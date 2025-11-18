// search.js - сквозной поиск по сайту
class GlobalSearch {
    constructor() {
        this.searchData = [];
        this.init();
    }

    init() {
        this.loadSearchData();
        this.setupEventListeners();
    }

    // Загружаем данные для поиска
    loadSearchData() {
        this.searchData = [
            // Животные с главной страницы
            { 
                title: "Лев", 
                description: "Царь саванны и символ силы", 
                url: "../main/index.html#forest",
                type: "animal",
                category: "Лес и саванна"
            },
            { 
                title: "Слон", 
                description: "Самое крупное сухопутное животное", 
                url: "../main/index.html#forest",
                type: "animal",
                category: "Лес и саванна"
            },
            { 
                title: "Дельфин", 
                description: "Дружелюбный и умный обитатель морей", 
                url: "../main/index.html#ocean",
                type: "animal", 
                category: "Океан"
            },
            { 
                title: "Орел", 
                description: "Гордый хищник, парящий над горами", 
                url: "../main/index.html#sky",
                type: "animal",
                category: "Птицы и небо"
            },
            { 
                title: "Кобра", 
                description: "Опасная и грациозная охотница", 
                url: "../main/index.html#desert",
                type: "animal",
                category: "Рептилии и пустыни"
            },

            // Заповедники
            { 
                title: "Байкальский заповедник", 
                description: "Охраняет уникальную экосистему озера Байкал", 
                url: "../main/reserves.html",
                type: "reserve",
                category: "Россия"
            },
            { 
                title: "Кроноцкий заповедник", 
                description: "Дом вулканов и диких медведей Камчатки", 
                url: "../main/reserves.html",
                type: "reserve",
                category: "Россия"
            },
            { 
                title: "Йеллоустон", 
                description: "Первый национальный парк в мире", 
                url: "../main/reserves.html",
                type: "reserve",
                category: "Америка"
            },
            { 
                title: "Серенгети", 
                description: "Знаменитый парк с миграцией животных", 
                url: "../main/reserves.html",
                type: "reserve",
                category: "Африка"
            },

            // Страницы
            { 
                title: "Главная страница", 
                description: "Обзор всех животных по категориям", 
                url: "../main/index.html",
                type: "page",
                category: "Навигация"
            },
            { 
                title: "Заповедники мира", 
                description: "Каталог природных заповедников", 
                url: "../main/reserves.html",
                type: "page",
                category: "Навигация"
            },
            { 
                title: "О проекте", 
                description: "Информация о создателе и технологиях", 
                url: "../main/about.html",
                type: "page",
                category: "Навигация"
            },
            { 
                title: "Контакты", 
                description: "Связь с автором проекта", 
                url: "../main/contacts.html",
                type: "page",
                category: "Навигация"
            },
            { 
                title: "Вход/Регистрация", 
                description: "Личный кабинет и поддержка заповедников", 
                url: "../main/login.html",
                type: "page",
                category: "Навигация"
            }
        ];
    }

    setupEventListeners() {
        const searchToggle = document.getElementById('searchToggle');
        const searchBox = document.getElementById('searchBox');
        const globalSearch = document.getElementById('globalSearch');
        const searchResults = document.getElementById('searchResults');

        // Открытие/закрытие поиска
        searchToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            searchBox.classList.toggle('active');
            if (searchBox.classList.contains('active')) {
                globalSearch.focus();
            }
        });

        // Поиск при вводе
        globalSearch.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        // Закрытие поиска при клике вне области
        document.addEventListener('click', (e) => {
            if (!searchBox.contains(e.target) && !searchToggle.contains(e.target)) {
                searchBox.classList.remove('active');
            }
        });

        // Обработка клавиш
        globalSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchBox.classList.remove('active');
            }
        });
    }

    performSearch(query) {
        const searchResults = document.getElementById('searchResults');
        
        if (!query.trim()) {
            searchResults.innerHTML = '';
            return;
        }

        const results = this.searchData.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );

        this.displayResults(results, query);
    }

    displayResults(results, query) {
        const searchResults = document.getElementById('searchResults');
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    Ничего не найдено для "${query}"
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(item => `
            <div class="search-result-item" data-url="${item.url}">
                <div class="search-result-icon">
                    ${this.getIconForType(item.type)}
                </div>
                <div class="search-result-text">
                    <div class="search-result-title">${this.highlightText(item.title, query)}</div>
                    <div class="search-result-description">
                        ${this.highlightText(item.description, query)}
                        <span style="color: #64ffda; font-size: 0.7rem;"> • ${item.category}</span>
                    </div>
                </div>
            </div>
        `).join('');

        searchResults.innerHTML = resultsHTML;

        // Добавляем обработчики клика
        this.addResultClickHandlers();
    }

    getIconForType(type) {
        const icons = {
            animal: '🐾',
            reserve: '🌿',
            page: '📄'
        };
        return icons[type] || '🔍';
    }

    highlightText(text, query) {
        if (!query.trim()) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    addResultClickHandlers() {
        const resultItems = document.querySelectorAll('.search-result-item');
        
        resultItems.forEach(item => {
            item.addEventListener('click', () => {
                const url = item.getAttribute('data-url');
                this.navigateToResult(url);
            });
        });
    }

    navigateToResult(url) {
        // Закрываем поиск
        document.getElementById('searchBox').classList.remove('active');
        document.getElementById('globalSearch').value = '';
        document.getElementById('searchResults').innerHTML = '';

        // Переходим по ссылке
        window.location.href = url;
    }
}

// Инициализация поиска при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new GlobalSearch();
});