package io.github.moonleeeaf.lingcat.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface MessageDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(msg: MessageEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessages(msgs: List<MessageEntity>)

    // 获取最新 N 条 (因为 reverseLayout，最新消息排在最前面)
    @Query("SELECT * FROM messages WHERE chat_id = :chatId ORDER BY time DESC, id DESC LIMIT :limit")
    suspend fun getLatestMessages(chatId: String, limit: Int): List<MessageEntity>

    // 查比当前 ID 更旧的 N 条
    @Query("SELECT * FROM messages WHERE chat_id = :chatId AND id < :beforeId ORDER BY id DESC LIMIT :limit")
    suspend fun getMessagesBefore(chatId: String, beforeId: Int, limit: Int): List<MessageEntity>

    // 查比当前 ID 更新的 N 条
    @Query("SELECT * FROM messages WHERE chat_id = :chatId AND id > :afterId ORDER BY id ASC LIMIT :limit")
    suspend fun getMessagesAfter(chatId: String, afterId: Int, limit: Int): List<MessageEntity>

    @Query("DELETE FROM messages WHERE id = :msgId")
    suspend fun deleteMessage(msgId: Int)

    @Query("SELECT * FROM messages WHERE id = :id LIMIT 1")
    suspend fun getMessageById(id: Int): MessageEntity?

    @Query("DELETE FROM messages WHERE chat_id = :chatId")
    suspend fun clearChat(chatId: String)
}