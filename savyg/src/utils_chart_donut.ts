import { palette } from "./palette"
import { createDonutMarker, createUid, getSvgDimensions, makeDonut, positionDonutLabel } from "./utils_common"
import { circle, element, line, path, svg, text } from "./utils_svg"
import { ChartArea, DrawingArea, StrokeOptions, SvgItem, TextAnchor } from "./utils_svg_types"

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
    showDataLabels?: boolean
    showLegend?: boolean
    showTotal?: boolean,
    title?: string;
    titleColor?: string
    titleFontSize?: number
    titlePosition?: "start" | "middle" | "end"
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
    parent
}: {
    dataset: ChartDonutDatasetItem[]
    options?: ChartDonutOptions
    parent?: HTMLElement
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
        donutThickness: options?.donutThickness ?? 56,
        fontFamily: options?.fontFamily ?? 'inherit',
        interactive: options?.interactive ?? true,
        legendColor: options?.legendColor ?? '#000000',
        legendFontSize: options?.legendFontSize ?? 10,
        legendOffsetY: options?.legendOffsetY ?? 40,
        paddingBottom: options?.paddingBottom ?? 36,
        paddingLeft: options?.paddingLeft ?? 0,
        paddingRight: options?.paddingRight ?? 0,
        paddingTop: options?.paddingTop ?? 96,
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
            id: options?.id ?? ''
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

    const arcs = makeDonut({
        series: formattedDataset,
        cx: width / 2,
        cy: height / 2,
        rx: width / 5,
        ry: width / 5
    })


    if (userOptions.showDataLabels) {
        const markers = element({
            el: SvgItem.G,
            options: {
                className: 'savyg-marker'
            },
            parent: chart
        })

        arcs.forEach((arc: { path: string, color: string, name: string, proportion: number, value: number, center: { endX: number, endY: number } }, i: number) => {
            const labelPosition = positionDonutLabel({ drawingArea, element: arc })
            text({
                options: {
                    x: labelPosition.x,
                    y: labelPosition.y,
                    fill: userOptions.dataLabelsColor!,
                    "font-size": userOptions.dataLabelsFontSize!,
                    "text-anchor": labelPosition.textAnchor as TextAnchor,
                    content: arc.name,
                    id: `${globalUid}_marker_name_${i}`,
                },
                parent: markers
            })

            const percentagePosition = positionDonutLabel({ drawingArea, element: arc, offset: 3 + userOptions.dataLabelsFontSize! })
            text({
                options: {
                    x: percentagePosition.x,
                    y: percentagePosition.y,
                    fill: userOptions.dataLabelsColor!,
                    "font-size": userOptions.dataLabelsFontSize!,
                    "text-anchor": percentagePosition.textAnchor as TextAnchor,
                    content: `${Number((arc.proportion * 100).toFixed(userOptions.dataLabelsRoundingPercentage)).toLocaleString()}% (${Number(arc.value.toFixed(userOptions.dataLabelsRoundingValue)).toLocaleString()})`,
                    id: `${globalUid}_marker_value_${i}`,
                },
                parent: markers
            })

            line({
                options: {
                    x1: arc.center.endX,
                    y1: arc.center.endY,
                    x2: createDonutMarker({ drawingArea, element: arc, offset: drawingArea.width / 5 }).x2,
                    y2: createDonutMarker({ drawingArea, element: arc, offset: drawingArea.width / 5 }).y2,
                    stroke: arc.color,
                    "stroke-width": 1,
                    id: `${globalUid}_marker_line_${i}`,
                },
                parent: markers
            })

            circle({
                options: {
                    cx: arc.center.endX,
                    cy: arc.center.endY,
                    fill: arc.color,
                    r: 3,
                    stroke: "none",
                    id: `${globalUid}_marker_circle_${i}`,
                },
                parent: markers
            })
        })
    }

    // ARCS

    const tooltipId = createUid();

    const tooltipCoordinates = {
        x: 0,
        y: 0
    }

    function tooltip(index: number) {
        const tt = document.getElementById(tooltipId) as HTMLElement;

        for (let i = 0; i < formattedDataset.length; i += 1) {
            if (i !== index) {
                const arc = document.getElementById(`${globalUid}_${i}`)
                if (arc) {
                    arc.classList.add('savyg-arc-unselected')
                }
                const markerTextName = document.getElementById(`${globalUid}_marker_name_${i}`)
                if (markerTextName) {
                    markerTextName.classList.add('savyg-marker-name-unselected')
                }
                const markerTextValue = document.getElementById(`${globalUid}_marker_value_${i}`)
                if (markerTextValue) {
                    markerTextValue.classList.add('savyg-marker-value-unselected')
                }
                const markerLine = document.getElementById(`${globalUid}_marker_line_${i}`)
                if (markerLine) {
                    markerLine.classList.add("savyg-marker-line-unselected")
                }
                const markerCircle = document.getElementById(`${globalUid}_marker_circle_${i}`)
                if (markerCircle) {
                    markerCircle.classList.add("savyg-marker-circle-unselected")
                }
            } else {
                const arc = document.getElementById(`${globalUid}_${i}`)
                if (arc) {
                    arc.classList.add('savyg-arc-selected')
                }
                const markerTextName = document.getElementById(`${globalUid}_marker_name_${i}`)
                if (markerTextName) {
                    markerTextName.classList.add('savyg-marker-name-selected')
                }
                const markerTextValue = document.getElementById(`${globalUid}_marker_value_${i}`)
                if (markerTextValue) {
                    markerTextValue.classList.add('savyg-marker-value-selected')
                }
                const markerLine = document.getElementById(`${globalUid}_marker_line_${i}`)
                if (markerLine) {
                    markerLine.classList.add("savyg-marker-line-selected")
                }
                const markerCircle = document.getElementById(`${globalUid}_marker_circle_${i}`)
                if (markerCircle) {
                    markerCircle.classList.add("savyg-marker-circle-selected")
                }
            }
        }


        let html = '';
        html += `<div style="display:flex;flex-direction:row;gap:4px;align-items:center"><svg viewBox="0 0 20 20" height="14" width="14" style="margin-right:3px;margin-bottom:-1px"><circle cx="10" cy="10" r="9" fill="${formattedDataset[index].color}"/></svg><div>${formattedDataset[index].name ?? '-'}</div></div>`
        html += `<div>${Number((formattedDataset[index].value / grandTotal * 100).toFixed(userOptions.dataLabelsRoundingPercentage)).toLocaleString()}% (${Number(formattedDataset[index].value.toFixed(userOptions.dataLabelsRoundingValue)).toLocaleString()})</div>`
        tt!.innerHTML = html;
    }

    function killTooltip(index: number) {
        const tt = document.getElementById(tooltipId);

        for (let i = 0; i < formattedDataset.length; i += 1) {
            const arc = document.getElementById(`${globalUid}_${i}`)
            if (arc) {
                arc.classList.remove('savyg-arc-unselected')
                arc.classList.remove('savyg-arc-selected')
            }
            const markerTextName = document.getElementById(`${globalUid}_marker_name_${i}`)
            if (markerTextName) {
                markerTextName.classList.remove('savyg-marker-name-unselected')
                markerTextName.classList.remove('savyg-marker-name-selected')
            }
            const markerTextValue = document.getElementById(`${globalUid}_marker_value_${i}`)
            if (markerTextValue) {
                markerTextValue.classList.remove('savyg-marker-value-unselected')
                markerTextValue.classList.remove('savyg-marker-value-selected')
            }
            const markerLine = document.getElementById(`${globalUid}_marker_line_${i}`)
            if (markerLine) {
                markerLine.classList.remove("savyg-marker-line-unselected")
                markerLine.classList.remove("savyg-marker-line-selected")
            }
            const markerCircle = document.getElementById(`${globalUid}_marker_circle_${i}`)
            if (markerCircle) {
                markerCircle.classList.remove("savyg-marker-circle-unselected")
                markerCircle.classList.remove("savyg-marker-circle-selected")
            }
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
    arcs.forEach((arc: { path: string; color: string }, i: number) => {
        const anArc = path({
            options: {
                d: arc.path,
                stroke: arc.color,
                "stroke-width": userOptions.donutThickness,
                fill: "none",
                id: `${globalUid}_${i}`
            },
            parent: donutArcs
        })
        if (userOptions.interactive) {
            anArc.addEventListener("mouseenter", () => tooltip(i))
            anArc.addEventListener("mouseleave", () => killTooltip(i))
            anArc.addEventListener('mousemove', (e) => setTooltipCoordinates(e))
        }
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
                content: Number(grandTotal.toFixed(userOptions.totalValueRounding)).toLocaleString(),
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
                fill: userOptions.titleColor!
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

        legend.style.background = 'transparent';

        const legendWrapper = document.createElement('div');
        legendWrapper.classList.add('savyg-legend');
        legendWrapper.setAttribute('style', `display:flex;align-items:center;justify-content:center;flex-direction:row;column-gap:12px;width:100%;height:100%;font-family:inherit;font-size:${userOptions.legendFontSize}px;overflow:visible;flex-wrap:wrap`);

        formattedDataset.forEach(ds => {
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
                    fill: ds.color
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

    if (parent) {
        parent.appendChild(chart)
    }

    return chart;
}

const utils_chart_donut = {
    chartDonut
}

export default utils_chart_donut