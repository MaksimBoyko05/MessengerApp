import pool from "../db.js";

export interface ReplyTemplate {
    template_text: string;
}

export interface AISuggestion {
    message_id: number;
    suggestion_text: string;
    model: string;
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
        model: string
    ): Promise<void> {
        if (suggestions.length === 0) return;

        await pool.query(
            `INSERT INTO ai_suggestions (message_id, suggestion_text, model)
             SELECT $1, unnest($2::text[]), $3`,
            [messageId, suggestions, model]
        );
    }
}