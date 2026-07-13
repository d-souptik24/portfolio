/* ==========================================================================
   Souptik Dutta — Portfolio Scripts
   ==========================================================================
   Modules:
     - Smooth scrolling & active-nav highlighting
     - Scroll-reveal (IntersectionObserver)
     - Theme toggle (light / dark) with localStorage
     - Mobile hamburger menu
     - Typewriter effect
     - Contact form (Web3Forms)
     - Dialog / modal logic
     - Back-to-top button
     - 3-D tilt on project cards
   ========================================================================== */

/* Prefer JS-enhanced features only after page load */
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.remove('no-js');

    /* Smooth scrolling offset handling */
    function scrollToHash(hash) {
        const target = document.querySelector(hash);
        if (!target) return;
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 74;
        const y = target.getBoundingClientRect().top + window.scrollY - (navHeight + 8);
        window.scrollTo({ top: y, behavior: 'smooth' });
    }

    /* Active nav highlighting */
    const sections = [...document.querySelectorAll('section, main#hero')];
    const navLinks = [...document.querySelectorAll('.nav-links a, .mobile-menu a')];
    function setActiveLink() {
        const scrollPos = window.scrollY + window.innerHeight * 0.25;
        let current = sections[0].id;
        for (const sec of sections) {
            if (scrollPos >= sec.offsetTop) {
                current = sec.id;
            }
        }
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        });
    }
    window.addEventListener('scroll', setActiveLink, { passive: true });
    setActiveLink(); // Initial call

    /* Intercept internal anchor clicks for unified smooth scroll */
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const hash = a.getAttribute('href');
        if (hash.length > 1) {
            e.preventDefault();
            scrollToHash(hash);
            // Close mobile menu if open
            const mobileMenu = document.querySelector('.mobile-menu');
            const hamburger = document.querySelector('.hamburger');
            if (mobileMenu && hamburger && mobileMenu.classList.contains('open')) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
            }
        }
    });

    /* Reveal on scroll */
    const revealEls = document.querySelectorAll('.reveal');

    // Assign stagger index within each parent for cascade effect
    const parentGroups = new Map();
    revealEls.forEach(el => {
        const parent = el.parentElement;
        if (!parentGroups.has(parent)) parentGroups.set(parent, 0);
        const idx = parentGroups.get(parent);
        el.style.setProperty('--stagger', idx);
        parentGroups.set(parent, idx + 1);
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, { 
            threshold: 0.1, 
            rootMargin: "0px 0px -60px 0px" 
        });
        revealEls.forEach(el => observer.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('in-view'));
    }


    /* Theme toggle */
    const themeBtn = document.querySelector('.theme-toggle');
    const themeIcon = document.querySelector('#theme-icon');
    const root = document.documentElement;
    if (themeBtn && themeIcon) {
        function setTheme(mode) {
            root.setAttribute('data-theme', mode);
            localStorage.setItem('theme', mode);
            if (mode === 'dark') {
                themeIcon.className = 'fa-solid fa-sun';
                themeBtn.setAttribute('aria-label', 'Switch to light mode');
                themeBtn.setAttribute('title', 'Switch to light mode');
            } else {
                themeIcon.className = 'fa-solid fa-moon';
                themeBtn.setAttribute('aria-label', 'Switch to dark mode');
                themeBtn.setAttribute('title', 'Switch to dark mode');
            }
        }
        
        const storedTheme = localStorage.getItem('theme');
        const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(storedTheme || preferredTheme);
        
        themeBtn.addEventListener('click', () => {
            themeBtn.style.transition = 'transform 0.4s cubic-bezier(.34,1.56,.64,1)';
            themeBtn.style.transform = 'rotate(360deg) scale(0.85)';
            setTimeout(() => { themeBtn.style.transform = ''; }, 400);
            const currentTheme = root.getAttribute('data-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    /* Mobile menu */
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (hamburger && mobileMenu) {
        function closeMobileMenu() {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
        }
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
            mobileMenu.setAttribute('aria-hidden', !isOpen);
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeMobileMenu();
            }
        });
    }

    /* Typewriter effect */
    const typingSpan = document.querySelector('.typing');
    if (typingSpan) {
        const roles = [
            "an Aspiring Full-Stack Developer",
            "a Problem Solver",
            "a Tech Explorer",
            "a Lifelong Learner"
        ];
        let roleIndex = 0;
        let charIndex = 0;
        let deleting = false;
        const typeSpeed = 90;
        const eraseSpeed = 40;
        const holdTime = 1500;
        function typeLoop() {
            const role = roles[roleIndex];
            let timeoutSpeed = deleting ? eraseSpeed : typeSpeed;

            if (!deleting) {
                typingSpan.textContent = role.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === role.length) {
                    deleting = true;
                    timeoutSpeed = holdTime;
                }
            } else {
                typingSpan.textContent = role.substring(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    deleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                }
            }
            setTimeout(typeLoop, timeoutSpeed);
        }
        typeLoop();
    }

    /* Contact form with Web3Forms */
    const form = document.getElementById('contactForm');
    const statusEl = document.getElementById('formStatus');
    if (statusEl) statusEl.setAttribute('aria-live','polite');
    const submitBtn = document.getElementById('submitBtn');
    
    let statusTimeout;
    
    if (form && statusEl && submitBtn) {
        const showStatus = (msg, color, duration = 4000) => {
            statusEl.textContent = msg;
            statusEl.style.color = color;
            clearTimeout(statusTimeout);
            if (duration > 0) {
                statusTimeout = setTimeout(() => {
                    statusEl.textContent = '';
                }, duration);
            }
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const name = formData.get('name')?.trim();
            const email = formData.get('email')?.trim();
            const message = formData.get('message')?.trim();
            
            // Check for suspicious patterns
            const suspiciousPatterns = /<script|javascript:|data:|vbscript:|onload=|onerror=/i;
            if (suspiciousPatterns.test(name + email + message)) {
                showStatus("Invalid characters detected. Please remove any script tags or suspicious content.", '#dc2626');
                return;
            }
            
            if (!name || !email || !message || message.length < 10) {
                showStatus("Please complete required fields with a valid message (≥ 10 chars).", '#dc2626');
                return;
            }
            
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showStatus("Please enter a valid email address.", '#dc2626');
                return;
            }
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            showStatus("Sending your message...", 'var(--color-accent)', 0); // 0 means don't auto-fade while sending
            
            try {
                // Submit to Web3Forms
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showStatus("✅ Message sent successfully! I'll get back to you soon.", '#10b981', 5000);
                    form.reset();
                } else {
                    throw new Error(result.message || 'Form submission failed');
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                showStatus("❌ Failed to send message. Please try again or email me directly at duttasouptik0@gmail.com", '#dc2626', 6000);
            } finally {
                // Reset button
                setTimeout(() => {
                    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
    }

    /* Modal logic */
    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-modal]');
        if (btn) {
            const id = btn.getAttribute('data-modal');
            const dlg = document.getElementById(id);
            if (dlg && typeof dlg.showModal === 'function') {
                dlg.showModal();
                document.activeElement?.blur();
            }
        }
        
        const dlg = e.target.closest('dialog');
        if (dlg && e.target === dlg) {
            dlg.close();
        }
    });

    /* Back To Top */
    const backToTop = document.getElementById('backToTop');
    let scrollTicking = false;
    function updateScrollUI() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        if (backToTop) {
            if (scrollTop > 600) backToTop.classList.add('visible'); else backToTop.classList.remove('visible');
        }
        scrollTicking = false;
    }
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(updateScrollUI);
            scrollTicking = true;
        }
    }, { passive: true });
    updateScrollUI();
    if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* Project Slider Navigation */
    const sliderTrack = document.querySelector('.slider-track');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.slider-dots');

    if (sliderTrack && prevBtn && nextBtn && dotsContainer) {
        const cards = sliderTrack.querySelectorAll('.project-card');
        const gap = parseFloat(getComputedStyle(sliderTrack).gap) || 24;

        // Determine how many cards are visible at current viewport
        function getVisibleCount() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1250) return 2;
            return 3;
        }

        // Generate dot indicators
        function buildDots() {
            dotsContainer.innerHTML = '';
            const visibleCount = getVisibleCount();
            const totalDots = Math.max(1, cards.length - visibleCount + 1);
            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => {
                    const cardWidth = cards[0].offsetWidth + gap;
                    sliderTrack.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
                });
                dotsContainer.appendChild(dot);
            }
        }

        // Sync dots & arrow states with scroll position
        function syncUI() {
            const cardWidth = cards[0].offsetWidth + gap;
            const scrollIndex = Math.round(sliderTrack.scrollLeft / cardWidth);
            const maxScroll = sliderTrack.scrollWidth - sliderTrack.clientWidth;

            // Update dots
            const dots = dotsContainer.querySelectorAll('.slider-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === scrollIndex);
            });

            // Update arrow states
            prevBtn.disabled = sliderTrack.scrollLeft <= 2;
            nextBtn.disabled = sliderTrack.scrollLeft >= maxScroll - 2;
        }

        // Arrow click handlers
        prevBtn.addEventListener('click', () => {
            const cardWidth = cards[0].offsetWidth + gap;
            sliderTrack.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            const cardWidth = cards[0].offsetWidth + gap;
            sliderTrack.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });

        // Listen for scroll to sync UI
        let scrollTimeout;
        sliderTrack.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(syncUI, 60);
        }, { passive: true });

        // Rebuild dots on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                buildDots();
                syncUI();
            }, 150);
        });

        // Initial setup
        buildDots();
        syncUI();
    }

    /* 3D Tilt Effect on Project Cards */
    const tiltCards = document.querySelectorAll('.project-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * 5;
            const rotateY = ((x - centerX) / centerX) * -5;
            card.style.transition = 'transform 0.15s ease';
            card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.6s cubic-bezier(.4,.0,.2,1)';
            card.style.transform = '';
        });
    });

    /* --- React Bits BorderGlow Pointer Tracking (Optimized) --- */
    const getEdgeProximity = (width, height, x, y) => {
        const cx = width / 2;
        const cy = height / 2;
        const dx = x - cx;
        const dy = y - cy;
        let kx = Infinity, ky = Infinity;
        if (dx !== 0) kx = cx / Math.abs(dx);
        if (dy !== 0) ky = cy / Math.abs(dy);
        return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    };

    const getCursorAngle = (width, height, x, y) => {
        const cx = width / 2;
        const cy = height / 2;
        const dx = x - cx;
        const dy = y - cy;
        if (dx === 0 && dy === 0) return 0;
        let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (degrees < 0) degrees += 360;
        return degrees;
    };

    const glowCards = document.querySelectorAll('.about-card, .skill-group, .project-card, .timeline-content, .contact-panel');
    glowCards.forEach(card => {
        // Inject outer glow span
        const edgeLight = document.createElement('span');
        edgeLight.className = 'edge-light';
        card.appendChild(edgeLight);

        let ticking = false;

        // Track pointer movement with rAF optimization
        card.addEventListener('pointermove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const edge = getEdgeProximity(rect.width, rect.height, x, y);
                    const angle = getCursorAngle(rect.width, rect.height, x, y);
                    
                    card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
                    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    });
});
