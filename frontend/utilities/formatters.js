

/** File size formatter */
export const formatSize = size => {
    if (size < 1024) return `${size} bytes`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
    return `${Math.round(size / 1024 / 1024)} MB`
}