import pool from "../db.js";
import {Chat} from "../types/db.js";

export class ChatRepository {

    async getUserChats(userId: number): Promise<any[]> {
        // @formatter:off
        const query = `
            SELECT
                c.id,
                c.is_group,
                CASE
                    WHEN c.is_group = false THEN (
                        SELECT u.id FROM chat_members cm2
                                             JOIN users u ON cm2.user_id = u.id
                        WHERE cm2.chat_id = c.id AND cm2.user_id != $1 LIMIT 1
                )
                    ELSE NULL
            END as partner_id,
                CASE
                    WHEN c.is_group = false THEN (
                        SELECT us.online FROM chat_members cm2
                        JOIN user_statuses us ON cm2.user_id = us.user_id
                        WHERE cm2.chat_id = c.id AND cm2.user_id != $1 LIMIT 1
            )
            ELSE NULL
            END as is_online,
                CASE
                    WHEN c.is_group = false THEN (
                        SELECT us.last_seen FROM chat_members cm2
                        JOIN user_statuses us ON cm2.user_id = us.user_id
                        WHERE cm2.chat_id = c.id AND cm2.user_id != $1 LIMIT 1
            )
            ELSE NULL
            END as last_seen,
                CASE
                    WHEN c.is_group = false THEN (
                        SELECT u.username FROM chat_members cm2
                                                   JOIN users u ON cm2.user_id = u.id
                        WHERE cm2.chat_id = c.id AND cm2.user_id != $1 LIMIT 1
                )
                    ELSE c.name
            END as name,
                CASE 
                    WHEN c.is_group = false THEN (
                        SELECT u.avatar_url FROM chat_members cm2 
                        JOIN users u ON cm2.user_id = u.id 
                        WHERE cm2.chat_id = c.id AND cm2.user_id != $1 LIMIT 1
            )
            ELSE c.avatar_url
            END as avatar_url,
                (SELECT text FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
                (SELECT user_id FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_author_id,
                (
    SELECT 
        CASE 
            WHEN m.user_id = $1 THEN
            EXISTS (
            SELECT 1 FROM read_receipts rr
            WHERE rr.message_id = m.id AND rr.user_id != $1
            )
            ELSE
            EXISTS (
            SELECT 1 FROM read_receipts rr
            WHERE rr.message_id = m.id AND rr.user_id = $1
            )
            END
            FROM messages m
            WHERE m.chat_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
            ) as is_last_message_read,
            (
            SELECT CAST(COUNT(*) AS INTEGER)
            FROM messages m
            LEFT JOIN read_receipts rr ON m.id = rr.message_id AND rr.user_id = $1
            WHERE m.chat_id = c.id AND m.user_id != $1 AND rr.id IS NULL
            ) as unread_count
            FROM chats c
            JOIN chat_members cm ON c.id = cm.chat_id
            WHERE cm.user_id = $1
            ORDER BY last_message_time DESC NULLS LAST;
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }
    async getChatByIdForSidebar(chatId: number, userId: number): Promise<any> {
        const query = `
            SELECT
                c.id,
                c.is_group,
                CASE
                    WHEN c.is_group = false THEN (
                        SELECT u.id FROM chat_members cm2
                                             JOIN users u ON cm2.user_id = u.id
                        WHERE cm2.chat_id = c.id AND cm2.user_id != $1 LIMIT 1
                )
                    ELSE NULL
            END as partner_id,
                CASE
                    WHEN c.is_group = false THEN (
                        SELECT us.online FROM chat_members cm2
                        JOIN user_statuses us ON cm2.user_id = us.user_id
                        WHERE cm2.chat_id = c.id AND cm2.user_id != $1 LIMIT 1
            )
            ELSE NULL
            END as is_online,
                CASE
                    WHEN c.is_group = false THEN (
                        SELECT us.last_seen FROM chat_members cm2
                        JOIN user_statuses us ON cm2.user_id = us.user_id
                        WHERE cm2.chat_id = c.id AND cm2.user_id != $1 LIMIT 1
            )
            ELSE NULL
            END as last_seen,
                CASE
                    WHEN c.is_group = false THEN (
                        SELECT u.username FROM chat_members cm2
                                                   JOIN users u ON cm2.user_id = u.id
                        WHERE cm2.chat_id = c.id AND cm2.user_id != $1 LIMIT 1
                )
                ELSE c.name
            END as name,
            CASE 
                WHEN c.is_group = false THEN (
                    SELECT u.avatar_url FROM chat_members cm2 
                    JOIN users u ON cm2.user_id = u.id 
                    WHERE cm2.chat_id = c.id AND cm2.user_id != $1 LIMIT 1
            )
            ELSE c.avatar_url
            END as avatar_url,
            (SELECT text FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
            (SELECT user_id FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_author_id,
           (
    SELECT 
        CASE 
            WHEN m.user_id = $1 THEN
            EXISTS (
            SELECT 1 FROM read_receipts rr
            WHERE rr.message_id = m.id AND rr.user_id != $1
            )
            ELSE
            EXISTS (
            SELECT 1 FROM read_receipts rr
            WHERE rr.message_id = m.id AND rr.user_id = $1
            )
            END
            FROM messages m
            WHERE m.chat_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
            ) as is_last_message_read,
            (
            SELECT CAST(COUNT(*) AS INTEGER)
            FROM messages m
            LEFT JOIN read_receipts rr ON m.id = rr.message_id AND rr.user_id = $1
            WHERE m.chat_id = c.id AND m.user_id != $1 AND rr.id IS NULL
            ) as unread_count
            FROM chats c
            JOIN chat_members cm ON c.id = cm.chat_id
            WHERE c.id = $2 AND cm.user_id = $1;
        `;
        const result = await pool.query(query, [userId, chatId]);
        return result.rows[0];
    }
    async findPrivateChat(user1Id: number, user2Id: number): Promise<Chat | null> {
        const query = `
            SELECT c.*
            FROM chats c
                     JOIN chat_members cm1 ON c.id = cm1.chat_id
                     JOIN chat_members cm2 ON c.id = cm2.chat_id
            WHERE c.is_group = false
              AND cm1.user_id = $1
              AND cm2.user_id = $2 LIMIT 1;
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
                VALUES ($1, $2),
                       ($1, $3)
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
    async createGroupChat(creatorId: number, name: string, memberIds: number[]): Promise<Chat> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const chatRes = await client.query(
                "INSERT INTO chats (name, is_group) VALUES ($1, $2) RETURNING *",
                [name, true]
            );
            const newChat = chatRes.rows[0];

            await client.query(
                "INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, 'admin')",
                [newChat.id, creatorId]
            );
            const otherMembers = [...new Set(memberIds)].filter(id => id !== creatorId);

            if (otherMembers.length > 0) {
                const insertPromises = otherMembers.map(userId =>
                    client.query(
                        "INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, 'member')",
                        [newChat.id, userId]
                    )
                );
                await Promise.all(insertPromises);
            }

            await client.query("COMMIT");
            return newChat;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }
    async addMembersToGroupChat(chatId: number, currentUserId: number, memberIds: number[]): Promise<number[]> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const roleRes = await client.query(
                "SELECT role FROM chat_members WHERE chat_id = $1 AND user_id = $2",
                [chatId, currentUserId]
            );

            if (roleRes.rowCount === 0) {
                throw new Error("You are not a member of this chat");
            }

            if (roleRes.rows[0].role !== 'admin') {
                throw new Error("Access denied: only admins can add members");
            }

            const chatRes = await client.query("SELECT is_group FROM chats WHERE id = $1", [chatId]);
            if (chatRes.rowCount === 0 || !chatRes.rows[0].is_group) {
                throw new Error("Chat not found or is not a group");
            }

            const existingMembersRes = await client.query("SELECT user_id FROM chat_members WHERE chat_id = $1", [chatId]);
            const existingMemberIds = existingMembersRes.rows.map(row => row.user_id);

            const newMembers = [...new Set(memberIds)].filter(id => !existingMemberIds.includes(id));

            if (newMembers.length > 0) {
                const insertPromises = newMembers.map(userId =>
                    client.query(
                        "INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, 'member')",
                        [chatId, userId]
                    )
                );
                await Promise.all(insertPromises);
            }

            await client.query("COMMIT");
            return newMembers;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }
    async getUsernames(userIds: number[]): Promise<string[]> {
        if (!userIds || userIds.length === 0) return [];

        const result = await pool.query(
            "SELECT username FROM users WHERE id = ANY($1)",
            [userIds]
        );
        return result.rows.map(row => row.username);
    }
    async getChatMemberIds(chatId: number): Promise<number[]> {
        const result = await pool.query(
            "SELECT user_id FROM chat_members WHERE chat_id = $1",
            [chatId]
        );
        return result.rows.map(row => row.user_id);
    }
    async updateGroupAvatar(chatId: number, currentUserId: number, avatarUrl: string): Promise<void> {
        const roleRes = await pool.query(
            "SELECT role FROM chat_members WHERE chat_id = $1 AND user_id = $2",
            [chatId, currentUserId]
        );

        if (roleRes.rowCount === 0) {
            throw new Error("You are not a member of this chat");
        }
        if (roleRes.rows[0].role !== 'admin') {
            throw new Error("Access denied: only admins can change avatar");
        }
        const result = await pool.query(
            "UPDATE chats SET avatar_url = $1 WHERE id = $2 AND is_group = true RETURNING id",
            [avatarUrl, chatId]
        );

        if (result.rowCount === 0) {
            throw new Error("Group chat not found");
        }
    }
    async updateGroupName(chatId: number, currentUserId: number, newName: string): Promise<void> {
        const roleRes = await pool.query(
            "SELECT role FROM chat_members WHERE chat_id = $1 AND user_id = $2",
            [chatId, currentUserId]
        );

        if (roleRes.rowCount === 0) {
            throw new Error("You are not a member of this chat");
        }
        if (roleRes.rows[0].role !== 'admin') {
            throw new Error("Access denied: only admins can change name");
        }

        const result = await pool.query(
            "UPDATE chats SET name = $1 WHERE id = $2 AND is_group = true RETURNING id",
            [newName, chatId]
        );

        if (result.rowCount === 0) {
            throw new Error("Group chat not found");
        }
    }
    async promoteToAdmin(chatId: number, currentUserId: number, targetUserId: number): Promise<void> {
        const roleRes = await pool.query(
            "SELECT role FROM chat_members WHERE chat_id = $1 AND user_id = $2",
            [chatId, currentUserId]
        );

        if (roleRes.rowCount === 0) {
            throw new Error("You are not a member of this chat");
        }
        if (roleRes.rows[0].role !== 'admin') {
            throw new Error("Access denied: only admins can promote members");
        }
        const updateRes = await pool.query(
            "UPDATE chat_members SET role = 'admin' WHERE chat_id = $1 AND user_id = $2 RETURNING id",
            [chatId, targetUserId]
        );

        if (updateRes.rowCount === 0) {
            throw new Error("Target user is not a member of this chat");
        }
    }
    async promoteToMember(chatId: number, currentUserId: number, targetUserId: number): Promise<void> {
        const roleRes = await pool.query(
            "SELECT role FROM chat_members WHERE chat_id = $1 AND user_id = $2",
            [chatId, currentUserId]
        );

        if (roleRes.rowCount === 0) {
            throw new Error("You are not a member of this chat");
        }
        if (roleRes.rows[0].role !== 'admin') {
            throw new Error("Access denied: only admins can promote members");
        }
        const updateRes = await pool.query(
            "UPDATE chat_members SET role = 'member' WHERE chat_id = $1 AND user_id = $2 RETURNING id",
            [chatId, targetUserId]
        );

        if (updateRes.rowCount === 0) {
            throw new Error("Target user is not a member of this chat");
        }
    }
    async removeMemberFromGroup(chatId: number, currentUserId: number, targetUserId: number): Promise<void> {
        const roleRes = await pool.query(
            "SELECT role FROM chat_members WHERE chat_id = $1 AND user_id = $2",
            [chatId, currentUserId]
        );

        if (roleRes.rowCount === 0) {
            throw new Error("You are not a member of this chat");
        }
        if (roleRes.rows[0].role !== 'admin') {
            throw new Error("Access denied: only admins can remove members");
        }

        const deleteRes = await pool.query(
            "DELETE FROM chat_members WHERE chat_id = $1 AND user_id = $2 RETURNING id",
            [chatId, targetUserId]
        );

        if (deleteRes.rowCount === 0) {
            throw new Error("Target user is not a member of this chat");
        }
    }
    async leaveGroupChat(chatId: number, currentUserId: number): Promise<void> {
        const deleteRes = await pool.query(
            "DELETE FROM chat_members WHERE chat_id = $1 AND user_id = $2 RETURNING id",
            [chatId, currentUserId]
        );

        if (deleteRes.rowCount === 0) {
            throw new Error("You are not a member of this chat");
        }
    }

    async findById(chatId: number): Promise<Chat | null> {
        const result = await pool.query("SELECT * FROM chats WHERE id = $1", [chatId]);
        return result.rows[0] || null;
    }

    async getCompanionInfo(chatId: number, userId: number): Promise<any> {
        const query = `
            SELECT
                u.id,
                u.username,
                u.avatar_url,
                us.online as is_online,
                us.last_seen
            FROM users u
                     JOIN chat_members cm ON u.id = cm.user_id
                     LEFT JOIN user_statuses us ON u.id = us.user_id
            WHERE cm.chat_id = $1
              AND cm.user_id != $2
                LIMIT 1;
        `;
        const result = await pool.query(query, [chatId, userId]);
        return result.rows[0];
    }

    async getChatDetails(chatId: number, userId: number): Promise<any> {
        const chatRes = await pool.query("SELECT id, name, is_group, avatar_url FROM chats WHERE id = $1", [chatId]);
        const chat = chatRes.rows[0];

        if (!chat) return null;

        if (chat.is_group) {
            const membersQuery = `
                SELECT 
                    u.id, u.username, u.avatar_url, 
                    cm.role, 
                    us.online as is_online, us.last_seen
                FROM users u
                JOIN chat_members cm ON u.id = cm.user_id
                LEFT JOIN user_statuses us ON u.id = us.user_id
                WHERE cm.chat_id = $1
                ORDER BY cm.role ASC, u.username ASC;
            `;
            const membersRes = await pool.query(membersQuery, [chatId]);

            return {
                id: chat.id,
                is_group: true,
                name: chat.name,
                avatar_url: chat.avatar_url,
                members: membersRes.rows
            };
        } else {
            const companionQuery = `
                SELECT 
                    u.id, u.username, u.avatar_url, 
                    us.online as is_online, us.last_seen
                FROM users u
                JOIN chat_members cm ON u.id = cm.user_id
                LEFT JOIN user_statuses us ON u.id = us.user_id
                WHERE cm.chat_id = $1 AND cm.user_id != $2
                LIMIT 1;
            `;
            const companionRes = await pool.query(companionQuery, [chatId, userId]);

            return {
                id: chat.id,
                is_group: false,
                companion: companionRes.rows[0]
            };
        }
    }

    async deleteChat(chatId: number, userId: number, forEveryone: boolean): Promise<void> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const checkQuery = `
                SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2
            `;
            const checkRes = await client.query(checkQuery, [chatId, userId]);

            if (checkRes.rowCount === 0) {
                throw new Error("Access denied or chat not found");
            }

            if (forEveryone) {

                await client.query("DELETE FROM read_receipts WHERE message_id IN (SELECT id FROM messages WHERE chat_id = $1)", [chatId]);
                await client.query("DELETE FROM messages WHERE chat_id = $1", [chatId]);
                await client.query("DELETE FROM chat_members WHERE chat_id = $1", [chatId]);

                await client.query("DELETE FROM chats WHERE id = $1", [chatId]);

            } else {
                await client.query(
                    `UPDATE chat_members 
                 SET is_hidden = true, 
                     cleared_history_at = NOW() 
                 WHERE chat_id = $1 AND user_id = $2`,
                    [chatId, userId]
                );
            }

            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            console.error("Error deleting chat:", err);
            throw err;
        } finally {
            client.release();
        }
    }
}