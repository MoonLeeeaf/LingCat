package lingcat.protocol;

import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("unused")
public final class Methods {
    public static final int Error_Response = 0x0;
    public static final int HandShake_Request = 0x1;
    public static final int HandShake_Response = 0x2;
    public static final int Ping_Request = 0x3;
    public static final int Ping_Response = 0x4;

    public static final int User_Registration_Request = 0x5;
    public static final int User_Registration_Response = 0x6;
    public static final int User_Login_Request = 0x7;
    public static final int User_Login_Response = 0x8;
    public static final int Authorize_Request = 0x11;
    public static final int Authorize_Response = 0x12;
    public static final int Query_User_Info_Request = 0x13;
    public static final int Query_User_Info_Response = 0x14;
    public static final int Query_My_User_Info_Request = 0x19;
    public static final int Query_My_User_Info_Response = 0x20;
    public static final int Update_My_Profile_Request = 0x15;
    public static final int Update_My_Profile_Response = 0x16;
    public static final int Get_User_Id_By_Username_Request = 0x43;
    public static final int Get_User_Id_By_Username_Response = 0x44;

    public static final int Request_File_Upload_Request = 0x9;
    public static final int Request_File_Upload_Response = 0x10;
    public static final int Request_File_Access_Request = 0x21;
    public static final int Request_File_Access_Response = 0x22;

    public static final int Update_Chat_Profile_Request = 0x17;
    public static final int Update_Chat_Profile_Response = 0x18;
    public static final int Send_Chat_Message_Request = 0x23;
    public static final int Send_Chat_Message_Response = 0x24;
    public static final int Get_Chat_Messages_Request = 0x25;
    public static final int Get_Chat_Messages_Response = 0x26;
    public static final int Query_Chat_Info_Request = 0x27;
    public static final int Query_Chat_Info_Response = 0x28;
    public static final int Get_Or_Create_Private_Chat_Request = 0x29;
    public static final int Get_Or_Create_Private_Chat_Response = 0x30;
    public static final int Get_My_Chats_Request = 0x33;
    public static final int Get_My_Chats_Response = 0x34;
    public static final int Get_My_Favourite_Chats_Request = 0x35;
    public static final int Get_My_Favourite_Chats_Response = 0x36;
    public static final int Search_My_Chats_Request = 0x37;
    public static final int Search_My_Chats_Response = 0x38;
    public static final int Get_Another_User_From_Private_Chat_Request = 0x39;
    public static final int Get_Another_User_From_Private_Chat_Response = 0x40;
    public static final int Set_Chat_Favourited_Request = 0x41;
    public static final int Set_Chat_Favourited_Response = 0x42;
    public static final int Create_Group_Request = 0x45;
    public static final int Create_Group_Response = 0x46;
    public static final int Resolve_Chat_Identifier_Request = 0x49;
    public static final int Resolve_Chat_Identifier_Response = 0x50;
    public static final int Join_Chat_Request = 0x51;
    public static final int Join_Chat_Response = 0x52;
    public static final int Remove_Chat_Member_Request = 0x53;
    public static final int Remove_Chat_Member_Response = 0x54;
    public static final int Update_Chat_Settings_Request = 0x55;
    public static final int Update_Chat_Settings_Response = 0x56;
    public static final int Get_Chat_Admins_Request = 0x57;
    public static final int Get_Chat_Admins_Response = 0x58;
    public static final int Get_Chat_Members_Request = 0x59;
    public static final int Get_Chat_Members_Response = 0x60;

    public static final int Set_Chat_Admin_Request = 0x47;
    public static final int Set_Chat_Admin_Response = 0x48;
    public static final int Add_Chat_Admin_Request = 0x61;
    public static final int Add_Chat_Admin_Response = 0x62;
    public static final int Edit_Chat_Admin_Permissions_Request = 0x63;
    public static final int Edit_Chat_Admin_Permissions_Response = 0x64;
    public static final int Remove_Chat_Admin_Request = 0x65;
    public static final int Remove_Chat_Admin_Response = 0x66;

    public static final int Verify_Password_Identity_Request = 0x67;
    public static final int Verify_Password_Identity_Response = 0x68;
    public static final int Change_Password_Request = 0x69;
    public static final int Change_Password_Response = 0x70;

    public static final int Receive_Chat_Message_Event = 0x31;
    public static final int Update_My_Chats_Event = 0x32;

    private static final Map<Integer, String> METHOD_NAME_MAP = new HashMap<>();

    static {
        try {
            for (java.lang.reflect.Field field : Methods.class.getDeclaredFields()) {
                if (java.lang.reflect.Modifier.isStatic(field.getModifiers())
                        && field.getType() == int.class) {
                    String name = field.getName();
                    int value = field.getInt(null);
                    METHOD_NAME_MAP.put(value, name);
                }
            }
        } catch (IllegalAccessException e) {
        }
    }

    public static String getMethodName(int id) {
        String name = METHOD_NAME_MAP.get(id);
        return name != null ? name : "Unknown_" + Integer.toHexString(id);
    }

    private Methods() {
    }
}
