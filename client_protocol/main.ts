import LingCatClient from "./LingCatClient.ts"
import UserApi from "./UserApi.ts"
import FileApi from './FileApi.ts'
import ChatApi from './ChatApi.ts'
import MeetingApi from './MeetingApi.ts'
import OAuthApi from './OAuthApi.ts'
import E2EApi from './E2EApi.ts'
import StickerApi from './StickerApi.ts'

import MessageParser from './MessageParser.ts'

export default LingCatClient
export {
    UserApi,
    FileApi,
    ChatApi,
    MeetingApi,
    OAuthApi,
    E2EApi,
    StickerApi,

    MessageParser,
}
export type { IMeetingCredentials } from './MeetingApi.ts'
export type { StickerInput, StickerPackDetail } from './StickerApi.ts'
