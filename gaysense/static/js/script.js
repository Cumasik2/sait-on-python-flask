/**
 * GameHub - JavaScript функционал
 * Автор: m1ncedPool
 * Дата: 2024
 */

class GameHub {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollAnimations();
        this.setupPreloader();
        this.loadGameFiles();
        this.setupSmoothScrolling();
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Навигация
        this.setupNavigation();

        // Кнопка наверх
        this.setupScrollToTop();

        // Карточки игр
        this.setupGameCards();

        // Анимации при прокрутке
        this.setupIntersectionObserver();
    }

    // Preloader
    setupPreloader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const preloader = document.getElementById('preloader');
                const mainContent = document.getElementById('main-content');

                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';

                mainContent.classList.remove('hidden');
                mainContent.classList.add('fade-in');
            }, 1000);
        });
    }

    // Навигация
    setupNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        // Мобильное меню
        hamburger?.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Активные ссылки навигации
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);

                // Закрываем мобильное меню
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });

        // Обновление активной ссылки при прокрутке
        window.addEventListener('scroll', this.updateActiveNavLink.bind(this));
    }

    // Плавная прокрутка
    setupSmoothScrolling() {
        // Переопределяем scroll-behavior для лучшего контроля
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const offsetTop = section.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // Кнопка наверх
    setupScrollToTop() {
        const scrollToTopBtn = document.getElementById('scroll-to-top');

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Карточки игр
    setupGameCards() {
        const gameCards = document.querySelectorAll('.game-card');

        gameCards.forEach(card => {
            card.addEventListener('click', () => {
                const gameId = card.dataset.game;
                this.scrollToSection(gameId);
            });
        });
    }

    // Загрузка файлов для игр
    async loadGameFiles() {
        // Ждем небольшой задержки, чтобы DOM полностью загрузился
        await new Promise(resolve => setTimeout(resolve, 100));

        const games = ['ddnet', 'cs2', 'minecraft'];

        for (const game of games) {
            try {
                const container = document.getElementById(`${game}-files`);
                if (!container) {
                    console.warn(`Контейнер для ${game} не найден`);
                    continue;
                }

                const response = await fetch(`/api/files/${game}?t=${Date.now()}`);
                const data = await response.json();

                if (data.files && data.files.length > 0) {
                    this.renderFiles(game, data.files);
                } else {
                    this.renderEmptyState(game);
                }
            } catch (error) {
                console.error(`Ошибка загрузки файлов для ${game}:`, error);
                this.renderErrorState(game);
            }
        }
    }

    // Отображение файлов
    renderFiles(gameId, files) {
        const container = document.getElementById(`${gameId}-files`);
        if (!container) return;

        container.innerHTML = '';

        files.forEach(file => {
            const fileCard = this.createFileCard(file);
            container.appendChild(fileCard);
        });
    }

    // Создание карточки файла
    createFileCard(file) {
        const card = document.createElement('div');
        card.className = 'file-card animate-on-scroll animate'; // Файлы видны сразу

        card.innerHTML = `
            <div class="file-name">${file.name}</div>
            <div class="file-info">
                <span>Размер: ${file.size_human}</span>
                <span>Обновлено: ${file.modified}</span>
            </div>
            <a href="${file.url}" class="download-btn" download>
                <i class="fas fa-download"></i> Скачать
            </a>
        `;

        return card;
    }

    // Состояние пустой секции
    renderEmptyState(gameId) {
        const container = document.getElementById(`${gameId}-files`);
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open fa-3x"></i>
                <p>Файлы для этой игры пока не добавлены</p>
            </div>
        `;
    }

    // Состояние ошибки
    renderErrorState(gameId) {
        const container = document.getElementById(`${gameId}-files`);
        if (!container) return;

        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <p>Ошибка загрузки файлов</p>
            </div>
        `;
    }

    // Анимации при прокрутке
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);

        // Добавляем классы анимации к элементам
        const animateElements = document.querySelectorAll('.game-card, .file-card, .game-info, .files-title');
        animateElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    // Intersection Observer для дополнительных анимаций
    setupIntersectionObserver() {
        const sections = document.querySelectorAll('.game-detail');

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'all 0.8s ease';
            sectionObserver.observe(section);
        });
    }

    // Обновление активной ссылки навигации
    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const headerHeight = document.querySelector('.header').offsetHeight;

        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionHeight = section.offsetHeight;

            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Parallax эффект для фона
    setupParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-bg');

            parallaxElements.forEach(el => {
                const rate = scrolled * -0.5;
                el.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    // Дополнительные эффекты
    addHoverEffects() {
        // Эффект свечения для кнопок
        const buttons = document.querySelectorAll('.download-btn, .social-link');

        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', (e) => {
                e.target.style.textShadow = '0 0 10px var(--neon-blue)';
            });

            btn.addEventListener('mouseleave', (e) => {
                e.target.style.textShadow = '';
            });
        });
    }

    // Обработка ошибок
    handleError(error, context) {
        console.error(`Ошибка в ${context}:`, error);

        // Можно добавить уведомления пользователю
        // this.showNotification('Произошла ошибка. Попробуйте позже.', 'error');
    }

    // Показать уведомление (можно расширить)
    showNotification(message, type = 'info') {
        // Простая реализация уведомлений
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new GameHub();
});

// Дополнительные утилиты
const Utils = {
    // Дебонс для оптимизации производительности
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Проверка поддержки WebP
    supportsWebP() {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
};

// Экспорт для возможного использования в других скриптах
window.GameHub = GameHub;
window.Utils = Utils;