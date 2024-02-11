import { palette } from "./palette"
import { calculateNiceScale, createSmoothPath, createUid, forceNum, getMaxSerieLength, getMinMaxInDatasetItems, getSvgDimensions, ratioToMax } from "./utils_common"
import { circle, element, line, path, rect, svg, text } from "./utils_svg"
import { ChartArea, Coordinates, ShapeRendering, StrokeOptions, SvgItem } from "./utils_svg_types"

export type ChartSparkDataset = StrokeOptions & {
    name: string
    values: Array<number | null>
    periods?: string[]
}

export type ChartSparkOptions = {
    areaOpacity?: number;
    /**
     * @option the color of x and y axis lines
     * @default "#CCCCCC"
     */
    axisColor?: string
    /**
     * @option the background color applied to the chart
     * @default "#FFFFFF"
     */
    backgroundColor?: string
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
     * @option the id of the svg. Defaults to a random uid
     */
    id?: string
    /**
     * @option the color of the line and circle indicators
     * @default ""
     */
    indicatorColor?: string;
    /**
     * @option the left starting point of the chart area
     * @default 3
     */
    paddingLeft?: number;
    /**
     * @option the right ending point of the chart area
     * @default 3
    */
    paddingRight?: number;
    /**
     * @option the bottom ending point of the chart area
     * @default 3
    */
    paddingBottom?: number;
    /**
     * @option standard svg rendering
     * @default "auto"
     */
    "shape-rendering"?: ShapeRendering
    /**
     * @option show or hide grid lines
     * @default true
     */
    showGrid?: boolean;
    /**
     * @option The rounding of the hovered value information
     * @default 0
     */
    rounding?: number;
    /**
     * @option show or hide the area
     * @default true
     */
    showArea?: boolean;
    /**
     * @option show or hide the dataset name in the title element
     * @default true
     */
    showTitle?: boolean;
    /**
     * @option show or hide the period and value of the hovered datapoint
     * @default true
     */
    showValueOnHover?: boolean;
    /**
     * @option to make the line or area path smooth
     * @default false
     */
    /**
     * @option the font size of the title & information on hover
     * @default 8
     */
    titleFontSize?: number;
    /**
     * @option the font weight of the title and information on hover
     * @default "normal"
     */
    titleFontWeight?: string;
    /**
     * @option the viewBox dimensions of the chart's svg
     * @default "0 0 192 64"
     */
    viewBox?: string;
}

export function chartSparkline({
    dataset,
    options,
    parent,
}: {
    dataset: ChartSparkDataset;
    options?: ChartSparkOptions;
    parent?: HTMLElement;
}) {

    const absoluteDataset = {
        ...dataset,
        name: dataset.name ?? '',
        values: dataset.values.map(v => forceNum(v)),
        "stroke-dasharray": dataset['stroke-dasharray'] ?? null,
        "stroke-dashoffset": dataset['stroke-dashoffset'] ?? null,
        "stroke-linecap": dataset['stroke-linecap'] ?? 'round',
        "stroke-linejoin": dataset['stroke-linejoin'] ?? 'round',
        "stroke-width": dataset['stroke-width'] ?? 1.5,
        color: dataset.stroke ?? palette[0],
        uid: createUid()
    };

    const userOptions: ChartSparkOptions = {
        areaOpacity: options?.areaOpacity ?? 0.3,
        axisColor: options?.axisColor ?? '#CCCCCC',
        backgroundColor: options?.backgroundColor ?? "#FFFFFF",
        fontFamily: options?.fontFamily ?? 'inherit',
        indicatorColor: options?.indicatorColor ?? "",
        "shape-rendering": options?.["shape-rendering"] ?? "auto",
        paddingLeft: options?.paddingLeft ?? 3,
        paddingRight: options?.paddingRight ?? 3,
        paddingBottom: options?.paddingBottom ?? 3,
        rounding: options?.rounding ?? 0,
        showArea: options?.showArea ?? true,
        showGrid: options?.showGrid ?? false,
        showTitle: options?.showTitle ?? true,
        showValueOnHover: options?.showValueOnHover ?? true,
        titleFontSize: options?.titleFontSize ?? 8,
        titleFontWeight: options?.titleFontWeight ?? "normal",
        viewBox: options?.viewBox ?? '0 0 192 64'
    };

    const globalUid = createUid();

    const chart = svg({
        options: {
            viewBox: userOptions.viewBox,
            className: options?.className ?? '',
            id: options?.id ?? `spark_${globalUid}`
        }
    });

    chart.dataset.savyg = `sparkLine`;
    chart.style.fontFamily = userOptions.fontFamily!;
    chart.style.background = userOptions.backgroundColor!;

    const { width, height } = getSvgDimensions(userOptions.viewBox as string);
    let { maxSeriesLength } = getMaxSerieLength([dataset])

    const chartArea: ChartArea = {
        left: userOptions.paddingLeft!, // tweak with datalabel position
        top: (userOptions.showTitle || userOptions.showValueOnHover) ? userOptions.titleFontSize! + 3 : 3, // tweak with title existence
        right: width - userOptions.paddingRight!, // tweak with datalabel position
        bottom: height - userOptions.paddingBottom!,
        height: height - ((userOptions.showTitle || userOptions.showValueOnHover) ? userOptions.titleFontSize! + 3 : 3) - userOptions.paddingBottom!,
        width: width - userOptions.paddingLeft! - userOptions.paddingRight!
    }

    const { max, min } = getMinMaxInDatasetItems([dataset]);

    function calculateBounds() {
        return {
            min: calculateNiceScale(min, max, 10).min,
            max: calculateNiceScale(min, max, 10).max,
            ticks: calculateNiceScale(min, max, 10).ticks
        }
    }

    const bounds = calculateBounds()

    function normalize(val: number) {
        return chartArea.bottom - (chartArea.height! * ratioToMax(val + absoluteMin, absoluteMax))
    }

    const absoluteMin = Math.abs(bounds.min);
    const absoluteMax = Math.abs(bounds.max + absoluteMin)
    const absoluteZero = chartArea.bottom - (chartArea.height! * ratioToMax(absoluteMin, absoluteMax))
    const slot = chartArea.width! / maxSeriesLength;

    // --- GRID

    const grid = element({
        el: SvgItem.G,
        options: {
            className: 'savyg-grid',
        },
        parent: chart
    })

    function drawGrid() {
        if (userOptions.showGrid) {
            grid.innerHTML = ""

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
            }) as SVGLineElement;

            const yAxis = line({
                options: {
                    x1: chartArea.left,
                    y1: chartArea.top,
                    x2: chartArea.left,
                    y2: chartArea.bottom,
                    stroke: userOptions.axisColor,
                    "stroke-linecap": "round",
                    "shape-rendering": userOptions["shape-rendering"]
                },
                parent: grid
            }) as SVGLineElement;

            [xAxis, yAxis].forEach(axis => axis.dataset.savyg = "axis")
        }
    }

    const normalizedValues = absoluteDataset.values.map((v, i) => {
        return {
            x: chartArea.left + (slot * i) + (slot / 2),
            y: v === null ? null : normalize(v)
        }
    }) as Coordinates[];

    function drawLine() {
        const g_line = element({
            el: SvgItem.G,
            options: {
                className: 'savyg-line',
            },
            parent: chart
        })

        g_line.innerHTML = "";

        path({
            options: {
                d: 'M' + createSmoothPath(normalizedValues),
                fill: "none",
                stroke: absoluteDataset.color,
                "stroke-width": absoluteDataset["stroke-width"],
                "stroke-dasharray": absoluteDataset["stroke-dasharray"]!,
                "stroke-dashoffset": absoluteDataset["stroke-dashoffset"]!,
                "stroke-linecap": absoluteDataset["stroke-linecap"],
                "stroke-linejoin": absoluteDataset["stroke-linejoin"],
                "shape-rendering": userOptions["shape-rendering"]
            },
            parent: g_line
        })

        if (userOptions.showArea) {
            const area = path({
                options: {
                    d: 'M' + `${normalizedValues[0].x},${chartArea.bottom} ` + createSmoothPath(normalizedValues) + ` L ${normalizedValues[normalizedValues.length - 1].x},${chartArea.bottom} z`,
                    fill: absoluteDataset.color,
                    stroke: "none",
                    "stroke-linecap": absoluteDataset["stroke-linecap"],
                    "stroke-linejoin": absoluteDataset["stroke-linejoin"],
                    "shape-rendering": userOptions["shape-rendering"]
                },
                parent: g_line
            })

            area.style.opacity = String(userOptions.areaOpacity)
        }

    }

    function setActiveTrap({ index, trap }: { index: number, trap: Partial<SVGGElement> }) {
        (trap as HTMLElement).style.opacity = "1";
        const title = document.getElementById(`title_${globalUid}`);
        if (title && userOptions.showValueOnHover) {
            title.innerHTML = `${absoluteDataset.name && userOptions.showTitle ? absoluteDataset.name + ' - ' : ''}${absoluteDataset.periods ? absoluteDataset.periods[index] + ' : ' : ''} ${Number(absoluteDataset.values[index].toFixed(userOptions.rounding)).toLocaleString()}`
        }
    }

    function resetTrap({ trap }: { trap: Partial<SVGGElement> }) {
        (trap as HTMLElement).style.opacity = "0"
        const title = document.getElementById(`title_${globalUid}`);
        if (title && userOptions.showValueOnHover) {
            title.innerHTML = absoluteDataset.name && userOptions.showTitle ? absoluteDataset.name : ''
        }
    }


    function drawTraps() {
        const g_traps = element({
            el: SvgItem.G,
            options: {
                className: 'savyg-mouse-traps'
            },
            parent: chart
        });

        g_traps.innerHTML = "";

        absoluteDataset.values.forEach((_, i) => {
            const trap = rect({
                options: {
                    x: chartArea.left + (i * slot),
                    y: chartArea.top,
                    height: chartArea.height!,
                    width: slot,
                    fill: "transparent",
                    id: `trap_${globalUid}_${i}`
                },
                parent: g_traps
            })

            const g_trap_group = element({
                el: SvgItem.G,
                options: {
                    className: 'savyg-trap-indicator'
                },
                parent: g_traps
            })

            line({
                options: {
                    x1: chartArea.left + (i * slot) + (slot / 2),
                    x2: chartArea.left + (i * slot) + (slot / 2),
                    y1: chartArea.top,
                    y2: chartArea.bottom,
                    "stroke-linecap": "round",
                    "stroke-width": 1,
                    stroke: userOptions.indicatorColor || absoluteDataset.color
                },
                parent: g_trap_group
            })

            circle({
                options: {
                    cx: chartArea.left + (i * slot) + (slot / 2),
                    cy: normalizedValues[i].y,
                    fill: userOptions.indicatorColor || absoluteDataset.color,
                    r: 3,
                    stroke: userOptions.backgroundColor,
                    "stroke-width": 1
                },
                parent: g_trap_group
            })

            g_trap_group.style.opacity = "0";
            g_trap_group.style.pointerEvents = "none";

            trap.addEventListener('mouseenter', () => setActiveTrap({
                index: i,
                trap: g_trap_group
            }));
            trap.addEventListener('mouseout', () => resetTrap({
                trap: g_trap_group
            }))
        })
    }

    function drawTitle() {
        text({
            options: {
                x: chartArea.left + slot / 2,
                y: userOptions.titleFontSize!,
                content: userOptions.showTitle ? absoluteDataset.name : '',
                fill: "black",
                "font-size": userOptions.titleFontSize!,
                id: `title_${globalUid}`,
                "text-anchor": "start"
            },
            parent: chart
        })
    }

    function drawDatapoints() {
        drawGrid();
        absoluteDataset.values.length && drawLine();
        drawTraps();
        (userOptions.showTitle || userOptions.showValueOnHover) && drawTitle();
    }

    drawDatapoints()

    ////////////////////////////////////////////////////////////////////////////

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
            const spark = chartSparkline({
                dataset,
                options,
                parent: rootNode,
            })

            return spark
        }
    }

    function updateData(ds: ChartSparkDataset) {
        if (chart && parent) {
            parent.removeChild(chart)
            const spark = chartSparkline({
                dataset: ds,
                options,
                parent,
            })
            return spark
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

const utils_chart_spark = {
    chartSparkline
}

export default utils_chart_spark