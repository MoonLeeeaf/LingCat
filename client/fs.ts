import fs, { configureSingleSync } from '@zenfs/core'
import { WebStorage } from '@zenfs/dom'
configureSingleSync({ backend: WebStorage })

fs.mkdirSync('/public_keys', { recursive: true })
fs.mkdirSync('/sessions', { recursive: true })

// @ts-ignore
window.fs = fs

export default fs
