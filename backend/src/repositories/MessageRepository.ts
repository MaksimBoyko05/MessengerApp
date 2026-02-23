import pool from "../db.js";
import {Message} from "../types/db.js";

export class MessageRepository {
    async create(chatId: number, senderId: number, text: string): Promise<any> {
        const query = `
            WITH inserted_msg AS (
            INSERT
            INTO messages (chat_id, user_id, text)
            VALUES ($1, $2, $3)
                RETURNING *
                )
            SELECT i.*, u.username as sender_name, u.avatar_url as sender_avatar
            FROM inserted_msg i
                     JOIN users u ON i.user_id = u.id;
        `;

        const result = await pool.query(query, [chatId, senderId, text]);
        return result.rows[0];
    }

    async findByChat(chatId: number, userId: number): Promise<any[]> {
        const query = `
            SELECT m.*,
                   u.username                             as sender_name,
                   u.avatar_url                           as sender_avatar,
                   EXISTS (SELECT 1
                           FROM read_receipts rr
                           WHERE rr.message_id = m.id
                             AND rr.user_id != m.user_id) AS is_read
            FROM messages m
                     JOIN chat_members cm ON m.chat_id = cm.chat_id
                     JOIN users u ON m.user_id = u.id
            WHERE m.chat_id = $1
              AND cm.user_id = $2
              AND (
                cm.cleared_history_at IS NULL
                    OR m.created_at > cm.cleared_history_at
                )
            ORDER BY m.created_at ASC;
        `;

        const result = await pool.query(query, [chatId, userId]);
        return result.rows;
    }


    async delete(messageId: number): Promise<number> {
        const result = await pool.query(
            "DELETE FROM messages WHERE id=$1 RETURNING id",
            [messageId]
        );
        return result.rowCount || 0;
    }

    async findAll(): Promise<Message[]> {
        const result = await pool.query("SELECT * FROM messages ORDER BY created_at ASC");
        return result.rows;
    }

    async markAsRead(chatId: number, userId: number): Promise<void> {
        const query = `
            INSERT INTO read_receipts (message_id, user_id)
            SELECT m.id, $2
            FROM messages m
                     LEFT JOIN read_receipts rr ON m.id = rr.message_id AND rr.user_id = $2
            WHERE m.chat_id = $1
              AND m.user_id != $2
              AND rr.id IS NULL;
        `;
        await pool.query(query, [chatId, userId]);
    }

    async findRecentByChat(chatId: number, userId: number, limit = 15): Promise<Message[]> {
        const query = `
            SELECT m.*
            FROM messages m
                     JOIN chat_members cm ON m.chat_id = cm.chat_id
            WHERE m.chat_id = $1
              AND cm.user_id = $2
            ORDER BY m.created_at DESC
                LIMIT $3
        `;
        const res = await pool.query(query, [chatId, userId, limit]);
        return res.rows.reverse();
    }
}