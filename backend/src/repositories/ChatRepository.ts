import pool from "../db.js";
import {Chat} from "../types/db.js"


export class ChatRepository {
    async getUserChats(userId: number): Promise<any[]> {
        const query = `
            SELECT
                c.id,
                c.is_group,
                c.created_at,
                CASE
                    WHEN c.is_group = false THEN (
                        SELECT u.username
                        FROM chat_members cm2
                                 JOIN users u ON cm2.user_id = u.id
                        WHERE cm2.chat_id = c.id AND cm2.user_id != $1
                        LIMIT 1
                )
                ELSE c.name
            END as name,
            CASE 
                WHEN c.is_group = false THEN (
                    SELECT u.avatar_url 
                    FROM chat_members cm2 
                    JOIN users u ON cm2.user_id = u.id 
                    WHERE cm2.chat_id = c.id AND cm2.user_id != $1
            LIMIT 1
            )
            ELSE NULL
            END as avatar_url,
            -- Останнє повідомлення
            (SELECT text FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
            
            (
                SELECT COUNT(*)::int 
                FROM messages m
                LEFT JOIN read_receipts rr ON m.id = rr.message_id AND rr.user_id = $1
            WHERE m.chat_id = c.id
            AND m.user_id != $1
            AND rr.id IS NULL
            ) as unread_count

            FROM chats c
            JOIN chat_members cm ON c.id = cm.chat_id
            WHERE cm.user_id = $1
            ORDER BY last_message_time DESC NULLS LAST;
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    }
    async createPrivateChat(user1Id: number, user2Id: number): Promise<Chat> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");
            const chatRes = await client.query(
                "INSERT INTO chats (is_group) VALUES ($1) RETURNING *",
                [false]
            );
            const newChat = chatRes.rows[0];
            const insertMemberQuery = `
        INSERT INTO chat_members (chat_id, user_id) 
        VALUES ($1, $2), ($1, $3)
      `;
            await client.query(insertMemberQuery, [newChat.id, user1Id, user2Id]);

            await client.query("COMMIT");
            return newChat;

        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }
    async findById(chatId: number): Promise<Chat | null> {
        const result = await pool.query("SELECT * FROM chats WHERE id = $1", [chatId]);
        return result.rows[0] || null;
    }
}