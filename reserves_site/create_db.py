import sqlite3
from datetime import datetime

# Подключаемся к базе (если файла нет, он создастся)
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Создаем таблицу пользователей
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
)
''')

# Создаем таблицу заповедников
cursor.execute('''
CREATE TABLE IF NOT EXISTS reserves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TEXT NOT NULL
)
''')

# Создаем таблицу пожертвований
cursor.execute('''
CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reserve_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(reserve_id) REFERENCES reserves(id)
)
''')

# Сохраняем и закрываем соединение
conn.commit()
conn.close()

print("База данных создана!")
