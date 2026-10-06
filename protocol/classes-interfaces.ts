export interface IUser {
    id: string
    username?: string | null
    nickname: string
    description?: string | null
    avatar_file_hash?: string | null
}

export type ChatType = 'private' | 'group'

export const AvailableChatSettings = {
    allow_join: 'boolean',
    allow_meeting: 'boolean',
}

export type IChatSettings = {
    allow_join: boolean
    allow_meeting: boolean
}

export const AvailableChatAdminPermissions = [
    /**
     * 基础权限
     */
    'edit_info',
    'edit_settings',
    'approve',
    'kick',
    'delete_message',
    'mute',
    'pin',
]

export type AvailableChatAdminPermission = typeof AvailableChatAdminPermissions[number]

export interface IChat {
    id: string
    /**
     * 私聊拿到的是对方的 title
     */
    title?: string | null
    chat_unique?: string | null
    type: ChatType
    avatar_file_hash?: string | null
    settings: string
    last_message_id: number
    last_message_time: number
    last_message_text?: string
    /**
     * 私聊拿到的是对方的 description
     */
    description?: string | null
    /**
     * (客户端状态) 是否为对话成员
     * 
     * 服务端存储层永远为 undefined
     * 
     * 只有在 ChatApi 返回客户端时 才有明确的值 或未被设置 == false
     */
    is_member?: boolean
}

export interface IFile {
    hash: string
    first_upload_file_name?: string | null
    belong_to_chat_id?: string | null
    mime: string
    uploaded_at: number
}

export interface IMessageEntity {
    type: "bold" | "italic" | 'strikethrough' | 'code' | 'spoiler' | 'attachment' | 'link' | 'chat_mention' | 'user_mention' | 'reply'
    offset: number
    length: number
    data?: string
}

export interface IMessage {
    id: number
    sender_user_id?: string | null
    system?: boolean | null
    chat_id: string
    text: string
    time: number
    entities?: IMessageEntity[]
    edited_at?: number
}

export type AdminRole = 'owner' | 'admin'

export interface IChatAdmin extends IUser {
    role: AdminRole
    permissions: string
    belong_to_chat_id: string
}
