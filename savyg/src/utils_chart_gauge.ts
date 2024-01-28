import { circle, element, line, path, svg, text } from ".";
import { palette } from "./palette";
import { createUid, getSvgDimensions, makeDonut, fordinum, forceNum } from "./utils_common";
import { ChartArea, DrawingArea, ShapeRendering, SvgItem, TextAnchor } from "./utils_svg_types";

export type ChartGaugeSegment = {
    /**
     * @description the starting value of a gauge segment
     */
    from: number
    /**
     * @escription the ending value of a gauge segment
     */
    to: number
    color?: string
}

export type ChartGaugeDataset = {
    segments: ChartGaugeSegment[]
    value: number
}

export type ChartGaugeOptions = {
    /**
     * @option the thickness of the gauge arcs
     * @default 58
     */
    arcThickness?: number
    /**
     * @option the background color applied to the chart
     * @default "#FFFFFF"
     */
    backgroundColor?: string
    /**
     * @option pass any strings separated by a space to generate class names. Example: "my-class1 my-class2"
     */
    className?: string
    /**
     * @option the text color of data labels
     * @default "#000000"
     */
    dataLabelsColor?: string
    /**
     * @option the font size of data labels
     * @default 12
     */
    dataLabelsFontSize?: number
    /**
     * @option the data labels offset from the arcs
     * @default 1.4
     * @example 1.2 will push data labels closer to the arcs
     */
    dataLabelsOffset?: number,
    /**
     * @option font family for all text elements
     * @default "inherit"
     */
    fontFamily?: string
    /**
     * @option the id of the svg. Defaults to a random uid
     */
    id?: string
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
    paddingTop?: number
    /**
     * @option the color of the pointer base circle
     * @default "#1A1A1A"
     */
    pointerBaseColor?: string
    /**
     * @option the radius of the pointer base circle
     * @default 5
     */
    pointerBaseRadius?: number
    /**
     * @option the border color of the pointer base circle
     * @default "#FFFFFF"
     */
    pointerBaseStroke?: string
    /**
     * @option the stroke width of the pointer base circle border
     * @default 1
     */
    pointerBaseStrokeWidth?: number
    /**
     * @option the color of the pointer
     * @default "#2A2A2A"
     */
    pointerColor?: string
    /**
     * @option the size of the pointer. 0.9 will make it bigger. Ok this is not logical but whatever
     * @default 1
     */
    pointerSize?: number
    /**
     * @option the thickness of the pointer
     * @default 5
     */
    pointerWidth?: number
    /**
    * @option standard svg rendering
    * @default "auto"
    */
    "shape-rendering"?: ShapeRendering
    /**
     * @option show or hide segment data labels
     * @default true
     */
    showDataLabels?: boolean
    /**
     * @option show or hide the gaueg value
     * @default true
     */
    showValue?: boolean
    /**
     * @option the text content of the title element
     * @default ""
     */
    title?: string
    /**
     * @option the text color of the title element
     * @default "#000000"
     */
    titleColor?: string
    /**
     * @option the font size of the title element
     * @default 18
     */
    titleFontSize?: number
    /**
     * @option the font weight of the title element
     * @default "bold"
     */
    titleFontWeight?: "bold" | "normal"
    /**
     * @option the horizontal position (text-anchor) of the title element
     * @default "middle"
     */
    titlePosition?: TextAnchor
    /**
     * @option the color of the gauge value
     * @default "#000000"
     */
    valueColor?: string
    /**
     * @option the font size of the gauge value
     * @default 20
     */
    valueFontSize?: number
    /**
     * @option the font weight of the gauge value
     * @default "normal"
     */
    valueFontWeight?: "bold" | "normal"
    /**
     * @option the rounding of the gauge value
     * @default 0
     */
    valueRounding?: number
    /**
     * @option the viewBox dimensions of the chart's svg
     * @default "0 0 450 300"
     */
    viewBox?: string
}

export function chartGauge({
    dataset,
    options,
    parent
}: {
    dataset: ChartGaugeDataset
    options?: ChartGaugeOptions
    parent?: HTMLElement
}) {
    const globalUid = createUid()

    const userOptions: ChartGaugeOptions = {
        arcThickness: options?.arcThickness ?? 58,
        backgroundColor: options?.backgroundColor ?? '#FFFFFF',
        dataLabelsColor: options?.dataLabelsColor ?? "#000000",
        dataLabelsFontSize: options?.dataLabelsFontSize ?? 12,
        dataLabelsOffset: options?.dataLabelsOffset ?? 1.4,
        fontFamily: options?.fontFamily ?? "inherit",
        paddingBottom: options?.paddingBottom ?? 0,
        paddingLeft: options?.paddingLeft ?? 0,
        paddingRight: options?.paddingRight ?? 0,
        paddingTop: options?.paddingTop ?? 0,
        pointerBaseColor: options?.pointerBaseColor ?? "#1A1A1A",
        pointerBaseRadius: options?.pointerBaseRadius ?? 5,
        pointerBaseStroke: options?.pointerBaseStroke ?? "#FFFFFF",
        pointerBaseStrokeWidth: options?.pointerBaseStrokeWidth ?? 1,
        pointerColor: options?.pointerColor ?? '#2A2A2A',
        pointerSize: options?.pointerSize ?? 1,
        pointerWidth: options?.pointerWidth ?? 5,
        "shape-rendering": options?.["shape-rendering"] ?? "auto",
        showDataLabels: options?.showDataLabels ?? true,
        showValue: options?.showValue ?? true,
        title: options?.title ?? '',
        titleColor: options?.titleColor ?? '#000000',
        titleFontSize: options?.titleFontSize ?? 18,
        titleFontWeight: options?.titleFontWeight ?? "bold",
        titlePosition: options?.titlePosition ?? 'middle',
        valueColor: options?.valueColor ?? "#000000",
        valueFontSize: options?.valueFontSize ?? 20,
        valueFontWeight: options?.valueFontWeight ?? "normal",
        valueRounding: options?.valueRounding ?? 0,
        viewBox: options?.viewBox ?? '0 0 450 300',
    }

    const chart = svg({
        options: {
            viewBox: userOptions.viewBox,
            className: options?.className ?? '',
            id: options?.id ?? `gauge_${globalUid}`
        }
    })

    chart.dataset.savyg = "gauge"
    chart.style.fontFamily = userOptions.fontFamily!
    chart.style.backgroundColor = userOptions.backgroundColor!

    const { width, height } = getSvgDimensions(userOptions.viewBox as string)

    const chartArea: ChartArea = {
        left: userOptions.paddingLeft!,
        top: userOptions.paddingTop!,
        right: width - userOptions.paddingRight!,
        bottom: height - userOptions.paddingBottom!
    }

    const drawingArea: DrawingArea = {
        top: userOptions.paddingTop!,
        right: chartArea.right,
        left: chartArea.left,
        bottom: chartArea.bottom,
        height: height,
        width: width,
        fullHeight: height,
        fullWidth: width,
        centerX: width / 2,
        centerY: height / 2,
    }

    const minMax = (function IIFE() {
        const arr: number[] = []
        dataset.segments.forEach(s => {
            arr.push(forceNum(s.from))
            arr.push(forceNum(s.to))
        })
        return {
            max: Math.max(...arr),
            min: Math.min(...arr)
        }
    }());

    const pointerCoordinates = (function IIFE() {
        const x = drawingArea.centerX
        const y = drawingArea.centerY + height / 4
        const angle = Math.PI * ((forceNum(dataset.value) - minMax.min) / (minMax.max - minMax.min)) + Math.PI
        return {
            x1: x,
            y1: y,
            x2: x + (drawingArea.width / (drawingArea.width / 72.58 * userOptions.pointerSize!)) * Math.cos(angle),
            y2: y + (drawingArea.width / (drawingArea.width / 72.58 * userOptions.pointerSize!)) * Math.sin(angle)
        }
    }());

    const formattedDataset = {
        value: dataset.value,
        segments: [...dataset.segments.map((s, i) => {
            return {
                ...s,
                id: `${globalUid}_segment_${i}`,
                color: s.color ?? palette[i],
                value: ((forceNum(s.to) - forceNum(s.from)) / minMax.max) * 100
            }
        }), { color: 'transparent', value: 0, from: forceNum(dataset.segments[dataset.segments.length - 1].to), to: forceNum(dataset.segments[dataset.segments.length - 1].to) }]
    }

    const segments = element({
        el: SvgItem.G,
        options: {
            className: "savyg-gauge-arc"
        },
        parent: chart
    })

    let arcs = makeDonut({
        series: formattedDataset.segments,
        cx: drawingArea.centerX,
        cy: drawingArea.centerY + height / 4,
        rx: width / 4,
        ry: width / 4,
        piProportion: 1,
        piMult: 1,
        arcAmpl: userOptions.dataLabelsOffset,
        degrees: 180,
        rotation: Math.PI
    })

    arcs = arcs.map((a: any, i: number) => {
        return {
            ...a,
            path: path({
                options: {
                    d: a.path,
                    stroke: a.color,
                    "stroke-width": userOptions.arcThickness,
                    fill: "none",
                    className: `savyg-gauge-arc-path savyg-gauge-arc-path-${i}`,
                    "shape-rendering": userOptions["shape-rendering"]
                },
            })
        }
    })

    arcs.forEach((arc: { path: string; color: string; }) => {
        const anArc = arc.path as unknown as SVGPathElement;
        segments.appendChild(anArc)
    })

    const pointer = element({
        el: SvgItem.G,
        options: {
            className: "savyg-gauge-pointer"
        },
        parent: chart
    })

    line({
        options: {
            ...pointerCoordinates,
            "stroke-width": userOptions.pointerWidth,
            stroke: userOptions.pointerColor,
            "stroke-linecap": "round",
            className: "savyg-gauge-pointer-arrow",
            "shape-rendering": userOptions["shape-rendering"]
        },
        parent: pointer
    })

    circle({
        options: {
            cx: drawingArea.centerX,
            cy: drawingArea.centerY + height / 4,
            r: userOptions.pointerBaseRadius!,
            fill: userOptions.pointerBaseColor,
            stroke: userOptions.pointerBaseStroke,
            "stroke-width": userOptions.pointerBaseStrokeWidth,
            className: "savyg-gauge-pointer-base",
            "shape-rendering": userOptions["shape-rendering"]
        },
        parent: pointer
    })

    const dataLabels = element({
        el: SvgItem.G,
        options: {
            className: "savyg-gauge-data-labels"
        },
        parent: chart
    })

    function getDataLabelTextAnchor(x: number): TextAnchor {
        if (x < (width / 2 - 12)) {
            return "end"
        } else if (x > (width / 2 + 12)) {
            return "start"
        } else {
            return "middle"
        }
    }

    if (userOptions.showDataLabels) {
        arcs.forEach((arc: { center: { startX: number; startY: number; }; from: number; to: number; endX: number; endY: number }) => {
            text({
                options: {
                    x: arc.center.startX,
                    y: arc.center.startY,
                    "font-size": userOptions.dataLabelsFontSize,
                    fill: userOptions.dataLabelsColor,
                    content: String(arc.from),
                    "text-anchor": getDataLabelTextAnchor(arc.center.startX),
                    className: "savyg-gauge-data-label"
                },
                parent: dataLabels
            })
        })
    }

    if (userOptions.title) {
        text({
            options: {
                x: userOptions.titlePosition === "middle" ? width / 2 : userOptions.titlePosition === "start" ? chartArea.left : chartArea.right,
                y: userOptions.titleFontSize! * 1.5,
                content: userOptions.title,
                "font-size": userOptions.titleFontSize,
                fill: userOptions.titleColor,
                className: "savyg-title",
                "text-anchor": userOptions.titlePosition,
                "font-weight": userOptions.titleFontWeight
            },
            parent: chart
        })
    }

    if (userOptions.showValue) {
        text({
            options: {
                x: width / 2,
                y: drawingArea.centerY + height / 4 + userOptions.valueFontSize! * 2,
                content: fordinum(dataset.value, userOptions.valueRounding),
                fill: userOptions.valueColor,
                "font-weight": userOptions.valueFontWeight,
                "font-size": userOptions.valueFontSize,
                "text-anchor": "middle",
                className: "savyg-gauge-value"
            },
            parent: chart
        })
    }


    if (parent) {
        parent.appendChild(chart)
    }

    function refresh(rootNode: HTMLElement) {
        if (chart && rootNode) {
            if (parent) {
                parent.removeChild(chart)
            } else {
                rootNode.removeChild(chart)
            }
            const gauge = chartGauge({
                dataset,
                options,
                parent: rootNode
            })
            return gauge
        }
    }

    function updateData(ds: ChartGaugeDataset) {
        if (chart && parent) {

            parent.removeChild(chart)
            const gauge = chartGauge({
                dataset: ds,
                options,
                parent,
            })
            return gauge
        } else {
            return
        }
    }

    return {
        chart,
        refresh,
        updateData,
        arcs: arcs.map((a: any) => {
            return {
                pathElement: a.path,
                color: a.color,
            }
        }),
        dimensions: {
            centerX: drawingArea.centerX,
            centerY: drawingArea.centerY + height / 4,
        }
    }
}

const utils_chart_gauge = {
    chartGauge
}

export default utils_chart_gauge