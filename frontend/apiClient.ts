import type {
  TaskDto,
  CreateTaskDto,
  UpdateTaskDto,
  SuccessResponseDto,
  ApiErrorResponseDto
} from "../shared/task.dto";

export const API_BASE_URL = "http://localhost:3000/api/v1";
const TASKS_PATH = "/tasks";

async function request<T>(
  path: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal
    });
  } catch (e: any) {
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
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const err = data as Partial<ApiErrorResponseDto> | null;

    throw {
      status: err?.status ?? response.status,
      code: err?.code ?? "HTTP_ERROR",
      message: err?.message ?? "HTTP Error",
      details: err?.details ?? (text ? [text] : [])
    };
  }

  return data as T;
}

// Назви функцій відповідають вимогам методички: getList/getById/create/update/remove.
export function getList() {
  return request<SuccessResponseDto<TaskDto[]>>(TASKS_PATH);
}

export function getById(id: string) {
  return request<SuccessResponseDto<TaskDto>>(`${TASKS_PATH}/${encodeURIComponent(id)}`);
}

export function create(dto: CreateTaskDto) {
  return request<SuccessResponseDto<TaskDto>>(TASKS_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto)
  });
}

export function update(id: string, dto: UpdateTaskDto) {
  return request<SuccessResponseDto<TaskDto>>(`${TASKS_PATH}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto)
  });
}


export function replace(id: string, dto: CreateTaskDto) {
  return request<SuccessResponseDto<TaskDto>>(`${TASKS_PATH}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto)
  });
}

export function remove(id: string) {
  return request<void>(`${TASKS_PATH}/${encodeURIComponent(id)}`, {
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
