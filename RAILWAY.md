# Евгенич Dashboard — Railway Deployment

## Структура проекта

```
/workspaces/day/
├── server.js              # Express API сервер
├── package.json           # Зависимости Node.js
├── railway.json           # Конфиг Railway
├── .env.example           # Пример переменных окружения
├── .gitignore             # Игнорируемые файлы
├── services/
│   ├── sheets.js          # Загрузка из Google Sheets
│   └── cache.js           # In-memory кэш
├── public/
│   └── index.html         # Дашборд (фронтенд)
└── dashboard.html         # Оригинальный файл (backup)
```

## Локальный запуск

```bash
# Установить зависимости
npm install

# Запустить сервер
npm start

# Или в режиме разработки (с авто-перезагрузкой)
npm run dev
```

Открыть: http://localhost:3000

## API Endpoints

| Endpoint | Описание |
|----------|----------|
| `GET /` | Дашборд (index.html) |
| `GET /api/data` | Все данные (лиды + звонки) |
| `GET /api/data?refresh=true` | Принудительное обновление |
| `GET /api/leads` | Только лиды |
| `GET /api/calls` | Только звонки |
| `GET /api/status` | Статус сервера и кэша |
| `POST /api/cache/clear` | Очистить кэш |
| `GET /health` | Health check |

## Деплой на Railway

### 1. Подготовка

```bash
# Убедитесь что всё в git
git add .
git commit -m "Add Railway deployment"
git push
```

### 2. Создание проекта на Railway

1. Перейдите на [railway.app](https://railway.app)
2. Нажмите "New Project"
3. Выберите "Deploy from GitHub repo"
4. Выберите репозиторий `nilfts/day`

### 3. Переменные окружения (опционально)

В настройках проекта Railway добавьте:

```
SPREADSHEET_ID=1CX7pjfDHiMiOE6TRsdTbhYdWF8KGAmGMGtdCx8TEtP0
CACHE_TTL=300000
```

### 4. Деплой

Railway автоматически:
- Определит Node.js проект
- Установит зависимости
- Запустит `npm start`
- Выдаст публичный URL

## Переменные окружения

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `PORT` | 3000 | Порт сервера (Railway задаёт автоматически) |
| `SPREADSHEET_ID` | см. код | ID Google таблицы |
| `SHEET_LEADS` | Сборка Лиды сайт | Название листа лидов |
| `SHEET_CALLS` | Манго Телефония | Название листа звонков |
| `CACHE_TTL` | 300000 | Время жизни кэша (мс), по умолчанию 5 мин |

## Архитектура

```
┌─────────────────────────────────────────────────────┐
│                  Railway Server                      │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Express    │  │   Sheets     │  │   Cache   │  │
│  │  API Server │──│   Service    │──│  Service  │  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
│         │                │                          │
│         ▼                ▼                          │
│  ┌─────────────┐  ┌──────────────┐                 │
│  │  Static     │  │   Google     │                 │
│  │  Files      │  │   Sheets     │                 │
│  └─────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────┘
```

## Преимущества

✅ **Кэширование** — данные кэшируются на 5 минут  
✅ **Отказоустойчивость** — при ошибке отдаётся старый кэш  
✅ **Health check** — Railway перезапустит при проблемах  
✅ **CORS** — работает из любого домена  
✅ **Статика** — фронтенд раздаётся с того же сервера  
