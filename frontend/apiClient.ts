import type {
  TaskDto,
  CreateTaskDto,
  UpdateTaskDto,
  SuccessResponseDto,
  ApiErrorResponseDto
} from "../shared/task.dto";

export const API_BASE_URL = "http://localhost:3000/api/v1";
const TASKS_PATH = "/tasks";

export type TaskStatsDto = {
  longestTitle: string;
  longestTitleLength: number;
  biggestCapacity: number;
  biggestCapacityTitle: string;
  upcomingEvents: number;
  pastEvents: number;
  byMonth: {
    month: string;
    count: number;
  }[];
  updatedAt: string;
};

export type TaskQuery = {
  search?: string;
  sortBy?: keyof Pick<TaskDto, "title" | "date" | "location" | "capacity">;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

function buildQuery(params: TaskQuery = {}): string {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortDir) query.set("sortDir", params.sortDir);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  const text = query.toString();

  return text ? `?${text}` : "";
}

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

// Основний список: тут працюють пошук, сортування і пагінація.
export function getList(params: TaskQuery = {}) {
  return request<SuccessResponseDto<TaskDto[]>>(`${TASKS_PATH}${buildQuery(params)}`);
}

export function getById(id: string) {
  return request<SuccessResponseDto<TaskDto>>(`${TASKS_PATH}/${encodeURIComponent(id)}`);
}

export function getByDate(from: string, to: string) {
  const query = new URLSearchParams({ from, to }).toString();
  return request<SuccessResponseDto<TaskDto[]>>(`${TASKS_PATH}/by-date?${query}`);
}

export function getTop() {
  return request<SuccessResponseDto<TaskDto[]>>(`${TASKS_PATH}/top`);
}

export function getCount() {
  return request<SuccessResponseDto<{ count: number }>>(`${TASKS_PATH}/count`);
}

export function getStats() {
  return request<SuccessResponseDto<TaskStatsDto>>(`${TASKS_PATH}/stats`);
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
