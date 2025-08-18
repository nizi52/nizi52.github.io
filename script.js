document.addEventListener('DOMContentLoaded', function () {
        // === Управление темой ===
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    // Проверяем, какая тема была сохранена
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else {
        // По умолчанию — светлая тема
        html.setAttribute('data-theme', 'light');
    }
    // Функция: обновить иконку в зависимости от темы
    function updateThemeIcon() {
        const currentTheme = html.getAttribute('data-theme');
        themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
    // Запускаем один раз при загрузке
    updateThemeIcon();
    // При клике — переключаем тему
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme); // Сохраняем выбор
        updateThemeIcon(); // Обновляем иконку
    });
    // === Плавная прокрутка с учётом шапки ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 0;
            const offsetPosition = targetElement.offsetTop - headerHeight;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            // Закрываем мобильное меню после клика
            const navList = document.querySelector('.nav ul');
            if (navList.classList.contains('active')) {
                navList.classList.remove('active');
            }
        });
    });
});