export const up = (pgm) => {
  // Користувачі
  pgm.createTable('users', {
    id: 'id',
    username: {type: 'varchar(50)', notNull: true, unique: true},
    email: {type: 'varchar(100)', notNull: true, unique: true},
    password_hash: {type: 'text', notNull: true},
    avatar_url: {type: 'text'},
    created_at: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
  });

  // Статуси
  pgm.createTable('user_statuses', {
    id: 'id',
    user_id: {type: 'integer', references: '"users"', onDelete: 'CASCADE', unique: true},
    online: {type: 'boolean', default: false},
    last_seen: {type: 'timestamp'},
  });

  // Налаштування
  pgm.createTable('user_settings', {
    id: 'id',
    user_id: {type: 'integer', references: '"users"', onDelete: 'CASCADE'},
    language: {type: 'varchar(10)', default: 'en'},
    theme: {type: 'varchar(10)', default: 'light'},
  });

  //  Чати
  pgm.createTable('chats', {
    id: 'id',
    name: {type: 'varchar(100)'},
    is_group: {type: 'boolean', default: false},
    created_at: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
  });

  //  Учасники чатів
  pgm.createTable('chat_members', {
    id: 'id',
    chat_id: {type: 'integer', references: '"chats"', onDelete: 'CASCADE'},
    user_id: {type: 'integer', references: '"users"', onDelete: 'CASCADE'},
    role: {type: 'varchar(20)', default: 'member'},
    is_hidden: {type: 'boolean', default: false},
    cleared_history_at: {type: 'timestamptz', default: null},
    joined_at: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
  });

  //  Повідомлення
  pgm.createTable('messages', {
    id: 'id',
    chat_id: {type: 'integer', references: '"chats"', onDelete: 'CASCADE'},
    user_id: {type: 'integer', references: '"users"', onDelete: 'CASCADE'},
    text: {type: 'text'},
    created_at: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
  });

  // Вкладення
  pgm.createTable('attachments', {
    id: 'id',
    message_id: {type: 'integer', references: '"messages"', onDelete: 'CASCADE'},
    type: {type: 'varchar(20)'},
    file_url: {type: 'text', notNull: true},
    size: {type: 'integer'},
    created_at: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
  });

  //  Прочитані повідомлення
  pgm.createTable('read_receipts', {
    id: 'id',
    message_id: {type: 'integer', references: '"messages"', onDelete: 'CASCADE'},
    user_id: {type: 'integer', references: '"users"', onDelete: 'CASCADE'},
    read_at: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
  });

  // Підказки ШІ
  pgm.createTable('ai_suggestions', {
    id: 'id',
    message_id: {type: 'integer', references: '"messages"', onDelete: 'CASCADE'},
    suggestion_text: {type: 'text', notNull: true},
    model: {type: 'varchar(50)'},
    created_at: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
  });

  // Аналітика ШІ
  pgm.createTable('ai_analytics', {
    id: 'id',
    suggestion_id: {type: 'integer', references: '"ai_suggestions"', onDelete: 'CASCADE'},
    user_id: {type: 'integer', references: '"users"', onDelete: 'CASCADE'},
    useful: {type: 'boolean'},
    response_time: {type: 'integer'},
  });

  // Шаблони відповідей
  pgm.createTable('reply_templates', {
    id: 'id',
    trigger_text: {type: 'text', notNull: true},
    template_text: {type: 'text', notNull: true},
    language: {type: 'varchar(10)', default: 'en'},
  });

  //  Сесії
  pgm.createTable('sessions', {
    id: 'id',
    user_id: {type: 'integer', references: '"users"', onDelete: 'CASCADE'},
    device_info: {type: 'text'},
    last_login: {type: 'timestamp', default: pgm.func('current_timestamp')},
    created_at: {type: 'timestamp', default: pgm.func('current_timestamp')},
  });

  // === ІНДЕКСИ ===
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'username');
  pgm.createIndex('user_statuses', 'user_id');
  pgm.createIndex('user_settings', 'user_id');
  pgm.createIndex('chat_members', 'chat_id');
  pgm.createIndex('chat_members', 'user_id');
  pgm.createIndex('messages', 'chat_id');
  pgm.createIndex('messages', 'user_id');
  pgm.createIndex('messages', 'created_at');
  pgm.createIndex('attachments', 'message_id');
  pgm.createIndex('read_receipts', 'message_id');
  pgm.createIndex('read_receipts', 'user_id');
  pgm.createIndex('ai_suggestions', 'message_id');
  pgm.createIndex('ai_analytics', 'suggestion_id');
  pgm.createIndex('sessions', 'user_id');
};

export const down = (pgm) => {
  pgm.dropTable('sessions');
  pgm.dropTable('reply_templates');
  pgm.dropTable('ai_analytics');
  pgm.dropTable('ai_suggestions');
  pgm.dropTable('read_receipts');
  pgm.dropTable('attachments');
  pgm.dropTable('messages');
  pgm.dropTable('chat_members');
  pgm.dropTable('chats');
  pgm.dropTable('user_settings');
  pgm.dropTable('user_statuses');
  pgm.dropTable('users');
};