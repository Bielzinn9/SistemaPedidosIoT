
const Database = require('better-sqlite3');
const path = require('path');

const caminhoBanco = path.join(__dirname, '..', 'pedidos.db');

const db = new Database(caminhoBanco);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT NOT NULL,
    mesa TEXT NOT NULL,
    observacao TEXT DEFAULT '',
    itens TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Recebido',
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
