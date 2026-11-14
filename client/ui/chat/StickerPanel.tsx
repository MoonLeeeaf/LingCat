import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { dialog } from 'mdui'
import { StickerApi } from 'lingcat-client-protocol'
import type { StickerPackDetail } from 'lingcat-client-protocol'
import type { ISticker } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'
import SessionEnv from '../../SessionEnv.ts'
import getFileUrl from '../../lib/getFileUrl.ts'
import ReloadableImage from '../ReloadableImage.tsx'
import StickerPackDialog from '../viewer/StickerPackDialog.tsx'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'

export interface StickerPick {
    sticker: ISticker
    packId: string
}

interface StickerPanelProps {
    open: boolean
    onClose: () => void
    onPick: (pick: StickerPick) => void
}

function fileUrl(hash: string) {
    return getFileUrl(hash, SessionEnv.myFileAccessToken)!
}

export default function StickerPanel({ open, onClose, onPick }: StickerPanelProps) {
    const [details, setDetails] = React.useState<StickerPackDetail[] | null>(null)
    const [activePackId, setActivePackId] = React.useState<string | null>(null)
    const [busy, setBusy] = React.useState(false)

    const load = React.useCallback(async () => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return
        try {
            const list = await StickerApi.getMyStickerPacks(client, {
                access_token: session.token,
            })
            setDetails(list)
            setActivePackId((prev) => {
                if (prev && list.some(d => d.pack.id === prev)) return prev
                return list.find(d => d.stickers.length > 0)?.pack.id ?? list[0]?.pack.id ?? null
            })
        } catch (e) {
            tipError(e, '加载贴纸包失败')
            setDetails([])
        }
    }, [])

    React.useEffect(() => {
        if (!open) return
        setDetails(null)
        void load()
    }, [open, load])

    const createPack = () => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        const dlg = dialog({
            headline: '新建贴纸包',
            body: `
                <mdui-text-field
                    id="sticker-pack-title"
                    label="标题"
                    variant="outlined"
                    maxlength="64"
                    style="width: 100%"
                ></mdui-text-field>
                <div style="margin-top: 10px; font-size: 12px; opacity: 0.6">
                    创建后可以往包里添加 PNG / WebP 贴纸
                </div>
            `,
            closeOnEsc: true,
            closeOnOverlayClick: true,
            actions: [
                { text: '取消', onClick: () => true },
                {
                    text: '创建',
                    onClick: () => {
                        const input = dlg.querySelector('#sticker-pack-title') as HTMLInputElement & { value: string }
                        const title = (input?.value ?? '').trim()
                        if (!title) {
                            showSnackbar({ message: '请输入标题' })
                            return false
                        }
                        void (async () => {
                            setBusy(true)
                            try {
                                const pack = await StickerApi.createStickerPack(client, {
                                    access_token: session.token,
                                    title,
                                })
                                await load()
                                setActivePackId(pack.id)
                                StickerPackDialog.show(pack.id, { onChanged: () => { void load() } })
                            } catch (e) {
                                tipError(e, '创建贴纸包失败')
                            } finally {
                                setBusy(false)
                            }
                        })()
                    },
                },
            ],
        })
    }

    const active = details?.find(d => d.pack.id === activePackId) ?? null

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="sticker-panel"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 8px)',
                        left: 0,
                        width: 'min(420px, 100%)',
                        maxHeight: '46vh',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 40,
                        background: 'rgb(var(--mdui-color-surface-container))',
                        borderRadius: '12px',
                        boxShadow: '0 8px 28px rgba(0,0,0,.18)',
                        overflow: 'hidden',
                    }}
                >
                    {/* 头部 */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '8px 10px 4px',
                    }}>
                        <span style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>贴纸</span>
                        <mdui-button-icon icon="add" title="新建贴纸包" onClick={createPack} disabled={busy || undefined} />
                        <mdui-button-icon icon="close" title="关闭" onClick={onClose} />
                    </div>

                    {details === null ? (
                        <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
                            <mdui-circular-progress />
                        </div>
                    ) : details.length === 0 ? (
                        <div style={{ padding: '24px 16px 28px', textAlign: 'center', fontSize: '13px', opacity: 0.65 }}>
                            还没有贴纸包，点右上角的 + 创建一个
                        </div>
                    ) : (
                        <>
                            {/* 包切换 */}
                            <div style={{
                                display: 'flex',
                                gap: '6px',
                                overflowX: 'auto',
                                padding: '2px 10px 8px',
                                flexShrink: 0,
                            }}>
                                {details.map(d => {
                                    const isActive = d.pack.id === activePackId
                                    return (
                                        <div
                                            key={d.pack.id}
                                            onClick={() => setActivePackId(d.pack.id)}
                                            title={d.pack.title}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '999px',
                                                fontSize: '13px',
                                                whiteSpace: 'nowrap',
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                                maxWidth: '160px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                background: isActive
                                                    ? 'rgba(var(--mdui-color-primary), 0.16)'
                                                    : 'rgba(127,127,127,0.08)',
                                                color: isActive ? 'rgb(var(--mdui-color-primary))' : undefined,
                                            }}
                                        >{d.pack.title}</div>
                                    )
                                })}
                            </div>

                            {/* 贴纸网格 */}
                            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 10px 8px' }}>
                                {!active || active.stickers.length === 0 ? (
                                    <div style={{ padding: '20px 6px', textAlign: 'center', fontSize: '13px', opacity: 0.6 }}>
                                        这个包还没有贴纸
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
                                        gap: '4px',
                                    }}>
                                        {active.stickers.map(s => (
                                            <motion.div
                                                key={s.hash}
                                                whileHover={{ scale: 1.06 }}
                                                whileTap={{ scale: 0.94 }}
                                                onClick={() => {
                                                    onPick({ sticker: s, packId: active.pack.id })
                                                    onClose()
                                                }}
                                                title={s.emoji || undefined}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <ReloadableImage
                                                    src={fileUrl(s.hash)}
                                                    alt={s.emoji || 'sticker'}
                                                    style={{
                                                        width: '100%',
                                                        aspectRatio: '1 / 1',
                                                        objectFit: 'contain',
                                                        display: 'block',
                                                        borderRadius: '6px',
                                                    }}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 底部: 管理当前包 */}
                            {active && (
                                <div style={{
                                    borderTop: '1px solid rgba(127,127,127,0.15)',
                                    padding: '4px 8px',
                                    flexShrink: 0,
                                }}>
                                    <mdui-list-item
                                        icon="tune"
                                        rounded
                                        onClick={() => StickerPackDialog.show(active.pack.id, { onChanged: () => { void load() } })}
                                    >
                                        管理「{active.pack.title}」
                                    </mdui-list-item>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
