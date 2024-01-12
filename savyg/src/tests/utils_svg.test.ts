// @vitest-environment happy-dom
import { describe, expect, test } from "vitest"
import { circle, freePolygon, line, path, rect, svg, text } from "../utils_svg"

describe('circle', () => {
    test("returns a circle svg element", () => {
        const c = circle({
            options: {
                cx: 10,
                cy: 12,
                r: 5,
            }
        })
        expect(c.toString()).toEqual(`<circle cx="10" cy="12" r="5"></circle>`)
    })
    test("returns a circle svg element with attributes", () => {
        const c = circle({
            options: {
                cx: 10,
                cy: 10,
                r: 10,
                stroke: "red",
                "stroke-width": 1,
                "stroke-dasharray": 2,
            }
        })
        expect(c.toString()).toEqual(`<circle cx="10" cy="10" r="10" stroke="red" stroke-width="1" stroke-dasharray="2"></circle>`)
    })
})

describe('line', () => {
    test('returns a line svg element', () => {
        const l = line({
            options: {
                x1: 0,
                y1: 10,
                x2: 20,
                y2: 10
            }
        })
        expect(l.toString()).toEqual(`<line x1="0" y1="10" x2="20" y2="10"></line>`)
    })
    test('returns a line svg element with attributes', () => {
        const l = line({
            options: {
                x1: 0,
                y1: 10,
                x2: 10,
                y2: 10,
                stroke: "red",
                "stroke-width": 1,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "stroke-dasharray": 2,
                "stroke-dashoffset": 4
            }
        })
        expect(l.toString()).toEqual(`<line x1="0" y1="10" x2="10" y2="10" stroke="red" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2" stroke-dashoffset="4"></line>`)
    })
})

describe('rect', () => {
    test('returns a rect svg element', () => {
        const r = rect({
            options: {
                x: 0,
                y: 0,
                height: 10,
                width: 20
            }
        })
        expect(r.toString()).toEqual(`<rect x="0" y="0" height="10" width="20"></rect>`)
    })
    test('returns a rect svg element with attributes', () => {
        const r = rect({
            options: {
                x: 0,
                y: 0,
                height: 10,
                width: 10,
                stroke: "red",
                "stroke-width": 1,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "stroke-dasharray": 2,
                "stroke-dashoffset": 4,
                rx: 2,
                ry: 3,
                fill: "blue"
            }
        })
        expect(r.toString()).toEqual(`<rect x="0" y="0" height="10" width="10" stroke="red" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2" stroke-dashoffset="4" rx="2" ry="3" fill="blue"></rect>`)
    })
})

describe('freePolygon', () => {
    test('returns a polygon based on the points passed', () => {
        const p = freePolygon({
            options: {
                points: "0,10 20,30 40,50 0,10",
            }
        })
        expect(p.toString()).toEqual(`<polygon points="0,10 20,30 40,50 0,10"></polygon>`)
    })
    test('returns a polygon with attributes', () => {
        const p = freePolygon({
            options: {
                points: "0,10 20,30 40,50 0,10",
                fill: "red",
                stroke: "blue",
                "stroke-width": 1,
                "stroke-dasharray": 2,
                "stroke-dashoffset": 3,
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
            }
        })
        expect(p.toString()).toEqual(`<polygon points="0,10 20,30 40,50 0,10" fill="red" stroke="blue" stroke-width="1" stroke-dasharray="2" stroke-dashoffset="3" stroke-linejoin="round" stroke-linecap="round"></polygon>`)
    })
})

describe('path', () => {
    test('returns a path svg element', () => {
        const p = path({
            options: {
                d: "M 10,10 20,20"
            }
        })
        expect(p.toString()).toEqual(`<path d="M 10,10 20,20"></path>`)
    })
    test('returns a path svg element with attributes', () => {
        const p = path({
            options: {
                d: "M 10,10 20,20",
                fill: "red",
                stroke: "blue",
                "stroke-width": 1,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "stroke-dasharray": 2,
                "stroke-dashoffset": 3
            }
        })
        expect(p.toString()).toEqual(`<path d="M 10,10 20,20" fill="red" stroke="blue" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2" stroke-dashoffset="3"></path>`)
    })
})

describe('text', () => {
    test('returns a text svg element with a content', () => {
        const t = text({
            options: {
                x: 0,
                y: 0,
                content: "test"
            }
        })
        expect(t.toString()).toEqual(`<text x="0" y="0">test</text>`)
    })
    test('returns a text svg element with content & attributes', () => {
        const t = text({
            options: {
                x: 0,
                y: 0,
                content: "test",
                "text-anchor": "middle",
                "font-size": 10,
                "font-weight": "bold",
                "fill": "red",
                "stroke": "blue",
                "stroke-width": 1,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "stroke-dasharray": 2,
                "stroke-dashoffset": 3
            }
        })
        expect(t.toString()).toEqual(`<text x="0" y="0" text-anchor="middle" font-size="10" font-weight="bold" fill="red" stroke="blue" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2" stroke-dashoffset="3">test</text>`)
    })
})

describe('svg', () => {
    test('returns a svg element', () => {
        const s = svg({
            options: {
                viewBox: "0 0 100 200"
            }
        })
        expect(s.toString()).toEqual(`<svg viewBox="0 0 100 200"></svg>`)
    })
    test('returns a svg element with attributes and class names', () => {
        const s = svg({
            options: {
                viewBox: "0 0 100 100",
                height: '100%',
                width: '100%',
                className: 'name1 name2'
            }
        })
        expect(s.toString()).toEqual(`<svg viewBox="0 0 100 100" height="100%" width="100%" class="name1 name2"></svg>`)
    })
})