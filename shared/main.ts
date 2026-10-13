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

export function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function hexToBytes(hex: string): Uint8Array {
    const clean = hex.startsWith('0x') ? hex.slice(2) : hex
    const out = new Uint8Array(clean.length / 2)
    for (let i = 0; i < out.length; i++) {
        out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
    }
    return out
}
