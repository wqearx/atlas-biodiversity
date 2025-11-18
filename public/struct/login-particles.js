window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("fireflies-login");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Позиция мыши для параллакса
  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  class Firefly {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.7;
      this.speedY = (Math.random() - 0.5) * 0.7;
      this.opacity = Math.random() * 0.8 + 0.2;
      this.flash = Math.random() * 100;
      this.offsetX = Math.random() * 50 - 25; // для параллакса
      this.offsetY = Math.random() * 50 - 25;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.flash += 0.05;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      // Параллакс смещение относительно мыши
      const parallaxX = (mouse.x - canvas.width / 2) * 0.02 * this.size;
      const parallaxY = (mouse.y - canvas.height / 2) * 0.02 * this.size;

      ctx.beginPath();
      ctx.arc(this.x + parallaxX + this.offsetX, this.y + parallaxY + this.offsetY, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 150, ${Math.abs(Math.sin(this.flash)) * this.opacity})`;
      ctx.fill();
    }
  }

  const fireflies = [];
  for (let i = 0; i < 80; i++) fireflies.push(new Firefly());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireflies.forEach(f => {
      f.update();
      f.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
});
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