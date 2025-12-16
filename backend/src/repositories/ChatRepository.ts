import pool from "../db.js";
import {Chat} from "../types/db.js"


export class ChatRepository {
    async findPrivateChat(user1Id: number, user2Id: number): Promise<Chat | null> {
        const query = `
      SELECT c.*
      FROM chats c
      JOIN chat_members m1 ON c.id = m1.chat_id
      JOIN chat_members m2 ON c.id = m2.chat_id
      WHERE m1.user_id = $1 
        AND m2.user_id = $2
        AND c.is_group = FALSE
      LIMIT 1;
    `;

        const result = await pool.query(query, [user1Id, user2Id]);
        return result.rows[0] || null;
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