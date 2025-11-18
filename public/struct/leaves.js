// ========================
// Анимация падающих листьев 🍃 с реакцией на мышь и естественным восстановлением
// ========================

const canvasLeaves = document.getElementById('leaves');
if (canvasLeaves) {
  const ctxL = canvasLeaves.getContext('2d');
  let leaves = [];
  let width = (canvasLeaves.width = window.innerWidth);
  let height = (canvasLeaves.height = window.innerHeight);

  const mouse = { x: null, y: null, radius: 100 }; // радиус влияния курсора

  class Leaf {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * -height;
      this.size = Math.random() * 24 + 12;
      this.baseSpeedY = Math.random() * 1 + 0.3; // базовая вертикальная скорость
      this.baseSpeedX = Math.random() * 0.6 - 0.3; // базовая горизонтальная скорость
      this.speedY = this.baseSpeedY;
      this.speedX = this.baseSpeedX;
      this.angle = Math.random() * Math.PI * 2;
      this.rotation = Math.random() * 0.02 - 0.01;
      this.color = `rgba(${80 + Math.random() * 60}, ${120 + Math.random() * 80}, 50, 0.7)`;
    }

    update() {
      // Если мышь активна — взаимодействуем
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          // Чем ближе, тем сильнее эффект
          const force = (mouse.radius - dist) / mouse.radius;
          const dirX = dx / dist;
          const dirY = dy / dist;

          // Отталкивание (эффект ветра)
          this.x += dirX * force * 3;
          this.y += dirY * force * 3;

          // Замедление падения
          this.speedY *= 0.9;
          this.speedX *= 0.9;
        } else {
          // Если далеко — плавно возвращаем к базовой скорости
          this.speedY += (this.baseSpeedY - this.speedY) * 0.02;
          this.speedX += (this.baseSpeedX - this.speedX) * 0.02;
        }
      } else {
        // Когда мыши нет — плавное восстановление
        this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
        this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
      }

      // Движение
      this.y += this.speedY;
      this.x += this.speedX;
      this.angle += this.rotation;

      // Возврат листа, если упал
      if (this.y > height + this.size) {
        this.y = -this.size;
        this.x = Math.random() * width;
        this.speedY = this.baseSpeedY;
        this.speedX = this.baseSpeedX;
      }
    }

    draw() {
      ctxL.save();
      ctxL.translate(this.x, this.y);
      ctxL.rotate(this.angle);
      ctxL.beginPath();
      ctxL.moveTo(0, -this.size / 2);
      ctxL.quadraticCurveTo(this.size / 2, 0, 0, this.size / 2);
      ctxL.quadraticCurveTo(-this.size / 2, 0, 0, -this.size / 2);
      ctxL.fillStyle = this.color;
      ctxL.fill();
      ctxL.restore();
    }
  }

  function initLeaves(count = 30) {
    leaves = [];
    for (let i = 0; i < count; i++) leaves.push(new Leaf());
  }

  function animateLeaves() {
    ctxL.clearRect(0, 0, width, height);
    for (let leaf of leaves) {
      leaf.update();
      leaf.draw();
    }
    requestAnimationFrame(animateLeaves);
  }

  // Движение мыши
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  // Когда мышь уходит
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // При изменении размера окна
  window.addEventListener('resize', () => {
    width = canvasLeaves.width = window.innerWidth;
    height = canvasLeaves.height = window.innerHeight;
    initLeaves();
  });
  


  initLeaves();
  animateLeaves();
}
document.addEventListener("DOMContentLoaded", function() {
    // Получаем имя текущего файла
    const currentPage = window.location.pathname.split('/').pop();
    console.log('Current page:', currentPage);
    
    const navLinks = document.querySelectorAll(".nav-links a");
    
    navLinks.forEach(link => {
        link.classList.remove("active");
        
        // Получаем имя файла из href
        const linkHref = link.getAttribute("href");
        const linkPage = linkHref.split('/').pop();
        console.log('Link page:', linkPage);
        
        // Сравниваем имена файлов
        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });
});