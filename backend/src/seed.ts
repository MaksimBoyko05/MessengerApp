import pool from "./db.js";
import bcrypt from 'bcryptjs';

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(`
            TRUNCATE users, chats, chat_members, messages, read_receipts, 
            user_statuses, user_settings, ai_suggestions, ai_analytics 
            RESTART IDENTITY CASCADE
        `);

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

            const userId = res.rows[0].id;
            users.push(res.rows[0]);

            const isOnline = i % 3 === 0;
            await client.query(`
                INSERT INTO user_statuses (user_id, online, last_seen)
                VALUES ($1, $2, NOW() - INTERVAL '${Math.floor(Math.random() * 60)} minutes')
            `, [userId, isOnline]);

            await client.query(`
                INSERT INTO user_settings (user_id, theme)
                VALUES ($1, 'light')
            `, [userId]);
        }

        console.log(`✅ Створено ${users.length} користувачів зі статусами та налаштуваннями`);

        // ─── Шаблони діалогів для приватних чатів ────────────────────────────────
        const dialogTemplates = [
            [
                {from: 1, text: "Привіт! Як справи?"},
                {from: 0, text: "Привіт! Все добре, дякую 😊 А в тебе?"},
                {from: 1, text: "Теж непогано. Що робиш?"},
                {from: 0, text: "Та ось з дипломом вожуся, база даних не хоче слухатись 😅"},
                {from: 1, text: "Ха, знайоме. Який стек?"},
                {from: 0, text: "PostgreSQL + Node.js. Зараз пишу seed файл"},
                {from: 1, text: "О, якраз по темі! Можу допомогти якщо що"},
                {from: 0, text: "Дякую! Буду мати на увазі 🙏"},
                {from: 1, text: "Без проблем. Успіхів з дипломом!"},
                {from: 0, text: "Дякую, і тобі! 👋"},
            ],
            [
                {from: 1, text: "Макс, ти бачив нові вимоги до диплому?"},
                {from: 0, text: "Ні ще, а що там?"},
                {from: 1, text: "Кажуть треба додати розділ з тестуванням"},
                {from: 0, text: "Та це і так планував 😄"},
                {from: 1, text: "Яким фреймворком тестуєш?"},
                {from: 0, text: "Jest для бекенду, Vitest для фронту"},
                {from: 1, text: "Добрий вибір. Я теж на Jest сидів"},
                {from: 0, text: "Покажи потім як у тебе організовано, якщо не складно"},
                {from: 1, text: "Звісно, можу скинути repo"},
                {from: 0, text: "Супер, буду вдячний!"},
                {from: 1, text: "Окей, трохи пізніше скину посилання"},
                {from: 0, text: "👍"},
            ],
            [
                {from: 1, text: "Ей, ти вже захистився?"},
                {from: 0, text: "Ще ні, захист через 3 тижні"},
                {from: 1, text: "І як ти себе почуваєш?"},
                {from: 0, text: "Чесно? Трохи нервово 😬"},
                {from: 1, text: "Це нормально! Головне — знаєш матеріал?"},
                {from: 0, text: "Та в цілому так, але завжди є що покращити"},
                {from: 1, text: "Не перфекціонізмуй, все вийде 💪"},
                {from: 0, text: "Дякую за підтримку! Потрібно було почути"},
                {from: 1, text: "Після захисту відзначимо! 🎉"},
                {from: 0, text: "Домовились! 🥳"},
            ],
            [
                {from: 1, text: "Макс, в мене питання по React"},
                {from: 0, text: "Питай, спробую допомогти"},
                {from: 1, text: "Як правильно зробити debounce для пошуку?"},
                {from: 0, text: "useCallback + setTimeout, або бібліотека lodash.debounce"},
                {from: 1, text: "А покажеш приклад?"},
                {from: 0, text: "const debouncedSearch = useCallback(debounce((val) => fetchResults(val), 300), []);"},
                {from: 1, text: "Ааа, зрозуміло! А dependecies array?"},
                {from: 0, text: "Порожній масив якщо fetchResults стабільний, або додай його туди"},
                {from: 1, text: "Спасибо, зрозумів 🔥"},
                {from: 0, text: "Гарно! Якщо ще щось — питай"},
            ],
            [
                {from: 1, text: "Де ти зазвичай каву береш?"},
                {from: 0, text: "Є одна кав'ярня біля університету, клас місце"},
                {from: 1, text: "Та яка? Знаю там кілька"},
                {from: 0, text: "\"Дім кави\", знаєш?"},
                {from: 1, text: "О так! Там смачно. Ти там часто?"},
                {from: 0, text: "Майже щодня зранку ☕"},
                {from: 1, text: "Може разом якось?"},
                {from: 0, text: "Давай! Завтра о 9?"},
                {from: 1, text: "Ідеально, буду!"},
                {from: 0, text: "Окей, до зустрічі 👋"},
            ],
            [
                {from: 1, text: "Як тебе звати, нагадай?"},
                {from: 0, text: "Макс 😄"},
                {from: 1, text: "Ах точно! Вибач, склероз 😅"},
                {from: 0, text: "Та нічого, буває"},
                {from: 1, text: "Ти на якій спеціальності?"},
                {from: 0, text: "Програмна інженерія, 4 курс"},
                {from: 1, text: "О класно! Я на КН"},
                {from: 0, text: "Схожі напрямки) Що пишеш на диплом?"},
                {from: 1, text: "Мобільний додаток для здоров'я. А ти?"},
                {from: 0, text: "Месенджер з ШІ функціями"},
                {from: 1, text: "Звучить круто! Покажеш колись?"},
                {from: 0, text: "Звісно, як допрацюю 😄"},
            ],
            [
                {from: 1, text: "Скинь плз лінк на той репозиторій"},
                {from: 0, text: "Який саме? У мене їх кілька 😄"},
                {from: 1, text: "Ну той, де ти Node.js API"},
                {from: 0, text: "А, зрозумів. Зараз"},
                {from: 0, text: "https://github.com/max/messenger-api"},
                {from: 1, text: "Дякую! Подивлюсь структуру"},
                {from: 0, text: "Там ще не всі endpoints, але загальна структура є"},
                {from: 1, text: "Ок, зрозуміло. Гарно організовано до речі!"},
                {from: 0, text: "Дякую 🙏 Намагаюсь дотримуватись чистої архітектури"},
                {from: 1, text: "Видно! Запозичу деякі ідеї якщо не проти"},
                {from: 0, text: "Без проблем, для того і відкрив 😄"},
            ],
            [
                {from: 1, text: "Що думаєш про TypeScript?"},
                {from: 0, text: "Дуже люблю! Рятує від купи помилок"},
                {from: 1, text: "Але ж повільніше розробка ні?"},
                {from: 0, text: "Спочатку так, але потім навпаки — менше дебагінгу"},
                {from: 1, text: "Логічно. Ти весь диплом на TS?"},
                {from: 0, text: "Фронт на TSX, бек поки JS але хочу мігрувати"},
                {from: 1, text: "Розумно. Я теж думаю перейти"},
                {from: 0, text: "Однозначно раджу! Особливо для великих проєктів"},
                {from: 1, text: "Окей, переконав 😄"},
            ],
            [
                {from: 1, text: "Ти чув про нову модель від OpenAI?"},
                {from: 0, text: "Так, читав! Вражає"},
                {from: 1, text: "Думаєш вона краща за Gemini?"},
                {from: 0, text: "Важко сказати, залежить від задачі"},
                {from: 1, text: "Ти використовуєш якийсь LLM у дипломі?"},
                {from: 0, text: "Так, Gemini для смарт-відповідей та AI асистента"},
                {from: 1, text: "Клас! І як API? Зручне?"},
                {from: 0, text: "Досить зручне, є SDK для Node. Безкоштовний tier є"},
                {from: 1, text: "О, цікаво. Може теж спробую для свого проєкту"},
                {from: 0, text: "Раджу! Якщо питання будуть — питай"},
            ],
            [
                {from: 1, text: "Макс, ти де зараз?"},
                {from: 0, text: "Вдома, пишу код"},
                {from: 1, text: "О, а я думав в університеті"},
                {from: 0, text: "Ні, пари відмінили сьогодні"},
                {from: 1, text: "Пощастило! Я ось сиджу на лекції нудьгую 😴"},
                {from: 0, text: "Хаха, співчуваю 😄"},
                {from: 1, text: "Краще б вдома кодив як ти"},
                {from: 0, text: "Ну, дистанційно теж є свої мінуси 😅"},
                {from: 1, text: "Які наприклад?"},
                {from: 0, text: "Холодильник занадто близько 😂"},
                {from: 1, text: "HAHAHA це проблема 😂"},
            ],
        ];

        const max = users[0];
        for (let i = 1; i < users.length; i++) {
            const chatRes = await client.query(`
                INSERT INTO chats (is_group)
                VALUES (false) RETURNING id
            `);
            const chatId = chatRes.rows[0].id;

            await client.query(`
                INSERT INTO chat_members (chat_id, user_id)
                VALUES ($1, $2),
                       ($1, $3)
            `, [chatId, max.id, users[i].id]);

            // Беремо шаблон діалогу (по колу)
            const template = dialogTemplates[(i - 1) % dialogTemplates.length];
            let lastMessageId = null;

            for (let m = 0; m < template.length; m++) {
                const msg = template[m];
                const senderId = msg.from === 0 ? max.id : users[i].id;
                // Повідомлення йдуть від старіших до новіших
                const minutesAgo = (template.length - m) * 3 + Math.floor(Math.random() * 2);

                const msgRes = await client.query(`
                    INSERT INTO messages (chat_id, user_id, text, created_at)
                    VALUES ($1, $2, $3, NOW() - INTERVAL '${minutesAgo} minutes') RETURNING id
                `, [chatId, senderId, msg.text]);

                lastMessageId = msgRes.rows[0].id;
            }

            // AI suggestion для останнього повідомлення у кожному другому чаті
            if (i % 2 === 0 && lastMessageId) {
                const aiSuggestions = [
                    `Дякую, що поділився! Це дуже корисно 😊`,
                    `Зрозумів, дякую! Буду мати на увазі 👍`,
                    `Чудово! Побачимось тоді 🎉`,
                    `Окей, звучить як план 💪`,
                    `Супер, дякую за допомогу! 🙏`,
                ];

                const aiRes = await client.query(`
                    INSERT INTO ai_suggestions (message_id, suggestion_text, model, generation_time_ms)
                    VALUES ($1, $2, 'gemini-pro', $3) RETURNING id
                `, [lastMessageId, aiSuggestions[i % aiSuggestions.length], 900 + Math.floor(Math.random() * 700)]);

                await client.query(`
                    INSERT INTO ai_analytics (suggestion_id, user_id, useful)
                    VALUES ($1, $2, $3)
                `, [aiRes.rows[0].id, max.id, i % 3 !== 0]);
            }
        }

        console.log(` Заповнено ${users.length - 1} приватних чатів з реалістичними діалогами`);

        // ─── Груповий чат: Дипломний проєкт ──────────────────────────────────────
        const groupChatRes = await client.query(`
            INSERT INTO chats (is_group, name)
            VALUES (true, 'Дипломний проєкт 🎓') RETURNING id
        `);
        const groupChatId = groupChatRes.rows[0].id;

        // Учасники: max, ivan, olena, andrii, dmytro
        const groupMembers = [users[0], users[1], users[3], users[4], users[6]];
        await client.query(`
            INSERT INTO chat_members (chat_id, user_id, role)
            VALUES ($1, $2, 'admin'),
                   ($1, $3, 'member'),
                   ($1, $4, 'member'),
                   ($1, $5, 'member'),
                   ($1, $6, 'member')
        `, [groupChatId, ...groupMembers.map(u => u.id)]);

        const groupMessages = [
            {user: users[0], text: "Вітаю всіх у груповому чаті дипломного проєкту! 🚀", minsAgo: 180},
            {user: users[1], text: "Привіт! Нарешті зібрались в одному місці 😄", minsAgo: 178},
            {user: users[3], text: "Привіт всім! Коли починаємо активну роботу?", minsAgo: 175},
            {user: users[0], text: "Пропоную сьогодні розподілити задачі", minsAgo: 173},
            {user: users[4], text: "Підтримую! Хто займається бекендом?", minsAgo: 170},
            {user: users[0], text: "Я берусь за бекенд і архітектуру", minsAgo: 168},
            {user: users[1], text: "Я можу взяти фронтенд, добре знаю React", minsAgo: 165},
            {user: users[3], text: "Тоді я — документація і тестування 📝", minsAgo: 162},
            {user: users[4], text: "А я — дизайн і UX 🎨", minsAgo: 160},
            {user: users[6], text: "Я допоможу з DevOps і деплоєм", minsAgo: 158},
            {user: users[0], text: "Чудово! Команда зібрана 💪", minsAgo: 155},
            {user: users[1], text: "До речі, яку базу даних використовуємо?", minsAgo: 120},
            {user: users[0], text: "PostgreSQL. Вже є схема і seed файл", minsAgo: 118},
            {user: users[3], text: "Поділишся схемою?", minsAgo: 115},
            {user: users[0], text: "Звісно, зараз скину в репозиторій", minsAgo: 113},
            {user: users[4], text: "Гарно! А що з авторизацією?", minsAgo: 110},
            {user: users[0], text: "JWT + bcrypt. Вже реалізовано базово", minsAgo: 108},
            {user: users[1], text: "Супер! Тоді можу починати форму логіну", minsAgo: 105},
            {user: users[6], text: "Я поки налаштую Docker compose", minsAgo: 100},
            {user: users[0], text: "Ідеально, дякую всім! 🙏", minsAgo: 98},
            {user: users[3], text: "Питання — який дедлайн для першого MVP?", minsAgo: 60},
            {user: users[0], text: "Думаю 2 тижні реально?", minsAgo: 58},
            {user: users[1], text: "Якщо без зайвого перфекціонізму — так 😄", minsAgo: 55},
            {user: users[4], text: "Дизайн базових екранів зроблю за тиждень", minsAgo: 52},
            {user: users[6], text: "DevOps налаштую паралельно, не займе багато", minsAgo: 50},
            {user: users[0], text: "Окей, домовились! Дедлайн — 2 тижні 📅", minsAgo: 48},
            {user: users[3], text: "Де будемо трекати задачі? Trello?", minsAgo: 30},
            {user: users[1], text: "Або GitHub Projects — зручно інтегрується з repo", minsAgo: 28},
            {user: users[0], text: "GitHub Projects 👍 Зараз створю board", minsAgo: 25},
            {user: users[4], text: "Відмінно! Чекаю запрошення 😊", minsAgo: 22},
            {user: users[6], text: "Я теж. До речі — назва проєкту вже є?", minsAgo: 18},
            {user: users[0], text: "\"Nexus\" — месенджер нового покоління 🌟", minsAgo: 15},
            {user: users[1], text: "О, звучить стильно!", minsAgo: 12},
            {user: users[3], text: "Мені подобається! 👏", minsAgo: 10},
            {user: users[4], text: "Nexus — ідеально для лого теж 🎨", minsAgo: 8},
            {user: users[6], text: "Гарна назва, поїхали! 🚀", minsAgo: 5},
            {user: users[0], text: "Поїхали! Удачі всім 💪🎓", minsAgo: 2},
        ];

        for (const msg of groupMessages) {
            await client.query(`
                INSERT INTO messages (chat_id, user_id, text, created_at)
                VALUES ($1, $2, $3, NOW() - INTERVAL '${msg.minsAgo} minutes')
            `, [groupChatId, msg.user.id, msg.text]);
        }

        console.log(` Груповий чат заповнено ${groupMessages.length} повідомленнями`);

        // ─── Другий груповий чат: Загальний ──────────────────────────────────────
        const chat2Res = await client.query(`
            INSERT INTO chats (is_group, name)
            VALUES (true, 'Загальний чат 💬') RETURNING id
        `);
        const chat2Id = chat2Res.rows[0].id;

        // Усі юзери
        for (let i = 0; i < users.length; i++) {
            await client.query(`
                INSERT INTO chat_members (chat_id, user_id, role)
                VALUES ($1, $2, $3)
            `, [chat2Id, users[i].id, i === 0 ? 'admin' : 'member']);
        }

        const generalMessages = [
            {user: users[0], text: "Всім привіт! 👋 Це загальний чат для нашої групи", minsAgo: 300},
            {user: users[2], text: "Привіт! Я AI асистент, готовий допомогти 🤖", minsAgo: 298},
            {user: users[5], text: "О клас! Хай живе чат 🎉", minsAgo: 295},
            {user: users[7], text: "Нарешті! Давно треба було 😄", minsAgo: 292},
            {user: users[8], text: "Привіт всім! Сергій тут", minsAgo: 290},
            {user: users[9], text: "І я! 🙋‍♀️", minsAgo: 288},
            {user: users[10], text: "Всім привіт! Артем на зв'язку", minsAgo: 285},
            {user: users[1], text: "Іван тут. Нарешті зібрались 👍", minsAgo: 283},
            {user: users[3], text: "Олена! Радий вас всіх бачити 😊", minsAgo: 280},
            {user: users[4], text: "Андрій. Всім привіт!", minsAgo: 278},
            {user: users[6], text: "Дмитро, вітаю всіх!", minsAgo: 275},
            {user: users[0], text: "Чудово! Тепер будемо на зв'язку 📱", minsAgo: 270},
            {user: users[5], text: "До речі, хто вже почав диплом писати?", minsAgo: 240},
            {user: users[0], text: "Я вже місяць як пишу 😅", minsAgo: 238},
            {user: users[7], text: "Я тільки почала, теми ще немає 😬", minsAgo: 235},
            {user: users[8], text: "Мені тему вже затвердили, пишу про ML", minsAgo: 232},
            {user: users[10], text: "О круто! Яку модель?", minsAgo: 230},
            {user: users[8], text: "Класифікація тексту, BERT", minsAgo: 228},
            {user: users[9], text: "Сурйозно! Я ще не знаю з чим іти 😅", minsAgo: 225},
            {user: users[2], text: "Можу допомогти з вибором теми якщо що 🤖", minsAgo: 223},
            {user: users[9], text: "ОО, зручно мати AI в чаті 😄", minsAgo: 220},
            {user: users[1], text: "Хаха, справді зручно!", minsAgo: 218},
            {user: users[3], text: "А коли дедлайн здачі чорновика?", minsAgo: 180},
            {user: users[0], text: "Здається 15-го наступного місяця", minsAgo: 178},
            {user: users[4], text: "Ой, треба поспішати тоді 😬", minsAgo: 175},
            {user: users[6], text: "Погоджуюсь, часу мало", minsAgo: 173},
            {user: users[5], text: "Хто де пишете? Бібліотека чи вдома?", minsAgo: 120},
            {user: users[0], text: "Вдома, продуктивніше коли нікого нема", minsAgo: 118},
            {user: users[7], text: "Я в кав'ярні, обожнюю там атмосферу ☕", minsAgo: 115},
            {user: users[1], text: "Я теж вдома. Бібліотека шумно чомусь 😄", minsAgo: 112},
            {user: users[10], text: "Хаха, бібліотека де мовчати треба — найгучніше місце 🤣", minsAgo: 110},
            {user: users[9], text: "ПРАВДА 😂", minsAgo: 108},
            {user: users[3], text: "Всі хто пише бекенд — ділімось ресурсами!", minsAgo: 60},
            {user: users[0], text: "Підтримую! У мене є хороші туторіали по Express", minsAgo: 58},
            {user: users[8], text: "Скинь плз!", minsAgo: 55},
            {user: users[0], text: "https://expressjs.com/en/guide/ і https://node.dev 👍", minsAgo: 53},
            {user: users[4], text: "Дякую, збережу!", minsAgo: 50},
            {user: users[6], text: "Корисно, спасибі!", minsAgo: 48},
            {user: users[5], text: "До речі, є хтось хто добре знає SCSS?", minsAgo: 30},
            {user: users[1], text: "Я непогано, можу допомогти", minsAgo: 28},
            {user: users[0], text: "Я теж, питай", minsAgo: 26},
            {user: users[5], text: "Окей, зараз сформулюю питання 😄", minsAgo: 24},
            {user: users[7], text: "А я можу по Figma допомогти якщо треба", minsAgo: 20},
            {user: users[4], text: "О! Може покажеш як зробити адаптивний лейаут?", minsAgo: 18},
            {user: users[7], text: "Давай завтра зустрінемось, покажу на прикладі 😊", minsAgo: 15},
            {user: users[4], text: "Супер, домовились!", minsAgo: 12},
            {user: users[2], text: "Якщо комусь потрібна допомога з кодом — я тут 24/7 🤖", minsAgo: 8},
            {user: users[10], text: "Хаха, найкращий учасник чату 😄", minsAgo: 5},
            {user: users[0], text: "Всім гарного вечора! 🌙 Продовжуємо завтра", minsAgo: 2},
        ];

        for (const msg of generalMessages) {
            await client.query(`
                INSERT INTO messages (chat_id, user_id, text, created_at)
                VALUES ($1, $2, $3, NOW() - INTERVAL '${msg.minsAgo} minutes')
            `, [chat2Id, msg.user.id, msg.text]);
        }

        console.log(` Загальний чат заповнено ${generalMessages.length} повідомленнями`);

        await client.query('COMMIT');
        console.log('\n База даних успішно заповнена реалістичними тестовими даними!');
        console.log(`    ${users.length} користувачів`);
        console.log(`    ${users.length - 1} приватних чатів`);
        console.log(`    2 групових чати`);
        console.log(`    ~${(users.length - 1) * 10 + groupMessages.length + generalMessages.length} повідомлень`);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(' Помилка при заповненні:', e);
    } finally {
        client.release();
        process.exit();
    }
}

seed();