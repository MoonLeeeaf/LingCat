package io.github.moonleeeaf.lingcat.data

import android.util.Log
import io.github.moonleeeaf.lingcat.data.db.AppDatabase
import io.github.moonleeeaf.lingcat.data.db.UserEntity
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import lingcat.classes.Classes.IChat
import lingcat.classes.Classes.IUser
import lingcat.client_protocol.ChatApi
import lingcat.client_protocol.UserApi
import java.util.concurrent.ConcurrentHashMap

object ProfileCache {
    private const val TAG = "ProfileCache"

    // 内存缓存 (第一级)
    private val userCache = ConcurrentHashMap<String, IUser>()
    private val userFetchMutex = Mutex()

    private val chatCache = ConcurrentHashMap<String, IChat>()
    private val chatFetchMutex = Mutex()

    // 懒加载数据库 (避免依赖注入的麻烦)
    private val userDao by lazy {
        AppDatabase.getDatabase(LingCatClientManager.appContext).userDao()
    }
    private val chatDao by lazy {
        AppDatabase.getDatabase(LingCatClientManager.appContext).chatDao()
    }

    // ==========================================
    // 用户 (User) 缓存
    // ==========================================

    fun getCachedUser(userId: String?): IUser? {
        if (userId.isNullOrEmpty()) return null
        return userCache[userId]
    }

    suspend fun fetchUser(userId: String): IUser? = withContext(Dispatchers.IO) {
        if (userId.isEmpty()) return@withContext null

        // 1. 查内存
        userCache[userId]?.let { return@withContext it }

        // 2. 加锁防并发
        userFetchMutex.withLock {
            userCache[userId]?.let { return@withContext it }

            // 3. 查本地数据库 (如果本地有，立刻返回并塞进内存，同时后台静默刷新)
            val localEntity = userDao.getUserById(userId)
            if (localEntity != null) {
                val localUser = localEntity.toIUser()
                if (localUser != null) {
                    userCache[userId] = localUser

                    // ★ 核心体验优化：查到本地后，后台静默去刷新一次网络，保证资料是最新的
                    kotlinx.coroutines.CoroutineScope(Dispatchers.IO).launch {
                        try {
                            val client = LingCatClientManager.currentClient
                            val token = LingCatClientManager.currentToken
                            if (client != null && token != null) {
                                val freshUser = UserApi.queryUserInfo(client, token, userId)
                                if (freshUser != null) {
                                    userCache[userId] = freshUser
                                    userDao.insertUser(UserEntity.from(freshUser))
                                }
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "background refresh user failed", e)
                        }
                    }
                    return@withContext localUser
                }
            }

            // 4. 如果本地没有，只能请求网络了
            try {
                val client = LingCatClientManager.currentClient ?: return@withContext null
                val token = LingCatClientManager.currentToken ?: return@withContext null

                val user = UserApi.queryUserInfo(client, token, userId)
                if (user != null) {
                    userCache[userId] = user
                    // 写入数据库
                    userDao.insertUser(UserEntity.from(user))
                    return@withContext user
                } else {}
            } catch (e: Exception) {
                Log.e(TAG, "fetchUser failed for $userId", e)
            }
        }
        return@withContext null
    }

    suspend fun fetchUsers(userIds: List<String>) = withContext(Dispatchers.IO) {
        val missingIds = userIds.filter { !userCache.containsKey(it) }.distinct()
        if (missingIds.isEmpty()) return@withContext
        for (id in missingIds) {
            fetchUser(id)
        }
    }

    // ==========================================
    // 对话 (Chat) 缓存
    // ==========================================

    fun getCachedChat(chatId: String?): IChat? {
        if (chatId.isNullOrEmpty()) return null
        return chatCache[chatId]
    }

    suspend fun fetchChat(chatId: String): IChat? = withContext(Dispatchers.IO) {
        if (chatId.isEmpty()) return@withContext null

        chatFetchMutex.withLock {
            // 之前是通过网络拉取，现在我们可以先看看内存或者数据库
            // （不过聊天信息通常 ChatList 那边已经存过了，这里为了保险再查一次）
            try {
                val client = LingCatClientManager.currentClient ?: return@withContext null
                val token = LingCatClientManager.currentToken ?: return@withContext null

                val chat = ChatApi.queryChatInfo(client, token, chatId)
                if (chat != null) {
                    chatCache[chatId] = chat
                    return@withContext chat
                } else {}
            } catch (e: Exception) {
                Log.e(TAG, "fetchChat failed for $chatId", e)
            }
        }
        return@withContext null
    }

    fun cacheChats(chats: List<IChat>) {
        for (chat in chats) {
            if (chat.id != null) {
                chatCache[chat.id] = chat
            }
        }
    }

    /**
     * 清理所有缓存（登出时调用）
     */
    suspend fun clearAll() {
        userCache.clear()
        chatCache.clear()
        withContext(Dispatchers.IO) {
            try {
                userDao.clearUsers()
                // 如果你也想清空聊天记录，可以加上 messageDao 和 chatDao 的 clear
            } catch (e: Exception) {
                Log.e(TAG, "clear db failed", e)
            }
        }
    }
}