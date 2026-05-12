export const up = (pgm) => {
  pgm.dropTable('attachments', {cascade: true});
  pgm.dropTable('sessions', {cascade: true});

  pgm.dropColumns('ai_analytics', ['response_time']);
  pgm.dropColumns('user_settings', ['language']);
};

export const down = (pgm) => {
  pgm.addColumns('ai_analytics', {response_time: {type: 'integer'}});
  pgm.addColumns('user_settings', {language: {type: 'varchar(10)', default: 'en'}});

  pgm.createTable('sessions', {
    id: 'id',
    user_id: {type: 'integer', references: '"users"', onDelete: 'CASCADE'},
    device_info: {type: 'text'},
    last_login: {type: 'timestamp', default: pgm.func('current_timestamp')},
    created_at: {type: 'timestamp', default: pgm.func('current_timestamp')},
  });
  pgm.createIndex('sessions', 'user_id');

  pgm.createTable('attachments', {
    id: 'id',
    message_id: {type: 'integer', references: '"messages"', onDelete: 'CASCADE'},
    type: {type: 'varchar(20)'},
    file_url: {type: 'text', notNull: true},
    size: {type: 'integer'},
    created_at: {type: 'timestamp', notNull: true, default: pgm.func('current_timestamp')},
  });
  pgm.createIndex('attachments', 'message_id');
};