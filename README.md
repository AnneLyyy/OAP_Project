# ЛР 4 — Інтеграція frontend/backend

Проєкт демонструє інтеграцію окремого backend API та окремого frontend застосунку для сутності **Task / Подія**.

## Запуск

Після розпакування архіву встановити залежності:

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

Відкрити frontend:

```text
http://127.0.0.1:5500
```

Backend API:

```text
http://localhost:3000/api/v1
```

OpenAPI контракт:

```text
http://localhost:3000/openapi.yaml
```

> Важливо: `index.html` не потрібно відкривати через `file://`. Frontend запускається через локальний web-сервер.

## Чому у frontend є і `.ts`, і `.js`

- `frontend/app.ts` та `frontend/apiClient.ts` — вихідний TypeScript-код.
- `frontend/app.js` та `frontend/apiClient.js` — скомпільований JavaScript, який виконує браузер.

Браузер не виконує TypeScript напряму, тому в HTML підключений саме JavaScript:

```html
<script type="module" src="./app.js"></script>
```

Це не порушення вимог: TypeScript залишається вихідним кодом, а JavaScript є результатом компіляції для браузера.

## Структура

```text
backend/
  app.ts
  server.ts
  src/
    controllers/
    db/
    domain/
    infrastructure/
    routes/
    services/
    types/
frontend/
  index.html
  app.ts
  apiClient.ts
  app.js
  apiClient.js
  styles.css
shared/
  task.dto.ts
  index.ts
docs/
  openapi.yaml
data/
  app.db
```

## Shared DTO

DTO винесені в `shared/task.dto.ts` і використовуються обома частинами проєкту:

- backend імпортує DTO через `backend/src/types/task.ts` та `backend/src/domain/task.dto.ts`;
- frontend імпортує DTO в `frontend/app.ts` і `frontend/apiClient.ts`.

Основні DTO:

```ts
TaskDto
CreateTaskDto
UpdateTaskDto
SuccessResponseDto<T>
ApiErrorResponseDto
```

## API endpoints

| Метод | Endpoint | Призначення |
|---|---|---|
| GET | `/api/v1/tasks` | список подій |
| GET | `/api/v1/tasks/:id` | деталі однієї події |
| POST | `/api/v1/tasks` | створити подію |
| PUT | `/api/v1/tasks/:id` | повністю замінити подію |
| PATCH | `/api/v1/tasks/:id` | частково оновити подію |
| DELETE | `/api/v1/tasks/:id` | видалити подію |
| GET | `/api/v1/health` | перевірка backend |
| GET | `/openapi.yaml` | OpenAPI контракт |

## Формат успішної відповіді

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

## Формат помилки

```json
{
  "success": false,
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request body",
  "details": ["title min 3 chars"]
}
```

Підтримані сценарії помилок:

- `400 VALIDATION_ERROR` — неправильні дані;
- `404 NOT_FOUND` — запис або маршрут не знайдено;
- `409 CONFLICT` — подія з такою назвою і датою вже існує;
- `500 ERROR` — непередбачена серверна помилка;
- `NETWORK_ERROR` на frontend — backend вимкнений або CORS заблокував запит;
- `TIMEOUT` на frontend — запит перевищив час очікування.

## CORS

Backend дозволяє тільки конкретні frontend origins:

```text
http://localhost:5500
http://127.0.0.1:5500
http://localhost:5173
http://127.0.0.1:5173
```

Дозволені методи:

```text
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

Дозволені заголовки:

```text
Content-Type, Authorization
```

## Frontend

Frontend:

- отримує список подій з backend через `fetch`;
- показує таблицю з полями DTO;
- має форму створення/редагування;
- має клієнтську валідацію;
- показує `loading`, `empty`, `error`, `success` стани;
- обробляє backend validation errors;
- має пошук і сортування;
- використовує окремий `apiClient`.

Функції `frontend/apiClient.ts`:

```ts
getList()
getById(id)
create(dto)
update(id, dto)
replace(id, dto)
remove(id)
```

## Перевірка сценаріїв

### 1. GET список

```bash
curl http://localhost:3000/api/v1/tasks
```

Очікувано: `200`, `success: true`, масив `data`.

### 2. GET деталі

Спочатку взяти `id` з відповіді списку, потім:

```bash
curl http://localhost:3000/api/v1/tasks/<id>
```

Очікувано: `200`, одна подія в `data`.

### 3. POST створення

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test event","date":"2026-05-10","location":"Kyiv","capacity":20,"description":"Demo"}'
```

Очікувано: `201`, створена подія.

### 4. PUT повна заміна

```bash
curl -X PUT http://localhost:3000/api/v1/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated event","date":"2026-05-11","location":"Lviv","capacity":30,"description":"Updated"}'
```

Очікувано: `200`, повністю оновлена подія.

### 5. PATCH часткове оновлення

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"capacity":35}'
```

Очікувано: `200`, змінено тільки `capacity`.

### 6. DELETE

```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/<id>
```

Очікувано: `204 No Content`.

### 7. 400 validation error

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"ab","date":"bad-date","location":"","capacity":0}'
```

Очікувано: `400`, `code: VALIDATION_ERROR`, список `details`.

### 8. 404 not found

```bash
curl http://localhost:3000/api/v1/tasks/not-existing-id
```

Очікувано: `404`, `code: NOT_FOUND`.

### 9. 409 conflict

Створити дві події з однаковими `title` і `date`:

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Duplicate event","date":"2026-05-12","location":"Kyiv","capacity":10}'

curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Duplicate event","date":"2026-05-12","location":"Kyiv","capacity":10}'
```

Очікувано: другий запит поверне `409`, `code: CONFLICT`.

### 10. Backend down

1. Зупинити backend.
2. Залишити frontend відкритим.
3. Натиснути оновлення/створення події.

Очікувано: frontend покаже помилку, що backend недоступний або запит заблоковано CORS.

## Чекліст виконання вимог на “відмінно”

- [x] Frontend і backend — окремі процеси на різних портах.
- [x] Взаємодія тільки через HTTP API.
- [x] API має префікс `/api/v1`.
- [x] Є `GET /api/v1/tasks`.
- [x] Є `GET /api/v1/tasks/:id`.
- [x] Є `POST /api/v1/tasks`.
- [x] Є `PUT /api/v1/tasks/:id`.
- [x] Є `PATCH /api/v1/tasks/:id`.
- [x] Є `DELETE /api/v1/tasks/:id`.
- [x] Є CORS whitelist без `*`.
- [x] Є єдиний формат успішних відповідей.
- [x] Є єдиний формат помилок.
- [x] Є обробка `400`, `404`, `409`, `500`.
- [x] Є frontend loading/empty/error/success стани.
- [x] Є frontend client-side validation.
- [x] Є backend validation.
- [x] Є окремий `apiClient` з `getList`, `getById`, `create`, `update`, `remove`.
- [x] Є TypeScript DTO на frontend.
- [x] Є shared DTO у папці `shared/`.
- [x] Є OpenAPI контракт у `docs/openapi.yaml` і endpoint `/openapi.yaml`.
- [x] Є `AbortController` timeout/cancel у `apiClient`.
- [x] Є сценарії перевірки backend down / 500 / 400 у README.
- [x] Frontend не відкривається через `file://`, а через локальний сервер.

## Примітка про `node_modules`

`node_modules` не додається до архіву. Після розпакування треба виконати:

```bash
npm install
```

Це особливо важливо для `sqlite3`, бо він має нативні файли під конкретну операційну систему.
