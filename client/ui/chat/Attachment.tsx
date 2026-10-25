import React from 'react'
import { motion } from 'motion/react'
import ReloadableImage from '../ReloadableImage.tsx'
import ImageViewerDialog from '../viewer/ImageViewerDialog.tsx'
import VideoViewerDialog from '../viewer/VideoViewerDialog.tsx'
import SessionEnv from '../../SessionEnv.ts'
import getFileUrl from '../../lib/getFileUrl.ts'
import { queryAttachmentMime } from '../../AttachmentMimeCache.ts'
import AudioAttachment from './AudioAttachment.tsx'

export interface IAttachmentData {
    hash: string
    name: string
}

export interface AttachmentContext {
    messageId?: number
    chatId?: string
    chatTitle?: string
    senderName?: string
}

function resolveKind(mime: string): 'image' | 'video' | 'audio' | 'file' {
    if (mime.startsWith('image/')) return 'image'
    if (mime.startsWith('audio/')) return 'audio'
    if (mime.startsWith('video/')) return 'video'
    return 'file'
}

const AUDIO_EXTENSIONS = new Set(['webm', 'ogg', 'oga', 'opus', 'm4a', 'mp3', 'wav', 'aac', 'caf', 'flac'])

function looksLikeAudioName(name?: string): boolean {
    const ext = name?.split('.').pop()?.toLowerCase()
    return !!ext && AUDIO_EXTENSIONS.has(ext)
}

export default function Attachment({ data, context }: { data: IAttachmentData; context?: AttachmentContext }) {
    const url = getFileUrl(data.hash, SessionEnv.myFileAccessToken)!
    const [mime, setMime] = React.useState<string | null>(null)

    React.useEffect(() => {
        let alive = true
        queryAttachmentMime(url, data.hash).then((m) => {
            if (!alive) return
            // HEAD 失败时按扩展名兜底，避免语音被当成普通文件
            if (m === 'application/octet-stream' && looksLikeAudioName(data.name)) setMime('audio/mpeg')
            else setMime(m)
        })
        return () => { alive = false }
    }, [url, data.hash, data.name])

    if (!mime) {
        if (looksLikeAudioName(data.name)) {
            return <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                width: '220px',
                height: '44px',
                padding: '4px 8px 4px 2px',
                background: 'rgba(127,127,127,0.06)',
                borderRadius: '6px',
                verticalAlign: 'middle',
            }}>
                <span style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'rgba(127,127,127,0.15)', flexShrink: 0,
                }} />
                <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', height: '8px', width: '60%', borderRadius: '4px', background: 'rgba(127,127,127,0.15)' }} />
                    <span style={{ display: 'block', height: '5px', width: '90%', borderRadius: '3px', background: 'rgba(127,127,127,0.1)', marginTop: '6px' }} />
                </span>
            </span>
        }
        return <span style={{
            display: 'inline-block',
            width: '200px',
            height: '150px',
            background: 'rgba(127,127,127,0.1)',
            borderRadius: '6px',
            verticalAlign: 'middle',
        }} />
    }

    const kind = resolveKind(mime)

    switch (kind) {
        case 'image':
            return <ReloadableImage
                src={url}
                alt={data.name}
                onClick={() => ImageViewerDialog.show(url)}
                style={{
                    maxWidth: '400px',
                    maxHeight: '300px',
                    width: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: '6px',
                }}
            />
        case 'video':
            return <video
                onClick={() => VideoViewerDialog.show(url)}
                src={url}
                style={{
                    maxWidth: '400px',
                    maxHeight: '300px',
                    width: '100%',
                    display: 'block',
                    borderRadius: '6px',
                }}
            />
        case 'audio':
            return <AudioAttachment
                url={url}
                name={data.name}
                hash={data.hash}
                chatId={context?.chatId}
                chatTitle={context?.chatTitle}
                messageId={context?.messageId}
                senderName={context?.senderName}
            />
        default:
            return <motion.a
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                    display: 'block',
                    width: '100%',
                    textDecoration: 'none',
                    color: 'inherit',
                }}
                href={url}
                download={data.name?.trim() || data.hash}
            >
                <mdui-card clickable style={{
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: 'inherit',
                    borderRadius: 'inherit',
                }}>
                    <mdui-icon name="insert_drive_file" style={{ margin: '13px', fontSize: '34px' }} />
                    <span style={{
                        marginRight: '13px',
                        wordWrap: 'break-word',
                        wordBreak: 'break-all',
                        whiteSpace: 'normal',
                        maxWidth: '100%',
                    }}>{data.name}</span>
                </mdui-card>
            </motion.a>
    }
}