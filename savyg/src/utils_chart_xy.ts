import { ChartArea, StrokeOptions, SvgItem } from "./utils_svg_types"
import { circle, element, line, linearGradient, path, svg, text } from "./utils_svg";
import { calculateNiceScale, createUid, getMaxSerieLength, getMinMaxInDatasetItems, getSvgDimensions, ratioToMax } from "./utils_common";
import { palette } from "./palette";

// TODO: add descriptions for types

export type BaseDatasetItem = StrokeOptions & {
    dataLabelOffsetY?: number
    dataLabelsColor?: string
    dataLabelsFontSize?: number
    name?: string
    plotRadius?: number
    rounding?: number
    type?: "line" | "bar" | "area" | "plot"
    values: Array<number | null>
    fill?: string
    gradientFrom?: string
    gradientTo?: string
    gradientDirection?: "vertical" | "horizontal"
}

export type ChartXyDatasetItem = BaseDatasetItem & {
    showDataLabels?: boolean
}

export type ChartXyOptions = {
    backgroundColor?: string;
    className?: string;
    fontFamily?: string
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    title?: string;
    titlePosition?: "left" | "center" | "right";
    viewBox?: string;
    xAxisLabels?: string[]
    xAxisLabelsFontSize?: number
    yAxisLabelsFontSize?: number
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
    const formattedDataset = dataset.map((ds, i) => {
        return {
            ...ds,
            type: ds.type ?? 'line',
            color: ds.stroke ?? palette[i],
            showDataLabels: ds.showDataLabels ?? true,
            rounding: ds.rounding ?? 0,
            plotRadius: ds.plotRadius ?? 1,
            dataLabelOffsetY: ds.dataLabelOffsetY ?? 0,
            dataLabelsFontSize: ds.dataLabelsFontSize ?? 10,
            dataLabelsColor: ds.dataLabelsColor ?? '#000000',
            fill: ds.fill ?? 'none',
            "stroke-width": ds['stroke-width'] ?? 1.5,
            "stroke-dasharray": ds['stroke-dasharray'] ?? null,
            "stroke-dashoffset": ds['stroke-dashoffset'] ?? null,
            "stroke-linecap": ds['stroke-linecap'] ?? 'round',
            "stroke-linejoin": ds['stroke-linejoin'] ?? 'round',
            gradientFrom: ds.gradientFrom ?? null,
            gradientTo: ds.gradientTo ?? null,
            gradientDirection: ds.gradientDirection ?? 'vertical'
        }
    })

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

    // --- PLOTS (line, plot & area datasetItem types)
    const g_plot_area_line = element({
        el: SvgItem.G,
        options: {
            className: 'savyg-plot-area-line'
        },
        parent: chart
    })
    const plotAndLineDatasets = formattedDataset.filter(ds => ["plot", "line", "area"].includes(ds.type!))

    plotAndLineDatasets.forEach(ds => {
        if (ds.values.length) {
            ds.values.forEach((value, i) => {
                if (value !== null) {
                    circle({
                        options: {
                            r: ds.plotRadius!,
                            cx: chartArea.left + (slot * i) + (slot / 2),
                            cy: normalize(value),
                            fill: ds.color,
                            stroke: ds.stroke,
                            "stroke-width": ds["stroke-width"],
                            "stroke-dasharray": ds["stroke-dasharray"]!,
                            "stroke-dashoffset": ds["stroke-dashoffset"]!,
                            "stroke-linecap": ds["stroke-linecap"],
                            "stroke-linejoin": ds["stroke-linejoin"],
                        },
                        parent: g_plot_area_line
                    })

                    if (ds.showDataLabels) {
                        text({
                            options: {
                                x: chartArea.left + (slot * i) + (slot / 2),
                                y: normalize(value) - (ds.dataLabelsFontSize! / 2) + ds.dataLabelOffsetY,
                                "text-anchor": "middle",
                                "font-size": ds.dataLabelsFontSize,
                                content: Number(value.toFixed(ds.rounding)).toLocaleString(),
                                fill: ds.dataLabelsColor
                            },
                            parent: g_plot_area_line
                        })
                    }
                }
            })
        }
    })

    // --- LINES (line datasetItem types only)
    const g_line = element({
        el: SvgItem.G,
        options: {
            className: 'savyg-line'
        },
        parent: chart
    })
    const lineDatasets = formattedDataset.filter(ds => ds.type === 'line');

    lineDatasets.forEach((ds) => {
        if (ds.values.length) {
            const normalizedValues = ds.values.map((v, j) => {
                return {
                    x: chartArea.left + (slot * j) + (slot / 2),
                    y: v === null ? null : normalize(v)
                }
            })
            path({
                options: {
                    d: 'M' + normalizedValues.map(v => {
                        if (v.y === null) {
                            return 'M '
                        } else {
                            return `${v.x},${v.y} `
                        }
                    }).join(' '),
                    fill: "none",
                    stroke: ds.color,
                    "stroke-width": ds["stroke-width"],
                    "stroke-dasharray": ds["stroke-dasharray"]!,
                    "stroke-dashoffset": ds["stroke-dashoffset"]!,
                    "stroke-linecap": ds["stroke-linecap"],
                    "stroke-linejoin": ds["stroke-linejoin"],
                },
                parent: g_line
            })
        }
    })

    // --- AREAS (area datasetItem types only)
    const g_area = element({
        el: SvgItem.G,
        options: {
            className: 'savyg-area'
        },
        parent: chart
    })

    const areaDatasets = formattedDataset.filter(ds => ds.type === 'area');

    areaDatasets.forEach((ds) => {
        if (ds.values.length) {
            const normalizedValues = ds.values.map((v, j) => {
                return {
                    x: chartArea.left + (slot * j) + (slot / 2),
                    y: v === null ? null : normalize(v)
                }
            })

            const hasGradient = ds.gradientFrom && ds.gradientTo && ds.gradientDirection;
            const areaGradientId = createUid()
            if (hasGradient) {
                const stops = [
                    {
                        offset: "0%",
                        'stop-color': ds.gradientFrom,
                        'stop-opacity': 1
                    },
                    {
                        offset: "100%",
                        'stop-color': ds.gradientTo,
                        'stop-opacity': 1
                    },
                ]

                linearGradient({
                    stops,
                    id: areaGradientId,
                    parent: g_area,
                    direction: ds.gradientDirection
                })
            }

            path({
                options: {
                    d: `M ${normalizedValues[0].x},${chartArea.bottom} ${normalizedValues.map(v => {
                        if (v.y === null) {
                            return ' '
                        } else {
                            return `${v.x},${v.y} `
                        }
                    }).join(' ')} ${normalizedValues[normalizedValues.length - 1].x},${chartArea.bottom}Z`,
                    fill: hasGradient ? `url(#${areaGradientId})` : ds.fill,
                    stroke: ds.color,
                    "stroke-width": ds["stroke-width"],
                    "stroke-dasharray": ds["stroke-dasharray"]!,
                    "stroke-dashoffset": ds["stroke-dashoffset"]!,
                    "stroke-linecap": ds["stroke-linecap"],
                    "stroke-linejoin": ds["stroke-linejoin"],
                },
                parent: g_area
            })
        }
    })

    // --- BARS (bar datasetItem types only)


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