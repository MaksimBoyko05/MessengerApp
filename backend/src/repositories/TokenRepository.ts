import pool from "../db.js";

export class TokenRepository {
    static async deleteUserTokensByType(userId: number, type: string) {
        await pool.query(
            "DELETE FROM verification_tokens WHERE user_id = $1 AND type = $2",
            [userId, type]
        );
    }

    static async createToken(userId: number, token: string, type: string, payload: string, expiresAt: Date) {
        await pool.query(
            `INSERT INTO verification_tokens (user_id, token, type, payload, expires_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, token, type, payload, expiresAt]
        );
    }

    static async findValidToken(token: string, type: string) {
        const result = await pool.query(
            `SELECT user_id, payload
             FROM verification_tokens
             WHERE token = $1
               AND type = $2
               AND expires_at > NOW()`,
            [token, type]
        );
        return result.rows[0] || null;
    }
}