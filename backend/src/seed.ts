import pool from "./db.js";
import bcrypt from 'bcryptjs';

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        await client.query('TRUNCATE users, chats, chat_members, messages, read_receipts RESTART IDENTITY CASCADE');

        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash('12345678', salt);

        const userNames = [
            'max', 'ivan', 'ai_assistant', 'olena', 'andrii',
            'svitlana', 'dmytro', 'yulia', 'serhii', 'oksana', 'artem'
        ];

        const users = [];
        for (let i = 0; i < userNames.length; i++) {
            const avatarIndex = (i % 10) + 1;
            const avatarUrl = `/avatars/avatar${avatarIndex}.png`;

            const res = await client.query(`
                INSERT INTO users (username, email, password_hash, avatar_url)
                VALUES ($1, $2, $3, $4) RETURNING id, username
            `, [userNames[i], `${userNames[i]}@test.com`, hashedPw, avatarUrl]);
            users.push(res.rows[0]);
        }

        console.log(` Створено ${users.length} користувачів з локальними аватарками`);

        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                const chatRes = await client.query(`INSERT INTO chats (is_group)
                                                    VALUES (false) RETURNING id`);
                const chatId = chatRes.rows[0].id;

                await client.query(`
                    INSERT INTO chat_members (chat_id, user_id)
                    VALUES ($1, $2),
                           ($1, $3)
                `, [chatId, users[i].id, users[j].id]);

                await client.query(`
                    INSERT INTO messages (chat_id, user_id, text, created_at)
                    VALUES ($1, $2, $3, NOW() - INTERVAL '${Math.floor(Math.random() * 100)} minutes')
                `, [chatId, users[j].id, `Привіт, це ${users[j].username}!`]);
            }
        }

        const groupChatRes = await client.query(`
            INSERT INTO chats (is_group, name)
            VALUES (true, 'Проект Диплом') RETURNING id
        `);
        const groupChatId = groupChatRes.rows[0].id;

        await client.query(`
            INSERT INTO chat_members (chat_id, user_id, role)
            VALUES ($1, $2, 'admin'),
                   ($1, $3, 'member'),
                   ($1, $4, 'member')
        `, [groupChatId, users[0].id, users[1].id, users[2].id]);

        await client.query(`
            INSERT INTO messages (chat_id, user_id, text, created_at)
            VALUES ($1, $2, 'Вітаю у команді дипломного проекту! 🚀', NOW())
        `, [groupChatId, users[2].id]);

        await client.query('COMMIT');
        console.log(' База даних  заповнена.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(' Помилка при заповненні:', e);
    } finally {
        client.release();
        process.exit();
    }
}

seed();