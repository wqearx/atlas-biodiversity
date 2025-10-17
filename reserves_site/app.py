from flask import Flask, render_template, request, redirect, session
import sqlite3
from flask_bcrypt import Bcrypt
from datetime import datetime

app = Flask(__name__)
app.secret_key = "supersecretkey"  # для сессий
bcrypt = Bcrypt(app)

DB_PATH = 'database.db'

# Подключение к БД
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# === Регистрация ===
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        password = request.form["password"]
        pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        created_at = datetime.now().isoformat()

        conn = get_db()
        try:
            conn.execute(
                "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                (name, email, pw_hash, created_at)
            )
            conn.commit()
        except sqlite3.IntegrityError:
            conn.close()
            return "Пользователь с таким email уже существует!"
        conn.close()
        return redirect("/login")
    return render_template("register.html")

# === Вход ===
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        conn.close()

        if user and bcrypt.check_password_hash(user["password_hash"], password):
            session["user_id"] = user["id"]
            session["user_name"] = user["name"]
            return redirect("/reserves")
        else:
            return "Неверный логин или пароль"
    return render_template("login.html")

# === Страница заповедников ===
@app.route("/reserves")
def reserves():
    if "user_id" not in session:
        return redirect("/login")
    conn = get_db()
    reserves_list = conn.execute("SELECT * FROM reserves").fetchall()
    conn.close()
    return render_template("reserves.html", reserves=reserves_list)

# === Выход ===
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

if __name__ == "__main__":
    app.run(debug=True)
