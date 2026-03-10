export interface User {
    id: number,
    username: string,
    email: string,
    password_hash: string,
    avatar_url: string | null,
    created_at: Date,
}

export interface UserStatus {
    online: boolean;
    last_seen: Date;
}

export type ChatUser = User & UserStatus;

export interface Chat {
    id: number;
    name: string | null;
    is_group: boolean;
    created_at: Date;
}

export interface Message {
    id: number,
    chat_id: number,
    user_id: number,
    text: string | null,
    created_at: Date,
    type: string
}