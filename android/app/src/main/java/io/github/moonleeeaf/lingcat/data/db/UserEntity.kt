package io.github.moonleeeaf.lingcat.data.db

import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import lingcat.classes.Classes.IUser

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "raw_bytes") val rawBytes: ByteArray
) {
    fun toIUser(): IUser? {
        return try {
            IUser.parseFrom(rawBytes)
        } catch (e: Exception) {
            null
        }
    }

    companion object {
        fun from(user: IUser): UserEntity {
            return UserEntity(
                id = user.id,
                rawBytes = user.toByteArray()
            )
        }
    }
}

@Dao
interface UserDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUsers(users: List<UserEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    @Query("SELECT * FROM users WHERE id = :userId LIMIT 1")
    suspend fun getUserById(userId: String): UserEntity?

    @Query("DELETE FROM users")
    suspend fun clearUsers()
}