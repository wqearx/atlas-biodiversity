// =================== СКВОЗНОЙ ПОИСК ===================
class GlobalSearch {
  constructor() {
    this.searchData = [];
    this.init();
  }

  async init() {
    await this.loadSearchData();
    this.createSearchComponent();
    this.bindEvents();
  }

  // Данные для поиска (можно расширить)
  async loadSearchData() {
    this.searchData = [
      {
        title: "Атлас биоразнообразия",
        description: "Главная страница с обзором биоразнообразия",
        url: "../main/index.html",
        page: "Главная",
        tags: ["главная", "биоразнообразие", "животные"]
      },
      {
        title: "Заповедники мира",
        description: "Каталог заповедников по регионам мира",
        url: "../main/reserves.html",
        page: "Заповедники",
        tags: ["заповедники", "парки", "охрана природы"]
      },
      {
        title: "Байкальский заповедник",
        description: "Охраняет уникальную экосистему озера Байкал",
        url: "../main/reserves.html#байкал",
        page: "Заповедники",
        tags: ["байкал", "россия", "озеро"]
      },
      {
        title: "Йеллоустонский парк",
        description: "Первый национальный парк в мире",
        url: "../main/reserves.html#йеллоустон",
        page: "Заповедники",
        tags: ["йеллоустон", "сша", "вулканы"]
      },
      {
        title: "О проекте",
        description: "Информация о создателе и технологиях проекта",
        url: "../main/about.html",
        page: "О проекте",
        tags: ["проект", "технологии", "создатель"]
      },
      {
        title: "Контакты",
        description: "Контактная информация и учебное заведение",
        url: "../main/contacts.html",
        page: "Контакты",
        tags: ["контакты", "почта", "github"]
      },
      {
        title: "Вход/Регистрация",
        description: "Система авторизации и поддержки заповедников",
        url: "../main/login.html",
        page: "Вход/Регистрация",
        tags: ["вход", "регистрация", "пожертвования"]
      },
      // Животные
      {
        title: "Лев",
        description: "Царь саванны и символ силы",
        url: "../main/index.html#forest",
        page: "Главная",
        tags: ["лев", "саванна", "хищник"]
      },
      {
        title: "Дельфин",
        description: "Дружелюбный и умный обитатель морей",
        url: "../main/index.html#ocean",
        page: "Главная",
        tags: ["дельфин", "океан", "млекопитающее"]
      },
      {
        title: "Орел",
        description: "Гордый хищник, парящий над горами",
        url: "../main/index.html#sky",
        page: "Главная",
        tags: ["орел", "птица", "хищник"]
      },
      {
        title: "Кобра",
        description: "Опасная и грациозная охотница",
        url: "../main/index.html#desert",
        page: "Главная",
        tags: ["кобра", "змея", "рептилия"]
      }
    ];
  }

  createSearchComponent() {
    const searchHTML = `
      <div class="global-search">
        <div class="search-toggle">
          <span>🔍 Поиск</span>
        </div>
        <div class="search-box">
          <input type="text" class="search-input" placeholder="Введите запрос...">
          <div class="search-results"></div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', searchHTML);
  }

  bindEvents() {
    const toggle = document.querySelector('.search-toggle');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');

    // Переключение видимости поиска
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      searchBox.classList.toggle('active');
      if (searchBox.classList.contains('active')) {
        searchInput.focus();
      }
    });

    // Поиск при вводе
    searchInput.addEventListener('input', (e) => {
      this.performSearch(e.target.value);
    });

    // Закрытие при клике вне области поиска
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.global-search')) {
        searchBox.classList.remove('active');
      }
    });

    // Обработка выбора результата
    searchResults.addEventListener('click', (e) => {
      const resultItem = e.target.closest('.search-result-item');
      if (resultItem) {
        const url = resultItem.dataset.url;
        if (url) {
          window.location.href = url;
        }
      }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchBox.classList.remove('active');
      }
    });
  }

  performSearch(query) {
    const searchResults = document.querySelector('.search-results');
    
    if (!query.trim()) {
      searchResults.innerHTML = '<div class="no-results">Введите поисковый запрос</div>';
      return;
    }

    const results = this.searchData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
      item.page.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="no-results">Ничего не найдено</div>';
      return;
    }

    searchResults.innerHTML = results.map(item => `
      <div class="search-result-item" data-url="${item.url}">
        <h4>${this.highlightText(item.title, query)}</h4>
        <p>${this.highlightText(item.description, query)}</p>
        <div class="page">${item.page}</div>
      </div>
    `).join('');
  }

  highlightText(text, query) {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Инициализация поиска
document.addEventListener('DOMContentLoaded', () => {
  new GlobalSearch();
});