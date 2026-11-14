package io.github.moonleeeaf.lingcat.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import java.util.concurrent.ConcurrentHashMap

@Database(entities = [MessageEntity::class, ChatEntity::class, UserEntity::class], version = 3, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun messageDao(): MessageDao
    abstract fun chatDao(): ChatDao
    abstract fun userDao(): UserDao

    companion object {
        private const val DB_NAME_PREFIX = "lingcat_database"

        /**
         * 每个账号一个独立的数据库实例。
         *
         * Room 的实例是线程安全且可复用的，但数据库名必须按账号区分，
         * 否则切换账号后会读到上一个账号缓存的对话、消息和用户资料
         * （例如在 B 账号里还能看到 A 账号群聊的历史消息）。
         */
        private val instances = ConcurrentHashMap<String, AppDatabase>()

        fun getDatabase(context: Context): AppDatabase {
            val name = databaseName(LingCatClientManager.currentUserId)
            return instances.computeIfAbsent(name) {
                Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    name
                )
                    // 测试阶段如果表结构变了，直接允许重建
                    .fallbackToDestructiveMigration()
                    .build()
            }
        }

        /** 未登录时用 guest 库；登录后按 userId 隔离。 */
        private fun databaseName(userId: String?): String {
            val key = userId?.trim()?.takeIf { it.isNotEmpty() }
                ?: return "${DB_NAME_PREFIX}_guest"
            // userId 一般是 UUID；仍然过滤一次，避免数据库文件名里出现非法字符。
            val safe = key.filter { it.isLetterOrDigit() || it == '-' || it == '_' }
            return if (safe.isNotEmpty()) {
                "${DB_NAME_PREFIX}_$safe"
            } else {
                "${DB_NAME_PREFIX}_" + Integer.toHexString(key.hashCode())
            }
        }
    }
}
