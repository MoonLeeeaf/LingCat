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
    static Update_Chat_Profile_Request = 0x17
    static Update_Chat_Profile_Response = 0x18
    static Query_My_User_Info_Request = 0x19
    static Query_My_User_Info_Response = 0x20
    static Request_File_Access_Request = 0x21
    static Request_File_Access_Response = 0x22
    static Send_Chat_Message_Request = 0x23
    static Send_Chat_Message_Response = 0x24
    static Get_Chat_Messages_Request = 0x25
    static Get_Chat_Messages_Response = 0x26
    static Query_Chat_Info_Request = 0x27
    static Query_Chat_Info_Response = 0x28
    static Get_Or_Create_Private_Chat_Request = 0x29
    static Get_Or_Create_Private_Chat_Response = 0x30
    static Get_My_Chats_Request = 0x33
    static Get_My_Chats_Response = 0x34
    static Get_My_Favourite_Chats_Request = 0x35
    static Get_My_Favourite_Chats_Response = 0x36
    static Search_My_Chats_Request = 0x37
    static Search_My_Chats_Response = 0x38
    static Get_Another_User_From_Private_Chat_Request = 0x39
    static Get_Another_User_From_Private_Chat_Response = 0x40
    static Set_Chat_Favourited_Request = 0x41
    static Set_Chat_Favourited_Response = 0x42
    static Get_User_Id_By_Username_Request = 0x43
    static Get_User_Id_By_Username_Response = 0x44
    static Create_Group_Request = 0x45
    static Create_Group_Response = 0x46
    static Set_Chat_Admin_Request = 0x47
    static Set_Chat_Admin_Response = 0x48
    static Resolve_Chat_Identifier_Request = 0x49
    static Resolve_Chat_Identifier_Response = 0x50
    static Join_Chat_Request = 0x51
    static Join_Chat_Response = 0x52
    static Remove_Chat_Member_Request = 0x53
    static Remove_Chat_Member_Response = 0x54
    static Update_Chat_Settings_Request = 0x55
    static Update_Chat_Settings_Response = 0x56
    static Get_Chat_Admins_Request = 0x57
    static Get_Chat_Admins_Response = 0x58
    static Get_Chat_Members_Request = 0x59
    static Get_Chat_Members_Response = 0x60
    static Add_Chat_Admin_Request = 0x61
    static Add_Chat_Admin_Response = 0x62
    static Edit_Chat_Admin_Permissions_Request = 0x63
    static Edit_Chat_Admin_Permissions_Response = 0x64
    static Remove_Chat_Admin_Request = 0x65
    static Remove_Chat_Admin_Response = 0x66
    static Verify_Password_Identity_Request = 0x67
    static Verify_Password_Identity_Response = 0x68
    static Change_Password_Request = 0x69
    static Change_Password_Response = 0x70
    static Edit_Chat_Message_Request = 0x71
    static Edit_Chat_Message_Response = 0x72
    static Start_Meeting_Request = 0x74
    static Start_Meeting_Response = 0x75
    static Get_Meeting_Token_Request = 0x76
    static Get_Meeting_Token_Response = 0x77
    static End_Meeting_Request = 0x78
    static End_Meeting_Response = 0x79
    static Get_Active_Meeting_Request = 0x82
    static Get_Active_Meeting_Response = 0x83
    static Exchange_OAuth_Code_Request = 0x84
    static Exchange_OAuth_Code_Response = 0x85

    static Receive_Chat_Message_Event = 0x31
    static Update_My_Chats_Event = 0x32
    static Message_Edited_Event = 0x73
    static Meeting_Started_Event = 0x80
    static Meeting_Ended_Event = 0x81

    static CACHED_KEYS?: Array<string>
    static CACHED_VALUES?: Array<any>
    static getMethodName(id: number) {
        if (this.CACHED_KEYS == undefined) this.CACHED_KEYS = Object.keys(this)
        if (this.CACHED_VALUES == undefined) this.CACHED_VALUES = Object.values(this)
        return this.CACHED_KEYS[this.CACHED_VALUES.indexOf(id)]
    }
}
