import pool from "./db.js";
import bcrypt from 'bcryptjs';

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('TRUNCATE users, chats, chat_members, messages, read_receipts RESTART IDENTITY CASCADE');

        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash('12345678', salt);

        const userRes = await client.query(`
            INSERT INTO users (username, email, password_hash, avatar_url)
            VALUES 
            ('max', 'max@test.com', $1, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max'),
            ('ivan', 'ivan@test.com', $1, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan'),
            ('ai_assistant', 'ai@test.com', $1, 'https://api.dicebear.com/7.x/bottts/svg?seed=Bot')
            RETURNING id, username
        `, [hashedPw]);

        const [max, ivan, ai] = userRes.rows;
        console.log(' Користувачі створені');

        const privChatRes = await client.query(`INSERT INTO chats (is_group) VALUES (false) RETURNING id`);
        const privChatId = privChatRes.rows[0].id;

        await client.query(`
            INSERT INTO chat_members (chat_id, user_id) 
            VALUES ($1, $2), ($1, $3)
        `, [privChatId, max.id, ivan.id]);

        const groupChatRes = await client.query(`
            INSERT INTO chats (is_group, name) VALUES (true, 'Проект Диплом') RETURNING id
        `);
        const groupChatId = groupChatRes.rows[0].id;

        await client.query(`
            INSERT INTO chat_members (chat_id, user_id, role) 
            VALUES ($1, $2, 'admin'), ($1, $3, 'member'), ($1, $4, 'member')
        `, [groupChatId, max.id, ivan.id, ai.id]);

        console.log(' Чати створені');

        await client.query(`
            INSERT INTO messages (chat_id, user_id, text, created_at) 
            VALUES ($1, $2, 'Привіт! Як там репозиторії?', NOW() - INTERVAL '2 hours')
        `, [privChatId, max.id]);

        await client.query(`
            INSERT INTO messages (chat_id, user_id, text, created_at) 
            VALUES ($1, $2, 'Вже працюють!', NOW() - INTERVAL '1 hour')
        `, [privChatId, ivan.id]);

        await client.query(`
            INSERT INTO messages (chat_id, user_id, text, created_at) 
            VALUES ($1, $2, 'Вітаю у команді!', NOW() - INTERVAL '10 minutes')
        `, [groupChatId, ai.id]);

        await client.query('COMMIT');
        console.log(' База даних успішно заповнена!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(' Помилка при заповненні:', e);
    } finally {
        client.release();
        process.exit();
    }
}

seed();