import pool from "../db.js";
import {Message} from "../types/db.js";

export class MessageRepository {
    async create(chatId: number, senderId: number, text: string, type: string = "text"): Promise<any> {
        const query = `
            WITH inserted_msg AS (
            INSERT
            INTO messages (chat_id, user_id, text, type)
            VALUES ($1, $2, $3, $4)
                RETURNING *
                )
            SELECT i.*, u.username as sender_name, u.avatar_url as sender_avatar
            FROM inserted_msg i
                     JOIN users u ON i.user_id = u.id;
        `;

        const result = await pool.query(query, [chatId, senderId, text, type]);
        return result.rows[0];
    }

    async isFirstMessageInChat(chatId: number): Promise<boolean> {
        const query = 'SELECT id FROM messages WHERE chat_id = $1 LIMIT 2';
        const result = await pool.query(query, [chatId]);
        
        return (result.rowCount ?? 0) === 1;
    }

    async findByChat(chatId: number, userId: number, limit: number = 30, cursor?: string): Promise<any[]> {
        let query = `
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
        `;

        const params: any[] = [chatId, userId, limit];

        if (cursor) {
            query += ` AND m.created_at < $4`;
            params.push(cursor);
        }

        query += ` ORDER BY m.created_at DESC LIMIT $3;`;

        const result = await pool.query(query, params);

        return result.rows.reverse();
    }

    async createAiMessage(chatId: number, userId: number, text: string): Promise<any> {
        return this.create(chatId, userId, text, "ai");
    }

    async createSystemMessage(chatId: number, initiatorId: number, text: string): Promise<any> {
        return this.create(chatId, initiatorId, text, "system");
    }


    async delete(messageId: number, userId: number): Promise<any> {
        const query = `
            UPDATE messages
            SET is_deleted = true
            WHERE id = $1
              AND user_id = $2 RETURNING *;
        `;

        const result = await pool.query(query, [messageId, userId]);
        return result.rows[0];
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