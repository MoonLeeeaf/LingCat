import LingCatClient from "./LingCatClient.ts"
import UserApi from "./UserApi.ts"
import FileApi from './FileApi.ts'
import ChatApi from './ChatApi.ts'
import MeetingApi from './MeetingApi.ts'

import MessageParser from './MessageParser.ts'

export default LingCatClient
export {
    UserApi,
    FileApi,
    ChatApi,
    MeetingApi,

    MessageParser,
}
export type { IMeetingCredentials } from './MeetingApi.ts'
