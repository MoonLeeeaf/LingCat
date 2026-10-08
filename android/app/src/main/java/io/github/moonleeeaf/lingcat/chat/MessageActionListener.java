package io.github.moonleeeaf.lingcat.chat;

import android.view.View;

import androidx.annotation.Nullable;

import lingcat.classes.Classes.IMessage;

/** 消息相关的所有交互回调：长按菜单 + 富文本内点击 + 回复跳转 */
public interface MessageActionListener extends MessageContentBuilder.Listener {

    /** 长按气泡 */
    void onMessageLongClick(IMessage msg, View anchor);

    /** 长按头像 */
    void onAvatarLongClick(String userId, View anchor);
    void onAvatarClick(String userId, View anchor);

    // 下面 4 个从 MessageContentBuilder.Listener 继承：
    //   void onMentionUser(String userId);
    //   void onMentionChat(String chatId);
    //   void onReplyClick(int seq);
    //   IMessage findMessage(int seq);
}