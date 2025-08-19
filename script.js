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
        themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
    
    updateThemeIcon();
    
    // Переключение темы
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
    });
    
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
    
    // Горизонтальный скролл для меню на узких экранах
    const navList = document.querySelector('.nav ul');
    if (navList) {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        navList.addEventListener('mousedown', (e) => {
            isDown = true;
            navList.classList.add('active');
            startX = e.pageX - navList.offsetLeft;
            scrollLeft = navList.scrollLeft;
        });
        
        navList.addEventListener('mouseleave', () => {
            isDown = false;
            navList.classList.remove('active');
        });
        
        navList.addEventListener('mouseup', () => {
            isDown = false;
            navList.classList.remove('active');
        });
        
        navList.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - navList.offsetLeft;
            const walk = (x - startX) * 2;
            navList.scrollLeft = scrollLeft - walk;
        });
    }
});