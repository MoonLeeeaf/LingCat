export interface IUser {
    id: string
    username?: string | null
    nickname: string
    avatar_file_hash?: string | null
}

export interface IGroup {
    id: string
    group_unique?: string | null
    name: string
}

export interface IFile {
    hash: string
    first_upload_file_name?: string | null
    belong_to_chat_id?: string | null
    mime: string
    uploaded_at: number
}
