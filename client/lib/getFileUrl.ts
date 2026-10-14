import ClientManager from "../ClientManager.ts"

export default function getFileUrl(hash: string, file_access_token: string) {
    return ClientManager.getActiveClient()?.getFileUrlByHashAndToken(hash, file_access_token)
}