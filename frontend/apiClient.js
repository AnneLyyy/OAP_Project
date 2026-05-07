export const API_BASE_URL = "http://localhost:3000/api/v1";
const TASKS_PATH = "/tasks";
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
// Назви функцій відповідають вимогам методички: getList/getById/create/update/remove.
export function getList() {
    return request(TASKS_PATH);
}
export function getById(id) {
    return request(`${TASKS_PATH}/${encodeURIComponent(id)}`);
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
// Залишаю об'єкт api для сумісності з наявним app.ts.
export const api = {
    getTasks: getList,
    getTaskById: getById,
    createTask: create,
    updateTask: update,
    replaceTask: replace,
    deleteTask: remove
};
