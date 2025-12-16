import pool from "../db.js";
import { Message } from "../types/db.js";

export class MessageRepository {
    async create(chatId: number, senderId: number, text: string): Promise<Message> {
        const result = await pool.query(
            "INSERT INTO messages (chat_id, user_id, text) VALUES ($1, $2, $3) RETURNING *",
            [chatId, senderId, text]
        );
        return result.rows[0];
    }
    async findByChat(chatId: number): Promise<Message[]> {
        const result = await pool.query(
            "SELECT * FROM messages WHERE chat_id=$1 ORDER BY created_at ASC",
            [chatId]
        );
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
}