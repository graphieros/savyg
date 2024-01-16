import { describe, expect, test } from "vitest"
import { getSvgDimensions, getMinMaxInDatasetItems, getMaxSerieLength, getClosestDecimal, calculateNiceScale, ratioToMax, positionDonutLabel, createDonutMarker, fordinum } from "../src/utils_common"

describe('getSvgDimensions', () => {
    test('parses dimensions of a string viewBox', () => {
        const viewBox = '0 0 100 200';
        expect(getSvgDimensions(viewBox)).toStrictEqual({
            startX: 0,
            startY: 0,
            width: 100,
            height: 200
        })
    })
})

describe('getMinMaxInDatasetItems', () => {
    test('returns an object with min and max values', () => {
        const datasetSimple = [
            {
                name: "d0",
                values: [-100, 0, 100],
            }
        ]
        const datasetMultiple =
            [
                {
                    name: "d0",
                    values: [-100, 0, 100],
                },
                {
                    name: "d1",
                    values: [-99, 0, 99]
                }
            ]
        expect(getMinMaxInDatasetItems(datasetSimple)).toStrictEqual({
            min: -100,
            max: 100
        })
        expect(getMinMaxInDatasetItems(datasetMultiple)).toStrictEqual({
            min: -100,
            max: 100
        })
    })
})

describe('getMaxSerieLength', () => {
    test('returns the longest length of an array of dataset items values', () => {
        const dataset = [
            {
                name: 'd0',
                values: [0, 1, 2, 3, 4]
            },
            {
                name: 'd1',
                values: [0, 1, 2]
            }
        ]
        expect(getMaxSerieLength(dataset)).toStrictEqual({
            maxSeriesLength: 5
        })
    })
})

describe('getClosestDecimal', () => {
    test('returns the closest decimal value', () => {
        expect(getClosestDecimal(0)).toBe(0)
        expect(getClosestDecimal(1)).toBe(1)
        expect(getClosestDecimal(11)).toBe(10)
        expect(getClosestDecimal(15)).toBe(20)
        expect(getClosestDecimal(19)).toBe(20)
    })
})

describe('calculateNiceScale', () => {
    test('returns an object with a smooth scale', () => {
        expect(calculateNiceScale(0, 100, 10)).toStrictEqual({
            min: 0,
            max: 100,
            tickSize: 10,
            ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        })
        expect(calculateNiceScale(-100, 100, 10)).toStrictEqual({
            min: -100,
            max: 100,
            tickSize: 20,
            ticks: [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100]
        })
    })
})

describe('ratioToMax', () => {
    test('returns a ratio', () => {
        expect(ratioToMax(4, 2)).toBe(2)
    })
})

describe('positionDonutLabel', () => {
    test('returns an ideal label position', () => {
        const labelLeft = {
            drawingArea: {
                top: 0,
                left: 0,
                bottom: 100,
                right: 100,
                height: 100,
                width: 100,
                fullHeight: 100,
                fullWidth: 100,
                centerX: 50,
                centerY: 50
            },
            element: {
                center: {
                    endX: 30,
                    endY: 30,
                }
            }
        }
        expect(positionDonutLabel(labelLeft)).toStrictEqual({
            x: 18,
            y: 26.429773960448415,
            textAnchor: "end"
        })
        const labelMiddle = {
            drawingArea: { ...labelLeft.drawingArea },
            element: {
                center: {
                    endX: 50,
                    endY: 20
                }
            }

        }
        expect(positionDonutLabel(labelMiddle)).toStrictEqual({
            x: 50,
            y: 16.666666666666664,
            textAnchor: "middle"
        })
        const labelRight = {
            drawingArea: { ...labelLeft.drawingArea },
            element: {
                center: {
                    endX: 80,
                    endY: 70
                }
            }
        }
        expect(positionDonutLabel(labelRight)).toStrictEqual({
            x: 92,
            y: 68.49000654084097,
            textAnchor: "start"
        })
    })
})

describe('createDonutMarker', () => {
    test('returns marker coordinates', () => {
        const label = {
            drawingArea: {
                top: 0,
                left: 0,
                bottom: 100,
                right: 100,
                height: 100,
                width: 100,
                fullHeight: 100,
                fullWidth: 100,
                centerX: 50,
                centerY: 50
            },
            element: {
                center: {
                    endX: 30,
                    endY: 30,
                }
            },
            offset: 0
        }
        expect(createDonutMarker(label)).toStrictEqual({
            x1: 30,
            x2: 50,
            y1: 30,
            y2: 50
        })
    })
})

describe('fordinum', () => {
    test('returns a formatted number to rounded text format', () => {
        expect(fordinum(1)).toBe("1")
        expect(fordinum(1.5)).toBe("2")
        expect(fordinum(-1)).toBe("-1")
        expect(fordinum(-1.5)).toBe("-2")
    })
    test('returns its identity if NaN', () => {
        expect(fordinum('text' as unknown as number)).toBe('text')
    })
    test("returns a number with an expected rounding", () => {
        expect(fordinum(1.618, 3)).toBe("1.618")
    })
    test("returns a number with prefix and suffix", () => {
        expect(fordinum(1, 0, '_suffix', 'prefix_')).toBe('prefix_1_suffix')
    })
})