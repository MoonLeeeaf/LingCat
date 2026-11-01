package io.github.moonleeeaf.lingcat.data.db

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import lingcat.classes.Classes.IChat

@Entity(tableName = "chats")
data class ChatEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "is_favourite") val isFavourite: Boolean,
    @ColumnInfo(name = "raw_bytes") val rawBytes: ByteArray
) {
    fun toIChat(): IChat {
        return try {
            IChat.parseFrom(rawBytes)
        } catch (e: Exception) {
            IChat.getDefaultInstance()
        }
    }

    companion object {
        fun from(chat: IChat, isFavourite: Boolean): ChatEntity {
            return ChatEntity(
                id = chat.id,
                isFavourite = isFavourite,
                rawBytes = chat.toByteArray()
            )
        }
    }
}