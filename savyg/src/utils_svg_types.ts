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
    TEXT = "text"
}

export type CommonOptions = {
    className?: string
    content?: string
}

export type Coordinates = {
    x: number
    y: number
    z?: number
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

export type Shape = "circle" | "defs" | "g" | "line" | "linearGradient" | "radialGradient" | "path" | "polygon" | "rect" | "stop" | "svg" | "foreignObject" | "text"

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

};

export type SvgWrapper = CommonOptions & {
    viewBox?: string
    height?: string
    width?: string
    id?: string
}

export type TextAnchor = "start" | "middle" | "end"

export type Text = CommonOptions & StrokeOptions & {
    x: number;
    y: number;
    "font-size"?: number
    "font-weight"?: "bold" | "normal"
    "text-anchor"?: TextAnchor
    content: string
    fill?: string
    id?: string
}

export type Path = StrokeOptions & CommonOptions & {
    d: string
    id?: string
    fill?: string
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
}

export type Circle = StrokeOptions & CommonOptions & {
    id?: string
    cx: number
    cy: number
    r: number
    fill?: string
}

export type Line = StrokeOptions & CommonOptions & {
    id?: string
    x1: number
    x2: number
    y1: number
    y2: number
}

export type ChartArea = {
    top: number
    left: number
    right: number
    bottom: number
    centerX?: number
    centerY?: number
}