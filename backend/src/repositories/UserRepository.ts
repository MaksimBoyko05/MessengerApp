import pool from "../db.js";
import {User} from "../types/db.js"

export class UserRepository {
    static async findByEmail(email: string): Promise<User | null> {
        const query = `SELECT *
                       FROM users
                       WHERE email = $1`;
        const result = await pool.query<User>(query, [email]);
        return result.rows[0] || null;
    }

    static async create(username: string, email: string, hash: string, avatar_url: string | null): Promise<User> {
        const query = `
            INSERT INTO users (username, email, password_hash, avatar_url)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const result = await pool.query<User>(query, [username, email, hash, avatar_url]);
        return result.rows[0];
    }

    static async findById(id: number): Promise<User | null> {
        const query = `SELECT *
                       FROM users
                       WHERE id = $1`;
        const result = await pool.query<User>(query, [id]);
        return result.rows[0] || null;
    }

    static async findAll(): Promise<User[]> {
        const query = `SELECT *
                       FROM users`;
        const result = await pool.query<User>(query, [])
        return result.rows;
    }

    static async search(query: string, currentUserId: number): Promise<User[]> {
        const sql = `
            SELECT id, username, email, avatar_url
            FROM users
            WHERE username ILIKE $1
              AND id != $2
                LIMIT 20
        `;
        const result = await pool.query<User>(sql, [`%${query}%`, currentUserId]);
        return result.rows;
    }
}