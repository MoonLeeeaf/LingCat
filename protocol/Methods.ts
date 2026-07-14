export default class Methods {
    static Error_Response = 0x0
    static HandShake_Request = 0x1
    static HandShake_Response = 0x2
    static Ping_Request = 0x3
    static Ping_Response = 0x4
    static User_Registration_Request = 0x5
    static User_Registration_Response = 0x6
    static User_Login_Request = 0x7
    static User_Login_Response = 0x8
    static Request_File_Upload_Request = 0x9
    static Request_File_Upload_Response = 0x10
    static Authorize_Request = 0x11
    static Authorize_Response = 0x12
    static Query_User_Info_Request = 0x13
    static Query_User_Info_Response = 0x14
    static Update_My_Profile_Request = 0x15
    static Update_My_Profile_Response = 0x16
    static Update_Chat_Avatar_Request = 0x17
    static Update_Chat_Avatar_Response = 0x18
    static Query_My_User_Info_Request = 0x19
    static Query_My_User_Info_Response = 0x20
    static Request_File_Access_Request = 0x21
    static Request_File_Access_Response = 0x22

    static CACHED_KEYS?: Array<string>
    static CACHED_VALUES?: Array<any>
    static getMethodName(id: number) {
        if (this.CACHED_KEYS == undefined) this.CACHED_KEYS = Object.keys(this)
        if (this.CACHED_VALUES == undefined) this.CACHED_VALUES = Object.values(this)
        return this.CACHED_KEYS[this.CACHED_VALUES.indexOf(id)]
    }
}
