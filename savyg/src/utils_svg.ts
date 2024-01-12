import { Coordinates, Shape, SvgItem, SvgOptions } from "./utils_svg_types"
import { CONSTANT } from "./constants"

/**
 * 
 * @description Creates any svg element. To append the element to an existing svg, provide the svg attribute. Otherwise, the element is returned so you can dispose of it as you please.
 * @returns a svg element
 */
export function element<T extends SvgItem>(attrs: {
    el: T | Shape;
    options: SvgOptions[T];
    parent?: SVGElement | HTMLElement;
}) {
    const item = document.createElementNS(CONSTANT.XMLNS, attrs.el);

    if (Object.keys(attrs.options).length) {
        Object.entries(attrs.options).forEach(([key, value]) => {
            const optionKey = key as string;
            if (key === "className" && attrs.options.className && attrs.options.className !== '') {
                attrs.options.className.split(' ').forEach((cn: string) => {
                    item.classList.add(cn)
                })
            } else {
                if (key !== 'className') {
                    item.setAttribute(optionKey, String(value));
                }
            }
        });
    }

    if (attrs.options.content) {
        item.innerHTML = attrs.options.content;
    }

    if (attrs.parent) {
        attrs.parent.appendChild(item)
    }
    return item
}

/**
 * 
 * @description Creates a svg circle element. To append the circle to an existing svg, provide the svg attribute. Otherwise, the circle is returned so you can dispose of it as you please.
 * @returns a svg circle element
 */
export function circle(attrs: {
    options: SvgOptions[SvgItem.CIRCLE],
    parent?: SVGElement | HTMLElement
}) {
    return element({
        el: SvgItem.CIRCLE,
        options: attrs.options,
        parent: attrs.parent
    })
}

/**
 * 
 * @description Creates a svg line element. To append the line to an existing svg, provide the svg attribute. Otherwise, the line is returned so you can dispose of it as you please.
 * @returns a svg line element
 */
export function line(attrs: {
    options: SvgOptions[SvgItem.LINE],
    parent?: SVGElement | HTMLElement
}) {
    return element({
        el: SvgItem.LINE,
        options: attrs.options,
        parent: attrs.parent
    })
}

/**
 * 
 * @description Creates a svg rect element. To append the rect to an existing svg, provide the svg attribute. Otherwise, the rect is returned so you can dispose of it as you please.
 * @returns a svg rect element
 */
export function rect(attrs: {
    options: SvgOptions[SvgItem.RECT],
    parent?: SVGElement | HTMLElement
}) {
    return element({
        el: SvgItem.RECT,
        options: attrs.options,
        parent: attrs.parent
    })
}

/**
 * 
 * @description Creates a svg polygon element. To append the polygon to an existing svg, provide the svg attribute. Otherwise, the polygon is returned so you can dispose of it as you please.
 * @returns a svg polygon element
 */
export function freePolygon(attrs: {
    options: SvgOptions[SvgItem.POLYGON],
    parent?: SVGElement | HTMLElement
}) {
    return element({
        el: SvgItem.POLYGON,
        options: attrs.options,
        parent: attrs.parent
    })
}

/**
 * 
 * @description Creates a svg path element. To append the path to an existing svg, provide the svg attribute. Otherwise, the path is returned so you can dispose of it as you please.
 * @returns a svg path element
 */
export function path(attrs: {
    options: SvgOptions[SvgItem.PATH],
    parent?: SVGElement | HTMLElement
}) {
    return element({
        el: SvgItem.PATH,
        options: attrs.options,
        parent: attrs.parent
    })
}

/**
 * 
 * @description Creates a svg path element. To append the path to an existing svg, provide the svg attribute. Otherwise, the path is returned so you can dispose of it as you please.
 * @returns a svg path element
 */
export function text(attrs: {
    options: SvgOptions[SvgItem.TEXT],
    parent?: SVGElement | HTMLElement,
}) {
    return element({
        el: SvgItem.TEXT,
        options: attrs.options,
        parent: attrs.parent
    })
}

export function calcPolygonPoints({
    centerX,
    centerY,
    outerPoints,
    radius,
    rotation
}: {
    centerX: number;
    centerY: number;
    outerPoints: number;
    radius: number;
    rotation: number;
}) {
    const angle = Math.PI / outerPoints;
    const angleOffsetToCenter = rotation;
    let points = "";
    const coordinates = [];
    for (let i = 0; i < outerPoints * 2; i += 1) {
        let currX = centerX + Math.cos(i * angle + angleOffsetToCenter) * radius;
        let currY = centerY + Math.sin(i * angle + angleOffsetToCenter) * radius;
        points += `${currX},${currY} `;
        coordinates.push({ x: currX, y: currY });
    }
    return points
}

/**
 * 
 * @description Creates a regular polygon from a given set of options. To append the polygon to an existing svg, provide the svg attribute. Otherwise, the polygon is returned so you can dispose of it as you please.
 * @returns a polygon svg element
 */
export function regularPolygon({
    coordinates,
    radius,
    sides,
    rotation = 0,
    parent,
    options
}: { coordinates: Coordinates, radius: number, sides: number, rotation: number, parent?: SVGElement | HTMLElement, options: SvgOptions[SvgItem.POLYGON] }) {
    const centerX = coordinates.x;
    const centerY = coordinates.y;
    const outerPoints = sides / 2;
    const points = calcPolygonPoints({
        centerX,
        centerY,
        outerPoints,
        radius: radius + 1,
        rotation
    });
    return freePolygon({
        options: {
            ...options,
            points,
        },
        parent
    })
}

export function svg(attrs: {
    options: SvgOptions[SvgItem.SVG],
    parent?: HTMLElement
}) {
    return element({
        el: SvgItem.SVG,
        options: attrs.options,
        parent: attrs.parent
    })
}

const utils_svg = {
    circle,
    element,
    freePolygon,
    line,
    path,
    rect,
    regularPolygon,
    svg,
    text
}

export default utils_svg