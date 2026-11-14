import React from 'react'
import ReactClient from 'react-dom/client'
import { MotionConfig, motion } from 'motion/react'
import { Dialog, dialog } from 'mdui'
import { FileApi, StickerApi } from 'lingcat-client-protocol'
import type { StickerPackDetail } from 'lingcat-client-protocol'
import type { ISticker } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'
import SessionEnv from '../../SessionEnv.ts'
import getFileUrl from '../../lib/getFileUrl.ts'
import ReloadableImage from '../ReloadableImage.tsx'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'
import ImageViewerDialog from './ImageViewerDialog.tsx'

/** 与服务端保持一致的数量上限 */
const MAX_STICKERS_PER_PACK = 120

interface StickerPackDialogProps {
    packId: string
    onClose?: () => void
    /** 包内容或订阅状态变化后通知外部刷新列表 */
    onChanged?: () => void
}

function fileUrl(hash: string) {
    return getFileUrl(hash, SessionEnv.myFileAccessToken)!
}

export default function StickerPackDialog({ packId, onClose, onChanged }: StickerPackDialogProps) {
    const dialogRef = React.useRef<Dialog>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const [detail, setDetail] = React.useState<StickerPackDetail | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [busy, setBusy] = React.useState(false)
    const [editingTitle, setEditingTitle] = React.useState(false)
    const [titleDraft, setTitleDraft] = React.useState('')

    const load = React.useCallback(async () => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return
        try {
            const d = await StickerApi.queryStickerPack(client, {
                access_token: session.token,
                pack_id: packId,
            })
            setDetail(d)
            setTitleDraft(d.pack.title)
        } catch (e) {
            tipError(e, '加载贴纸包失败')
        } finally {
            setLoading(false)
        }
    }, [packId])

    React.useEffect(() => { void load() }, [load])

    // 打开弹窗
    React.useEffect(() => {
        const dlg = dialogRef.current
        if (!dlg) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== dlg) return
            onClose?.()
        }
        dlg.addEventListener('closed', handleClosed)
        dlg.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => { if (!cancelled) dlg.open = true })
        })

        return () => {
            cancelled = true
            dlg.removeEventListener('closed', handleClosed)
        }
    }, [onClose])

    const isAuthor = !!detail?.pack.is_author

    const saveTitle = async () => {
        const title = titleDraft.trim()
        if (!detail || !title) return
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return
        setBusy(true)
        try {
            await StickerApi.updateStickerPackTitle(client, {
                access_token: session.token,
                pack_id: packId,
                title,
            })
            setEditingTitle(false)
            await load()
            onChanged?.()
            showSnackbar({ message: '标题已更新' })
        } catch (e) {
            tipError(e, '修改标题失败')
        } finally {
            setBusy(false)
        }
    }

    const toggleSubscribe = async () => {
        if (!detail) return
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return
        const subscribed = !detail.pack.subscribed
        setBusy(true)
        try {
            await StickerApi.setStickerPackSubscribed(client, {
                access_token: session.token,
                pack_id: packId,
                subscribed,
            })
            await load()
            onChanged?.()
            showSnackbar({ message: subscribed ? '已订阅' : '已取消订阅' })
        } catch (e) {
            tipError(e, subscribed ? '订阅失败' : '取消订阅失败')
        } finally {
            setBusy(false)
        }
    }

    const addStickers = async (files: FileList) => {
        if (!detail) return
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        const accepted = Array.from(files).filter(f =>
            f.type === 'image/png' || f.type === 'image/webp' || /\.(png|webp)$/i.test(f.name))
        if (accepted.length === 0) {
            showSnackbar({ message: '只支持 PNG / WebP 贴纸' })
            return
        }
        if (detail.stickers.length + accepted.length > MAX_STICKERS_PER_PACK) {
            showSnackbar({ message: `单个包最多 ${MAX_STICKERS_PER_PACK} 张贴纸` })
            return
        }

        setBusy(true)
        try {
            const token = await FileApi.requestUploadFileToken(client, {
                access_token: session.token,
            })
            const items = detail.stickers.map(s => ({ hash: s.hash, emoji: s.emoji ?? undefined }))
            for (const file of accepted) {
                const hash = await FileApi.uploadFileResumable(
                    client,
                    token,
                    file,
                    file.name,
                    file.type || 'image/png',
                )
                items.push({ hash, emoji: undefined })
            }
            await StickerApi.setStickerPackContent(client, {
                access_token: session.token,
                pack_id: packId,
                stickers: items,
            })
            await load()
            onChanged?.()
            showSnackbar({ message: `已添加 ${accepted.length} 张贴纸` })
        } catch (e) {
            tipError(e, '添加贴纸失败')
        } finally {
            setBusy(false)
        }
    }

    const removeSticker = async (sticker: ISticker) => {
        if (!detail) return
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return
        setBusy(true)
        try {
            await StickerApi.setStickerPackContent(client, {
                access_token: session.token,
                pack_id: packId,
                stickers: detail.stickers
                    .filter(s => s.hash !== sticker.hash)
                    .map(s => ({ hash: s.hash, emoji: s.emoji ?? undefined })),
            })
            await load()
            onChanged?.()
        } catch (e) {
            tipError(e, '移除贴纸失败')
        } finally {
            setBusy(false)
        }
    }

    /** 移除单张贴纸前先确认, 避免误点右上角的 × */
    const confirmRemoveSticker = (sticker: ISticker) => {
        if (!detail) return
        dialog({
            headline: '移除贴纸',
            body: `确定要从「${detail.pack.title}」中移除这张贴纸吗? 已发送的消息不受影响。`,
            closeOnEsc: true,
            closeOnOverlayClick: true,
            actions: [
                { text: '取消', onClick: () => true },
                {
                    text: '移除',
                    variant: 'text',
                    onClick: () => removeSticker(sticker),
                },
            ],
        })
    }

    const deletePack = () => {
        if (!detail) return
        dialog({
            headline: '删除贴纸包',
            body: `确定删除「${detail.pack.title}」吗? 已发送的消息里仍会显示这些贴纸。`,
            closeOnEsc: true,
            closeOnOverlayClick: true,
            actions: [
                { text: '取消', onClick: () => true },
                {
                    text: '删除',
                    variant: 'text',
                    onClick: async () => {
                        const client = ClientManager.getActiveClient()
                        const session = ClientManager.getActiveSession()
                        if (!client || !session) return
                        try {
                            await StickerApi.deleteStickerPack(client, {
                                access_token: session.token,
                                pack_id: packId,
                            })
                            dialogRef.current!.open = false
                            onChanged?.()
                            showSnackbar({ message: '已删除贴纸包' })
                        } catch (e) {
                            tipError(e, '删除失败')
                        }
                    },
                },
            ],
        })
    }

    return (
        <mdui-dialog ref={dialogRef as any} close-on-overlay-click close-on-esc>
            <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                    const files = e.target.files
                    e.target.value = ''
                    if (files && files.length > 0) void addStickers(files)
                }}
            />

            {loading || !detail ? (
                <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
                    <mdui-circular-progress />
                </div>
            ) : (
                <div style={{ padding: '0 20px 16px' }}>
                    {/* 标题 / 作者 / 订阅 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        {editingTitle ? (
                            <>
                                <mdui-text-field
                                    value={titleDraft}
                                    onInput={(e: any) => setTitleDraft(e.target.value)}
                                    maxlength={64}
                                    variant="outlined"
                                    style={{ flex: 1 }}
                                />
                                <mdui-button-icon icon="check" onClick={saveTitle} disabled={busy || !titleDraft.trim() || undefined} />
                                <mdui-button-icon icon="close" onClick={() => { setEditingTitle(false); setTitleDraft(detail.pack.title) }} />
                            </>
                        ) : (
                            <>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>{detail.pack.title}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.6 }}>
                                        {detail.stickers.length} 张贴纸
                                    </div>
                                </div>
                                {isAuthor && (
                                    <mdui-button-icon icon="edit" title="修改标题" onClick={() => setEditingTitle(true)} />
                                )}
                            </>
                        )}
                    </div>

                    {/* 贴纸网格 */}
                    {detail.stickers.length === 0 ? (
                        <div style={{ padding: '24px 0', textAlign: 'center', opacity: 0.6, fontSize: '14px' }}>
                            这个包还没有贴纸
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
                            gap: '8px',
                            maxHeight: '46vh',
                            overflowY: 'auto',
                            padding: '4px 2px',
                        }}>
                            {detail.stickers.map(s => (
                                <motion.div
                                    key={s.hash}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    style={{ position: 'relative' }}
                                >
                                    <ReloadableImage
                                        src={fileUrl(s.hash)}
                                        alt={s.emoji || 'sticker'}
                                        title={s.emoji || undefined}
                                        onClick={() => ImageViewerDialog.show(fileUrl(s.hash))}
                                        style={{
                                            width: '100%',
                                            aspectRatio: '1 / 1',
                                            objectFit: 'contain',
                                            display: 'block',
                                            cursor: 'pointer',
                                            background: 'rgba(127,127,127,0.05)',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    {isAuthor && (
                                        <mdui-button-icon
                                            icon="close"
                                            title="从包中移除"
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation()
                                                if (!busy) confirmRemoveSticker(s)
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '0',
                                                right: '0',
                                                transform: 'scale(0.75)',
                                                background: 'rgba(0,0,0,0.35)',
                                                color: '#fff',
                                                borderRadius: '50%',
                                            }}
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* 操作区 */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                        {isAuthor ? (
                            <>
                                <mdui-button
                                    variant="tonal"
                                    icon="add_photo_alternate"
                                    disabled={busy || undefined}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    添加贴纸
                                </mdui-button>
                                <mdui-button
                                    variant="text"
                                    icon="delete"
                                    disabled={busy || undefined}
                                    onClick={deletePack}
                                >
                                    删除包
                                </mdui-button>
                            </>
                        ) : (
                            <mdui-button
                                variant={detail.pack.subscribed ? 'outlined' : 'filled'}
                                icon={detail.pack.subscribed ? 'remove' : 'add'}
                                disabled={busy || undefined}
                                onClick={toggleSubscribe}
                            >
                                {detail.pack.subscribed ? '取消订阅' : '订阅'}
                            </mdui-button>
                        )}
                    </div>
                </div>
            )}
        </mdui-dialog>
    )
}

StickerPackDialog.show = function (packId: string, options?: { onChanged?: () => void }) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(
        <MotionConfig reducedMotion="user">
            <StickerPackDialog packId={packId} onClose={onClose} onChanged={options?.onChanged} />
        </MotionConfig>,
    )
}
