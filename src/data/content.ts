export type Lang = 'ru' | 'en';

export const links = {
  github: 'https://github.com/nizi52',
  telegram: 'https://t.me/nniizzii',
  telegramHandle: '@nniizzii',
};

export const ui = {
  ru: {
    metaTitle: 'nizi. fullstack-разработчик',
    metaDescription: 'Портфолио nizi, fullstack-разработчика. Java, Python, JavaScript, C#. Открыт к сотрудничеству.',
    nav: { works: 'работы', about: 'обо мне', contact: 'контакты' },
    hero: {
      lines: ['от базы', 'данных', 'до интерфейса'],
      line: 'fullstack-разработчик. Java, Python, JavaScript, C#.',
      loading: 'зажигаю звёзды',
      cta: 'написать мне',
      secondary: 'смотреть работы',
    },
    ticker: ['fullstack', 'java', 'python', 'javascript', 'c#', 'открыт к сотрудничеству'],
    about: {
      title: 'обо мне',
      lines: ['nizi.', 'fullstack-разработчик.', 'открыт к сотрудничеству.'],
    },
    works: { title: 'работы', open: 'открыть' },
    skills: { title: 'навыки' },
    more: { title: 'ещё работы' },
    contact: { title: 'напишите мне', hint: 'Отвечаю в Telegram. Код смотрите на GitHub.' },
    switchTo: 'EN',
  },
  en: {
    metaTitle: 'nizi. fullstack developer',
    metaDescription: 'Portfolio of nizi, a fullstack developer. Java, Python, JavaScript, C#. Open to collaboration.',
    nav: { works: 'works', about: 'about', contact: 'contact' },
    hero: {
      lines: ['from', 'database', 'to interface'],
      line: 'fullstack developer. Java, Python, JavaScript, C#.',
      loading: 'lighting the stars',
      cta: 'message me',
      secondary: 'see the work',
    },
    ticker: ['fullstack', 'java', 'python', 'javascript', 'c#', 'open to collaboration'],
    about: {
      title: 'about',
      lines: ['nizi.', 'fullstack developer.', 'open to collaboration.'],
    },
    works: { title: 'works', open: 'open' },
    skills: { title: 'skills' },
    more: { title: 'more work' },
    contact: { title: 'write to me', hint: 'I reply on Telegram. The code is on GitHub.' },
    switchTo: 'RU',
  },
} as const;

export const skills = {
  ru: [
    { name: 'бэкенд', items: 'Java, Python (Django, FastAPI), C# (ASP.NET Core), Express' },
    { name: 'фронтенд', items: 'JavaScript, React, Vue, HTML, CSS, Astro' },
    { name: 'данные', items: 'PostgreSQL, SQLite, SQLAlchemy, Alembic, Redis' },
    { name: 'инструменты', items: 'Git, Docker, pytest, Maven' },
  ],
  en: [
    { name: 'backend', items: 'Java, Python (Django, FastAPI), C# (ASP.NET Core), Express' },
    { name: 'frontend', items: 'JavaScript, React, Vue, HTML, CSS, Astro' },
    { name: 'data', items: 'PostgreSQL, SQLite, SQLAlchemy, Alembic, Redis' },
    { name: 'tools', items: 'Git, Docker, pytest, Maven' },
  ],
} as const;

export const moreWork = {
  ru: [
    { title: 'колл-центр', note: 'JavaFX, PostgreSQL, Docker. Учёт обращений клиентов', href: 'https://github.com/nizi52/ru_Mirea_call-center' },
    { title: 'react и vue', note: 'Список фильмов, приложение на React, практика на Vue', href: 'https://github.com/nizi52/List-of-films' },
    { title: 'c# и .net', note: 'Blazor, ASP.NET Core MVC, WPF', href: 'https://github.com/nizi52/Blazor_pks' },
    { title: 'терминальные шахматы', note: 'Python, консоль', href: 'https://github.com/nizi52/pychess' },
  ],
  en: [
    { title: 'call center', note: 'JavaFX, PostgreSQL, Docker. Customer appeal tracking', href: 'https://github.com/nizi52/ru_Mirea_call-center' },
    { title: 'react and vue', note: 'Film list, a React app, Vue practice', href: 'https://github.com/nizi52/List-of-films' },
    { title: 'c# and .net', note: 'Blazor, ASP.NET Core MVC, WPF', href: 'https://github.com/nizi52/Blazor_pks' },
    { title: 'terminal chess', note: 'Python, console', href: 'https://github.com/nizi52/pychess' },
  ],
} as const;
