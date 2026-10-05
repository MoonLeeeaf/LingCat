/**
 * 将图片居中裁剪为 1:1 正方形, 并缩放到指定边长后导出为 Blob。
 * 用于上传头像时统一为正方形。
 */
export async function cropImageToSquare(file: Blob, size = 512, mime = 'image/png'): Promise<Blob> {
    const bitmap = await loadBitmap(file)
    const { width, height } = bitmap
    const min = Math.min(width, height)
    const sx = (width - min) / 2
    const sy = (height - min) / 2

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建 canvas 上下文')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap.source, sx, sy, min, min, 0, 0, size, size)
    bitmap.close()

    return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('图片导出失败')), mime)
    })
}

interface LoadedBitmap {
    source: CanvasImageSource
    width: number
    height: number
    close: () => void
}

async function loadBitmap(file: Blob): Promise<LoadedBitmap> {
    // 优先用 createImageBitmap (低内存/带 EXIF 方向)
    if (typeof createImageBitmap === 'function') {
        try {
            const bmp = await createImageBitmap(file)
            return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close?.() }
        } catch { /* 回退 */ }
    }
    // 回退: Image + object URL
    return await new Promise<LoadedBitmap>((resolve, reject) => {
        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => resolve({
            source: img,
            width: img.naturalWidth,
            height: img.naturalHeight,
            close: () => URL.revokeObjectURL(url),
        })
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片加载失败')) }
        img.src = url
    })
}
