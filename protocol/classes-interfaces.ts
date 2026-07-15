export interface IUser {
    id: string
    username?: string | null
    nickname: string
    description?: string | null
    avatar_file_hash?: string | null
}

export type ChatType = 'private' | 'group'

export interface IChat {
    id: string
    title?: string | null
    unique?: string | null
    type: ChatType
    avatar_file_hash?: string | null
    settings: string
}

export interface IFile {
    hash: string
    first_upload_file_name?: string | null
    belong_to_chat_id?: string | null
    mime: string
    uploaded_at: number
}

export interface IMessage {
    id: number
    sender_user_id?: string | null
    system?: boolean | null
    chat_id: string
    text: string
    time: number
}
