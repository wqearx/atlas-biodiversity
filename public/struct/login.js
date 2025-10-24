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
                
                // Находим существующий заповедник
                const existingIndex = selectedReserves.findIndex(r => r.name === reserveName);
                
                if (existingIndex >= 0) {
                    // Если заповедник уже выбран - СУММИРУЕМ сумму
                    selectedReserves[existingIndex].amount += amount;
                } else {
                    // Если заповедник новый - добавляем
                    selectedReserves.push({ 
                        name: reserveName, 
                        amount: amount,
                        originalAmount: amount // сохраняем оригинальную сумму для подсветки
                    });
                }

                // Подсветка выбранной кнопки
                updateButtonHighlight(buttons, selectedReserves[existingIndex >= 0 ? existingIndex : selectedReserves.length - 1]);
                
                // Обновляем список выбранных
                updateSelectedReservesList();
            });
        });

        // Восстанавливаем подсветку при загрузке страницы
        restoreButtonHighlight(card, reserveName);
    });
}

// ==========================
// Обновление подсветки кнопок
// ==========================
function updateButtonHighlight(buttons, reserve) {
    buttons.querySelectorAll("button").forEach(b => {
        const buttonAmount = parseInt(b.dataset.amount);
        
        if (buttonAmount === reserve.originalAmount) {
            b.style.background = "#00c853";
            b.style.color = "#fff";
            b.style.transform = "scale(1.05)";
        } else {
            b.style.background = "#64ffda";
            b.style.color = "#000";
            b.style.transform = "scale(1)";
        }
    });
}

// ==========================
// Восстановление подсветки кнопок при загрузке
// ==========================
function restoreButtonHighlight(card, reserveName) {
    const existingReserve = selectedReserves.find(r => r.name === reserveName);
    if (existingReserve) {
        const buttons = card.querySelector(".donation-buttons");
        updateButtonHighlight(buttons, existingReserve);
    }
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
    
    // Группируем по названию заповедника для отображения
    const groupedReserves = selectedReserves.reduce((acc, reserve) => {
        if (!acc[reserve.name]) {
            acc[reserve.name] = 0;
        }
        acc[reserve.name] += reserve.amount;
        return acc;
    }, {});
    
    Object.entries(groupedReserves).forEach(([name, totalAmount], index) => {
        const item = document.createElement("div");
        item.className = "selected-item";
        item.innerHTML = `
            <span>${name} — ${totalAmount} ₽</span>
            <button class="remove-btn" data-name="${name}">×</button>
        `;
        selectedList.appendChild(item);
    });
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const reserveName = btn.dataset.name;
            
            // Удаляем все записи этого заповедника
            selectedReserves = selectedReserves.filter(r => r.name !== reserveName);
            updateSelectedReservesList();
            
            // Сбрасываем подсветку кнопок в соответствующей карточке
            const card = document.querySelector(`[data-name="${reserveName}"]`);
            if (card) {
                card.querySelectorAll('.donation-buttons button').forEach(b => {
                    b.style.background = "#64ffda";
                    b.style.color = "#000";
                    b.style.transform = "scale(1)";
                });
            }
        });
    });

    // Показываем общую сумму
    showTotalAmount();
}

// ==========================
// Показать общую сумму пожертвований
// ==========================
function showTotalAmount() {
    // Удаляем старый элемент если есть
    const oldTotal = document.getElementById('totalAmount');
    if (oldTotal) oldTotal.remove();
    
    const total = selectedReserves.reduce((sum, reserve) => sum + reserve.amount, 0);
    
    const totalElement = document.createElement("div");
    totalElement.id = "totalAmount";
    totalElement.innerHTML = `<strong>Общая сумма: ${total} ₽</strong>`;
    totalElement.style.cssText = `
        text-align: center;
        font-size: 1.2rem;
        color: #64ffda;
        margin: 1rem 0;
        padding: 0.5rem;
        background: rgba(100, 255, 218, 0.1);
        border-radius: 10px;
        border: 1px solid #64ffda;
    `;
    
    const selectedContainer = document.getElementById("selectedReserves");
    selectedContainer.appendChild(totalElement);
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
        
        // Группируем платежи по заповедникам перед отправкой
        const groupedReserves = selectedReserves.reduce((acc, reserve) => {
            if (!acc[reserve.name]) {
                acc[reserve.name] = 0;
            }
            acc[reserve.name] += reserve.amount;
            return acc;
        }, {});

        // Преобразуем обратно в массив для отправки
        const reservesToSend = Object.entries(groupedReserves).map(([name, amount]) => ({
            name,
            amount
        }));

        const response = await fetch("/save-reserves", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: user.email, 
                reserves: reservesToSend,
                totalAmount: reservesToSend.reduce((sum, r) => sum + r.amount, 0)
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(message, "✅ " + result.message, true);
            await loadUserDonations(user.email);
            
            // Очищаем выбранные заповедники после успешного сохранения
            selectedReserves = [];
            updateSelectedReservesList();
            
            // Сбрасываем подсветку всех кнопок
            document.querySelectorAll('.donation-buttons button').forEach(btn => {
                btn.style.background = "#64ffda";
                btn.style.color = "#000";
                btn.style.transform = "scale(1)";
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
    
    // Группируем донаты по заповедникам для отображения
    const groupedDonations = donations.reduce((acc, donation) => {
        if (!acc[donation.reserve_name]) {
            acc[donation.reserve_name] = 0;
        }
        acc[donation.reserve_name] += donation.amount;
        return acc;
    }, {});
    
    donationsList.innerHTML = Object.entries(groupedDonations).map(([reserveName, totalAmount]) => `
        <div class="donation-item">
            <div class="donation-info">
                <span class="reserve-name">${reserveName}</span>
                <span class="donation-amount">${totalAmount} ₽</span>
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
    
    .selected-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        margin: 0.3rem 0;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border-left: 3px solid #64ffda;
    }
    
    .remove-btn {
        background: #ff5252;
        color: white;
        border: none;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        cursor: pointer;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .remove-btn:hover {
        background: #ff0000;
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);

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