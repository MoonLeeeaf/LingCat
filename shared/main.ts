import fs from 'node:fs'

export function fileExists(path: string) {
    try {
        fs.statSync(path)
        return true
    } catch (e) {
        return false
    }
}
