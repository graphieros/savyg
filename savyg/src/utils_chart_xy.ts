import { ChartArea, StrokeLinecap, StrokeLinejoin, SvgItem } from "./utils_svg_types"
import { element, line, svg, text } from "./utils_svg";
import { calculateNiceScale, getMaxSerieLength, getMinMaxInDatasetItems, getSvgDimensions, ratioToMax } from "./utils_common";

export type BaseDatasetItem = {
    name?: string
    values: number[]
}

export type ChartXyDatasetItem = BaseDatasetItem & {
    stroke?: string
    "stroke-width"?: number
    "stroke-linecap"?: StrokeLinecap
    "stroke-linejoin"?: StrokeLinejoin
    "stroke-dasharray"?: number
    "stroke-dashoffset"?: number
    showDataLabels?: boolean
}

export type ChartXyOptions = {
    backgroundColor?: string;
    viewBox?: string;
    className?: string;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    title?: string;
    titlePosition?: "left" | "center" | "right";
    yAxisLabelsFontSize?: number
    xAxisLabels?: string[]
    xAxisLabelsFontSize?: number
    fontFamily?: string
}

export function chartXy({
    dataset,
    options,
    parent
}: {
    dataset: ChartXyDatasetItem[],
    options?: ChartXyOptions,
    parent?: HTMLElement
}) {
    const userOptions: ChartXyOptions = {
        backgroundColor: options?.backgroundColor ?? "#FFFFFF",
        viewBox: options?.viewBox ?? '0 0 512 341',
        paddingTop: options?.paddingTop ?? 48,
        paddingRight: options?.paddingRight ?? 24,
        paddingBottom: options?.paddingBottom ?? 48,
        paddingLeft: options?.paddingLeft ?? 48,
        yAxisLabelsFontSize: options?.yAxisLabelsFontSize ?? 12,
        xAxisLabelsFontSize: options?.xAxisLabelsFontSize ?? 12,
        fontFamily: options?.fontFamily ?? 'inherit'
    }

    const chart = svg({
        options: {
            viewBox: userOptions.viewBox,
            className: options?.className ?? ''
        }
    })

    chart.dataset.savyg = "line"
    chart.style.fontFamily = userOptions.fontFamily!;

    /**************************************************************************/

    const { width, height } = getSvgDimensions(userOptions.viewBox as string);

    const chartArea: ChartArea = {
        left: userOptions.paddingLeft!,
        top: userOptions.paddingTop!,
        right: width - userOptions.paddingRight!,
        bottom: height - userOptions.paddingBottom!
    }

    // --- DATA

    const { min, max } = getMinMaxInDatasetItems(dataset)
    const { maxSeriesLength } = getMaxSerieLength(dataset)

    // ------ * Bounds

    const bounds = {
        min: calculateNiceScale(min, max, 10).min,
        max: calculateNiceScale(min, max, 10).max,
        ticks: calculateNiceScale(min, max, 10).ticks
    }

    function normalize(val: number) {
        return chartArea.bottom - ((height - userOptions.paddingBottom! - userOptions.paddingTop!) * ratioToMax(val + absoluteMin, absoluteMax))
    }

    const absoluteMin = Math.abs(bounds.min);
    const absoluteMax = Math.abs(bounds.max + absoluteMin)
    const absoluteZero = chartArea.bottom - ((height - userOptions.paddingBottom! - userOptions.paddingTop!) * ratioToMax(absoluteMin, absoluteMax))
    const slot = (width - chartArea.left - userOptions.paddingRight!) / maxSeriesLength;

    console.log({ width, height, chartArea, min, max, maxSeriesLength, bounds, absoluteZero })

    console.log(userOptions, dataset)

    // --- GRID
    const grid = element({
        el: SvgItem.G,
        options: {
            className: 'savyg-grid'
        },
        parent: chart
    })

    const yAxis = line({
        options: {
            x1: chartArea.left,
            x2: chartArea.left,
            y1: chartArea.top,
            y2: chartArea.bottom,
            stroke: "black",
            "stroke-linecap": "round"
        },
        parent: grid
    }) as SVGLineElement

    const xAxis = line({
        options: {
            x1: chartArea.left,
            x2: chartArea.right,
            y1: absoluteZero,
            y2: absoluteZero,
            stroke: "black",
            "stroke-linecap": "round"
        },
        parent: grid
    }) as SVGLineElement

    [xAxis, yAxis].forEach(axis => axis.dataset.savyg = "axis")

    // --- Y AXIS TICKS

    bounds.ticks.forEach(tick => {
        const normalizedValue = normalize(tick);
        line({
            options: {
                x1: chartArea.left,
                x2: chartArea.left - 5,
                y1: normalizedValue,
                y2: normalizedValue,
                stroke: "black"
            },
            parent: grid
        })

        text({
            options: {
                x: chartArea.left - 7,
                y: normalizedValue + userOptions.yAxisLabelsFontSize! / 3,
                "text-anchor": "end",
                "font-size": userOptions.yAxisLabelsFontSize,
                content: String(tick)
            },
            parent: grid
        })
    })

    // --- X AXIS LABELS
    if (options?.xAxisLabels && options.xAxisLabels.length) {
        for (let i = 0; i < maxSeriesLength; i += 1) {
            const xLabel = options.xAxisLabels[i];
            if (xLabel) {
                text({
                    options: {
                        x: chartArea.left + (slot * i) + (slot / 2),
                        y: chartArea.bottom + userOptions.xAxisLabelsFontSize!,
                        content: xLabel,
                        "text-anchor": "middle",
                        "font-size": userOptions.xAxisLabelsFontSize
                    },
                    parent: grid
                })
            }
        }
    }


    /**************************************************************************/

    if (parent) {
        parent.appendChild(chart);
    }

    return chart;
}

const utils_chart_line = {
    chartXy
}

export default utils_chart_line