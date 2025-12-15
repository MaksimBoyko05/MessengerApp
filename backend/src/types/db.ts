export interface User {
    id:number,
    username:string,
    email:string,
    password_hash:string,
    avatar_url:string | null,
    created_at:Date,
}
export interface Message {
    id:number,
    chat_id:number,
    user_id:number,
    text:string | null,
    created_at:Date,
}