import { Coordinates, GradientStop, Shape, SvgItem, SvgOptions } from "./utils_svg_types"
import { CONSTANT } from "./constants"
import { createUid } from "./utils_common";

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
                if (!['className', 'content', 'xlink:href'].includes(key) && ![undefined, null].includes(value as any)) {
                    item.setAttribute(optionKey, String(value));
                }
            }
        });
    }

    if (attrs.options.content) {
        item.innerHTML = attrs.options.content;
    }

    if ((attrs.options as any)["xlink:href"]) {
        item.setAttributeNS(CONSTANT.XMLNS, "xlink:href", (attrs.options as any)["xlink:href"])
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
 * @description Creates an empty clipPath svg element.
 * @returns a clipPath svg element
 */
export function clipPath(attrs: {
    options: SvgOptions[SvgItem.CLIP_PATH],
    parent?: SVGElement | HTMLElement
}) {
    return element({
        el: SvgItem.CLIP_PATH,
        options: attrs.options,
        parent: attrs.parent
    })
}

/**
 * 
 * @description Creates a use svg element.
 * @returns a use svg element
 */

export function use(attrs: {
    options: SvgOptions[SvgItem.USE],
    parent?: SVGElement | HTMLElement
}) {
    return element({
        el: SvgItem.USE,
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
    /**
     * @option x: number
     * @option y: number
     * @option content: text element content, cannot be broken into several lines
     */
    options: SvgOptions[SvgItem.TEXT],
    parent?: SVGElement | HTMLElement,
}) {
    return element({
        el: SvgItem.TEXT,
        options: attrs.options,
        parent: attrs.parent
    })
}

/**
 * 
 * @description Creates a svg marker element.
 * @returns a marker svg element
 */
export function marker(attrs: {
    options: SvgOptions[SvgItem.MARKER],
    parent?: SVGElement | HTMLElement,
}) {
    return element({
        el: SvgItem.MARKER,
        options: attrs.options,
        parent: attrs.parent
    })
}

export function arrow(attrs: {
    options: SvgOptions[SvgItem.ARROW],
    parent?: SVGElement | HTMLElement
}) {
    const uid = createUid();

    const g = element({
        el: SvgItem.G,
        options: {
            className: "savyg-arrow"
        },
    })

    const defs = element({
        el: SvgItem.DEFS,
        options: {},
        parent: g
    })
    const baseSize = attrs.options.size ?? 10;
    const viewBox = `0 0 ${baseSize} ${baseSize}`
    const refX = baseSize / 2
    const refY = baseSize / 2
    const markerWidth = refX * 1.2
    const markerHeight = refY * 1.2

    if (['end', 'both'].includes(attrs.options.marker)) {
        const markerEnd = marker({
            options: {
                id: `marker-end-${uid}`,
                orient: "auto",
                viewBox,
                refX,
                refY,
                markerHeight: attrs.options.markerHeight ?? markerHeight,
                markerWidth: attrs.options.markerWidth ?? markerWidth
            },
            parent: defs
        })

        path({
            options: {
                d: `M 0 0 L ${baseSize} ${refX} L 0 ${baseSize} z`,
                fill: attrs.options.stroke
            },
            parent: markerEnd
        })
    }
    if (['start', 'both'].includes(attrs.options.marker)) {
        const markerStart = marker({
            options: {
                id: `marker-start-${uid}`,
                orient: "auto-start-reverse",
                viewBox,
                refX,
                refY,
                markerHeight: attrs.options.markerHeight ?? markerHeight,
                markerWidth: attrs.options.markerWidth ?? markerWidth
            },
            parent: defs
        })
        path({
            options: {
                d: `M 0 0 L ${baseSize} ${refX} L 0 ${baseSize} z`,
                fill: attrs.options.stroke
            },
            parent: markerStart
        })
    }

    line({
        options: {
            x1: attrs.options.x1,
            y1: attrs.options.y1,
            x2: attrs.options.x2,
            y2: attrs.options.y2,
            stroke: attrs.options.stroke,
            "stroke-width": attrs.options["stroke-width"],
            "stroke-dasharray": attrs.options["stroke-dasharray"],
            "stroke-dashoffset": attrs.options["stroke-dashoffset"],
            "stroke-linecap": attrs.options["stroke-linecap"],
            "stroke-linejoin": attrs.options["stroke-linejoin"],
            "shape-rendering": attrs.options["shape-rendering"],
            "marker-end": ['end', 'both'].includes(attrs.options.marker) ? `url(#marker-end-${uid})` : '',
            "marker-start": ['start', 'both'].includes(attrs.options.marker) ? `url(#marker-start-${uid})` : '',
        },
        parent: g
    })

    if (attrs.parent) {
        attrs.parent.appendChild(g)
    }

    return g
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

export function linearGradient(attrs: {
    stops: GradientStop[],
    parent?: HTMLElement | SVGElement
    id: string,
    direction: "vertical" | "horizontal",
    gradientUnits?: "userSpaceOnUse" | "objectBoundingBox",
    spreadMethod?: "pad" | "reflect" | "repeat",
}) {
    const def = document.createElementNS(CONSTANT.XMLNS, SvgItem.DEFS)
    const linearGradient = document.createElementNS(CONSTANT.XMLNS, SvgItem.LINEAR_GRADIENT)
    if (attrs.gradientUnits) {
        linearGradient.setAttribute('gradientUnits', attrs.gradientUnits)
    }
    if (attrs.spreadMethod) {
        linearGradient.setAttribute('spreadMethod', attrs.spreadMethod)
    }
    linearGradient.setAttribute("id", attrs.id)
    if (attrs.direction === "vertical") {
        linearGradient.setAttribute('x2', "0%")
        linearGradient.setAttribute('y2', "100%")
    } else {
        linearGradient.setAttribute('x1', '0%')
        linearGradient.setAttribute('y1', '0%')
        linearGradient.setAttribute('x2', '100%')
        linearGradient.setAttribute('y2', '0%')
    }

    attrs.stops.forEach((stop: { [x: string]: any; offset: string; }) => {
        const s = document.createElementNS(CONSTANT.XMLNS, SvgItem.STOP);
        s.setAttribute('offset', stop.offset)
        s.setAttribute('stop-color', stop['stop-color'])
        if (stop['stop-opacity']) {
            s.setAttribute('stop-opacity', String(stop['stop-opacity']))
        }
        linearGradient.appendChild(s)
    })

    def.appendChild(linearGradient)

    if (attrs.parent) {
        attrs.parent.appendChild(def)
    }

    return def
}

export function radialGradient(attrs: {
    cx?: string,
    cy?: string,
    fx?: string, // defaults to cx
    fy?: string, // defaults to cy
    fr?: string, // defaults to 0%
    r?: string, // defaults to 50%
    gradientUnits?: "userSpaceOnUse" | "objectBoundingBox",
    spreadMethod?: "pad" | "reflect" | "repeat", // defaults to pad
    stops: GradientStop[],
    parent?: HTMLElement | SVGElement,
    id: string,
}) {
    const def = document.createElementNS(CONSTANT.XMLNS, SvgItem.DEFS)
    const radialGradient = document.createElementNS(CONSTANT.XMLNS, SvgItem.RADIAL_GRADIENT)
    radialGradient.setAttribute("id", attrs.id)
    if (attrs.cx) {
        radialGradient.setAttribute('cx', attrs.cx)
    }
    if (attrs.cy) {
        radialGradient.setAttribute('cy', attrs.cy)
    }
    if (attrs.fx) {
        radialGradient.setAttribute('fx', attrs.fx)
    }
    if (attrs.fy) {
        radialGradient.setAttribute('fy', attrs.fy)
    }
    if (attrs.fr) {
        radialGradient.setAttribute('fr', attrs.fr)
    }
    if (attrs.gradientUnits) {
        radialGradient.setAttribute('gradientUnits', attrs.gradientUnits)
    }
    if (attrs.spreadMethod) {
        radialGradient.setAttribute('spreadMethod', attrs.spreadMethod)
    }
    attrs.stops.forEach((stop: { [x: string]: any; offset: string; }) => {
        const s = document.createElementNS(CONSTANT.XMLNS, SvgItem.STOP);
        s.setAttribute('offset', stop.offset)
        s.setAttribute('stop-color', stop['stop-color'])
        if (stop['stop-opacity']) {
            s.setAttribute('stop-opacity', String(stop['stop-opacity']))
        }
        radialGradient.appendChild(s)
    })

    def.appendChild(radialGradient)

    if (attrs.parent) {
        attrs.parent.appendChild(def)
    }

    return def
}

export function findArcMidpoint(pathElement: SVGPathElement) {
    const length = pathElement.getTotalLength();
    let start = 0;
    let end = length;
    let midpointParameter = length / 2;

    const epsilon = 0.01; // Avoiding infinite loop caused by floating point
    while (end - start > epsilon) {
        const mid = (start + end) / 2;
        const midPoint = pathElement.getPointAtLength(mid);
        const midLength = midPoint.x;

        if (Math.abs(midLength - midpointParameter) < epsilon) {
            midpointParameter = mid;
            break;
        } else if (midLength < midpointParameter) {
            start = mid;
        } else {
            end = mid;
        }
    }
    const { x, y } = pathElement.getPointAtLength(midpointParameter);
    return { x, y };
}

export function offsetFromCenterPoint({
    initX,
    initY,
    offset,
    centerX,
    centerY
}: {
    initX: number;
    initY: number;
    offset: number;
    centerX: number;
    centerY: number
}) {
    const angle = Math.atan2(initY - centerY, initX - centerX);
    return {
        x: initX + offset * Math.cos(angle),
        y: initY + offset * Math.sin(angle)
    }
}

export function setTextAnchorFromCenterPoint({ x, centerX, middleRange = 0, isDiv = false }: { x: number; centerX: number; middleRange?: number, isDiv?: boolean }) {
    if (isDiv) {
        switch (true) {
            case x > centerX - middleRange && x < centerX + middleRange:
                return "center";
            case x > centerX + middleRange:
                return "left";
            case x < centerX - middleRange:
                return "right";
            default:
                return "right"
        }
    } else {
        switch (true) {
            case x > centerX - middleRange && x < centerX + middleRange:
                return "middle";
            case x > centerX + middleRange:
                return "start";
            case x < centerX - middleRange:
                return "end";
            default:
                return "end"
        }
    }
}

const utils_svg = {
    circle,
    clipPath,
    element,
    findArcMidpoint,
    freePolygon,
    line,
    linearGradient,
    marker,
    offsetFromCenterPoint,
    path,
    radialGradient,
    rect,
    regularPolygon,
    setTextAnchorFromCenterPoint,
    svg,
    text,
    use,
}

export default utils_svg