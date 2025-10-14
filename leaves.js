// ========================
// Анимация падающих листьев 🍃
// ========================

const canvasLeaves = document.getElementById('leaves');
if (canvasLeaves) {
  const ctxL = canvasLeaves.getContext('2d');
  let leaves = [];
  let width = (canvasLeaves.width = window.innerWidth);
  let height = (canvasLeaves.height = window.innerHeight);

  class Leaf {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * -height;
      this.size = Math.random() * 24 + 12;
      this.speedY = Math.random() * 1 + 0.3;
      this.speedX = Math.random() * 0.6 - 0.3;
      this.angle = Math.random() * Math.PI * 2;
      this.rotation = Math.random() * 0.02 - 0.01;
      this.color = `rgba(${80 + Math.random() * 60}, ${120 + Math.random() * 80}, ${50}, 0.7)`;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.angle += this.rotation;
      if (this.y > height + this.size) {
        this.y = -this.size;
        this.x = Math.random() * width;
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

  window.addEventListener('resize', () => {
    width = canvasLeaves.width = window.innerWidth;
    height = canvasLeaves.height = window.innerHeight;
    initLeaves();
  });

  initLeaves();
  animateLeaves();
}
