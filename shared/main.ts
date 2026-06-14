import fs from 'node:fs'

export function fileExists(path: string) {
    try {
        fs.statSync(path)
        return true
    } catch (e) {
        return false
    }
}
export function mkdir(path: string) {
    return fs.mkdirSync(path, { recursive: true })
}

export function toUint8Array(data: Buffer | ArrayBuffer | Buffer[] | Uint8Array) {
    let buffer: Uint8Array
    if (data instanceof Uint8Array)
        buffer = data
    else if (data instanceof Buffer)
        buffer = data
    else if (Array.isArray(data))
        buffer = new Uint8Array(Buffer.concat(data))
    else
        buffer = new Uint8Array(data)
    return buffer
}
