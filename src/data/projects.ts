import type { Lang } from './content';

export interface Project {
  slug: string;
  title: Record<Lang, string>;
  kind: Record<Lang, string>;
  status: Record<Lang, string>;
  summary: Record<Lang, string>;
  stack: string[];
  demo?: string;
  code?: string;
}

export const projects: Project[] = [
  {
    slug: 'library-of-babel',
    title: { ru: 'вавилонская библиотека', en: 'library of babel' },
    kind: { ru: 'веб-приложение', en: 'web app' },
    status: { ru: 'в разработке', en: 'in development' },
    summary: {
      ru: 'Личная библиотека: учёт прочитанных книг и полка тех, что хочется прочитать позже.',
      en: 'A personal library: books you have read and a shelf for the ones you want to read later.',
    },
    stack: ['React', 'Vite', 'JavaScript'],
    demo: 'https://nizi52.github.io/library-of-babel/',
    code: 'https://github.com/nizi52/library-of-babel',
  },
  {
    slug: 'blockchat',
    title: { ru: 'блок чат', en: 'block chat' },
    kind: { ru: 'p2p-мессенджер', en: 'p2p messenger' },
    status: { ru: 'временно недоступен', en: 'temporarily unavailable' },
    summary: {
      ru: 'Децентрализованный мессенджер: сообщения идут напрямую между пользователями, без хранения на серверах, у каждого свой BlockChat ID.',
      en: 'A decentralized messenger: messages go straight between users with no server storage, and everyone has their own BlockChat ID.',
    },
    stack: ['Rust)))', 'Electron'],
    demo: 'https://blockchat-messenger.github.io/',
  },
  {
    slug: 'domain-registry',
    title: { ru: 'учёт доменов', en: 'domain registry' },
    kind: { ru: 'веб-приложение', en: 'web app' },
    status: { ru: 'учебный проект', en: 'study project' },
    summary: {
      ru: 'Учёт доменных имён, организаций, ресурсов и аренды с контролем сроков регистрации.',
      en: 'Tracking of domain names, organizations, resources and rentals with registration deadlines.',
    },
    stack: ['Python', 'Django', 'SQLite', 'Bootstrap', 'pytest'],
    code: 'https://github.com/nizi52/python_framework_1',
  },
  {
    slug: 'fastapi-shop',
    title: { ru: 'fastapi и миграции', en: 'fastapi and migrations' },
    kind: { ru: 'бэкенд', en: 'backend' },
    status: { ru: 'учебный проект', en: 'study project' },
    summary: {
      ru: 'API магазина на FastAPI: товары в базе через SQLAlchemy с миграциями Alembic, валидация и свои исключения.',
      en: 'A shop API on FastAPI: products in a database through SQLAlchemy with Alembic migrations, validation and custom exceptions.',
    },
    stack: ['Python', 'FastAPI', 'SQLAlchemy', 'Alembic', 'Pydantic', 'pytest'],
    code: 'https://github.com/nizi52/fast_api_4cr',
  },
];
