import { BaseDatasetItem } from "./utils_chart_xy";
import { Coordinates } from "./utils_svg_types";

export function getSvgDimensions(viewBox: string) {
    const dimensions = viewBox.split(' ');

    return {
        startX: +dimensions[0],
        startY: +dimensions[1],
        width: +dimensions[2],
        height: +dimensions[3]
    }
}

export function getMinMaxInDatasetItems(datasetItems: BaseDatasetItem[], zoom?: { start: number, end: number }) {
    let flattened;
    if (zoom) {
        flattened = datasetItems.flatMap(d => d.values.map(v => forceNum(v)).filter((_, i) => i >= zoom.start && i <= zoom.end).filter(v => v !== null)) as number[];
    } else {
        flattened = datasetItems.flatMap(d => d.values.map(v => forceNum(v)).filter(v => v !== null)) as number[];
    }
    return {
        max: Math.max(...flattened),
        min: Math.min(...flattened) >= 0 ? 0 : Math.min(...flattened)
    }
}

export function getMaxSerieLength(datasetItems: BaseDatasetItem[], zoom?: { start: number, end: number }) {
    if (zoom) {
        return {
            maxSeriesLength: Math.max(...datasetItems.map(d => d.values.map(v => forceNum(v)).filter((_v, i) => i >= zoom.start && i <= zoom.end).length))
        }
    } else {
        return {
            maxSeriesLength: Math.max(...datasetItems.map(d => d.values.length))
        }
    }
}

export function getClosestDecimal(num: number) {
    if (num === 0) return 0;
    const orderOfMagnitude = Math.floor(Math.log10(Math.abs(num)));
    const powerOf10 = 10 ** orderOfMagnitude;
    let roundedValue;
    if (num < 0) {
        roundedValue = Math.round(num / powerOf10) * powerOf10;
    } else {
        roundedValue = Math.round(num / powerOf10) * powerOf10;
    }
    return roundedValue;
}

export function calculateNiceScale(minValue: number, maxValue: number, maxTicks: number): { min: number, max: number, tickSize: number, ticks: number[] } {
    const range = niceNum(maxValue - minValue, false);
    const tickSpacing = niceNum(range / (maxTicks - 1), true);
    const niceMin = Math.floor(minValue / tickSpacing) * tickSpacing;
    const niceMax = Math.ceil(maxValue / tickSpacing) * tickSpacing;

    const ticks: number[] = [];
    for (let tick = niceMin; tick <= niceMax; tick += tickSpacing) {
        ticks.push(tick);
    }

    return {
        min: niceMin,
        max: niceMax,
        tickSize: tickSpacing,
        ticks
    };
}

export function niceNum(range: number, round: boolean): number {
    const exponent = Math.floor(Math.log10(range));
    const fraction = range / Math.pow(10, exponent);
    let niceFraction;

    if (round) {
        if (fraction < 1.5) {
            niceFraction = 1;
        } else if (fraction < 3) {
            niceFraction = 2;
        } else if (fraction < 7) {
            niceFraction = 5;
        } else {
            niceFraction = 10;
        }
    } else {
        if (fraction <= 1) {
            niceFraction = 1;
        } else if (fraction <= 2) {
            niceFraction = 2;
        } else if (fraction <= 5) {
            niceFraction = 5;
        } else {
            niceFraction = 10;
        }
    }

    return niceFraction * Math.pow(10, exponent);
}

export function ratioToMax(value: number, max: number) {
    return value / max
}

export function createUid() {
    const cryptoArray = new Uint8Array(16);
    window.crypto.getRandomValues(cryptoArray);
    cryptoArray[6] = (cryptoArray[6] & 0x0F) | 0x40;
    cryptoArray[8] = (cryptoArray[8] & 0x3F) | 0x80;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c, index) {
            const r = cryptoArray[index >> 1];
            const v = c === 'x' ? r & 0x0F : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}


export function rotateMatrix(x: number) {
    return [
        [Math.cos(x), -Math.sin(x)],
        [Math.sin(x), Math.cos(x)],
    ];
}

export function addVector([a1, a2]: any, [b1, b2]: [number, number]) {
    return [a1 + b1, a2 + b2];
}

export function matrixTimes([[a, b], [c, d]]: any, [x, y]: [number, number]) {
    return [a * x + b * y, c * x + d * y];
}

export function createArc([cx, cy]: any, [rx, ry]: any, [position, ratio]: [number, number], phi: number, degrees: number = 360, piMult = 2, reverse = false) {
    ratio = ratio % (piMult * Math.PI);
    const rotMatrix = rotateMatrix(phi);
    const [sX, sY] = addVector(
        matrixTimes(rotMatrix, [
            rx * Math.cos(position),
            ry * Math.sin(position),
        ]),
        [cx, cy]
    );
    const [eX, eY] = addVector(
        matrixTimes(rotMatrix, [
            rx * Math.cos(position + ratio),
            ry * Math.sin(position + ratio),
        ]),
        [cx, cy]
    );
    const fA = ratio > Math.PI ? 1 : 0;
    const fS = ratio > 0 ? reverse ? 0 : 1 : reverse ? 1 : 0;
    return {
        startX: reverse ? eX : sX,
        startY: reverse ? eY : sY,
        endX: reverse ? sX : eX,
        endY: reverse ? sY : eY,
        path: `M${reverse ? eX : sX} ${reverse ? eY : sY} A ${[
            rx,
            ry,
            (phi / (piMult * Math.PI)) * degrees,
            fA,
            fS,
            reverse ? sX : eX,
            reverse ? sY : eY,
        ].join(" ")}`,
    };
}

export function makeDonut({
    series,
    cx,
    cy,
    rx,
    ry,
    piProportion = 1.99999,
    piMult = 2,
    arcAmpl = 1.45,
    degrees = 360,
    rotation = 105.25,
    size = 0
}: {
    series: any;
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    piProportion?: number;
    piMult?: number;
    arcAmpl?: number;
    degrees?: number;
    rotation?: number;
    size?: number
}) {
    if (!series) {
        return {
            ...series,
            proportion: 0,
            ratio: 0,
            path: '',
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            center: {}
        }
    }
    const sum = [...series]
        .map(s => s.value)
        .reduce((a, b) => a + b, 0)

    const ratios = []

    let acc = 0
    for (let i = 0; i < series.length; i += 1) {
        let proportion = series[i].value / sum;
        const ratio = proportion * (Math.PI * piProportion);
        const midProportion = series[i].value / 2 / sum;
        const midRatio = midProportion * (Math.PI * piMult);
        const { startX, startY, endX, endY, path } = createArc(
            [cx, cy],
            [rx, ry],
            [acc, ratio],
            rotation,
            degrees,
            piMult
        );

        const inner = createArc(
            [cx, cy],
            [rx - size, ry - size],
            [acc, ratio],
            rotation,
            degrees,
            piMult,
            true
        )

        ratios.push({
            arcSlice: `${path} L ${inner.startX} ${inner.startY} ${inner.path} L ${startX} ${startY}`,
            cx,
            cy,
            ...series[i],
            proportion,
            ratio: ratio,
            path,
            startX,
            startY,
            endX,
            endY,
            center: createArc(
                [cx, cy],
                [rx * arcAmpl, ry * arcAmpl],
                [acc, midRatio],
                rotation,
                degrees,
                piMult
            ), // center of the arc, to display a marker. rx & ry are larger to be displayed with a slight offset
        });
        acc += ratio;
    }
    return ratios;
}

export function fordinum(n: number, r: number = 0, s: string = '', p: string = ''): string {
    if (isNaN(n)) return n as unknown as string
    return p + (Number(n).toFixed(r)).toLocaleString() + s
}

export function forceNum(n: number | string | null | undefined): number {
    return isNaN(Number(n)) ? 0 : Number(n)
}

export function createSmoothPath(points: Coordinates[]) {
    const smoothing = 0.2; // Could be a user option
    function l(pointA: Coordinates, pointB: Coordinates) {
        const lengthX = pointB.x - pointA.x;
        const lengthY = pointB.y - pointA.y;
        return {
            length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
            angle: Math.atan2(lengthY, lengthX)
        };
    }
    function controlPoint(current: Coordinates, previous: Coordinates, next: Coordinates, reverse?: boolean) {
        const p = previous || current;
        const n = next || current;
        const o = l(p, n);

        const angle = o.angle + (reverse ? Math.PI : 0);
        const length = o.length * smoothing;

        const x = current.x + Math.cos(angle) * length;
        const y = current.y + Math.sin(angle) * length;
        return { x, y };
    }
    function bezierCommand(point: Coordinates, i: number, a: Coordinates[]) {
        const cps = controlPoint(a[i - 1], a[i - 2], point);
        const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
        return `C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
    }
    const d = points.reduce((acc, point, i, a) => i === 0
        ? `${point.x},${point.y} `
        : `${acc} ${bezierCommand(point, i, a)} `
        , '');

    return d;
}

const utils_commons = {
    calculateNiceScale,
    createSmoothPath,
    createUid,
    forceNum,
    fordinum,
    getClosestDecimal,
    getMaxSerieLength,
    getMinMaxInDatasetItems,
    getSvgDimensions,
    makeDonut,
    ratioToMax,
}

export default utils_commons