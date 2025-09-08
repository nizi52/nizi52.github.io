document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else {
        // Автоопределение темы по системным настройкам
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    // Обновление иконки темы
    function updateThemeIcon() {
        const currentTheme = html.getAttribute('data-theme');
        themeToggle.textContent = currentTheme === 'dark' ? '🔆' : '🌙';
    }

    updateThemeIcon();

    // Переключение темы
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
        
        // Принудительное обновление анимированного фона
        updateAnimatedBackground();
    });

    // Функция для обновления анимированного фона
    function updateAnimatedBackground() {
        const backgroundEffect = document.querySelector('.background-effect');
        if (backgroundEffect) {
            // Перезапускаем все анимации
            const particles = document.querySelectorAll('.particle');
            
            particles.forEach(particle => {
                const animation = particle.style.animation;
                particle.style.animation = 'none';
                void particle.offsetWidth;
                particle.style.animation = animation;
            });
            
            // Перезапускаем основную анимацию
            const beforeAnimation = backgroundEffect.style.animation;
            backgroundEffect.style.animation = 'none';
            void backgroundEffect.offsetWidth;
            backgroundEffect.style.animation = beforeAnimation;
        }
    }

    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 0;
            const offsetPosition = targetElement.offsetTop - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });

    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами для анимации
    document.querySelectorAll('.project, .about-grid, .hero-text, .hero-visual').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Анимация для заголовков секций
    document.querySelectorAll('.section-title').forEach(title => {
        title.style.opacity = '0';
        title.style.transform = 'translateY(20px)';
        title.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(title);
    });

    // Горизонтальный скролл для меню на узких экранах с touch поддержкой
    const navList = document.querySelector('.nav ul');
    if (navList) {
        let isDown = false;
        let startX;
        let scrollLeft;

        // Для мыши
        navList.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - navList.offsetLeft;
            scrollLeft = navList.scrollLeft;
        });

        navList.addEventListener('mouseleave', () => {
            isDown = false;
        });

        navList.addEventListener('mouseup', () => {
            isDown = false;
        });

        navList.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - navList.offsetLeft;
            const walk = (x - startX) * 2;
            navList.scrollLeft = scrollLeft - walk;
        });

        // Для touch
        navList.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - navList.offsetLeft;
            scrollLeft = navList.scrollLeft;
        });

        navList.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX - navList.offsetLeft;
            const walk = (x - startX) * 2;
            navList.scrollLeft = scrollLeft - walk;
        });
    }
});