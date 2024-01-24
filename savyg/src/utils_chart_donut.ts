import { palette } from "./palette"
import { createUid, fordinum, getSvgDimensions, makeDonut } from "./utils_common"
import { circle, element, findArcMidpoint, line, offsetFromCenterPoint, path, setTextAnchorFromCenterPoint, svg, text } from "./utils_svg"
import { ChartArea, DrawingArea, ShapeRendering, StrokeOptions, SvgItem, TextAnchor } from "./utils_svg_types"

export type ChartDonutDatasetItem = StrokeOptions & {
    name: string
    value: number
    color?: string
}

export type ChartDonutOptions = {
    backgroundColor?: string
    className?: string
    dataLabelsColor?: string
    dataLabelsFontSize?: number
    dataLabelsRoundingPercentage?: number
    dataLabelsRoundingValue?: number
    dataLabelsOffset?: number
    dataLabelsLineOffset?: number
    hideLabelUnderPercentage?: number
    donutRadiusRatio?: number
    donutThickness?: number
    fontFamily?: string
    id?: string
    interactive?: boolean
    legendColor?: string
    legendFontSize?: number
    legendOffsetY?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
    paddingTop?: number
    "shape-rendering"?: ShapeRendering
    showDataLabels?: boolean
    showLegend?: boolean
    showTotal?: boolean,
    title?: string;
    titleColor?: string
    titleFontSize?: number
    titlePosition?: TextAnchor
    tooltipBackgroundColor?: string
    tooltipColor?: string
    totalLabel?: string
    totalLabelColor?: string
    totalLabelFontSize?: number
    totalValueFontSize?: number
    totalValueRounding?: number
    viewBox?: string
}

export function chartDonut({
    dataset,
    options,
    parent,
    callbacks
}: {
    dataset: ChartDonutDatasetItem[]
    options?: ChartDonutOptions
    parent?: HTMLElement
    callbacks?: {
        onClickArc?: (args?: any) => void
        onClickLegend?: (args?: any) => void
        onHoverArc?: (args?: any) => void
        onHoverLegend?: (args?: any) => void
    }
}) {

    const globalUid = createUid();
    const grandTotal = dataset.map(ds => ds.value ?? 0).reduce((a, b) => a + b, 0)

    const formattedDataset = dataset.map((ds, i) => {
        return {
            ...ds,
            color: ds.color ?? palette[i],
            "stroke-width": ds["stroke-width"] ?? 20,
            "stroke-linecap": ds["stroke-linecap"] ?? 'butt',
            uid: createUid(),
            proportion: (ds.value ?? 0) / grandTotal
        }
    }).sort((a, b) => b.proportion - a.proportion)

    const userOptions: ChartDonutOptions = {
        backgroundColor: options?.backgroundColor ?? '#FFFFFF',
        dataLabelsColor: options?.dataLabelsColor ?? "#000000",
        dataLabelsFontSize: options?.dataLabelsFontSize ?? 12,
        dataLabelsRoundingPercentage: options?.dataLabelsRoundingPercentage ?? 0,
        dataLabelsRoundingValue: options?.dataLabelsRoundingValue ?? 0,
        dataLabelsOffset: options?.dataLabelsOffset ?? 70,
        dataLabelsLineOffset: options?.dataLabelsLineOffset ?? 45,
        donutThickness: options?.donutThickness ?? 48,
        donutRadiusRatio: options?.donutRadiusRatio ?? 1,
        fontFamily: options?.fontFamily ?? 'inherit',
        hideLabelUnderPercentage: options?.hideLabelUnderPercentage ?? 3,
        interactive: options?.interactive ?? true,
        legendColor: options?.legendColor ?? '#000000',
        legendFontSize: options?.legendFontSize ?? 10,
        legendOffsetY: options?.legendOffsetY ?? 40,
        paddingBottom: options?.paddingBottom ?? 36,
        paddingLeft: options?.paddingLeft ?? 0,
        paddingRight: options?.paddingRight ?? 0,
        paddingTop: options?.paddingTop ?? 96,
        "shape-rendering": options?.["shape-rendering"] ?? "auto",
        showDataLabels: options?.showDataLabels ?? true,
        showLegend: options?.showLegend ?? true,
        showTotal: options?.showTotal ?? true,
        title: options?.title ?? '',
        titleColor: options?.titleColor ?? "#000000",
        titleFontSize: options?.titleFontSize ?? 18,
        titlePosition: options?.titlePosition ?? 'middle',
        tooltipBackgroundColor: options?.tooltipBackgroundColor ?? 'rgb(255,255,255,0.9)',
        tooltipColor: options?.tooltipColor ?? '#000000',
        totalLabel: options?.totalLabel ?? 'Total',
        totalLabelColor: options?.totalLabelColor ?? '#000000',
        totalLabelFontSize: options?.totalLabelFontSize ?? 20,
        totalValueFontSize: options?.totalValueFontSize ?? 20,
        totalValueRounding: options?.totalValueRounding ?? 0,
        viewBox: options?.viewBox ?? '0 0 450 450',
    }

    const chart = svg({
        options: {
            viewBox: userOptions.viewBox,
            className: options?.className ?? '',
            id: options?.id ?? globalUid
        }
    })

    chart.dataset.savyg = "donut"
    chart.style.fontFamily = userOptions.fontFamily!
    chart.style.backgroundColor = userOptions.backgroundColor!
    chart.style.overflow = "visible"

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

    let arcs = makeDonut({
        series: formattedDataset,
        cx: width / 2,
        cy: height / 2,
        rx: width / (5.5 / userOptions.donutRadiusRatio!),
        ry: width / (5.5 / userOptions.donutRadiusRatio!)
    })

    const tooltipId = createUid();

    const tooltipCoordinates = {
        x: 0,
        y: 0
    }

    const selectionElements = [
        { el: `${globalUid}_##`, s: 'savyg-arc-selected', u: 'savyg-arc-unselected' },
        { el: `${globalUid}_marker_name_##`, s: 'savyg-marker-name-selected', u: 'savyg-marker-name-unselected' },
        { el: `${globalUid}_marker_value_##`, s: 'savyg-marker-value-selected', u: 'savyg-marker-value-unselected' },
        { el: `${globalUid}_marker_line_##`, s: 'savyg-marker-line-selected', u: 'savyg-marker-line-unselected' },
        { el: `${globalUid}_marker_circle_##`, s: 'savyg-marker-circle-selected', u: 'savyg-marker-circle-unselected' }
    ]

    function tooltip(index: number) {
        const tt = document.getElementById(tooltipId) as HTMLElement;
        for (let i = 0; i < formattedDataset.length; i += 1) {
            selectionElements.forEach(o => {
                const e = document.getElementById(o.el.replace("##", i + ''))
                if (e) {
                    if (i !== index) {
                        e.classList.add(o.u)
                    } else {
                        e.classList.add(o.s)
                    }
                }
            })
        }

        let html = '';
        html += `<div style="display:flex;flex-direction:row;gap:4px;align-items:center"><svg viewBox="0 0 20 20" height="14" width="14" style="margin-right:3px;margin-bottom:-1px"><circle cx="10" cy="10" r="9" fill="${formattedDataset[index].color}"/></svg><div>${formattedDataset[index].name ?? '-'}</div></div>`
        html += `<div>${fordinum(formattedDataset[index].value / grandTotal * 100, userOptions.dataLabelsRoundingPercentage, '%')} (${fordinum(formattedDataset[index].value, userOptions.dataLabelsRoundingValue)})</div>`
        tt!.innerHTML = html;
    }

    function killTooltip(index: number) {
        const tt = document.getElementById(tooltipId);

        for (let i = 0; i < formattedDataset.length; i += 1) {
            selectionElements.forEach(o => {
                const e = document.getElementById(o.el.replace('##', i + ''))
                if (e) {
                    e.classList.remove(o.s)
                    e.classList.remove(o.u)
                }
            })
        }

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


    const donutArcs = element({
        el: SvgItem.G,
        options: {
            className: 'savyg-donut-arcs'
        },
        parent: chart
    })

    arcs = arcs.map((a: any, i: number) => {
        return {
            ...a,
            path: path({
                options: {
                    d: a.path,
                    stroke: a.color,
                    "stroke-width": userOptions.donutThickness,
                    fill: "none",
                    id: `${globalUid}_${i}`,
                    "shape-rendering": userOptions["shape-rendering"]
                }
            })
        }
    })

    if (userOptions.showDataLabels) {
        const markers = element({
            el: SvgItem.G,
            options: {
                className: 'savyg-marker'
            },
            parent: chart
        })

        let count = formattedDataset.map(d => d.proportion * 100).filter(v => v < userOptions.hideLabelUnderPercentage!).length;

        arcs.forEach((arc: { path: string, color: string, name: string, proportion: number, value: number, center: { endX: number, endY: number } }, i: number) => {
            const arcMidPoint = findArcMidpoint(arc.path as unknown as SVGPathElement)

            const lineEndpoint = offsetFromCenterPoint({
                initX: arcMidPoint.x,
                initY: arcMidPoint.y,
                offset: userOptions.dataLabelsLineOffset!,
                centerX: drawingArea.centerX,
                centerY: drawingArea.centerY
            })

            const lineEndpointUnderValue = offsetFromCenterPoint({
                initX: arcMidPoint.x,
                initY: arcMidPoint.y,
                offset: userOptions.dataLabelsLineOffset!,
                centerX: drawingArea.centerX,
                centerY: drawingArea.centerY
            })

            const lineStart = offsetFromCenterPoint({
                initX: arcMidPoint.x,
                initY: arcMidPoint.y,
                offset: userOptions.donutThickness! / 2,
                centerX: drawingArea.centerX,
                centerY: drawingArea.centerY
            })

            if (formattedDataset[i].proportion * 100 >= userOptions.hideLabelUnderPercentage!) {
                const labelSerieEndpoint = offsetFromCenterPoint({
                    initX: arcMidPoint.x,
                    initY: arcMidPoint.y,
                    offset: userOptions.dataLabelsOffset!,
                    centerX: drawingArea.centerX,
                    centerY: drawingArea.centerY
                })

                text({
                    options: {
                        x: labelSerieEndpoint.x,
                        y: labelSerieEndpoint.y,
                        fill: userOptions.dataLabelsColor!,
                        "font-size": userOptions.dataLabelsFontSize!,
                        "text-anchor": setTextAnchorFromCenterPoint({
                            x: labelSerieEndpoint.x,
                            centerX: drawingArea.centerX,
                            middleRange: 30
                        }),
                        content: arc.name,
                        id: `${globalUid}_marker_name_${i}`,
                    },
                    parent: markers
                })

                text({
                    options: {
                        x: labelSerieEndpoint.x,
                        y: labelSerieEndpoint.y + userOptions.dataLabelsFontSize!,
                        fill: userOptions.dataLabelsColor!,
                        "font-size": userOptions.dataLabelsFontSize!,
                        "text-anchor": setTextAnchorFromCenterPoint({
                            x: labelSerieEndpoint.x,
                            centerX: drawingArea.centerX,
                            middleRange: 30
                        }),
                        content: `${fordinum(arc.proportion * 100, userOptions.dataLabelsRoundingPercentage, '%')} (${fordinum(arc.value, userOptions.dataLabelsRoundingValue)})`,
                        id: `${globalUid}_marker_value_${i}`,
                    },
                    parent: markers
                })

                line({
                    options: {
                        x1: lineStart.x,
                        y1: lineStart.y,
                        x2: lineEndpoint.x,
                        y2: lineEndpoint.y,
                        stroke: arc.color,
                        "stroke-width": 1,
                        id: `${globalUid}_marker_line_${i}`,
                        "shape-rendering": userOptions["shape-rendering"]
                    },
                    parent: markers
                })

                circle({
                    options: {
                        cx: lineEndpoint.x,
                        cy: lineEndpoint.y,
                        fill: arc.color,
                        r: 3,
                        stroke: "none",
                        id: `${globalUid}_marker_circle_${i}`,
                        "shape-rendering": userOptions["shape-rendering"]
                    },
                    parent: markers
                })

            } else {
                const topDistance = (drawingArea.centerX - lineEndpointUnderValue.x) / 2
                const lineEndY = (lineEndpointUnderValue.y * 1.3) - (count * (userOptions.dataLabelsFontSize!)) - topDistance

                path({
                    options: {
                        d: `M${lineStart.x},${lineStart.y} ${lineEndpointUnderValue.x},${lineEndY}`,
                        stroke: arc.color,
                        "stroke-width": 0.6,
                        id: `${globalUid}_marker_line_${i}`,
                        "stroke-linecap": "round",
                        "shape-rendering": userOptions["shape-rendering"],
                        fill: "none"
                    },
                    parent: markers
                })

                circle({
                    options: {
                        cx: lineEndpointUnderValue.x,
                        cy: lineEndY,
                        fill: arc.color,
                        r: 1.8,
                        stroke: "none",
                        id: `${globalUid}_marker_circle_${i}`,
                        "shape-rendering": userOptions["shape-rendering"]
                    },
                    parent: markers
                })

                text({
                    options: {
                        x: lineEndpointUnderValue.x + 6,
                        y: lineEndY + (userOptions.dataLabelsFontSize! * 0.6) / 4,
                        fill: userOptions.dataLabelsColor!,
                        "font-size": userOptions.dataLabelsFontSize! * 0.6,
                        "text-anchor": "start",
                        content: `${arc.name} : ${fordinum(arc.proportion * 100, userOptions.dataLabelsRoundingPercentage, '%')} (${fordinum(arc.value, userOptions.dataLabelsRoundingValue)})`,
                        id: `${globalUid}_marker_name_${i}`,
                    },
                    parent: markers
                })

                count -= 1
            }
        })
    }

    function clickArc(index: number) {
        if (callbacks?.onClickArc) {
            return callbacks?.onClickArc({
                arc: {
                    "stroke-width": arcs[index]["stroke-width"],
                    arcMidpoint: findArcMidpoint(arcs[index].path),
                    color: arcs[index].color,
                    cx: arcs[index].cx,
                    cy: arcs[index].cy,
                    name: arcs[index].name,
                    path: arcs[index].path,
                    proportion: arcs[index].proportion,
                    uid: arcs[index].uid,
                    value: arcs[index].value,
                }
            })
        }
    }

    function hoverArc(index: number) {
        if (callbacks?.onHoverArc) {
            return callbacks?.onHoverArc({
                arc: {
                    "stroke-width": arcs[index]["stroke-width"],
                    arcMidpoint: findArcMidpoint(arcs[index].path),
                    color: arcs[index].color,
                    cx: arcs[index].cx,
                    cy: arcs[index].cy,
                    name: arcs[index].name,
                    path: arcs[index].path,
                    proportion: arcs[index].proportion,
                    uid: arcs[index].uid,
                    value: arcs[index].value,
                },
            })
        }
    }

    arcs.forEach((arc: { path: string; color: string }, i: number) => {
        const anArc = arc.path as unknown as SVGPathElement

        if (userOptions.interactive) {
            anArc.addEventListener("mouseenter", () => tooltip(i))
            anArc.addEventListener("mouseleave", () => killTooltip(i))
            anArc.addEventListener('mousemove', (e) => setTooltipCoordinates(e))
            if (callbacks?.onClickArc) {
                anArc.addEventListener('click', () => clickArc(i))
            }
            if (callbacks?.onHoverArc) {
                anArc.addEventListener('mouseenter', () => hoverArc(i))
            }
        }

        donutArcs.appendChild(anArc)
    })

    // HOLLOW

    if (userOptions.showTotal) {
        text({
            options: {
                x: width / 2,
                y: height / 2 - userOptions.totalLabelFontSize! / 3,
                "font-size": userOptions.totalLabelFontSize!,
                content: userOptions.totalLabel!,
                "text-anchor": "middle",
                fill: userOptions.totalLabelColor
            },
            parent: chart
        })
        text({
            options: {
                x: width / 2,
                y: height / 2 + userOptions.totalValueFontSize!,
                "font-size": userOptions.totalValueFontSize,
                content: fordinum(grandTotal, userOptions.totalValueRounding),
                "text-anchor": "middle",
                fill: userOptions.totalLabelColor
            },
            parent: chart
        })
    }

    // TITLE

    if (userOptions.title) {
        text({
            options: {
                x: userOptions.titlePosition === "middle" ? width / 2 : userOptions.titlePosition === "start" ? chartArea.left : chartArea.right,
                y: userOptions.paddingTop! / 2,
                "text-anchor": userOptions.titlePosition,
                content: userOptions.title,
                "font-weight": "bold",
                fill: userOptions.titleColor!,
                className: "savyg-title"
            },
            parent: chart
        })
    }

    // LEGEND

    if (userOptions.showLegend) {
        const legend = element({
            el: SvgItem.FOREIGN_OBJECT,
            options: {
                x: chartArea.left,
                y: chartArea.bottom - userOptions.legendOffsetY!,
                height: userOptions.paddingBottom! + userOptions.legendOffsetY!,
                width: width
            }
        });

        function clickLegend(index: number) {
            if (callbacks?.onClickLegend) {
                return callbacks?.onClickLegend({
                    arc: arcs[index],
                    item: formattedDataset[index]
                })
            }
        }

        function hoverLegend(index: number) {
            if (callbacks?.onHoverLegend) {
                return callbacks?.onHoverLegend({
                    arc: arcs[index],
                    item: formattedDataset[index]
                })
            }
        }

        legend.style.background = 'transparent';

        const legendWrapper = document.createElement('div');
        legendWrapper.classList.add('savyg-legend');
        legendWrapper.setAttribute('style', `display:flex;align-items:center;justify-content:center;flex-direction:row;column-gap:12px;width:100%;height:100%;font-family:inherit;font-size:${userOptions.legendFontSize}px;overflow:visible;flex-wrap:wrap`);

        formattedDataset.forEach((ds, i) => {
            const legendItem = document.createElement('div');
            legendItem.setAttribute("style", `display:flex;flex-direction:row;gap:4px;font-size:inherit;width:fit-content;max-width:100%;align-items:center;justify-content:center;align-items:center;`);

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
                    fill: ds.color,
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

    if (parent) {
        parent.appendChild(chart)
    }

    function refresh(rootNode: HTMLElement) {
        if (chart && rootNode) {
            const tt = document.getElementById(tooltipId);
            if (tt) {
                tt.remove()
            }
            if (parent) {
                parent.removeChild(chart)
            } else {
                rootNode.removeChild(chart)
            }
            const donut = chartDonut({
                dataset,
                options,
                parent: rootNode,
                callbacks
            });
            return donut
        }
    }

    function updateData(ds: ChartDonutDatasetItem[]) {
        if (chart && parent) {
            const tt = document.getElementById(tooltipId);
            if (tt) {
                tt.remove()
            }
            parent.removeChild(chart)
            const donut = chartDonut({
                dataset: ds,
                options,
                parent,
                callbacks
            });
            return donut
        } else {
            return
        }
    }

    return {
        chart,
        refresh,
        updateData,
        arcs: arcs.map((a: any, i: number) => {
            return {
                pathElement: a.path,
                arcMidPoint: findArcMidpoint(a.path),
                name: formattedDataset[i].name,
                color: formattedDataset[i].color,
                uid: formattedDataset[i].uid,
                value: formattedDataset[i].value,
                percentage: formattedDataset[i].proportion
            }
        }),
        dimensions: {
            centerX: drawingArea.centerX,
            centerY: drawingArea.centerY
        }
    }
}

const utils_chart_donut = {
    chartDonut
}

export default utils_chart_donut