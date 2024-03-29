export enum SvgItem {
    CIRCLE = "circle",
    DEFS = "defs",
    G = "g",
    LINE = "line",
    LINEAR_GRADIENT = "linearGradient",
    PATH = "path",
    POLYGON = "polygon",
    RADIAL_GRADIENT = "radialGradient",
    RECT = "rect",
    STOP = "stop",
    SVG = "svg",
    FOREIGN_OBJECT = "foreignObject",
    TEXT = "text",
    CLIP_PATH = "clipPath",
    USE = "use",
    MARKER = "marker",
    ARROW = "arrow"
}

export type ShapeRendering = "auto" | "optimizeSpeed" | "crispEdges" | "geometricPrecision"

export type CommonOptions = {
    className?: string
    content?: string
    "clip-path"?: string
}

export type Coordinates = {
    x: number
    y: number
    z?: number
}

export type ClipPath = CommonOptions & {
    id: string
    className?: string
    clipPathUnits?: "userSpaceOnUse" | "objectBoundingBox"
}

export type Use = CommonOptions & {
    "clip-path"?: string
    "xlink:href"?: string
    fill?: string
}

export type DrawingArea = {
    top: number;
    right: number;
    bottom: number;
    left: number;
    height: number;
    width: number;
    fullHeight: number;
    fullWidth: number;
    centerX: number;
    centerY: number;
}

export type Shape = "circle" | "defs" | "g" | "line" | "linearGradient" | "radialGradient" | "path" | "polygon" | "rect" | "stop" | "svg" | "foreignObject" | "text" | "clipPath" | "use" | "marker"

export type StrokeLinecap = "round" | "butt" | "square"
export type StrokeLinejoin = "arcs" | "bevel" | "miter" | "miter-clip" | "round"
export type StrokeOptions = {
    stroke?: string;
    'stroke-linecap'?: StrokeLinecap
    'stroke-linejoin'?: StrokeLinejoin
    'stroke-dasharray'?: number
    'stroke-dashoffset'?: number
    'stroke-width'?: number
}

export type SvgOptions = {
    [SvgItem.CIRCLE]: Circle
    [SvgItem.DEFS]: CommonOptions
    [SvgItem.G]: G
    [SvgItem.LINE]: Line
    [SvgItem.LINEAR_GRADIENT]: LinearGradient
    [SvgItem.PATH]: Path
    [SvgItem.POLYGON]: Polygon
    [SvgItem.RADIAL_GRADIENT]: RadialGradient
    [SvgItem.RECT]: Rect
    [SvgItem.STOP]: Stop
    [SvgItem.SVG]: SvgWrapper
    [SvgItem.FOREIGN_OBJECT]: ForeignObject
    [SvgItem.TEXT]: Text
    [SvgItem.USE]: Use
    [SvgItem.CLIP_PATH]: ClipPath
    [SvgItem.MARKER]: Marker
    [SvgItem.ARROW]: Arrow

};

export type SvgWrapper = CommonOptions & {
    viewBox?: string
    height?: string
    width?: string
    id?: string
}

export type TextAnchor = "start" | "middle" | "end" | "left" | "center" | "right"

export type Text = CommonOptions & StrokeOptions & {
    x: number;
    y: number;
    "font-size"?: number
    "font-weight"?: "bold" | "normal"
    "text-anchor"?: TextAnchor
    /**
     * @description The content of the text element. Should be kept concise, as SVG text element do not break into multiple lines
     */
    content: string
    /**
     * @description The color of the text. Can be any color format
     */
    fill?: string
    id?: string
}

export type Path = StrokeOptions & CommonOptions & {
    d: string
    id?: string
    fill?: string
    "shape-rendering"?: ShapeRendering
    "marker-start"?: string
    "marker-end"?: string
}

export type GradientStop = {
    offset: string
    'stop-color': string
    'stop-opacity'?: number
}

export type Stop = CommonOptions & {
    offset: string
    'stop-color': string
    'stop-opacity'?: number
}

export type Rect = StrokeOptions & CommonOptions & {
    x: number
    y: number
    width: number
    height: number
    id?: string
    fill?: string
    rx?: number
    ry?: number
    "shape-rendering"?: ShapeRendering
}

export type ForeignObject = CommonOptions & {
    x: number;
    y: number;
    height: string | number;
    width: string | number;
    id?: string;
}

export type RadialGradient = CommonOptions & {
    id: string
    cx?: number
    cy?: number
    fx?: number
    fy?: number
}

export type LinearGradient = CommonOptions & {
    id: string;
    x1: string
    y1: string
    x2: string
    y2: string
}

export type G = StrokeOptions & CommonOptions & {
    id?: string
    fill?: string;
}

export type Polygon = StrokeOptions & CommonOptions & {
    id?: string
    points?: string
    fill?: string
    "shape-rendering"?: ShapeRendering
}

export type Circle = StrokeOptions & CommonOptions & {
    id?: string
    cx: number
    cy: number
    r: number
    fill?: string
    "shape-rendering"?: ShapeRendering
}

export type Line = StrokeOptions & CommonOptions & {
    id?: string
    x1: number
    x2: number
    y1: number
    y2: number
    "shape-rendering"?: ShapeRendering
    "marker-start"?: string
    "marker-end"?: string
}

export type ChartArea = {
    top: number
    left: number
    right: number
    bottom: number
    centerX?: number
    centerY?: number
    height?: number
    width?: number
}

export type PreserveAspectRatioValue =
    | 'none'
    | 'xMinYMin'
    | 'xMidYMin'
    | 'xMaxYMin'
    | 'xMinYMid'
    | 'xMidYMid'
    | 'xMaxYMid'
    | 'xMinYMax'
    | 'xMidYMax'
    | 'xMaxYMax'

type PreserveAspectRatio = `${PreserveAspectRatioValue} ${'meet' | 'slice' | ''}`;

export type Marker = CommonOptions & {
    id?: string
    markerHeight?: number
    markerWidth?: number
    markerUnits?: 'userSpaceOnUse' | 'strokeWidth'
    orient?: 'auto' | 'auto-start-reverse'
    preserveAspectRatio?: PreserveAspectRatio
    refX?: number | 'left' | 'center' | 'right'
    refY?: number | 'top' | 'center' | 'bottom'
    viewBox?: string
}

export type Arrow = Line & Marker & {
    marker: "start" | "end" | "both",
    size?: number
}