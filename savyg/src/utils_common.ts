import { BaseDatasetItem } from "./utils_chart_xy";
import { DrawingArea } from "./utils_svg_types";


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
        flattened = datasetItems.flatMap(d => d.values.filter((_, i) => i >= zoom.start && i <= zoom.end).filter(v => v !== null)) as number[];
    } else {
        flattened = datasetItems.flatMap(d => d.values.filter(v => v !== null)) as number[];
    }
    return {
        max: Math.max(...flattened),
        min: Math.min(...flattened)
    }
}

export function getMaxSerieLength(datasetItems: BaseDatasetItem[], zoom?: { start: number, end: number }) {
    if (zoom) {
        return {
            maxSeriesLength: Math.max(...datasetItems.map(d => d.values.filter((_v, i) => i >= zoom.start && i <= zoom.end).length))
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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
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

export function createArc([cx, cy]: any, [rx, ry]: any, [position, ratio]: [number, number], phi: number, degrees: number = 360, piMult = 2) {
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
    const fS = ratio > 0 ? 1 : 0;
    return {
        startX: sX,
        startY: sY,
        endX: eX,
        endY: eY,
        path: `M${sX} ${sY} A ${[
            rx,
            ry,
            (phi / (piMult * Math.PI)) * degrees,
            fA,
            fS,
            eX,
            eY,
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
    rotation = 105.25
}: {
    series: any,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    piProportion?: number,
    piMult?: number,
    arcAmpl?: number
    degrees?: number
    rotation?: number
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

        ratios.push({
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
            ), // center of the arc, to display the marker. rx & ry are larger to be displayed with a slight offset
        });
        acc += ratio;
    }
    return ratios;
}

export function createDonutMarker({ drawingArea, element, offset }: { drawingArea: DrawingArea, element: any, offset: number }) {
    const dx = drawingArea.centerX - element.center.endX;
    const dy = drawingArea.centerY - element.center.endY;

    const length = Math.sqrt(dx * dx + dy * dy);
    const endX = element.center.endX + (dx / length) * (length - offset);
    const endY = element.center.endY + (dy / length) * (length - offset);

    return {
        x1: element.center.endX,
        y1: element.center.endY,
        x2: endX,
        y2: endY
    }
}

export function positionDonutLabel({ drawingArea, element, offset = 0 }: { drawingArea: DrawingArea, element: any, offset?: number }) {
    let position = {
        x: element.center.endX,
        y: element.center.endY + offset,
        textAnchor: "middle"
    };

    if (element.center.endX - 12 > drawingArea.centerX) {
        position.textAnchor = "start";
        position.x += 12;
    }

    if (element.center.endX + 12 < drawingArea.centerX) {
        position.textAnchor = "end";
        position.x -= 12;
    }

    if (element.center.endX === drawingArea.centerX) {
        position.textAnchor = "middle";
        if (element.center.endY > drawingArea.centerY) {
            position.y += 12;
        }
        if (element.center.endY < drawingArea.centerY) {
            position.y -= 12;
        }
    }

    if (element.center.endY - 6 < (drawingArea.top + drawingArea.height / 4)) {
        position.y = createDonutMarker({ drawingArea, element, offset: drawingArea.width / 3 }).y2 + offset;
    }

    if (element.center.endY + 6 > drawingArea.height - (drawingArea.height / 4)) {
        position.y = createDonutMarker({ drawingArea, element, offset: drawingArea.width / 3 }).y2 + offset;
    }

    return position;
}

export function fordinum(n: number, r: number = 0, s: string = '', p: string = ''): string {
    if (isNaN(n)) return n as unknown as string
    return p + (Number(n).toFixed(r)).toLocaleString() + s
}

const utils_commons = {
    calculateNiceScale,
    createDonutMarker,
    createUid,
    fordinum,
    getClosestDecimal,
    getMaxSerieLength,
    getMinMaxInDatasetItems,
    getSvgDimensions,
    makeDonut,
    positionDonutLabel,
    ratioToMax,
}

export default utils_commons