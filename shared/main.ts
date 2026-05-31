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
