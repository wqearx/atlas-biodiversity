const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'atlas-bio-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// === Подключаем папку public как статическую ===
app.use(express.static(path.join(__dirname, "public")));

// === Подключение к базе данных ===
const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Ошибка подключения к БД:", err.message);
  else console.log("✅ База данных подключена");
});

// === Создание таблицы пользователей (если нет) ===
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// === Создание таблицы пожертвований (если нет) ===
db.run(`CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  reserve_name TEXT NOT NULL,
  amount REAL NOT NULL,
  donation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_email) REFERENCES users (email)
)`);

// === Регистрация ===
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Все поля обязательны" });
  }

  const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
  db.run(query, [name, email, password], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ message: "Пользователь с таким email уже существует" });
      }
      return res.status(500).json({ message: "Ошибка при добавлении пользователя", error: err.message });
    }
    
    req.session.userId = this.lastID;
    req.session.userEmail = email;
    req.session.userName = name;
    
    res.status(200).json({ 
      message: "Регистрация прошла успешно", 
      userId: this.lastID,
      user: {
        id: this.lastID,
        name: name,
        email: email
      }
    });
  });
});

// === Вход ===
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, row) => {
    if (err) return res.status(500).json({ message: "Ошибка сервера" });
    if (!row) return res.status(401).json({ message: "Неверный логин или пароль" });

    req.session.userId = row.id;
    req.session.userEmail = row.email;
    req.session.userName = row.name;

    res.json({ 
      message: "Успешный вход", 
      user: {
        id: row.id,
        name: row.name,
        email: row.email
      }
    });
  });
});

// === Выход ===
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при выходе" });
    }
    res.json({ message: "Выход выполнен успешно" });
  });
});

// === Проверка авторизации ===
app.get("/check-auth", (req, res) => {
  if (req.session.userId) {
    res.json({ 
      loggedIn: true, 
      user: {
        id: req.session.userId,
        name: req.session.userName,
        email: req.session.userEmail
      }
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// === Сохранение выбранных заповедников и сумм ===
app.post("/save-reserves", (req, res) => {
  const { email, reserves } = req.body;

  if (!email || !reserves || reserves.length === 0) {
    return res.status(400).json({ message: "Неверные данные" });
  }

  // Сначала удаляем старые донаты пользователя
  db.run(`DELETE FROM donations WHERE user_email = ?`, [email], (err) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка при обновлении данных" });
    }

    // Затем добавляем новые
    const insertQuery = `INSERT INTO donations (user_email, reserve_name, amount) VALUES (?, ?, ?)`;
    const stmt = db.prepare(insertQuery);
    
    reserves.forEach(r => {
      stmt.run(email, r.name, r.amount);
    });
    
    stmt.finalize((err) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка при сохранении данных" });
      }

      res.status(200).json({ message: "Данные успешно сохранены" });
    });
  });
});

// === Получение списка пожертвований пользователя ===
app.get("/user-donations", (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ message: "Не указан email" });

  db.all(`SELECT reserve_name, amount FROM donations WHERE user_email = ? ORDER BY donation_date DESC`, [email], (err, rows) => {
    if (err) return res.status(500).json({ message: "Ошибка при получении данных" });
    res.json({ donations: rows });
  });
});

// === Удаление пожертвования ===
app.delete("/donation/:id", (req, res) => {
  const donationId = req.params.id;
  const userEmail = req.session.userEmail;

  db.run(`DELETE FROM donations WHERE id = ? AND user_email = ?`, [donationId, userEmail], function(err) {
    if (err) return res.status(500).json({ message: "Ошибка при удалении" });
    if (this.changes === 0) return res.status(404).json({ message: "Пожертвование не найдено" });
    
    res.json({ message: "Пожертвование удалено" });
  });
});

// === Главная страница ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main", "index.html"));
});

// === Страница входа ===
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login", "login.html"));
});

// === Запуск сервера ===
app.listen(PORT, () => console.log(`🚀 Сервер запущен: http://localhost:${PORT}`));