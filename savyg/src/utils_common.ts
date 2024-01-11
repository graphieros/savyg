export function getSvgDimensions(viewBox: string) {
    const dimensions = viewBox.split(' ');

    return {
        startX: +dimensions[0],
        startY: +dimensions[1],
        width: +dimensions[2],
        height: +dimensions[3]
    }
}

const utils_commons = {
    getSvgDimensions
}

export default utils_commons