import { BaseDatasetItem } from "./utils_chart_xy";


export function getSvgDimensions(viewBox: string) {
    const dimensions = viewBox.split(' ');

    return {
        startX: +dimensions[0],
        startY: +dimensions[1],
        width: +dimensions[2],
        height: +dimensions[3]
    }
}

export function getMinMaxInDatasetItems(datasetItems: BaseDatasetItem[]) {
    const flattened = datasetItems.flatMap(d => d.values.filter(v => v !== null)) as number[];
    return {
        max: Math.max(...flattened),
        min: Math.min(...flattened)
    }
}

export function getMaxSerieLength(datasetItems: BaseDatasetItem[]) {
    return {
        maxSeriesLength: Math.max(...datasetItems.map(d => d.values.length))
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

const utils_commons = {
    createUid,
    getMinMaxInDatasetItems,
    getSvgDimensions,
    getMaxSerieLength,
    getClosestDecimal,
    calculateNiceScale,
    ratioToMax
}

export default utils_commons