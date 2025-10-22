// Глобальная переменная для хранения выбранных заповедников
let selectedReserves = [];

// ==========================
// Инициализация при загрузке страницы
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
    initializeEventListeners();
});

// ==========================
// Проверка статуса авторизации
// ==========================
async function checkAuthStatus() {
    try {
        const response = await fetch('/check-auth');
        const result = await response.json();
        
        if (result.loggedIn) {
            // Пользователь уже авторизован
            localStorage.setItem("user", JSON.stringify(result.user));
            showUserInterface(result.user);
            await loadUserDonations(result.user.email);
        } else {
            // Показываем формы входа/регистрации
            document.querySelector(".form-container").style.display = "flex";
            document.getElementById("profileMenu").style.display = "none";
        }
    } catch (error) {
        console.log('Ошибка проверки авторизации:', error);
        document.querySelector(".form-container").style.display = "flex";
    }
}

// ==========================
// Инициализация обработчиков событий
// ==========================
function initializeEventListeners() {
    // Регистрация
    document.getElementById("registerForm").addEventListener("submit", handleRegister);
    
    // Вход
    document.getElementById("loginForm").addEventListener("submit", handleLogin);
    
    // Выход
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
    
    // Сохранение заповедников
    document.getElementById("saveReserves").addEventListener("click", handleSaveReserves);
    
    // Инициализация карточек заповедников
    initializeReserveCards();
}

// ==========================
// Регистрация
// ==========================
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const terms = document.getElementById("termsCheck").checked;
    const message = document.getElementById("messageRegister");

    if (!terms) {
        showMessage(message, "❌ Нужно согласиться с условиями", false);
        return;
    }

    if (password.length < 6) {
        showMessage(message, "❌ Пароль должен быть не менее 6 символов", false);
        return;
    }

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(message, "✅ " + result.message, true);
            localStorage.setItem("user", JSON.stringify(result.user));
            showUserInterface(result.user);
            // Очищаем форму
            document.getElementById("registerForm").reset();
        } else {
            showMessage(message, "❌ " + result.message, false);
        }
    } catch (error) {
        showMessage(message, "❌ Ошибка сети", false);
    }
}

// ==========================
// Вход
// ==========================
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const message = document.getElementById("messageLogin");

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();

        if (response.ok) {
            showMessage(message, "✅ " + result.message, true);
            localStorage.setItem("user", JSON.stringify(result.user));
            showUserInterface(result.user);
            await loadUserDonations(result.user.email);
            // Очищаем форму
            document.getElementById("loginForm").reset();
        } else {
            showMessage(message, "❌ " + result.message, false);
        }
    } catch (error) {
        showMessage(message, "❌ Ошибка сети", false);
    }
}

// ==========================
// Выход
// ==========================
async function handleLogout() {
    try {
        const response = await fetch("/logout", { 
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        
        const result = await response.json();
        console.log(result.message);
    } catch (error) {
        console.error('Ошибка выхода:', error);
    }
    
    // Очищаем локальное хранилище и перезагружаем страницу
    localStorage.removeItem("user");
    selectedReserves = [];
    window.location.reload();
}

// ==========================
// Показать интерфейс пользователя
// ==========================
function showUserInterface(user) {
    document.querySelector(".form-container").style.display = "none";
    document.getElementById("reservesContainer").style.display = "block";
    document.getElementById("donationsContainer").style.display = "block";
    document.getElementById("profileMenu").style.display = "flex";
    document.getElementById("userName").textContent = user.name;
    
    // Показываем приветствие
    showWelcomeMessage(user.name);
}

// ==========================
// Приветственное сообщение
// ==========================
function showWelcomeMessage(userName) {
    // Удаляем старое сообщение если есть
    const oldWelcome = document.getElementById('welcomeMessage');
    if (oldWelcome) oldWelcome.remove();
    
    const welcome = document.createElement("div");
    welcome.id = "welcomeMessage";
    welcome.innerHTML = `🎉 Добро пожаловать, <strong>${userName}</strong>! Теперь вы можете поддержать заповедники.`;
    welcome.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #00c853, #64dd17);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        max-width: 300px;
        font-size: 14px;
        animation: slideIn 0.5s ease-out;
    `;
    
    document.body.appendChild(welcome);
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        if (welcome.parentNode) {
            welcome.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => welcome.remove(), 500);
        }
    }, 5000);
}

// ==========================
// Инициализация карточек заповедников
// ==========================
function initializeReserveCards() {
    document.querySelectorAll(".reserve-card").forEach(card => {
        const buttons = card.querySelector(".donation-buttons");
        const reserveName = card.dataset.name;

        card.addEventListener("click", (e) => {
            if (!e.target.closest('.donation-buttons')) {
                buttons.style.display = buttons.style.display === "flex" ? "none" : "flex";
            }
        });

        // Обработка выбора суммы
        buttons.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const amount = parseInt(btn.dataset.amount);
                
                // Обновляем или добавляем заповедник
                const existingIndex = selectedReserves.findIndex(r => r.name === reserveName);
                if (existingIndex >= 0) {
                    selectedReserves[existingIndex].amount = amount;
                } else {
                    selectedReserves.push({ name: reserveName, amount });
                }

                // Подсветка выбранной кнопки
                buttons.querySelectorAll("button").forEach(b => {
                    b.style.background = "#64ffda";
                    b.style.color = "#000";
                });
                btn.style.background = "#00c853";
                btn.style.color = "#fff";

                // Обновляем список выбранных
                updateSelectedReservesList();
            });
        });
    });
}

// ==========================
// Обновление списка выбранных заповедников
// ==========================
function updateSelectedReservesList() {
    const selectedList = document.getElementById("selectedList");
    const selectedContainer = document.getElementById("selectedReserves");
    
    if (selectedReserves.length === 0) {
        selectedContainer.style.display = "none";
        return;
    }
    
    selectedContainer.style.display = "block";
    selectedList.innerHTML = "";
    
    selectedReserves.forEach((reserve, index) => {
        const item = document.createElement("div");
        item.className = "selected-item";
        item.innerHTML = `
            <span>${reserve.name} — ${reserve.amount} ₽</span>
            <button class="remove-btn" data-index="${index}">×</button>
        `;
        selectedList.appendChild(item);
    });
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            selectedReserves.splice(index, 1);
            updateSelectedReservesList();
            
            // Сбрасываем подсветку кнопок в соответствующей карточке
            const reserveName = selectedReserves[index]?.name;
            if (reserveName) {
                const card = document.querySelector(`[data-name="${reserveName}"]`);
                if (card) {
                    card.querySelectorAll('.donation-buttons button').forEach(b => {
                        b.style.background = "#64ffda";
                        b.style.color = "#000";
                    });
                }
            }
        });
    });
}

// ==========================
// Сохранение заповедников на сервер
// ==========================
async function handleSaveReserves() {
    const message = document.getElementById("reservesMessage");

    if (selectedReserves.length === 0) {
        showMessage(message, "❌ Выберите хотя бы один заповедник и сумму", false);
        return;
    }

    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await fetch("/save-reserves", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, reserves: selectedReserves })
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(message, "✅ " + result.message, true);
            await loadUserDonations(user.email);
            

            
            // Сбрасываем подсветку кнопок
            document.querySelectorAll('.donation-buttons button').forEach(btn => {
                btn.style.background = "#64ffda";
                btn.style.color = "#000";
            });
            
        } else {
            showMessage(message, "❌ " + result.message, false);
        }
    } catch (err) {
        showMessage(message, "❌ Ошибка сети", false);
    }
}

// ==========================
// Загрузка истории донатов пользователя
// ==========================
async function loadUserDonations(email) {
    try {
        const response = await fetch(`/user-donations?email=${encodeURIComponent(email)}`);
        const result = await response.json();
        
        if (response.ok) {
            displayDonations(result.donations);
        }
    } catch (error) {
        console.error('Ошибка загрузки донатов:', error);
    }
}

// ==========================
// Отображение списка пожертвований
// ==========================
function displayDonations(donations) {
    const donationsList = document.getElementById("donationsList");
    const noDonations = document.getElementById("noDonations");
    
    if (!donations || donations.length === 0) {
        donationsList.innerHTML = "";
        noDonations.style.display = "block";
        return;
    }
    
    noDonations.style.display = "none";
    
    donationsList.innerHTML = donations.map(donation => `
        <div class="donation-item">
            <div class="donation-info">
                <span class="reserve-name">${donation.reserve_name}</span>
                <span class="donation-amount">${donation.amount} ₽</span>
            </div>
        </div>
    `).join('');
}

// ==========================
// Вспомогательная функция для показа сообщений
// ==========================
function showMessage(element, text, isSuccess) {
    element.textContent = text;
    element.style.color = isSuccess ? "#b2ff59" : "#ff5252";
    element.style.display = "block";
    
    // Автоматически скрываем успешные сообщения через 3 секунды
    if (isSuccess) {
        setTimeout(() => {
            element.style.display = "none";
        }, 3000);
    }
}

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
const li = document.createElement('li');
li.classList.add('donation-item');
li.textContent = `${li.reserveName} — ${li.amount} ₽`;
li.style.opacity = '0'; // стартовое состояние для анимации
donationsList.appendChild(li);

// Чтобы анимация сработала после вставки
setTimeout(() => {
  li.style.opacity = '1';
  li.style.animation = 'fadeUp 0.5s ease forwards';
}, 10);

// МОДАЛЬНОЕ ОКНО СОГЛАСЕН С УСЛОВИЯМИ ИСПОЛЬЗОВАНИЯ
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("termsModal");
  const openBtn = document.getElementById("openTerms");
  const closeBtn = document.querySelector(".modal .close");

  if (!modal || !openBtn || !closeBtn) return;

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});

