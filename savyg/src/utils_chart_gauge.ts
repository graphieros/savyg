import { circle, element, line, path, svg, text } from ".";
import { palette } from "./palette";
import { createUid, getSvgDimensions, makeDonut } from "./utils_common";
import { ChartArea, DrawingArea, SvgItem, TextAnchor } from "./utils_svg_types";

export type ChartGaugeSegment = {
    from: number
    to: number
    color?: string
}

export type ChartGaugeDataset = {
    segments: ChartGaugeSegment[]
    value: number
}

export type ChartGaugeOptions = {
    arcThickness?: number
    backgroundColor?: string
    className?: string
    fontFamily?: string
    id?: string
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
    paddingTop?: number
    pointerBaseColor?: string
    pointerBaseRadius?: number
    pointerBaseStroke?: string
    pointerBaseStrokeWidth?: number
    pointerColor?: string
    pointerSize?: number
    pointerWidth?: number
    showDataLabels?: boolean
    showValue?: boolean
    title?: string
    titleColor?: string
    titleFontSize?: number
    titleFontWeight?: "bold" | "normal"
    titlePosition?: TextAnchor
    valueColor?: string
    valueFontSize?: number
    valueFontWeight?: "bold" | "normal"
    valueRounding?: number
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
            id: options?.id ?? ''
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
            arr.push(s.from)
            arr.push(s.to)
        })
        return {
            max: Math.max(...arr),
            min: Math.min(...arr)
        }
    }());

    const pointerCoordinates = (function IIFE() {
        const x = drawingArea.centerX
        const y = drawingArea.centerY + height / 4
        const angle = Math.PI * ((dataset.value - minMax.min) / (minMax.max - minMax.min)) + Math.PI
        return {
            x1: x,
            y1: y,
            x2: x + (drawingArea.width / (drawingArea.width / 72.58 * userOptions.pointerSize!)) * Math.cos(angle),
            y2: y + (drawingArea.width / (drawingArea.width / 72.58 * userOptions.pointerSize!)) * Math.sin(angle)
        }
    }());

    const formattedDataset = {
        value: dataset.value,
        segments: dataset.segments.map((s, i) => {
            return {
                ...s,
                id: `${globalUid}_segment_${i}`,
                color: s.color ?? palette[i],
                value: ((s.to - s.from) / minMax.max) * 100
            }
        })
    }

    const segments = element({
        el: SvgItem.G,
        options: {
            className: "savyg-gauge-arc"
        },
        parent: chart
    })

    const arcs = makeDonut({
        series: formattedDataset.segments,
        cx: drawingArea.centerX,
        cy: drawingArea.centerY + height / 4,
        rx: width / 4,
        ry: width / 4,
        piProportion: 1,
        piMult: 1,
        arcAmpl: 1.4,
        degrees: 180,
        rotation: Math.PI
    })

    arcs.forEach((arc: { path: string; color: string; }, i: number) => {
        path({
            options: {
                d: arc.path,
                stroke: arc.color,
                "stroke-width": userOptions.arcThickness,
                fill: "none",
                className: `savyg-gauge-arc-path savyg-gauge-arc-path-${i}`
            },
            parent: segments
        })
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
            className: "savyg-gauge-pointer-arrow"
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
            className: "savyg-gauge-pointer-base"
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
        arcs.forEach((arc: { center: { startX: number; startY: number; }; from: number; to: number; endX: number; endY: number }, i: number) => {
            text({
                options: {
                    x: arc.center.startX,
                    y: arc.center.startY,
                    "font-size": 12,
                    fill: "black",
                    content: String(arc.from),
                    "text-anchor": getDataLabelTextAnchor(arc.center.startX),
                    className: "savyg-gauge-data-label"
                },
                parent: dataLabels
            })
            if (i === arcs.length - 1) {
                text({
                    options: {
                        x: arc.endX + (userOptions.arcThickness! / 1.3),
                        y: arc.endY,
                        "font-size": 12,
                        fill: "black",
                        content: String(arc.to),
                        "text-anchor": getDataLabelTextAnchor(arc.endX),
                        className: "savyg-gauge-data-label"
                    },
                    parent: dataLabels
                })
            }
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
                content: Number(dataset.value.toFixed(userOptions.valueRounding)).toLocaleString(), // this is a pain in the neck and should be a utils
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

    return chart
}

const utils_chart_gauge = {
    chartGauge
}

export default utils_chart_gauge