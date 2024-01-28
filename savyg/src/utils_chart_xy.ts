import { ChartArea, GradientStop, ShapeRendering, StrokeOptions, SvgItem } from "./utils_svg_types"
import { circle, element, line, linearGradient, path, rect, svg, text } from "./utils_svg";
import { calculateNiceScale, createUid, forceNum, fordinum, getMaxSerieLength, getMinMaxInDatasetItems, getSvgDimensions, ratioToMax } from "./utils_common";
import { palette } from "./palette";

// TODO: add descriptions for types

export type BaseDatasetItem = StrokeOptions & {
    /**
     * @option data labels vertical offset for a given series
     * @default 0
     */
    dataLabelOffsetY?: number
    /**
     * @option data labels color for a given series
     * @default "#000000"
     */
    dataLabelsColor?: string
    /**
     * @option data labels font size for a given series
     */
    dataLabelsFontSize?: number
    fill?: string
    /**
     * @option the gradient direction for a given bar or area series
     * @default "vertical"
     */
    gradientDirection?: "vertical" | "horizontal",
    /**
     * @option the gradient starting color for a given bar or area series
     */
    gradientFrom?: string
    /**
     * @option the gradient end color for a given bar or area series
     */
    gradientTo?: string
    /**
     * @option the name of a given series
     */
    name?: string
    /**
     * @option the plot radius for a given line, plot or area series
     * @default 1
     */
    plotRadius?: number
    /**
     * @option the rounding of data labels for a given series
     * @default 0
     */
    rounding?: number
    /**
     * @option the rx border radius of a given bar series
     * @default null
     */
    rx?: number
    /**
     * @option the ry border radius of a given bar series
     * @default null
     */
    ry?: number
    /**
     * @option the graphical type of the series
     * @default "line"
     */
    type?: "line" | "bar" | "area" | "plot"
    /**
     * @option the values for a given series. null values can be provided in the array
     * @example [1, 2, 3, null, 8]
     */
    values: Array<number | null>
}

export type ChartXyDatasetItem = BaseDatasetItem & {
    /**
     * @option show or hide data labels of a given series
     * @default  true
     */
    showDataLabels?: boolean
}

export type ChartXyOptions = {
    /**
     * @option the color of x and y axis lines
     * @default "#000000"
     */
    axisColor?: string
    /**
     * @option the background color applied to the chart
     * @default "#FFFFFF"
     */
    backgroundColor?: string
    /**
     * @option the spacing between bars in pixels.
     * @default 0
     */
    barSpacing?: number
    /**
     * @option pass any strings separated by a space to generate class names. Example: "my-class1 my-class2".
     */
    className?: string
    /**
     * @option font family for all text elements.
     * @default "inherit"
     */
    fontFamily?: string
    /**
     * @option the color of all grid line elements. Can be any color format.
     * @default "#CCCCCC"
     */
    gridColor?: string
    /**
     * @option the id of the svg. Defaults to a random uid
     */
    id?: string
    /**
     * @option activates user interactions (tooltip, zoom)
     * @default true
     */
    interactive?: boolean
    /**
     * @option the text color of legend elements
     * @default "#000000"
     */
    legendColor?: string
    /**
     * @option the font size of legend elements
     * @default 10
     */
    legendFontSize?: number
    /**
     * @option leave space for the legend
     * @default 48
     */
    paddingBottom?: number
    /**
     * @option leave space for y axis labels
     * @default 48
     */
    paddingLeft?: number
    /**
     * @option leave space on the right side of the chart
     * @default 24
     */
    paddingRight?: number
    /**
     * @option leave space for the title
     * @default 48
     */
    paddingTop?: number
    /**
     * @option in interactive mode, color of the selector rect on series hover. Should be a transparent color.
     * @default "#00000010"
     */
    selectorColor?: string
    /**
     * @option standard svg rendering
     * @default "auto"
     */
    "shape-rendering"?: ShapeRendering
    /**
     * @option show or hide axis lines
     * @default true
     */
    showAxis?: boolean
    /**
     * @option show or hide grid lines
     * @default true
     */
    showGrid?: boolean
    /**
     * @option show or hide legend
     * @default true
     */
    showLegend?: boolean
    /**
     * @option the text content of the title element
     * @default ""
     */
    title?: string;
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
     * @option the horizontal position (text-anchor) of the title element
     * @default "start"
     */
    titlePosition?: "start" | "middle" | "end"
    /**
     * @option the background color of the tooltip container
     * @default "#FFFFFF"
     */
    tooltipBackgroundColor?: string
    /**
     * @option the text color of the tooltip content
     * @default "#000000"
     */
    tooltipColor?: string;
    /**
     * @option the viewBox dimensions of the chart's svg
     * @default "0 0 512 341"
     */
    viewBox?: string;
    /**
     * @option the labels on the time axis
     * @default []
     * @example ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"]
     */
    xAxisLabels?: string[]
    /**
     * @option the color of time labels on the x axis
     * @default "#000000"
     */
    xAxisLabelsColor?: string
    /**
     * @option the font size of time labels on the x axis
     * @default 12
     */
    xAxisLabelsFontSize?: number
    /**
     * @option the vertical offset of time labels on the x axis
     * @default 0
     */
    xAxisLabelsOffsetY?: number
    /**
     * @option the color of value labels on the y axis
     * @default "#000000"
     */
    yAxisLabelsColor?: string
    /**
     * @option the font size of value labels on the y axis
     * @default 12
     */
    yAxisLabelsFontSize?: number
    /**
     * @option the rounding of y axis label values
     * @default 1
     */
    yAxisLabelRounding?: number
    /**
     * @option the color of the zoom indicator
     * @default "#00FF0010"
     */
    zoomColor?: string
}

export function chartXy({
    dataset,
    options,
    parent,
    callbacks,
}: {
    dataset: ChartXyDatasetItem[]
    options?: ChartXyOptions
    parent?: HTMLElement
    callbacks?: {
        onClickLegend?: (args?: any) => void
        onHoverLegend?: (args?: any) => void
        onClickPeriod?: (args?: any) => void
        onHoverPeriod?: (args?: any) => void
    }
}) {

    const absoluteDataset = dataset.map((ds, i) => {
        return {
            ...ds,
            values: ds.values.map(v => forceNum(v)),
            "stroke-dasharray": ds['stroke-dasharray'] ?? null,
            "stroke-dashoffset": ds['stroke-dashoffset'] ?? null,
            "stroke-linecap": ds['stroke-linecap'] ?? 'round',
            "stroke-linejoin": ds['stroke-linejoin'] ?? 'round',
            "stroke-width": ds['stroke-width'] ?? 1.5,
            color: ds.stroke ?? palette[i],
            dataLabelOffsetY: ds.dataLabelOffsetY ?? 0,
            dataLabelsColor: ds.dataLabelsColor ?? '#000000',
            dataLabelsFontSize: ds.dataLabelsFontSize ?? 10,
            fill: ds.fill ?? 'none',
            gradientDirection: ds.gradientDirection ?? 'vertical',
            gradientFrom: ds.gradientFrom ?? null,
            gradientTo: ds.gradientTo ?? null,
            plotRadius: ds.plotRadius ?? 1,
            rounding: ds.rounding ?? 0,
            rx: ds.rx ?? null,
            ry: ds.ry ?? null,
            showDataLabels: ds.showDataLabels ?? true,
            type: ds.type ?? 'line',
            uid: createUid(),
        }
    })

    const formattedDataset = [...absoluteDataset];

    const userOptions: ChartXyOptions = {
        axisColor: options?.axisColor ?? '#000000',
        backgroundColor: options?.backgroundColor ?? "#FFFFFF",
        barSpacing: options?.barSpacing ?? 0,
        fontFamily: options?.fontFamily ?? 'inherit',
        gridColor: options?.gridColor ?? '#CCCCCC',
        interactive: options?.interactive ?? true,
        legendColor: options?.legendColor ?? "#000000",
        legendFontSize: options?.legendFontSize ?? 10,
        paddingBottom: options?.paddingBottom ?? 48,
        paddingLeft: options?.paddingLeft ?? 48,
        paddingRight: options?.paddingRight ?? 24,
        paddingTop: options?.paddingTop ?? 48,
        selectorColor: options?.selectorColor ?? '#00000010',
        "shape-rendering": options?.["shape-rendering"] ?? "auto",
        showAxis: options?.showAxis ?? true,
        showGrid: options?.showGrid ?? true,
        showLegend: options?.showLegend ?? true,
        title: options?.title ?? '',
        titleColor: options?.titleColor ?? "#000000",
        titleFontSize: options?.titleFontSize ?? 18,
        titlePosition: options?.titlePosition ?? 'start',
        tooltipBackgroundColor: options?.tooltipBackgroundColor ?? 'rgb(255,255,255,0.9)',
        tooltipColor: options?.tooltipColor ?? '#000000',
        viewBox: options?.viewBox ?? '0 0 512 341',
        xAxisLabelsColor: options?.xAxisLabelsColor ?? '#000000',
        xAxisLabelsFontSize: options?.xAxisLabelsFontSize ?? 12,
        xAxisLabelsOffsetY: options?.xAxisLabelsOffsetY ?? 0,
        yAxisLabelsColor: options?.yAxisLabelsColor ?? '#000000',
        yAxisLabelRounding: options?.yAxisLabelRounding ?? 1,
        yAxisLabelsFontSize: options?.yAxisLabelsFontSize ?? 12,
        zoomColor: options?.zoomColor ?? '#00FF0010'
    }

    const globalUid = createUid();

    const chart = svg({
        options: {
            viewBox: userOptions.viewBox,
            className: options?.className ?? '',
            id: options?.id ?? `xy_${globalUid}`
        }
    })

    chart.dataset.savyg = "line"
    chart.style.fontFamily = userOptions.fontFamily!;
    chart.style.background = userOptions.backgroundColor!;

    /**************************************************************************/

    const { width, height } = getSvgDimensions(userOptions.viewBox as string);

    const chartArea: ChartArea = {
        left: userOptions.paddingLeft!,
        top: userOptions.paddingTop!,
        right: width - userOptions.paddingRight!,
        bottom: height - userOptions.paddingBottom!
    }

    let isZooming = false;
    let selectedTraps: number[] = [];

    // --- DATA

    let { maxSeriesLength } = getMaxSerieLength(dataset)
    const zoom = {
        start: 0,
        end: maxSeriesLength
    }

    function mutateMaxSeriesLength() {
        maxSeriesLength = getMaxSerieLength(dataset, zoom).maxSeriesLength
    }

    let min: number, max: number;

    function calculateMinMax() {
        min = getMinMaxInDatasetItems(dataset, zoom).min < 0 ? getMinMaxInDatasetItems(dataset, zoom).min : 0
        max = getMinMaxInDatasetItems(dataset, zoom).max
    }

    calculateMinMax()

    // ------ * Bounds

    let bounds: { min: number; max: number; ticks: number[] };

    function calculateBounds() {
        bounds = {
            min: calculateNiceScale(min, max, 10).min,
            max: calculateNiceScale(min, max, 10).max,
            ticks: calculateNiceScale(min, max, 10).ticks
        }
    }

    calculateBounds();

    function normalize(val: number) {
        return chartArea.bottom - ((height - userOptions.paddingBottom! - userOptions.paddingTop!) * ratioToMax(val + absoluteMin, absoluteMax))
    }

    let absoluteMin: number, absoluteMax: number, absoluteZero: number, slot: number;

    function calculateAbsolutes() {
        absoluteMin = Math.abs(bounds.min);
        absoluteMax = Math.abs(bounds.max + absoluteMin)
        absoluteZero = chartArea.bottom - ((height - userOptions.paddingBottom! - userOptions.paddingTop!) * ratioToMax(absoluteMin, absoluteMax))
        slot = (width - chartArea.left - userOptions.paddingRight!) / maxSeriesLength;
    }

    calculateAbsolutes();

    // TITLE

    if (userOptions.title) {
        text({
            options: {
                x: userOptions.titlePosition === "middle" ? width / 2 : userOptions.titlePosition === "start" ? chartArea.left : chartArea.right,
                y: userOptions.paddingTop! / 2,
                "text-anchor": userOptions.titlePosition,
                content: userOptions.title,
                "font-weight": "bold",
                fill: userOptions.titleColor,
                className: "savyg-title"
            },
            parent: chart
        })
    }

    // --- GRID
    const grid = element({
        el: SvgItem.G,
        options: {
            className: 'savyg-grid'
        },
        parent: chart
    })

    function drawGrid() {
        if (userOptions.showGrid) {
            grid.innerHTML = "";
            bounds.ticks.forEach(tick => {
                const normalizedValue = normalize(tick);
                line({
                    options: {
                        x1: chartArea.left,
                        x2: chartArea.right,
                        y1: normalizedValue,
                        y2: normalizedValue,
                        stroke: userOptions.gridColor,
                        "stroke-linecap": "round",
                        "stroke-width": 0.6,
                        "shape-rendering": userOptions["shape-rendering"]
                    },
                    parent: grid
                })
            })

            for (let i = 1; i <= maxSeriesLength; i += 1) {
                line({
                    options: {
                        x1: chartArea.left + (slot * i),
                        x2: chartArea.left + (slot * i),
                        y1: chartArea.top,
                        y2: chartArea.bottom,
                        stroke: userOptions.gridColor,
                        "stroke-linecap": "round",
                        "stroke-width": 0.6,
                        "shape-rendering": userOptions["shape-rendering"]
                    },
                    parent: grid
                })
            }
        }

        if (userOptions.showAxis) {
            const yAxis = line({
                options: {
                    x1: chartArea.left,
                    x2: chartArea.left,
                    y1: chartArea.top,
                    y2: chartArea.bottom,
                    stroke: userOptions.axisColor,
                    "stroke-linecap": "round",
                    "shape-rendering": userOptions["shape-rendering"]
                },
                parent: grid
            }) as SVGLineElement

            const xAxis = line({
                options: {
                    x1: chartArea.left,
                    x2: chartArea.right,
                    y1: absoluteZero,
                    y2: absoluteZero,
                    stroke: userOptions.axisColor,
                    "stroke-linecap": "round",
                    "shape-rendering": userOptions["shape-rendering"]
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
                        stroke: userOptions.axisColor,
                        "stroke-linecap": "round",
                        "shape-rendering": userOptions["shape-rendering"]
                    },
                    parent: grid
                })

                text({
                    options: {
                        x: chartArea.left - 7,
                        y: normalizedValue + userOptions.yAxisLabelsFontSize! / 3,
                        "text-anchor": "end",
                        "font-size": userOptions.yAxisLabelsFontSize,
                        content: fordinum(tick, userOptions.yAxisLabelRounding),
                        fill: userOptions.yAxisLabelsColor
                    },
                    parent: grid
                })
            })

            // --- X AXIS LABELS
            if (options?.xAxisLabels && options.xAxisLabels.length) {
                const labels = options.xAxisLabels.filter((_l, i) => i >= zoom.start && i <= zoom.end)
                for (let i = 0; i < labels.length; i += 1) {
                    const xLabel = labels[i];
                    if (xLabel) {
                        text({
                            options: {
                                x: chartArea.left + (slot * i) + (slot / 2),
                                y: chartArea.bottom + userOptions.xAxisLabelsFontSize! + userOptions.xAxisLabelsOffsetY!,
                                content: xLabel,
                                "text-anchor": "middle",
                                "font-size": userOptions.xAxisLabelsFontSize,
                                fill: userOptions.xAxisLabelsColor
                            },
                            parent: grid
                        })
                    }
                }
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

    function drawPlotsAndLines() {
        g_plot_area_line.innerHTML = ""
        plotAndLineDatasets.forEach(ds => {
            if (ds.values.length) {
                ds.values.filter((_, i) => i >= zoom.start && i <= zoom.end).forEach((value, i) => {
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
                                "shape-rendering": userOptions["shape-rendering"]
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
                                    content: fordinum(value, ds.rounding),
                                    fill: ds.dataLabelsColor
                                },
                                parent: g_plot_area_line
                            })
                        }
                    }
                })
            }
        })

    }


    // --- LINES (line datasetItem types only)
    const g_line = element({
        el: SvgItem.G,
        options: {
            className: 'savyg-line'
        },
        parent: chart
    })
    const lineDatasets = formattedDataset.filter(ds => ds.type === 'line');

    function drawLines() {
        g_line.innerHTML = "";
        lineDatasets.forEach((ds) => {
            if (ds.values.length) {
                const normalizedValues = ds.values.filter((_, i) => i >= zoom.start && i <= zoom.end).map((v, j) => {
                    return {
                        x: chartArea.left + (slot * j) + (slot / 2),
                        y: v === null ? null : normalize(v)
                    }
                })
                path({
                    options: {
                        d: ('M' + normalizedValues.map(v => {
                            if (v.y === null) {
                                return 'M '
                            } else {
                                return `${v.x},${v.y} `
                            }
                        }).join(' ')).replace('MM', 'M').trimEnd().replace(/M$/, ''),
                        fill: "none",
                        stroke: ds.color,
                        "stroke-width": ds["stroke-width"],
                        "stroke-dasharray": ds["stroke-dasharray"]!,
                        "stroke-dashoffset": ds["stroke-dashoffset"]!,
                        "stroke-linecap": ds["stroke-linecap"],
                        "stroke-linejoin": ds["stroke-linejoin"],
                        "shape-rendering": userOptions["shape-rendering"]
                    },
                    parent: g_line
                })
            }
        })
    }


    // --- AREAS (area datasetItem types only)
    const g_area = element({
        el: SvgItem.G,
        options: {
            className: 'savyg-area'
        },
        parent: chart
    })

    const areaDatasets = formattedDataset.filter(ds => ds.type === 'area');

    function drawAreas() {
        g_area.innerHTML = ""
        areaDatasets.forEach((ds) => {
            if (ds.values.length) {
                const normalizedValues = ds.values.filter((_, i) => i >= zoom.start && i <= zoom.end).map((v, j) => {
                    return {
                        x: chartArea.left + (slot * j) + (slot / 2),
                        y: v === null ? null : normalize(v)
                    }
                })

                const hasGradient = ds.gradientFrom && ds.gradientTo && ds.gradientDirection;
                const areaGradientId = ds.uid
                if (hasGradient) {
                    const stops: GradientStop[] = [
                        {
                            offset: "0%",
                            'stop-color': ds.gradientFrom!,
                            'stop-opacity': 1
                        },
                        {
                            offset: "100%",
                            'stop-color': ds.gradientTo!,
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
                        "shape-rendering": userOptions["shape-rendering"]
                    },
                    parent: g_area
                })
            }
        })
    }


    // --- BARS (bar datasetItem types only)
    const g_bar = element({
        el: SvgItem.G,
        options: {
            className: 'savyg-bar'
        },
        parent: chart
    })


    function drawBars() {
        const barDatasets = formattedDataset.filter(ds => ds.type === 'bar');
        const barSlot = (width - userOptions.paddingLeft! - userOptions.paddingRight!) / barDatasets.length / maxSeriesLength
        g_bar.innerHTML = ""
        barDatasets.forEach((ds, i) => {
            const hasGradient = ds.gradientFrom && ds.gradientTo && ds.gradientDirection;
            const barGradientPositiveId = ds.uid
            const barGradientNegativeId = createUid()
            if (hasGradient) {
                const stopsPositive: GradientStop[] = [
                    {
                        offset: "0%",
                        'stop-color': ds.gradientFrom!,
                        'stop-opacity': 1
                    },
                    {
                        offset: "100%",
                        'stop-color': ds.gradientTo!,
                        'stop-opacity': 1
                    },
                ]
                const stopsNegative: GradientStop[] = [
                    {
                        offset: "0%",
                        'stop-color': ds.gradientTo!,
                        'stop-opacity': 1
                    },
                    {
                        offset: "100%",
                        'stop-color': ds.gradientFrom!,
                        'stop-opacity': 1
                    },
                ]

                linearGradient({
                    stops: stopsPositive,
                    id: barGradientPositiveId,
                    parent: g_bar,
                    direction: ds.gradientDirection
                })
                linearGradient({
                    stops: stopsNegative,
                    id: barGradientNegativeId,
                    parent: g_bar,
                    direction: ds.gradientDirection
                })
            }

            ds.values.filter((_, i) => i >= zoom.start && i <= zoom.end).forEach((v, j) => {
                rect({
                    options: {
                        x: (chartArea.left + barSlot * i) + (barSlot * j * barDatasets.length) + userOptions.barSpacing!,
                        y: (v ?? 0) < 0 ? absoluteZero : normalize(v ?? 0),
                        height: (v ?? 0) >= 0 ? absoluteZero - normalize(v ?? 0) : normalize(v ?? 0) - absoluteZero,
                        width: barSlot - userOptions.barSpacing! * 2,
                        fill: hasGradient ? (v ?? 0) > 0 ? `url(#${barGradientPositiveId})` : `url(#${barGradientNegativeId})` : ds.color,
                        rx: ds.rx ?? undefined,
                        ry: ds.ry ?? undefined,
                        "shape-rendering": userOptions["shape-rendering"]
                    },
                    parent: g_bar
                })
                if (v !== null) {
                    text({
                        options: {
                            x: (chartArea.left + barSlot * i) + (barSlot * j * barDatasets.length) + userOptions.barSpacing! + ((barSlot) / 2 - (userOptions.barSpacing!)),
                            y: normalize(v ?? 0) + ((v ?? 0) < 0 ? ds.dataLabelsFontSize + ds.dataLabelOffsetY : (-ds.dataLabelsFontSize / 2 - ds.dataLabelOffsetY)),
                            "text-anchor": "middle",
                            "font-size": ds.dataLabelsFontSize,
                            content: fordinum(v ?? 0, ds.rounding),
                            fill: ds.dataLabelsColor
                        },
                        parent: g_bar
                    })
                }
            })
        })
    }

    // LEGEND

    if (userOptions.showLegend) {
        const legend = element({
            el: SvgItem.FOREIGN_OBJECT,
            options: {
                x: chartArea.left,
                y: chartArea.bottom + userOptions.xAxisLabelsFontSize! * 1.2 + userOptions.xAxisLabelsOffsetY!,
                height: userOptions.paddingBottom! - userOptions.xAxisLabelsFontSize! * 1.2 + userOptions.xAxisLabelsOffsetY!,
                width: width - userOptions.paddingLeft! - userOptions.paddingRight!
            }
        });

        function clickLegend(index: number) {
            if (callbacks?.onClickLegend) {
                return callbacks?.onClickLegend({
                    item: absoluteDataset[index]
                })
            }
        }

        function hoverLegend(index: number) {
            if (callbacks?.onHoverLegend) {
                return callbacks?.onHoverLegend({
                    item: absoluteDataset[index]
                })
            }
        }

        legend.style.background = 'transparent';

        const legendWrapper = document.createElement('div');
        legendWrapper.classList.add('savyg-legend');
        legendWrapper.setAttribute('style', `display:flex;align-items:center;justify-content:center;flex-direction:row;column-gap:12px;width:100%;height:100%;font-family:inherit;font-size:${userOptions.legendFontSize}px;overflow:visible`);

        formattedDataset.forEach((ds, i) => {
            const legendItem = document.createElement('div');
            legendItem.setAttribute("style", `display:flex;flex-direction:row;gap:4px;font-size:inherit;width:100%;align-items:center;justify-content:center;align-items:center`);

            const legendMarker = svg({
                options: {
                    viewBox: '0 0 20 20',
                    height: "12",
                    width: "12"
                }
            })

            legendWrapper.style.background = "transparent";

            circle({
                options: {
                    cx: 10,
                    cy: 10,
                    r: 9,
                    fill: ds.gradientFrom && ds.gradientTo && ds.gradientDirection ? `url(#${ds.uid})` : ds.color,
                    "shape-rendering": userOptions["shape-rendering"]
                },
                parent: legendMarker
            })

            const legendLabel = document.createElement('span');
            legendLabel.style.maxWidth = 'calc(100% - 24px)'
            legendLabel.style.whiteSpace = "nowrap"
            legendLabel.style.color = userOptions.legendColor!
            legendLabel.innerHTML = ds.name!;
            [legendMarker, legendLabel].forEach(el => {
                legendItem.appendChild(el);
            })
            legendWrapper.appendChild(legendItem)

            if (callbacks?.onClickLegend) {
                legendItem.addEventListener("click", () => clickLegend(i))
            }
            if (callbacks?.onHoverLegend) {
                legendItem.addEventListener("mouseenter", () => hoverLegend(i))
            }
        })

        legend.appendChild(legendWrapper);

        chart.appendChild(legend)
    }

    // INTERACTIVITY

    const tooltipId = createUid();

    const tooltipCoordinates = {
        x: 0,
        y: 0
    }

    function tooltip(index: number) {
        const tt = document.getElementById(tooltipId) as HTMLElement
        const trap = document.getElementById(`${globalUid}_${index}`) as HTMLElement;
        const datapointIndex = index + zoom.start;
        trap.setAttribute('fill', userOptions.selectorColor!)
        let html = '';
        if (options?.xAxisLabels && options?.xAxisLabels!.length) {
            html += `<div>${options.xAxisLabels![datapointIndex]}</div>`;
        }
        absoluteDataset.forEach(ds => {
            html += `<div style="min-width:0; display:flex; flex-direction:row;gap:4px;align-items:center;"><div><svg viewBox="0 0 20 20" height="14" width="14" style="margin-right:3px;margin-bottom:-1px"><circle cx="10" cy="10" r="9" fill="${ds.gradientFrom && ds.gradientTo && ds.gradientDirection ? `url(#${ds.uid})` : ds.color}"/></svg><span>${ds.name}</span> : <b>${[undefined, null].includes(ds.values[datapointIndex] as any) ? '-' : fordinum(ds.values[datapointIndex] ?? 0, ds.rounding)}</b></div></div>`
        })
        tt!.innerHTML = html;
    }

    function killTooltip(index: number) {
        const tt = document.getElementById(tooltipId);
        tt!.setAttribute("style", "display:none");
        const trap = document.getElementById(`${globalUid}_${index}`);
        trap?.setAttribute('fill', 'transparent');
    }

    function setTooltipCoordinates(event: any, index: number) {
        if (!isZooming) {
            tooltipCoordinates.x = event.clientX
            tooltipCoordinates.y = event.clientY
            const tt = document.getElementById(tooltipId) as HTMLElement;

            tt!.setAttribute("style", `min-width:0;padding:12px;display:flex;position:fixed;top:${tooltipCoordinates.y + 24}px;left:${tooltipCoordinates.x}px;flex-direction:column;gap:3px;align-items:start;background:${userOptions.tooltipBackgroundColor};color:${userOptions.tooltipColor};font-family:inherit;box-shadow:0 6px 12px -6px rgba(0,0,0,0.3);width:200px;`)

            const tooltipRect = tt.getBoundingClientRect();
            const chartRect = chart.getBoundingClientRect();

            if (event.clientX + tooltipRect.width / 2 > chartRect.right) {
                tt.style.left = String(tooltipCoordinates.x - tooltipRect.width) + 'px'
            } else if (event.clientX - tooltipRect.width / 2 < chartRect.left) {
                tt.style.left = String(chartRect.left) + "px"
            } else {
                tt.style.left = String(tooltipCoordinates.x - tooltipRect.width / 2) + 'px'
            }

            if (event.clientY + tooltipRect.height > chartRect.bottom) {
                tt.style.top = String(tooltipCoordinates.y - tooltipRect.height - 48) + 'px'
            }
        }

        // set all selected traps to color
        const traps = document.querySelectorAll(`[data-savyg-zoom="${globalUid}"]`);
        if (isZooming) {
            if (!selectedTraps.includes(index)) {
                selectedTraps.push(index)
            }
            Array.from(traps).forEach((trap, i) => {
                if (i === index || selectedTraps.includes(i)) {
                    trap.setAttribute("fill", userOptions.zoomColor!)
                }
            })
        }
    }

    const tt = document.createElement('div');
    tt.setAttribute("id", tooltipId)
    tt.classList.add('savyg-tooltip')
    tt.style.display = "none"

    if (parent) {
        parent.appendChild(tt)
    }

    const tooltip_traps = element({
        el: SvgItem.G,
        options: {
            className: 'savyg-tooltip-trap'
        },
        parent: chart
    })

    function hoverPeriod(index: number) {
        if (callbacks?.onHoverPeriod) {
            return callbacks?.onHoverPeriod({
                item: absoluteDataset.map(el => {
                    return {
                        ...el,
                        value: el.values[index] ?? null
                    }
                })
            })
        }
    }

    function drawTraps() {
        if (userOptions.interactive) {
            tooltip_traps.innerHTML = ""
            for (let i = 0; i < maxSeriesLength; i += 1) {
                const trap = rect({
                    options: {
                        x: chartArea.left + (slot * i),
                        y: chartArea.top,
                        height: height - userOptions.paddingTop! - userOptions.paddingBottom!,
                        width: slot,
                        fill: "transparent",
                        "shape-rendering": userOptions["shape-rendering"]
                    },
                    parent: tooltip_traps
                })
                trap.setAttribute("id", `${globalUid}_${i}`)
                trap.dataset.savygZoom = globalUid;
                trap.style.cursor = "crosshair"
                trap.addEventListener("mouseenter", () => hoverPeriod(i))
                trap.addEventListener('mouseenter', () => !isZooming && tooltip(i))
                trap.addEventListener('mouseleave', () => killTooltip(i))
                trap.addEventListener('mousemove', (e) => setTooltipCoordinates(e, i))
                trap.addEventListener('mousedown', () => setZoomStart(i))
                trap.addEventListener('mouseup', () => setZoomEnd(i))
            }
        }
    }

    function setZoomStart(index: number) {
        killTooltip(index)
        isZooming = true;
        zoom.start = index;
        if (callbacks?.onClickPeriod) {
            return callbacks?.onClickPeriod({
                item: absoluteDataset.map((el) => {
                    return {
                        ...el,
                        value: el.values[index] ?? null,
                    }
                })
            })
        }
    }

    function setZoomEnd(index: number) {
        killTooltip(index)
        zoom.end = index
        isZooming = false;
        selectedTraps = [];
        if (zoom.end < zoom.start) {
            let temp = zoom.start
            zoom.start = index;
            zoom.end = temp
        }
        if (zoom.end === zoom.start) {
            zoom.start = 0;
            zoom.end = getMaxSerieLength(dataset).maxSeriesLength
        }
        mutateMaxSeriesLength()
        calculateMinMax()
        calculateBounds()
        calculateAbsolutes()
        drawDatapoints()
    }

    function drawDatapoints() {
        drawGrid()
        drawPlotsAndLines()
        drawLines()
        drawAreas()
        drawBars()
        drawTraps()
    }

    drawDatapoints()

    if (parent) {
        parent.appendChild(chart);
    }

    function refresh(rootNode: HTMLElement) {
        if (chart && rootNode) {
            const tt = document.getElementById(tooltipId);
            if (tt) {
                tt.remove();
            }
            if (parent) {
                parent.removeChild(chart)
            } else {
                rootNode.removeChild(chart)
            }
            const xy = chartXy({
                dataset,
                options,
                parent: rootNode,
                callbacks
            })

            return xy
        }
    }

    function updateData(ds: ChartXyDatasetItem[]) {
        if (chart && parent) {
            const tt = document.getElementById(tooltipId);
            if (tt) {
                tt.remove()
            }
            parent.removeChild(chart)
            const xy = chartXy({
                dataset: ds,
                options,
                parent,
                callbacks
            })
            return xy
        } else {
            return
        }
    }

    return {
        chart,
        refresh,
        updateData
    }
}

const utils_chart_line = {
    chartXy
}

export default utils_chart_line