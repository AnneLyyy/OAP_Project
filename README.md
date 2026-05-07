# Project OAP — Events App

Це навчальний вебпроєкт для роботи з подіями.

У проєкті є дві основні частини:

- **backend** — сервер, який зберігає та обробляє події;
- **frontend** — сторінка в браузері, де можна переглядати, додавати, редагувати і видаляти події.

Frontend і backend працюють окремо, але спілкуються між собою через HTTP API.

---

## Як запустити проєкт

Спочатку встановити залежності:

```bash
npm install
```

Запустити backend у першому терміналі:

```bash
npm run dev:be
```

Запустити frontend у другому терміналі:

```bash
npm run dev:fe
```

Відкрити сайт у браузері:

```text
http://127.0.0.1:5500
```

Backend API працює тут:

```text
http://localhost:3000/api/v1
```

OpenAPI-документація API:

```text
http://localhost:3000/openapi.yaml
```

`index.html` не потрібно відкривати подвійним кліком. Frontend треба запускати через локальний сервер.

---

## Структура проєкту

```text
backend/   — серверна частина проєкту
frontend/  — сторінка, форма, таблиця і логіка браузера
shared/    — спільні DTO для frontend і backend
docs/      — документація API
data/      — локальна база SQLite
scripts/   — допоміжні скрипти
```

---

## Backend

Backend відповідає за API.

Він:

- приймає запити від frontend;
- працює з базою даних;
- створює, читає, редагує і видаляє події;
- перевіряє правильність даних;
- повертає помилки у зрозумілому форматі;
- налаштовує CORS, щоб браузер дозволяв запити з frontend.

Основні маршрути backend:

| Метод | Endpoint | Що робить |
|---|---|---|
| GET | `/api/v1/tasks` | отримати всі події |
| GET | `/api/v1/tasks/:id` | отримати одну подію |
| POST | `/api/v1/tasks` | створити подію |
| PUT | `/api/v1/tasks/:id` | повністю оновити подію |
| PATCH | `/api/v1/tasks/:id` | частково оновити подію |
| DELETE | `/api/v1/tasks/:id` | видалити подію |
| GET | `/api/v1/health` | перевірити, що backend працює |

---

## Frontend

Frontend — це частина, яку бачить користувач у браузері.

Він:

- отримує події з backend;
- показує події в таблиці;
- має форму для створення і редагування подій;
- дозволяє видаляти події;
- показує повідомлення про помилки;
- має стани завантаження, порожнього списку, успіху і помилки;
- використовує окремий `apiClient` для запитів до backend.

Основні файли frontend:

```text
frontend/app.ts        — логіка сторінки, таблиці і форми
frontend/apiClient.ts  — запити до backend API
frontend/app.js        — JavaScript для браузера
frontend/apiClient.js  — JavaScript для браузера
frontend/index.html    — HTML-сторінка
frontend/styles.css    — стилі
```

---

## Чому є `.ts` і `.js`

`.ts` — це TypeScript-код, тобто вихідний код проєкту.

`.js` — це JavaScript-код, який реально виконує браузер.

Браузер не запускає TypeScript напряму, тому в HTML підключається JavaScript:

```html
<script type="module" src="./app.js"></script>
```

TypeScript потрібен для типізації, DTO і перевірки помилок у коді.

---

## Shared DTO

Папка `shared/` містить спільні типи даних для frontend і backend.

DTO описують, як виглядає подія і відповіді API.

Основна подія має такі поля:

```text
id
title
date
location
capacity
description
```

Спільні DTO потрібні, щоб frontend і backend використовували однаковий формат даних.

---

## OpenAPI

Файл:

```text
docs/openapi.yaml
```

описує API проєкту.

У ньому вказано:

- які endpoints існують;
- які методи підтримуються;
- які DTO використовуються;
- які помилки може повернути backend.

Це документація API і контракт між frontend та backend.

---

## База даних

Проєкт використовує локальну SQLite-базу.

Файл бази знаходиться у папці:

```text
data/
```

SQLite підходить для навчального проєкту, бо не потребує окремого встановлення PostgreSQL або іншої СУБД.

---

## Формат успішної відповіді

Backend повертає успішні відповіді у такому форматі:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Для списку подій:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Подія",
      "date": "2026-05-10",
      "location": "Київ",
      "capacity": 50,
      "description": "Опис"
    }
  ],
  "meta": {
    "count": 1
  }
}
```

---

## Формат помилки

Помилки повертаються в одному форматі:

```json
{
  "success": false,
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request body",
  "details": ["title min 3 chars"]
}
```

Підтримуються такі помилки:

- `400` — неправильні дані;
- `404` — запис не знайдено;
- `409` — така подія вже існує;
- `500` — помилка сервера;
- `NETWORK_ERROR` — backend вимкнений або запит заблоковано;
- `TIMEOUT` — запит виконувався занадто довго.

---

## CORS

Backend дозволяє запити тільки з конкретних frontend-адрес:

```text
http://localhost:5500
http://127.0.0.1:5500
http://localhost:5173
http://127.0.0.1:5173
```

Це потрібно, щоб браузер дозволяв frontend звертатися до backend.

---

## Перевірка

Перевірити backend:

```text
http://localhost:3000/api/v1/health
```

Перевірити список подій:

```text
http://localhost:3000/api/v1/tasks
```

Перевірити OpenAPI:

```text
http://localhost:3000/openapi.yaml
```

---

## Приклади curl-запитів

Отримати список подій:

```bash
curl http://localhost:3000/api/v1/tasks
```

Створити подію:

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test event","date":"2026-05-10","location":"Kyiv","capacity":20,"description":"Demo"}'
```

Оновити подію частково:

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"capacity":35}'
```

Видалити подію:

```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/<id>
```

---

## Що реалізовано

У проєкті реалізовано:

- окремий frontend;
- окремий backend;
- API з префіксом `/api/v1`;
- CRUD для подій;
- CORS whitelist;
- TypeScript;
- shared DTO;
- OpenAPI-документація;
- окремий `apiClient`;
- frontend validation;
- backend validation;
- loading / empty / success / error стани;
- обробка 400 / 404 / 409 / 500;
- timeout через AbortController;
- README з інструкцією запуску.

---

## Примітка

Папка `node_modules` не додається до проєкту.

Після розпакування треба виконати:

```bash
npm install
```
