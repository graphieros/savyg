import { ChartArea, StrokeLinecap, StrokeLinejoin, SvgItem } from "./utils_svg_types"
import { element, line, svg } from "./utils_svg";
import { getSvgDimensions } from "./utils_common";

type ChartLineDatasetItem = {
    name?: string
    values: number[]
    stroke?: string
    "stroke-width"?: number
    "stroke-linecap"?: StrokeLinecap
    "stroke-linejoin"?: StrokeLinejoin
    "stroke-dasharray"?: number
    "stroke-dashoffset"?: number
    showDataLabels?: boolean
}

type ChartLineOptions = {
    backgroundColor?: string;
    viewBox?: string;
    className?: string;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    title?: string;
    titlePosition?: "left" | "center" | "right";
}

export function chartLine({
    dataset,
    options,
    parent
}: {
    dataset: ChartLineDatasetItem[],
    options?: ChartLineOptions,
    parent?: HTMLElement
}) {
    const userOptions: ChartLineOptions = {
        backgroundColor: options?.backgroundColor ?? "#FFFFFF",
        viewBox: options?.viewBox ?? '0 0 512 341',
        paddingTop: options?.paddingTop ?? 48,
        paddingRight: options?.paddingRight ?? 24,
        paddingBottom: options?.paddingBottom ?? 48,
        paddingLeft: options?.paddingLeft ?? 48
    }

    const chart = svg({
        options: {
            viewBox: userOptions.viewBox,
            className: options?.className ?? ''
        }
    })

    chart.dataset.savyg = "line"

    /**************************************************************************/

    const { width, height } = getSvgDimensions(userOptions.viewBox as string);

    const chartArea: ChartArea = {
        left: userOptions.paddingLeft!,
        top: userOptions.paddingTop!,
        right: width - userOptions.paddingRight!,
        bottom: height - userOptions.paddingBottom!
    }

    // GRID
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
            y1: chartArea.bottom,
            y2: chartArea.bottom,
            stroke: "black",
            "stroke-linecap": "round"
        },
        parent: grid
    }) as SVGLineElement

    [xAxis, yAxis].forEach(axis => axis.dataset.savyg = "axis")



    console.log({ width, height, chartArea })

    console.log(userOptions, dataset)


    /**************************************************************************/

    if (parent) {
        parent.appendChild(chart);
    }

    return chart;
}

const utils_chart_line = {
    chartLine
}

export default utils_chart_line