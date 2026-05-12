import pool from "../db.js";
import {emailQueue} from "../queues/emailQueue.js";

export const checkUnreadMessages = async () => {
    const query = `
        SELECT u.email, u.username, COUNT(m.id) AS unread_count
        FROM messages m
                 JOIN chat_members cm ON cm.chat_id = m.chat_id
                 JOIN users u ON u.id = cm.user_id
                 LEFT JOIN read_receipts rr ON rr.message_id = m.id AND rr.user_id = u.id
        WHERE m.user_id != u.id 
        AND rr.id IS NULL 
        AND m.created_at < NOW() - INTERVAL '2 days'
        GROUP BY u.email, u.username;
    `;

    try {
        const result = await pool.query(query);

        if (result.rows.length === 0) {
            console.log("📭 Немає користувачів з давніми непрочитаними повідомленнями.");
            return;
        }

        for (const row of result.rows) {
            await emailQueue.add("sendUnreadEmail", {
                email: row.email,
                subject: "Нагадування: Вас чекають повідомлення 📩",
                text: `Привіт, ${row.username}! Ви маєте ${row.unread_count} непрочитаних повідомлень, яким вже більше 2 днів. Заходьте в чат!`,
            });
        }

        console.log(` Відправлено нагадування ${result.rows.length} користувачам.`);
    } catch (error) {
        console.error(" Помилка при перевірці непрочитаних повідомлень:", error);
    }
};