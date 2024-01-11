import { describe, expect, test } from "vitest"
import { getSvgDimensions } from "../utils_common"

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