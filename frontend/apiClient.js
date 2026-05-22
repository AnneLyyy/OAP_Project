export const API_BASE_URL = "http://localhost:3000/api/v1";
const TASKS_PATH = "/tasks";
function buildQuery(params = {}) {
    const query = new URLSearchParams();
    if (params.search)
        query.set("search", params.search);
    if (params.sortBy)
        query.set("sortBy", params.sortBy);
    if (params.sortDir)
        query.set("sortDir", params.sortDir);
    if (params.page)
        query.set("page", String(params.page));
    if (params.pageSize)
        query.set("pageSize", String(params.pageSize));
    const text = query.toString();
    return text ? `?${text}` : "";
}
async function request(path, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            signal: controller.signal
        });
    }
    catch (e) {
        clearTimeout(timer);
        if (e?.name === "AbortError") {
            throw {
                status: 408,
                code: "TIMEOUT",
                message: "Запит перевищив час очікування",
                details: ["Перевірте підключення або повторіть дію пізніше."]
            };
        }
        throw {
            status: 0,
            code: "NETWORK_ERROR",
            message: "Backend недоступний або запит заблоковано CORS",
            details: [e?.message ?? String(e)]
        };
    }
    finally {
        clearTimeout(timer);
    }
    if (response.status === 204) {
        return null;
    }
    const text = await response.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    }
    catch {
        data = null;
    }
    if (!response.ok) {
        const err = data;
        throw {
            status: err?.status ?? response.status,
            code: err?.code ?? "HTTP_ERROR",
            message: err?.message ?? "HTTP Error",
            details: err?.details ?? (text ? [text] : [])
        };
    }
    return data;
}
// Основний список: тут працюють пошук, сортування і пагінація.
export function getList(params = {}) {
    return request(`${TASKS_PATH}${buildQuery(params)}`);
}
export function getById(id) {
    return request(`${TASKS_PATH}/${encodeURIComponent(id)}`);
}
export function getByDate(from, to) {
    const query = new URLSearchParams({ from, to }).toString();
    return request(`${TASKS_PATH}/by-date?${query}`);
}
export function getTop() {
    return request(`${TASKS_PATH}/top`);
}
export function getCount() {
    return request(`${TASKS_PATH}/count`);
}
export function getStats() {
    return request(`${TASKS_PATH}/stats`);
}
export function create(dto) {
    return request(TASKS_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
    });
}
export function update(id, dto) {
    return request(`${TASKS_PATH}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
    });
}
export function replace(id, dto) {
    return request(`${TASKS_PATH}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
    });
}
export function remove(id) {
    return request(`${TASKS_PATH}/${encodeURIComponent(id)}`, {
        method: "DELETE"
    });
}
// Об'єкт api залишений для зручності app.ts.
export const api = {
    getTasks: getList,
    getTaskById: getById,
    getTasksByDate: getByDate,
    getTopTasks: getTop,
    getTasksCount: getCount,
    getTasksStats: getStats,
    createTask: create,
    updateTask: update,
    replaceTask: replace,
    deleteTask: remove
};
