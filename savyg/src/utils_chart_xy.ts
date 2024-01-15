import { ChartArea, GradientStop, StrokeOptions, SvgItem } from "./utils_svg_types"
import { circle, element, line, linearGradient, path, rect, svg, text } from "./utils_svg";
import { calculateNiceScale, createUid, getMaxSerieLength, getMinMaxInDatasetItems, getSvgDimensions, ratioToMax } from "./utils_common";
import { palette } from "./palette";

// TODO: add descriptions for types

export type BaseDatasetItem = StrokeOptions & {
    dataLabelOffsetY?: number
    dataLabelsColor?: string
    dataLabelsFontSize?: number
    fill?: string
    gradientDirection?: "vertical" | "horizontal",
    gradientFrom?: string
    gradientTo?: string
    name?: string
    plotRadius?: number
    rounding?: number
    rx?: number
    ry?: number
    type?: "line" | "bar" | "area" | "plot"
    values: Array<number | null>
}

export type ChartXyDatasetItem = BaseDatasetItem & {
    showDataLabels?: boolean
}

export type ChartXyOptions = {
    axisColor?: string
    backgroundColor?: string
    barSpacing?: number
    className?: string
    fontFamily?: string
    gridColor?: string
    id?: string
    interactive?: boolean
    legendColor?: string
    legendFontSize?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
    paddingTop?: number
    selectorColor?: string
    showAxis?: boolean
    showGrid?: boolean
    showLegend?: boolean
    title?: string;
    titleColor?: string
    titleFontSize?: number
    titlePosition?: "start" | "middle" | "end"
    tooltipBackgroundColor?: string
    tooltipColor?: string;
    viewBox?: string;
    xAxisLabels?: string[]
    xAxisLabelsColor?: string
    xAxisLabelsFontSize?: number
    xAxisLabelsOffsetY?: number
    yAxisLabelsColor?: string
    yAxisLabelsFontSize?: number
}

export function chartXy({
    dataset,
    options,
    parent
}: {
    dataset: ChartXyDatasetItem[]
    options?: ChartXyOptions
    parent?: HTMLElement
}) {
    const formattedDataset = dataset.map((ds, i) => {
        return {
            ...ds,
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
        yAxisLabelsFontSize: options?.yAxisLabelsFontSize ?? 12,
    }

    const globalUid = createUid();

    const chart = svg({
        options: {
            viewBox: userOptions.viewBox,
            className: options?.className ?? '',
            id: options?.id ?? ''
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

    if (userOptions.showGrid) {
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
                    "stroke-width": 0.6
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
                stroke: userOptions.axisColor,
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
                    stroke: userOptions.axisColor,
                    "stroke-linecap": "round"
                },
                parent: grid
            })

            text({
                options: {
                    x: chartArea.left - 7,
                    y: normalizedValue + userOptions.yAxisLabelsFontSize! / 3,
                    "text-anchor": "end",
                    "font-size": userOptions.yAxisLabelsFontSize,
                    content: String(tick),
                    fill: userOptions.yAxisLabelsColor
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
                },
                parent: g_area
            })
        }
    })

    // --- BARS (bar datasetItem types only)
    const g_bar = element({
        el: SvgItem.G,
        options: {
            className: 'savyg-bar'
        },
        parent: chart
    })

    const barDatasets = formattedDataset.filter(ds => ds.type === 'bar');
    const barSlot = (width - userOptions.paddingLeft! - userOptions.paddingRight!) / barDatasets.length / maxSeriesLength

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

        ds.values.forEach((v, j) => {
            rect({
                options: {
                    x: (chartArea.left + barSlot * i) + (barSlot * j * barDatasets.length) + userOptions.barSpacing!,
                    y: (v ?? 0) < 0 ? absoluteZero : normalize(v ?? 0),
                    height: (v ?? 0) >= 0 ? absoluteZero - normalize(v ?? 0) : normalize(v ?? 0) - absoluteZero,
                    width: barSlot - userOptions.barSpacing! * 2,
                    fill: hasGradient ? (v ?? 0) > 0 ? `url(#${barGradientPositiveId})` : `url(#${barGradientNegativeId})` : ds.color,
                    rx: ds.rx ?? undefined,
                    ry: ds.ry ?? undefined
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
                        content: Number((v ?? 0).toFixed(ds.rounding)).toLocaleString(),
                        fill: ds.dataLabelsColor
                    },
                    parent: g_bar
                })
            }
        })
    })

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

        legend.style.background = 'transparent';

        const legendWrapper = document.createElement('div');
        legendWrapper.classList.add('savyg-legend');
        legendWrapper.setAttribute('style', `display:flex;align-items:center;justify-content:center;flex-direction:row;column-gap:12px;width:100%;height:100%;font-family:inherit;font-size:${userOptions.legendFontSize}px;overflow:visible`);

        formattedDataset.forEach(ds => {
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
                    fill: ds.gradientFrom && ds.gradientTo && ds.gradientDirection ? `url(#${ds.uid})` : ds.color
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
        trap.setAttribute('fill', userOptions.selectorColor!)
        let html = '';
        if (options?.xAxisLabels && options?.xAxisLabels!.length) {
            html += `<div>${options.xAxisLabels![index]}</div>`;
        }
        formattedDataset.forEach(ds => {
            html += `<div style="min-width:0; display:flex; flex-direction:row;gap:4px;align-items:center;"><div><svg viewBox="0 0 20 20" height="14" width="14" style="margin-right:3px;margin-bottom:-1px"><circle cx="10" cy="10" r="9" fill="${ds.gradientFrom && ds.gradientTo && ds.gradientDirection ? `url(#${ds.uid})` : ds.color}"/></svg><span>${ds.name}</span> : <b>${[undefined, null].includes(ds.values[index] as any) ? '-' : Number(ds.values[index]?.toFixed(ds.rounding)).toLocaleString()}</b></div></div>`
        })
        tt!.innerHTML = html;
    }

    function killTooltip(index: number) {
        const tt = document.getElementById(tooltipId);
        tt!.setAttribute("style", "display:none");
        const trap = document.getElementById(`${globalUid}_${index}`);
        trap?.setAttribute('fill', 'transparent');
    }

    function setTooltipCoordinates(event: any) {
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

    const tt = document.createElement('div');
    tt.setAttribute("id", tooltipId)
    tt.classList.add('savyg-tooltip')
    tt.style.display = "none"

    if (parent) {
        parent.appendChild(tt)
    }

    if (userOptions.interactive) {
        const tooltip_traps = element({
            el: SvgItem.G,
            options: {
                className: 'savyg-tooltip-trap'
            },
            parent: chart
        })

        for (let i = 0; i < maxSeriesLength; i += 1) {
            const trap = rect({
                options: {
                    x: chartArea.left + (slot * i),
                    y: chartArea.top,
                    height: height - userOptions.paddingTop! - userOptions.paddingBottom!,
                    width: slot,
                    fill: "transparent"
                },
                parent: tooltip_traps
            })
            trap.setAttribute("id", `${globalUid}_${i}`)
            trap.addEventListener('mouseenter', () => tooltip(i))
            trap.addEventListener('mouseleave', () => killTooltip(i))
            trap.addEventListener('mousemove', (e) => setTooltipCoordinates(e))
        }
    }

    if (parent) {
        parent.appendChild(chart);
    }

    /**************************************************************************/

    return chart;
}

const utils_chart_line = {
    chartXy
}

export default utils_chart_line