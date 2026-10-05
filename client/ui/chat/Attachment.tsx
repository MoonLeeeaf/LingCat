import React from "react"
import ReloadableImage from "../ReloadableImage.tsx"
import ImageViewerDialog from "../viewer/ImageViewerDialog.tsx"
import VideoViewerDialog from "../viewer/VideoViewerDialog.tsx"
import ClientManager from "../../ClientManager.ts"
import AppState from "../AppState.ts"
import { queryAttachmentMime } from "../../AttachmentMimeCache.ts"

export interface IAttachmentData {
    hash: string
    name: string
}

function resolveKind(name: string, mime: string): 'image' | 'video' | 'audio' | 'file' {
    // 前缀
    if (name.startsWith('图片-') || name.startsWith('图片_')) return 'image'
    if (name.startsWith('视频-') || name.startsWith('视频_')) return 'video'
    if (name.startsWith('语音-') || name.startsWith('语音_')) return 'audio'
    if (name.startsWith('文件-') || name.startsWith('文件_')) return 'file'

    // MIME 兜底
    if (mime.startsWith('image/')) return 'image'
    if (mime.startsWith('audio/')) return 'audio'
    if (mime.startsWith('video/')) return 'video'
    return 'file'
}

export default function Attachment({ data }: { data: IAttachmentData }) {
    const url = ClientManager.client.getFileUrlByHashAndToken(data.hash, AppState.fileAccessToken)
    const [mime, setMime] = React.useState<string | null>(null)

    React.useEffect(() => {
        let alive = true
        queryAttachmentMime(url).then((m) => {
            if (alive) setMime(m)
        })
        return () => { alive = false }
    }, [url])

    if (!mime) {
        return <span style={{
            display: 'inline-block',
            width: '200px',
            height: '150px',
            background: 'rgba(127,127,127,0.1)',
            borderRadius: '6px',
            verticalAlign: 'middle',
        }} />
    }

    const kind = resolveKind(data.name, mime)

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
            return <audio controls src={url} style={{ display: 'block' }} />
        default:
            return <a
                style={{
                    display: 'block',
                    width: '100%',
                    textDecoration: 'none',
                    color: 'inherit',
                }}
                href={url}
                download={url}
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
            </a>
    }
}