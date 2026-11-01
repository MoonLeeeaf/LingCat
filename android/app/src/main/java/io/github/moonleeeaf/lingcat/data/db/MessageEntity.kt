package io.github.moonleeeaf.lingcat.data.db

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import lingcat.classes.Classes.IMessage

@Entity(tableName = "messages", indices = [Index("chat_id"), Index("time")])
data class MessageEntity(
    @PrimaryKey val id: Int,
    @ColumnInfo(name = "chat_id") val chatId: String,
    @ColumnInfo(name = "sender_id") val senderId: String,
    @ColumnInfo(name = "time") val time: Long,
    @ColumnInfo(name = "raw_bytes") val rawBytes: ByteArray
) {
    fun toIMessage(): IMessage {
        return try {
            IMessage.parseFrom(rawBytes)
        } catch (e: Exception) {
            IMessage.getDefaultInstance()
        }
    }

    companion object {
        fun from(msg: IMessage): MessageEntity {
            return MessageEntity(
                id = msg.id,
                chatId = msg.chatId,
                senderId = msg.senderUserId,
                time = msg.time,
                rawBytes = msg.toByteArray()
            )
        }
    }
}