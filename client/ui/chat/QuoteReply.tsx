import React from 'react'
import { useChatMessageStore } from './useChatMessageStore.ts'
import ProfileCache from '../../ProfileCache.ts'

export default function QuoteReply({ seq }: { seq: number }) {
    const requestScrollToSeq = useChatMessageStore(s => s.requestScrollToSeq)
    // 订阅 messageMap: 消息被编辑/删除/加载后自动更新
    const target = useChatMessageStore(s => s.messageMap.get(seq))
    const [senderName, setSenderName] = React.useState<string>('')

    React.useEffect(() => {
        let alive = true
        if (!target?.sender_user_id) {
            setSenderName('')
            return
        }
        ProfileCache.queryUserInfo(target.sender_user_id)
            .then((u) => { if (alive) setSenderName(u.nickname) })
            .catch(() => { if (alive) setSenderName('') })
        return () => { alive = false }
    }, [target?.sender_user_id])

    const loaded = target != null
    const preview = loaded
        ? (target.system
            ? target.text
            : (target.text || '').replace(/\s+/g, ' ').slice(0, 80))
        : null

    const displayName = loaded
        ? (target.system ? '系统消息' : (senderName || '…'))
        : `消息 #${seq}`   // 未加载时给个占位, 不谎报"不存在"

    const displayText = loaded
        ? (preview ?? '[空消息]')
        : '点击跳转到这条消息'

    return <mdui-card
        variant='filled'
        clickable
        onClick={(e) => {
            e.stopPropagation()
            requestScrollToSeq(seq)   // 无条件触发, 由 ChatFragment 决定加载或滚动
        }}
        style={{
            cursor: 'pointer',
            padding: '7px 15px',
            borderLeft: '3px solid rgb(var(--mdui-color-primary))',
            borderRadius: '2px',
            maxWidth: '100%',
            overflow: 'hidden',
        }}
    >
        <div style={{
            color: 'rgb(var(--mdui-color-primary))',
            marginBottom: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            opacity: loaded ? 1 : 0.7,
        }}>
            {displayName}
        </div>
        <div style={{
            opacity: loaded ? 0.85 : 0.6,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontStyle: loaded ? 'normal' : 'italic',
        }}>
            {displayText}
        </div>
    </mdui-card>
}