import pool from "../db.js";
import {User} from "../types/db.js"

export class UserRepository {
    static async findByEmail(email: string): Promise<User | null> {
        const query = `SELECT *
                       FROM users
                       WHERE email = $1`;
        const result = await pool.query<User>(query, [email]);
        return result.rows[0] || null;
    }

    static async create(username: string, email: string, hash: string, avatar_url: string | null): Promise<User> {
        const query = `
            INSERT INTO users (username, email, password_hash, avatar_url)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const result = await pool.query<User>(query, [username, email, hash, avatar_url]);
        return result.rows[0];
    }

    static async findById(id: number): Promise<any | null> {
        const query = `
            SELECT u.*, s.theme, s.is_private
            FROM users u
                     LEFT JOIN user_settings s ON u.id = s.user_id
            WHERE u.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    static async findAll(): Promise<User[]> {
        const query = `SELECT *
                       FROM users`;
        const result = await pool.query<User>(query, [])
        return result.rows;
    }

    static async getRecentOnlineUsers(currentUserId: number, limit: number = 20): Promise<any[]> {
        const query = `
            SELECT u.id,
                   u.username,
                   u.avatar_url,
                   us.online as is_online,
                   us.last_seen
            FROM users u
                     LEFT JOIN user_statuses us ON u.id = us.user_id
            WHERE u.id != $1
              AND EXISTS (
            -- Шукаємо спільний приватний чат, де є повідомлення
                SELECT 1
                FROM chat_members cm1
                JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
                JOIN chats c ON cm1.chat_id = c.id
                JOIN messages m ON c.id = m.chat_id
                WHERE cm1.user_id = u.id
              AND cm2.user_id = $1
              AND c.is_group = false
                )
            ORDER BY
                us.online DESC NULLS LAST,
                us.last_seen DESC NULLS LAST
                LIMIT $2;
        `;

        const result = await pool.query(query, [currentUserId, limit]);
        return result.rows;
    }

    static async search(query: string, currentUserId: number): Promise<any[]> {
        const sql = `
            SELECT u.id,
                   u.username,
                   u.email,
                   u.avatar_url,
                   us.last_seen,
                   us.online as is_online,
                   CASE
                       WHEN EXISTS (SELECT 1
                                    FROM chat_members cm1
                                             JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
                                             JOIN chats c ON cm1.chat_id = c.id
                                    WHERE cm1.user_id = u.id
                                      AND cm2.user_id = $2
                                      AND c.is_group = false) THEN 1
                       ELSE 0
                       END   as search_weight
            FROM users u
                     LEFT JOIN user_statuses us ON u.id = us.user_id
                     LEFT JOIN user_settings set
            ON u.id = set.user_id
            WHERE u.username ILIKE $1
              AND u.id != $2
              AND (set.is_private IS NULL
               OR set.is_private = false)
            ORDER BY
                search_weight DESC,
                u.username ASC
                LIMIT 20
        `;
        const result = await pool.query(sql, [`%${query}%`, currentUserId]);
        return result.rows;
    }

    static async update(userId: number, updateData: {
        username?: string;
        email?: string;
        password_hash?: string;
        avatar_url?: string;
    }): Promise<User | null> {

        const setClauses: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (updateData.username !== undefined) {
            setClauses.push(`username=$${paramIndex++}`);
            values.push(updateData.username);
        }
        if (updateData.email !== undefined) {
            setClauses.push(`email=$${paramIndex++}`);
            values.push(updateData.email);
        }
        if (updateData.password_hash !== undefined) {
            setClauses.push(`password_hash=$${paramIndex++}`);
            values.push(updateData.password_hash);
        }
        if (updateData.avatar_url !== undefined) {
            setClauses.push(`avatar_url=$${paramIndex++}`);
            values.push(updateData.avatar_url);
        }

        if (setClauses.length === 0) {
            return null;
        }

        const query = `
            UPDATE users
            SET ${setClauses.join(", ")}
            WHERE id = $${paramIndex} RETURNING id, username, email, avatar_url, created_at
        `;

        values.push(userId);

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    static async updatePrivacySetting(userId: number, isPrivate: boolean): Promise<void> {
        const sql = `
            INSERT INTO user_settings (user_id, is_private)
            VALUES ($1, $2) ON CONFLICT (user_id) 
        DO
            UPDATE SET is_private = EXCLUDED.is_private;
        `;
        await pool.query(sql, [userId, isPrivate]);
    }

    static async updateThemeSetting(userId: number, theme: string): Promise<void> {
        const sql = `
            INSERT INTO user_settings (user_id, theme)
            VALUES ($1, $2) ON CONFLICT (user_id) 
            DO
            UPDATE SET theme = EXCLUDED.theme;
        `;
        await pool.query(sql, [userId, theme]);
    }

    static async updateEmailAndClearTokens(userId: number, newEmail: string, tokenType: string) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            await client.query("UPDATE users SET email = $1 WHERE id = $2", [newEmail, userId]);

            await client.query(
                "DELETE FROM verification_tokens WHERE user_id = $1 AND type = $2",
                [userId, tokenType]
            );

            await client.query("COMMIT");
            return true;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

}