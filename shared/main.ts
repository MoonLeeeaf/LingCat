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

export type LongLike = number | { toNumber(): number } | null | undefined

export function toNumber(v: LongLike): number {
    if (v == null) return 0
    if (typeof v === 'number') return v
    if (typeof (v as any).toNumber === 'function') return (v as any).toNumber()
    return Number(v)
}

export function toNumberOrUndefined(v: LongLike): number | undefined {
    if (v == null) return undefined
    return toNumber(v)
}
