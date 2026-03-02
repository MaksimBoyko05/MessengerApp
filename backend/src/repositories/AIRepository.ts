import pool from "../db.js";

export interface ReplyTemplate {
    template_text: string;
}

export interface SavedSuggestion {
    id: number;
    text: string;
}

export interface AnalyticsData {
    suggestion_id: number;
    user_id: number;
    useful: boolean;
    response_time?: number | null;
}

export class AIRepository {
    async findTemplatesByTrigger(triggerText: string, language = "uk"): Promise<ReplyTemplate[]> {
        const safeText = triggerText
            .slice(0, 100)
            .replace(/[%_\\]/g, "\\$&");

        const result = await pool.query<ReplyTemplate>(
            `SELECT template_text
             FROM reply_templates
             WHERE trigger_text ILIKE $1
               AND language = $2
                 LIMIT 3`,
            [`%${safeText}%`, language]
        );

        return result.rows;
    }

    async saveSuggestions(
        messageId: number,
        suggestions: string[],
        model: string,
        generationTimeMs: number = 0
    ): Promise<SavedSuggestion[]> {
        if (suggestions.length === 0) return [];

        const result = await pool.query<SavedSuggestion>(
            `INSERT INTO ai_suggestions (message_id, suggestion_text, model, generation_time_ms)
             SELECT $1,
                    unnest($2::text[]),
                    $3,
                    $4
                        RETURNING id, suggestion_text AS text`,
            [messageId, suggestions, model, generationTimeMs]
        );

        return result.rows;
    }

    async saveAnalytics(suggestionId: number, userId: number): Promise<void> {
        await pool.query(
            `INSERT INTO ai_analytics (suggestion_id, user_id, useful)
             VALUES ($1, $2, true)`,
            [suggestionId, userId]
        );
    }
}