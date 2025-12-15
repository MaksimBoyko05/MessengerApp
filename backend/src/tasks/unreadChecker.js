import pool from "../db.ts";
import { emailQueue } from "../queues/emailQueue.js";

export const checkUnreadMessages = async () => {
  const query = `
    SELECT u.email, u.username, COUNT(m.id) AS unread_count
    FROM messages m
    JOIN users u ON u.id = m.user_id
    LEFT JOIN read_receipts rr ON rr.message_id = m.id
    WHERE rr.id IS NULL AND m.created_at < NOW() - INTERVAL '2 days'
    GROUP BY u.email, u.username
  `;

  const result = await pool.query(query);

  for (const row of result.rows) {
    await emailQueue.add("sendUnreadEmail", {
      email: row.email,
      subject: "У вас є непрочитані повідомлення ",
      text: `Привіт, ${row.username}! У вас ${row.unread_count} непрочитаних повідомлень.`,
    });
  }

  console.log(` Перевірено ${result.rows.length} користувачів`);
};
