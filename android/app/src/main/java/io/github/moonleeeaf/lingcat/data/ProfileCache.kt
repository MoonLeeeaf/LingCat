package io.github.moonleeeaf.lingcat.data

import android.util.Log
import io.github.moonleeeaf.lingcat.data.db.AppDatabase
import io.github.moonleeeaf.lingcat.data.db.UserEntity
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
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

/**
 * 拉取资料失败（未连接 / 网络异常）。
 *
 * 与「服务器明确告知该用户/对话不存在」区分开：后者返回 null，
 * 调用方据此决定是重试还是展示空态。
 */
class ProfileFetchException(message: String, cause: Throwable? = null) : Exception(message, cause)

/**
 * 用户 / 对话资料的共享缓存。
 *
 * 这一层只做三件事：
 * 1. 失败时抛 [ProfileFetchException]，绝不把失败伪装成「不存在」；
 * 2. 对「服务器确认不存在」做 30s 负缓存，避免连续打服务器；
 * 3. single-flight：并发请求同一 key 时只发一次网络请求。
 *
 * 重试策略（次数、退避、是否提示用户）由调用方决定，不放在这里。
 */
object ProfileCache {
    private const val TAG = "ProfileCache"

    /** 「服务器确认不存在」的负缓存时长。 */
    private const val MISS_TTL_MS = 30_000L

    // 内存缓存 (第一级)
    private val userCache = ConcurrentHashMap<String, IUser>()
    private val userFetchMutex = Mutex()

    private val chatCache = ConcurrentHashMap<String, IChat>()
    private val chatFetchMutex = Mutex()

    // 负缓存：只记录“服务器确认不存在”的结果，失败不写入
    private val userMissCache = ConcurrentHashMap<String, Long>()
    private val chatMissCache = ConcurrentHashMap<String, Long>()

    // 懒加载数据库 (避免依赖注入的麻烦)。
    // 注意用 getter 而不是 lazy：切换账号后必须拿到新账号的数据库实例。
    private val userDao get() =
        AppDatabase.getDatabase(LingCatClientManager.appContext).userDao()
    private val chatDao get() =
        AppDatabase.getDatabase(LingCatClientManager.appContext).chatDao()

    private fun isFreshMiss(cache: ConcurrentHashMap<String, Long>, id: String): Boolean {
        val cachedAt = cache[id] ?: return false
        if (System.currentTimeMillis() - cachedAt < MISS_TTL_MS) return true
        cache.remove(id)
        return false
    }

    // ==========================================
    // 用户 (User) 缓存
    // ==========================================

    fun getCachedUser(userId: String?): IUser? {
        if (userId.isNullOrEmpty()) return null
        return userCache[userId]
    }

    /**
     * 拉取用户资料。
     *
     * @return 用户资料；仅当服务器确认该用户不存在时返回 null。
     * @throws ProfileFetchException 未连接或网络/请求失败。
     */
    suspend fun requireUser(userId: String): IUser? = withContext(Dispatchers.IO) {
        if (userId.isEmpty()) return@withContext null

        // 1. 查内存
        userCache[userId]?.let { return@withContext it }
        if (isFreshMiss(userMissCache, userId)) return@withContext null

        // 2. 加锁防并发（single-flight）
        userFetchMutex.withLock {
            // 等锁期间可能已经有别的协程拉到了
            userCache[userId]?.let { return@withContext it }
            if (isFreshMiss(userMissCache, userId)) return@withContext null

            // 3. 查本地数据库：有就先返回，同时后台静默刷新
            val localEntity = userDao.getUserById(userId)
            if (localEntity != null) {
                val localUser = localEntity.toIUser()
                if (localUser != null) {
                    userCache[userId] = localUser
                    refreshUserInBackground(userId)
                    return@withContext localUser
                }
            }

            // 4. 本地没有，只能请求网络
            val client = LingCatClientManager.currentClient
            val token = LingCatClientManager.currentToken
            if (client == null || token == null || !client.isReady()) {
                throw ProfileFetchException("client not ready")
            }

            try {
                val user = UserApi.queryUserInfo(client, token, userId)
                if (user == null) {
                    // 服务器确认不存在：写负缓存，避免界面疯狂重试
                    userMissCache[userId] = System.currentTimeMillis()
                    return@withContext null
                }
                userCache[userId] = user
                userDao.insertUser(UserEntity.from(user))
                userMissCache.remove(userId)
                user
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                throw ProfileFetchException("query user failed: ${e.message}", e)
            }
        }
    }

    /**
     * 兼容旧调用方（通知、保活服务等）：失败时返回 null，不抛异常。
     * 需要区分「失败」与「不存在」、或者需要重试的 UI 调用方请用 [requireUser]。
     */
    suspend fun fetchUser(userId: String): IUser? = try {
        requireUser(userId)
    } catch (e: CancellationException) {
        throw e
    } catch (e: ProfileFetchException) {
        Log.w(TAG, "fetchUser failed for $userId", e)
        null
    }

    private fun refreshUserInBackground(userId: String) {
        CoroutineScope(Dispatchers.IO).launch {
            val client = LingCatClientManager.currentClient
            val token = LingCatClientManager.currentToken
            if (client == null || token == null || !client.isReady()) return@launch

            try {
                val freshUser = UserApi.queryUserInfo(client, token, userId)
                if (freshUser != null) {
                    userCache[userId] = freshUser
                    userDao.insertUser(UserEntity.from(freshUser))
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.w(TAG, "background refresh user failed", e)
            }
        }
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

    /**
     * 拉取对话信息。
     *
     * @return 对话信息；仅当服务器确认该对话不存在时返回 null。
     * @throws ProfileFetchException 未连接或网络/请求失败。
     */
    suspend fun requireChat(chatId: String): IChat? = withContext(Dispatchers.IO) {
        if (chatId.isEmpty()) return@withContext null

        chatCache[chatId]?.let { return@withContext it }
        if (isFreshMiss(chatMissCache, chatId)) return@withContext null

        chatFetchMutex.withLock {
            chatCache[chatId]?.let { return@withContext it }
            if (isFreshMiss(chatMissCache, chatId)) return@withContext null

            val client = LingCatClientManager.currentClient
            val token = LingCatClientManager.currentToken
            if (client == null || token == null || !client.isReady()) {
                throw ProfileFetchException("client not ready")
            }

            try {
                val chat = ChatApi.queryChatInfo(client, token, chatId)
                if (chat == null) {
                    chatMissCache[chatId] = System.currentTimeMillis()
                    return@withContext null
                }
                chatCache[chatId] = chat
                chatMissCache.remove(chatId)
                chat
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                throw ProfileFetchException("query chat failed: ${e.message}", e)
            }
        }
    }

    /**
     * 强制从服务器刷新对话信息，忽略内存缓存。
     *
     * 用于「是否仍属于该对话」这类不能凭旧缓存判断的场景：
     * 对话信息里的 `is_member` 会随被移出群聊而改变，缓存里的值可能已经过期。
     *
     * @return 对话信息；仅当服务器确认该对话不存在时返回 null。
     * @throws ProfileFetchException 未连接或网络/请求失败。
     */
    suspend fun refreshChat(chatId: String): IChat? = withContext(Dispatchers.IO) {
        if (chatId.isEmpty()) return@withContext null

        chatFetchMutex.withLock {
            val client = LingCatClientManager.currentClient
            val token = LingCatClientManager.currentToken
            if (client == null || token == null || !client.isReady()) {
                throw ProfileFetchException("client not ready")
            }

            try {
                val chat = ChatApi.queryChatInfo(client, token, chatId)
                if (chat == null) {
                    chatCache.remove(chatId)
                    chatMissCache[chatId] = System.currentTimeMillis()
                    return@withContext null
                }
                chatCache[chatId] = chat
                chatMissCache.remove(chatId)
                chat
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                throw ProfileFetchException("query chat failed: ${e.message}", e)
            }
        }
    }

    /**
     * 兼容旧调用方：失败时返回 null，不抛异常。
     * 需要区分「失败」与「不存在」、或者需要重试的 UI 调用方请用 [requireChat]。
     */
    suspend fun fetchChat(chatId: String): IChat? = try {
        requireChat(chatId)
    } catch (e: CancellationException) {
        throw e
    } catch (e: ProfileFetchException) {
        Log.w(TAG, "fetchChat failed for $chatId", e)
        null
    }

    fun cacheChats(chats: List<IChat>) {
        for (chat in chats) {
            val id = chat.id ?: continue
            chatCache[id] = chat
            chatMissCache.remove(id)
        }
    }

    /** 只清空内存缓存（切换账号时调用），不碰数据库。 */
    fun clearMemory() {
        userCache.clear()
        chatCache.clear()
        userMissCache.clear()
        chatMissCache.clear()
    }

    /**
     * 清理内存缓存，并把当前账号的用户表清空（编辑资料后强制重新拉取时使用）。
     */
    suspend fun clearAll() {
        clearMemory()
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
