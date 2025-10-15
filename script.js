let animalsData = [];

// Загружаем JSON с животными
fetch('animals.json')
  .then(response => response.json())
  .then(data => {
    animalsData = data;
    displayAnimals(animalsData); // Отобразим всех при загрузке
  })
  .catch(error => console.error('Ошибка загрузки JSON:', error));

// === Интерактивный многослойный туман 🌫 ===
const canvas = document.getElementById('fireflies');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fogLayers = [];
let mouse = { x: canvas.width/2, y: canvas.height/2 };

// Настройки слоев: [кол-во, макс радиус, скорость]
const layerSettings = [
  { count: 10, radius: 400, speed: 0.02 },  // передний план
  { count: 15, radius: 250, speed: 0.03 },  // средний
  { count: 20, radius: 150, speed: 0.04 }   // задний план
];

class Fog {
  constructor(radius, speed) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * radius/2 + radius/2;
    this.speedX = (Math.random() * speed - speed/2);
    this.speedY = (Math.random() * speed - speed/2);
    this.alpha = Math.random() * 0.15 + 0.05;
    this.alphaDirection = Math.random() > 0.5 ? 1 : -1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // взаимодействие с мышью
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if(dist < 250){
      const force = (250 - dist)/250 * 1.5;
      this.x += dx/dist * force;
      this.y += dy/dist * force;
    }

    // цикл по экрану
    if (this.x > canvas.width + this.radius) this.x = -this.radius;
    if (this.x < -this.radius) this.x = canvas.width + this.radius;
    if (this.y > canvas.height + this.radius) this.y = -this.radius;
    if (this.y < -this.radius) this.y = canvas.height + this.radius;

    // мягкое мерцание
    this.alpha += 0.001 * this.alphaDirection;
    if (this.alpha < 0.03 || this.alpha > 0.2) this.alphaDirection *= -1;
  }

  draw() {
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initFog() {
  fogLayers = [];
  layerSettings.forEach(layer => {
    let arr = [];
    for (let i = 0; i < layer.count; i++) arr.push(new Fog(layer.radius, layer.speed));
    fogLayers.push(arr);
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fogLayers.forEach(layer => {
    layer.forEach(f => { f.update(); f.draw(); });
  });
  requestAnimationFrame(animate);
}

// отслеживаем мышь
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initFog();
});

initFog();
animate();

// === Плавное появление карточек при скролле ===
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.animal-card').forEach(card => observer.observe(card));

// === Модальное окно ===
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const btnInfo = document.querySelector(".btn.info");
  const spanClose = document.querySelector(".modal .close");

  if(btnInfo){
    // открыть модальное окно
    btnInfo.addEventListener("click", () => {
      modal.style.display = "block";
    });
  }

  // закрыть при клике на крестик
  spanClose.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // закрыть при клике вне окна
  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalImage = document.getElementById("modal-image");
  const modalDesc = document.getElementById("modal-description");
  const closeBtn = modal.querySelector(".close");
  const animalsData = [
  { name: "Лев", biome: "forest", img: "images/1-315.jpg", description: "Царь саванны и символ силы." },
  { name: "Слон", biome: "forest", img: "images/elephant_03.jpg", description: "Самое крупное сухопутное животное." },
  { name: "Тигр", biome: "forest", img: "images/istockphoto-1420676204-612x612.jpg", description: "Мощный хищник из джунглей Азии." },
  { name: "Дельфин", biome: "ocean", img: "images/150218144801_dolphines_happy_624x351_thinkstock.jpg", description: "Дружелюбный и умный обитатель морей." },
  { name: "Черепаха", biome: "ocean", img: "images/Images_SW_illustration_16.jpg", description: "Спокойное создание, путешествующее по океанам." },
  { name: "Орел", biome: "sky", img: "images/golden-eagle-flying.jpg", description: "Гордый хищник, парящий над горами." },
  { name: "Попугай", biome: "sky", img: "images/1621053325_30-oir_mobi-p-popugai-arlekin-zhivotnie-krasivo-foto-31.jpg", description: "Яркий болтун тропических лесов." },
  { name: "Кобра", biome: "desert", img: "images/d4fef1c857d595ebe6ce86fa0d93497f.jpg", description: "Опасная и грациозная охотница, символ силы и мудрости." },
  { name: "Игуана", biome: "desert", img: "images/794tflkt5qs3fno25ck9n91un17v5t7r.jpg", description: "Безмятежная ящерица, обожающая солнечные лучи." }
];


  // расширенные описания для животных
  const animalDetails = {
    "Жираф": "Научное название: Giraffa camelopardalis - высокое травоядное животное. Питается листьями деревьев, преимущественно акации. Достигает высокой скорости при необходимости убежать от хищников.",
    "Волк": "Научное название: Canis lupus - хищник семейства псовых. Социальное животное, живёт стаями с иерархией. Рацион состоит из копытных и мелких млекопитающих.",
    "Лев": "Научное название: Panthera leo - крупный хищник Африки. Живёт стаями (прайдами), вершина пищевой цепи саванны. Питается копытными животными.",
    "Слон": "Научное название: Loxodonta africana - самое крупное сухопутное животное. Социальные группы, высокий интеллект, питается листьями, корой и травой.",
    "Тигр": "Научное название: Panthera tigris - крупный хищник Азии. Ведёт одиночный образ жизни, охотится на копытных и мелких млекопитающих.",
    "Панда": "Научное название: Ailuropoda melanoleuca - медведь, обитающий в горах Китая. Питается главным образом бамбуком. Уязвимый вид.",
    "Медведь": "Научное название: Ursus arctos - крупный хищник, всеядное животное. Активен как днём, так и ночью. Питается рыбой, ягодами и мелкими млекопитающими.",
    "Олень": "Научное название: Cervidae - травоядное животное с разветвлёнными рогами. Живёт в лесах и степях, питается травой, листьями и ягодами.",
    "Павлин": "Научное название: Pavo cristatus - птица семейства фазановых. Самцы демонстрируют длинный красочный хвост для привлечения самок.",
    "Дельфин": "Научное название: Delphinus delphis - социальные морские млекопитающие. Используют эхолокацию, живут в стаях, обладают сложным социальным поведением.",
    "Морская черепаха": "Научное название: Cheloniidae - морское рептильное животное. Питается водорослями и мелкой рыбой, способно к долгим миграциям.",
    "Акула": "Научное название: Carcharhinus spp. - хищная рыба. Обладает острым обонянием и зрением, регулирует численность популяций морских животных.",
    "Осьминог": "Научное название: Octopus vulgaris - высокоразвитый моллюск, умеет маскироваться и использовать инструменты. Питается крабами и рыбой.",
    "Медуза": "Научное название: Aurelia aurita - прозрачное морское животное. Питается планктоном, способно к биолюминесценции.",
    "Морской конёк": "Научное название: Hippocampus spp. - небольшая морская рыба. Самцы вынашивают икру, питается планктоном.",
    "Рыба-клоун": "Научное название: Amphiprioninae - яркая рыба, живёт среди анемонов. Территориальное поведение, питается мелкими беспозвоночными.",
    "Кит": "Научное название: Balaenoptera musculus - крупнейшее животное на планете. Фильтрующий корм — планктон. Миграции на сотни километров.",
    "Кораллы": "Научное название: Scleractinia - морские полипы, строят рифовые экосистемы, поддерживают биоразнообразие океанов.",
    "Манта": "Научное название: Manta birostris - гигантская морская рыба. Плавает грациозно, фильтруя мелкий планктон. Миграции по океанам.",
    "Орёл": "Научное название: Aquila chrysaetos - крупная хищная птица. Обитает в горах и лесах, охотится на мелких и средних млекопитающих, обладает острым зрением и сильными когтями.",
    "Фламинго": "Научное название: Phoenicopterus roseus - крупная водоплавающая птица с розовым оперением. Питается креветками и водорослями, фильтруя воду с помощью клюва.",
    "Попугай": "Научное название: Psittacidae - яркая тропическая птица, умная и общительная. Питается фруктами, семенами и орехами, способна имитировать звуки.",
    "Сова": "Научное название: Strigiformes - ночная хищная птица. Отличается острым слухом и зрением, охотится на грызунов и мелких птиц.",
    "Калибри": "Научное название: Trochilidae - маленькая птица, зависающая в воздухе. Питается нектаром цветов, активно участвует в опылении.",
    "Аист": "Научное название: Ciconia ciconia - крупная перелётная птица. Питается рыбой, лягушками и насекомыми, символизирует рождение и благополучие.",
    "Чайка": "Научное название: Larus argentatus - морская птица, хорошо приспособлена к прибрежной среде. Питается рыбой, падалью и пищевыми отходами.",
    "Павлин": "Научное название: Pavo cristatus - самец известен своим длинным красочным хвостом. Питается насекомыми, зерном и мелкими растениями.",
    "Ласточка": "Научное название: Hirundinidae - небольшая перелётная птица, питается насекомыми в полёте. Строит гнёзда из глины и травы.",
    "Пингвин": "Научное название: Aptenodytes forsteri - нелетающая птица, приспособленная к жизни в холодных водах. Питается рыбой и крилем, отлично плавает.",
    "Кобра": "Научное название: Naja spp. - ядовитая змея, обитающая в Азии и Африке. Питается мелкими млекопитающими, ящерицами и птицами.",
    "Игуана": "Научное название: Iguana iguana - крупная ящерица, вегетарианец. Питается листьями, фруктами и цветами, ведёт дневной образ жизни.",
    "Хамелеон": "Научное название: Chamaeleonidae - ящерица с способностью менять окраску. Питается насекомыми, обладает длинным захватывающим языком.",
    "Геккон": "Научное название: Gekkonidae - небольшая ночная ящерица. Питается насекомыми, способен к лазанию по вертикальным поверхностям.",
    "Варан": "Научное название: Varanus - крупная ящерица, активный хищник. Питается рыбой, мелкими млекопитающими и птицами, обитает в тропических и пустынных регионах.",
    "Крокодил": "Научное название: Crocodylus - крупный пресмыкающийся хищник. Живёт в пресных водоёмах, охотится на рыбу, птиц и млекопитающих.",
    "Пустынная черепаха": "Научное название: Testudo kleinmanni - маленькая сухопутная черепаха пустынных регионов. Питается кактусами и растительностью, приспособлена к засушливым условиям.",
    "Скорпион": "Научное название: Scorpiones - членистоногое, хищник пустынь. Использует ядовитые жала для охоты на насекомых и мелких животных.",
    "Верблюд": "Научное название: Camelus dromedarius - крупное травоядное животное пустынь. Приспособлен к долгим переходам без воды, запасает жир в горбе.",
    "Фенек": "Научное название: Vulpes zerda - мелкий пустынный хищник с большими ушами. Активен ночью, питается насекомыми и мелкими животными."

   
  };
 

   // Клик по карточке
  document.querySelectorAll('.animal-card').forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('h3').innerText;
      const imgSrc = card.querySelector('img').src;
      const desc = animalDetails[title] || card.querySelector('p').innerText;

      modalTitle.textContent = title;
      modalImage.src = imgSrc;
      modalImage.alt = title;
      modalDesc.textContent = desc;

      modal.style.display = 'flex';
    });
  });

  // Закрытие модалки
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => { if(e.target === modal) modal.style.display = 'none'; });
});

function displayAnimals(list, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  list.forEach(animal => {
    const card = document.createElement('div');
    card.className = 'animal-card';
    card.innerHTML = `
      <img src="${animal.img}" alt="${animal.name}">
      <h3>${animal.name}</h3>
      <p>${animal.description}</p>
    `;
    container.appendChild(card);

    // Клик по карточке для модалки
    card.addEventListener('click', () => {
      modalTitle.textContent = animal.name;
      modalImage.src = animal.img;
      modalImage.alt = animal.name;
      modalDesc.textContent = animalDetails[animal.name] || animal.description;
      modal.style.display = 'flex';
    });
  });

  // Добавляем IntersectionObserver для плавного появления
  document.querySelectorAll(`#${containerId} .animal-card`).forEach(card => observer.observe(card));
}
const biomeSelect = document.getElementById('biome-select');

biomeSelect.addEventListener('change', () => {
  const biome = biomeSelect.value;
  if (biome === 'all') {
    displayAnimals(animalsData, 'forest'); // Здесь можно делать несколько контейнеров, если нужно
  } else {
    const filtered = animalsData.filter(a => a.biome === biome);
    displayAnimals(filtered, 'forest'); // Меняем контейнер по нужной секции
  }
});






// ждём загрузки DOM, чтобы все элементы были доступны
document.addEventListener('DOMContentLoaded', () => {

  // ---------- элементы UI ----------
  const container = document.getElementById('animal-container');
  const selectBiome = document.getElementById('biome-select');
  const searchInput = document.getElementById('search-input');

  // модалка (использует твои существующие элементы)
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalImage = document.getElementById('modal-image');
  const modalDesc = document.getElementById('modal-description');
  const closeBtn = modal ? modal.querySelector('.close') : null;

  let animalsData = []; // сюда загрузим JSON

  // ---------- загрузка JSON ----------
  fetch('animals.json')
    .then(res => {
      if (!res.ok) throw new Error('Не удалось загрузить animals.json — проверь путь и наличие файла');
      return res.json();
    })
    .then(data => {
      animalsData = data;
      renderAnimals(animalsData);
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<p style="color: #fff">Ошибка загрузки данных: ${err.message}</p>`;
    });

  // ---------- рендер карточек ----------
  function renderAnimals(list) {
    container.innerHTML = ''; // очистка
    if (!list.length) {
      container.innerHTML = `<p style="color:#ddd">Ничего не найдено.</p>`;
      return;
    }

    list.forEach(animal => {
      const card = document.createElement('div');
      card.className = 'animal-card';
      card.innerHTML = `
        <img src="${animal.img}" alt="${escapeHtml(animal.name)}">
        <h3>${escapeHtml(animal.name)}</h3>
        <p>${escapeHtml(animal.description)}</p>
      `;

      // клик открывает модалку с расширенной инфой (оставляем простую, можно расширить)
      card.addEventListener('click', () => {
        if (!modal) return;
        modalTitle.textContent = animal.name;
        modalImage.src = animal.img;
        modalImage.alt = animal.name;
        modalDesc.textContent = animal.description;
        modal.style.display = 'flex';
      });

      container.appendChild(card);
    });
  }

  // ---------- фильтрация + поиск (одновременно) ----------
  function applyFilters() {
    const biome = (selectBiome?.value || 'all').toLowerCase();
    const q = (searchInput?.value || '').trim().toLowerCase();

    let filtered = animalsData;

    if (biome !== 'all') {
      filtered = filtered.filter(a => (a.biome || '').toLowerCase() === biome);
    }
    if (q.length) {
      filtered = filtered.filter(a => (a.name || '').toLowerCase().includes(q));
    }

    renderAnimals(filtered);
  }

  // слушатели
  if (selectBiome) selectBiome.addEventListener('change', applyFilters);
  if (searchInput) {
    // простая оптимизация — debounce, чтобы поиск не вызывался слишком часто при вводе
    let timer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(applyFilters, 150);
    });
  }

  // модалка — закрытие
  if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

  // защита от XSS (очень простая)
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

});
