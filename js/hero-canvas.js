/* ==========================================================================
   Hero Canvas Animation — Dala Constellation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    // Create and insert the canvas dynamically if it doesn't exist
    let canvas = document.getElementById('hero-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'hero-canvas';
        heroSection.insertBefore(canvas, heroSection.firstChild);
    }
    
    const ctx = canvas.getContext('2d');
    
    // Config
    const particles = [];
    const particleCount = window.innerWidth < 768 ? 60 : 130;
    
    // Dala Theme Palette
    const colors = [
        '#8052ff', // Electric Iris (Violet)
        '#ffb829', // Saffron Spark (Amber)
        '#ffffff', // Bone White
        '#0ea5e9', // Deep Cyan for depth
        '#6366f1'  // Indigo/Purple variant
    ];

    // Mouse tracking for the spotlight effect
    let mouse = { x: -1000, y: -1000 }; // Start off-screen
    let targetMouse = { x: -1000, y: -1000 };
    
    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        targetMouse.x = e.clientX - rect.left;
        targetMouse.y = e.clientY - rect.top;
    });

    heroSection.addEventListener('mouseleave', () => {
        targetMouse.x = -1000;
        targetMouse.y = -1000;
    });

    // Resize handling
    let width, height;
    function resize() {
        width = heroSection.offsetWidth;
        height = heroSection.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    class Triangle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 6 + 2; // Size between 2 and 8
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.isFilled = Math.random() > 0.5; // 50% filled, 50% outlined
            
            // Base opacity based on size to simulate depth (smaller = fainter)
            this.baseAlpha = (this.size / 8) * 0.6 + 0.1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;

            // Wrap around edges seamlessly
            if (this.x < -this.size) this.x = width + this.size;
            if (this.x > width + this.size) this.x = -this.size;
            if (this.y < -this.size) this.y = height + this.size;
            if (this.y > height + this.size) this.y = -this.size;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size, this.size);
            ctx.lineTo(-this.size, this.size);
            ctx.closePath();

            // Convert hex to rgb for alpha manipulation
            ctx.globalAlpha = this.baseAlpha;
            
            if (this.isFilled) {
                ctx.fillStyle = this.color;
                ctx.fill();
            } else {
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = this.color;
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Triangle());
    }

    let animationFrameId;
    let isPlaying = false;

    function animate() {
        if (!isPlaying) return;
        
        ctx.clearRect(0, 0, width, height);

        // Smooth mouse follow (easing)
        mouse.x += (targetMouse.x - mouse.x) * 0.1;
        mouse.y += (targetMouse.y - mouse.y) * 0.1;

        // Removed interactive spotlight highlight per user request

        // Draw and update particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    // Theme Observer: Only run animation in dark mode to save battery
    const htmlElement = document.documentElement;
    
    function checkTheme() {
        const theme = htmlElement.getAttribute('data-theme');
        if (theme === 'dark') {
            if (!isPlaying) {
                isPlaying = true;
                resize();
                animate();
            }
        } else {
            isPlaying = false;
            cancelAnimationFrame(animationFrameId);
            ctx.clearRect(0, 0, width, height);
        }
    }

    // Initial check
    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                checkTheme();
            }
        });
    });
    observer.observe(htmlElement, { attributes: true });
});
