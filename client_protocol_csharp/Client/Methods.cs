using System.Reflection;

namespace LingCat.ClientProtocol.Client;

/// <summary>
/// 协议方法 ID，移植自 protocol/Methods.ts。
/// </summary>
public static class Methods
{
    public const uint Error_Response = 0x0;
    public const uint HandShake_Request = 0x1;
    public const uint HandShake_Response = 0x2;
    public const uint Ping_Request = 0x3;
    public const uint Ping_Response = 0x4;
    public const uint User_Registration_Request = 0x5;
    public const uint User_Registration_Response = 0x6;
    public const uint User_Login_Request = 0x7;
    public const uint User_Login_Response = 0x8;
    public const uint Request_File_Upload_Request = 0x9;
    public const uint Request_File_Upload_Response = 0x10;
    public const uint Authorize_Request = 0x11;
    public const uint Authorize_Response = 0x12;
    public const uint Query_User_Info_Request = 0x13;
    public const uint Query_User_Info_Response = 0x14;
    public const uint Update_My_Profile_Request = 0x15;
    public const uint Update_My_Profile_Response = 0x16;
    public const uint Update_Chat_Profile_Request = 0x17;
    public const uint Update_Chat_Profile_Response = 0x18;
    public const uint Query_My_User_Info_Request = 0x19;
    public const uint Query_My_User_Info_Response = 0x20;
    public const uint Request_File_Access_Request = 0x21;
    public const uint Request_File_Access_Response = 0x22;
    public const uint Send_Chat_Message_Request = 0x23;
    public const uint Send_Chat_Message_Response = 0x24;
    public const uint Get_Chat_Messages_Request = 0x25;
    public const uint Get_Chat_Messages_Response = 0x26;
    public const uint Query_Chat_Info_Request = 0x27;
    public const uint Query_Chat_Info_Response = 0x28;
    public const uint Get_Or_Create_Private_Chat_Request = 0x29;
    public const uint Get_Or_Create_Private_Chat_Response = 0x30;
    public const uint Get_My_Chats_Request = 0x33;
    public const uint Get_My_Chats_Response = 0x34;
    public const uint Get_My_Favourite_Chats_Request = 0x35;
    public const uint Get_My_Favourite_Chats_Response = 0x36;
    public const uint Search_My_Chats_Request = 0x37;
    public const uint Search_My_Chats_Response = 0x38;
    public const uint Get_Another_User_From_Private_Chat_Request = 0x39;
    public const uint Get_Another_User_From_Private_Chat_Response = 0x40;
    public const uint Set_Chat_Favourited_Request = 0x41;
    public const uint Set_Chat_Favourited_Response = 0x42;
    public const uint Get_User_Id_By_Username_Request = 0x43;
    public const uint Get_User_Id_By_Username_Response = 0x44;
    public const uint Create_Group_Request = 0x45;
    public const uint Create_Group_Response = 0x46;
    public const uint Set_Chat_Admin_Request = 0x47;
    public const uint Set_Chat_Admin_Response = 0x48;
    public const uint Resolve_Chat_Identifier_Request = 0x49;
    public const uint Resolve_Chat_Identifier_Response = 0x50;
    public const uint Join_Chat_Request = 0x51;
    public const uint Join_Chat_Response = 0x52;
    public const uint Remove_Chat_Member_Request = 0x53;
    public const uint Remove_Chat_Member_Response = 0x54;
    public const uint Update_Chat_Settings_Request = 0x55;
    public const uint Update_Chat_Settings_Response = 0x56;
    public const uint Get_Chat_Admins_Request = 0x57;
    public const uint Get_Chat_Admins_Response = 0x58;
    public const uint Get_Chat_Members_Request = 0x59;
    public const uint Get_Chat_Members_Response = 0x60;
    public const uint Add_Chat_Admin_Request = 0x61;
    public const uint Add_Chat_Admin_Response = 0x62;
    public const uint Edit_Chat_Admin_Permissions_Request = 0x63;
    public const uint Edit_Chat_Admin_Permissions_Response = 0x64;
    public const uint Remove_Chat_Admin_Request = 0x65;
    public const uint Remove_Chat_Admin_Response = 0x66;
    public const uint Verify_Password_Identity_Request = 0x67;
    public const uint Verify_Password_Identity_Response = 0x68;
    public const uint Change_Password_Request = 0x69;
    public const uint Change_Password_Response = 0x70;
    public const uint Edit_Chat_Message_Request = 0x71;
    public const uint Edit_Chat_Message_Response = 0x72;
    public const uint Start_Meeting_Request = 0x74;
    public const uint Start_Meeting_Response = 0x75;
    public const uint Get_Meeting_Token_Request = 0x76;
    public const uint Get_Meeting_Token_Response = 0x77;
    public const uint End_Meeting_Request = 0x78;
    public const uint End_Meeting_Response = 0x79;
    public const uint Get_Active_Meeting_Request = 0x82;
    public const uint Get_Active_Meeting_Response = 0x83;
    public const uint Exchange_OAuth_Code_Request = 0x84;
    public const uint Exchange_OAuth_Code_Response = 0x85;
    public const uint Get_OAuth_Bindings_Request = 0x86;
    public const uint Get_OAuth_Bindings_Response = 0x87;
    public const uint Unbind_OAuth_Request = 0x88;
    public const uint Unbind_OAuth_Response = 0x89;
    public const uint Set_User_Remark_Request = 0x91;
    public const uint Set_User_Remark_Response = 0x92;
    public const uint Get_My_User_Remarks_Request = 0x93;
    public const uint Get_My_User_Remarks_Response = 0x94;
    public const uint Upload_E2E_Key_Request = 0x96;
    public const uint Upload_E2E_Key_Response = 0x97;
    public const uint Get_My_E2E_Key_Request = 0x98;
    public const uint Get_My_E2E_Key_Response = 0x99;
    public const uint Get_E2E_Public_Keys_Request = 0x9a;
    public const uint Get_E2E_Public_Keys_Response = 0x9b;
    public const uint Get_All_My_E2E_Keys_Request = 0x9c;
    public const uint Get_All_My_E2E_Keys_Response = 0x9d;

    public const uint Get_Online_Status_Request = 0x9e;
    public const uint Get_Online_Status_Response = 0x9f;

    public const uint Get_Meeting_Participants_Request = 0x8a;
    public const uint Get_Meeting_Participants_Response = 0x8b;

    public const uint Update_Meeting_Title_Request = 0xa0;
    public const uint Update_Meeting_Title_Response = 0xa1;
    public const uint Meeting_Title_Changed_Event = 0xa2;

    public const uint Get_My_Sticker_Packs_Request = 0xa3;
    public const uint Get_My_Sticker_Packs_Response = 0xa4;
    public const uint Query_Sticker_Pack_Request = 0xa5;
    public const uint Query_Sticker_Pack_Response = 0xa6;
    public const uint Create_Sticker_Pack_Request = 0xa7;
    public const uint Create_Sticker_Pack_Response = 0xa8;
    public const uint Update_Sticker_Pack_Title_Request = 0xa9;
    public const uint Update_Sticker_Pack_Title_Response = 0xaa;
    public const uint Set_Sticker_Pack_Content_Request = 0xab;
    public const uint Set_Sticker_Pack_Content_Response = 0xac;
    public const uint Set_Sticker_Pack_Subscribed_Request = 0xad;
    public const uint Set_Sticker_Pack_Subscribed_Response = 0xae;
    public const uint Delete_Sticker_Pack_Request = 0xaf;
    public const uint Delete_Sticker_Pack_Response = 0xb0;

    public const uint Receive_Chat_Message_Event = 0x31;
    public const uint Update_My_Chats_Event = 0x32;
    public const uint Message_Edited_Event = 0x73;
    public const uint Meeting_Started_Event = 0x80;
    public const uint Meeting_Ended_Event = 0x81;
    public const uint Meeting_Participants_Changed_Event = 0x90;
    public const uint User_Remarks_Changed_Event = 0x95;

    private static readonly Dictionary<uint, string> Names = BuildNames();

    private static Dictionary<uint, string> BuildNames()
    {
        var names = new Dictionary<uint, string>();
        foreach (var field in typeof(Methods).GetFields(BindingFlags.Public | BindingFlags.Static))
        {
            if (!field.IsLiteral || field.FieldType != typeof(uint)) continue;
            if (field.GetRawConstantValue() is uint value) names.TryAdd(value, field.Name);
        }
        return names;
    }

    public static string? GetMethodName(uint id) => Names.GetValueOrDefault(id);
}
