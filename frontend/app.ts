import { api } from "./apiClient";
import type {
    TaskDto,
    CreateTaskDto
} from "../shared/task.dto";

console.log("APP LOADED");

// ================= STATE =================
type ViewMode = "all" | "byDate" | "top";
type SortField = keyof Pick<TaskDto, "title" | "date" | "location" | "capacity">;

type SortDirection = "asc" | "desc";

const state = {
    items: [] as TaskDto[],
    editingId: null as string | null,
    loading: false,
    requestRunning: false,
    viewMode: "all" as ViewMode,
    totalCount: 0,

    filters: {
        search: "",
        sort: "date" as SortField,
        from: "",
        to: ""
    },

    pagination: {
        page: 1,
        pageSize: 5
    },

    sortDirection: "desc" as SortDirection
};

// ================= DOM =================
const notice =
    document.getElementById("notice") as HTMLDivElement;

const form =
    document.getElementById("createForm") as HTMLFormElement;

const tableBody =
    document.getElementById("itemsTableBody") as HTMLTableSectionElement;

const searchInput =
    document.getElementById("searchInput") as HTMLInputElement;

const cancelEditBtn =
    document.getElementById("cancelEdit") as HTMLButtonElement;

const submitBtn =
    form.querySelector('button[type="submit"]') as HTMLButtonElement;

const titleInput =
    document.getElementById("titleInput") as HTMLInputElement;

const dateInput =
    document.getElementById("dateInput") as HTMLInputElement;

const locationInput =
    document.getElementById("locationInput") as HTMLInputElement;

const capacityInput =
    document.getElementById("capacityInput") as HTMLInputElement;

const descriptionInput =
    document.getElementById("descriptionInput") as HTMLTextAreaElement;

const applyFiltersBtn =
    document.getElementById("applyFilters") as HTMLButtonElement;

const resetFiltersBtn =
    document.getElementById("resetFilters") as HTMLButtonElement;

const fromDateInput =
    document.getElementById("fromDateInput") as HTMLInputElement;

const toDateInput =
    document.getElementById("toDateInput") as HTMLInputElement;

const applyDateBtn =
    document.getElementById("applyDateFilter") as HTMLButtonElement;

const topTasksBtn =
    document.getElementById("topTasks") as HTMLButtonElement;

const prevPageBtn =
    document.getElementById("prevPage") as HTMLButtonElement;

const nextPageBtn =
    document.getElementById("nextPage") as HTMLButtonElement;

const pageInfo =
    document.getElementById("pageInfo") as HTMLSpanElement;

const totalInfo =
    document.getElementById("totalInfo") as HTMLDivElement;

const activeFilterInfo =
    document.getElementById("activeFilterInfo") as HTMLParagraphElement;

const sortFieldSelect =
    document.getElementById("sortFieldSelect") as HTMLSelectElement;

const sortDirectionSelect =
    document.getElementById("sortDirectionSelect") as HTMLSelectElement;

const pageSizeSelect =
    document.getElementById("pageSizeSelect") as HTMLSelectElement;

const statsTableBody =
    document.getElementById("statsTableBody") as HTMLTableSectionElement;

const monthStatsTableBody =
    document.getElementById("monthStatsTableBody") as HTMLTableSectionElement;

const refreshStatsBtn =
    document.getElementById("refreshStats") as HTMLButtonElement;

// ================= INIT =================
(async function init() {
    attachHandlers();
    syncControlsFromState();
    await refreshCount();
    await renderStats();
    await fetchTasks();
})();

// ================= HANDLERS =================
function attachHandlers(): void {

    form.addEventListener("submit", onSubmit);

    tableBody.addEventListener("click", onTableClick);

    searchInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            await applyMainFilters();
        }
    });

    applyFiltersBtn.addEventListener("click", applyMainFilters);

    resetFiltersBtn.addEventListener("click", async () => {
        resetFilters();
        syncControlsFromState();
        await fetchTasks();
    });

    applyDateBtn.addEventListener("click", async () => {
        state.filters.from = fromDateInput.value;
        state.filters.to = toDateInput.value;

        if (!state.filters.from || !state.filters.to) {
            notice.innerHTML = "Оберіть дату початку і дату завершення.";
            return;
        }

        if (state.filters.from > state.filters.to) {
            notice.innerHTML = "Дата початку не може бути більшою за дату завершення.";
            return;
        }

        state.viewMode = "byDate";
        state.pagination.page = 1;
        await fetchTasks();
    });

    topTasksBtn.addEventListener("click", async () => {
        state.viewMode = "top";
        state.pagination.page = 1;
        await fetchTasks();
    });

    prevPageBtn.addEventListener("click", async () => {
        if (state.pagination.page <= 1 || state.viewMode !== "all") return;

        state.pagination.page -= 1;
        await fetchTasks();
    });

    nextPageBtn.addEventListener("click", async () => {
        if (state.viewMode !== "all") return;

        state.pagination.page += 1;
        await fetchTasks();
    });

    refreshStatsBtn.addEventListener("click", renderStats);

    cancelEditBtn.addEventListener("click", resetForm);
}

async function applyMainFilters(): Promise<void> {
    state.filters.search = searchInput.value.trim();
    state.filters.sort = sortFieldSelect.value as SortField;
    state.sortDirection = sortDirectionSelect.value as SortDirection;
    state.pagination.pageSize = Number(pageSizeSelect.value) || 5;
    state.pagination.page = 1;
    state.viewMode = "all";

    await fetchTasks();
}

// ================= FETCH =================
async function fetchTasks(): Promise<void> {

    state.loading = true;
    notice.innerHTML = "Завантаження...";
    renderPagination();

    try {
        let res;

        if (state.viewMode === "byDate") {
            res = await api.getTasksByDate(state.filters.from, state.filters.to);
        } else if (state.viewMode === "top") {
            res = await api.getTopTasks();
        } else {
            res = await api.getTasks({
                search: state.filters.search || undefined,
                sortBy: state.filters.sort,
                sortDir: state.sortDirection,
                page: state.pagination.page,
                pageSize: state.pagination.pageSize
            });
        }

        state.items = Array.isArray(res.data) ? res.data : [];

        render();
        renderTotalInfo();
        renderFilterInfo();

        if (state.items.length === 0) {
            notice.innerHTML = "Немає даних за вибраними умовами.";
        } else {
            notice.innerHTML = "";
        }

    } catch (err: any) {

        state.items = [];
        render();
        setError(err);

    } finally {

        state.loading = false;
        renderPagination();
    }
}

async function refreshCount(): Promise<void> {
    try {
        const res = await api.getTasksCount();
        state.totalCount = Number(res.data?.count ?? 0);
        renderTotalInfo();
    } catch {
        totalInfo.textContent = "";
    }
}

async function renderStats(): Promise<void> {
    try {
        const res = await api.getTasksStats();
        const stats = res.data;

        statsTableBody.innerHTML = `
            <tr>
                <td>Найдовша назва</td>
                <td>${escapeHtml(stats.longestTitle)}</td>
                <td>${stats.longestTitleLength} символів</td>
            </tr>
            <tr>
                <td>Найбільша вмісткість</td>
                <td>${stats.biggestCapacity}</td>
                <td>${escapeHtml(stats.biggestCapacityTitle)}</td>
            </tr>
            <tr>
                <td>Майбутні події</td>
                <td>${stats.upcomingEvents}</td>
                <td>Події, дата яких сьогодні або пізніше</td>
            </tr>
            <tr>
                <td>Події, які пройшли</td>
                <td>${stats.pastEvents}</td>
                <td>Події з датою раніше сьогоднішньої</td>
            </tr>
        `;

        const months = Array.isArray(stats.byMonth) ? stats.byMonth : [];
        const max = Math.max(...months.map((item: any) => Number(item.count)), 1);

        monthStatsTableBody.innerHTML = months.length
            ? months.map((item: any) => `
                <tr>
                    <td>${escapeHtml(item.month)}</td>
                    <td>${item.count}</td>
                    
                </tr>
            `).join("")
            : `
                <tr>
                    <td colspan="2">Немає даних за місяцями</td>
                </tr>
            `;
    } catch {
        statsTableBody.innerHTML = `
            <tr>
                <td colspan="3">Статистику не вдалося завантажити</td>
            </tr>
        `;

        monthStatsTableBody.innerHTML = `
            <tr>
                <td colspan="2">Немає даних</td>
            </tr>
        `;
    }
}

// ================= SUBMIT =================
async function onSubmit(e: Event): Promise<void> {

    e.preventDefault();

    if (state.requestRunning) return;

    clearErrors();

    const dto = readForm();

    if (!validate(dto)) return;

    state.requestRunning = true;
    submitBtn.disabled = true;

    try {

        const wasEditing = Boolean(state.editingId);

        if (state.editingId) {
            await api.updateTask(state.editingId, dto);
        } else {
            await api.createTask(dto);
        }

        resetFilters();
        syncControlsFromState();
        await refreshCount();
        await renderStats();
        await fetchTasks();

        resetForm();
        notice.innerHTML = wasEditing ? "Подію оновлено" : "Подію додано";

    } catch (err: any) {

        handleApiErrors(err);

    } finally {

        state.requestRunning = false;
        submitBtn.disabled = false;
    }
}

// ================= TABLE ACTIONS =================
async function onTableClick(e: Event): Promise<void> {

    const target = e.target as HTMLElement;

    const deleteId = target.dataset.delete;
    const editId = target.dataset.edit;
    const detailsId = target.dataset.details;

    if (deleteId) {
        if (confirm("Видалити подію?")) {
            await deleteTask(deleteId);
        }
    }

    if (editId) {
        startEdit(editId);
    }

    if (detailsId) {
        await showDetails(detailsId);
    }
}

// ================= DETAILS =================
async function showDetails(id: string): Promise<void> {

    try {

        const res = await api.getTaskById(id);
        const task = res.data;

        alert(
`Назва: ${task.title}
Дата: ${task.date}
Локація: ${task.location}
Місця: ${task.capacity}
Опис: ${task.description || "-"}`
        );

    } catch (err: any) {

        setError(err);
    }
}

// ================= DELETE =================
async function deleteTask(id: string): Promise<void> {

    try {

        await api.deleteTask(id);
        await refreshCount();
        await renderStats();
        await fetchTasks();
        notice.innerHTML = "Подію видалено";

    } catch (err: any) {

        setError(err);
    }
}

// ================= RENDER =================
function render(): void {

    tableBody.innerHTML = "";

    const items = Array.isArray(state.items) ? state.items : [];

    renderPagination();

    if (items.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Немає даних
                </td>
            </tr>
        `;

        return;
    }

    items.forEach((item, index) => {
        const number =
            state.viewMode === "all"
                ? (state.pagination.page - 1) * state.pagination.pageSize + index + 1
                : index + 1;

        tableBody.innerHTML += `
            <tr>
                <td>${number}</td>
                <td>${escapeHtml(item.title)}</td>
                <td>${formatDate(item.date)}</td>
                <td>${escapeHtml(item.location)}</td>
                <td>${item.capacity}</td>
                <td>
                    <button data-details="${item.id}">Деталі</button>
                    <button data-edit="${item.id}">Ред.</button>
                    <button data-delete="${item.id}">Вид.</button>
                </td>
            </tr>
        `;
    });
}

function renderPagination(): void {
    pageInfo.textContent =
        state.viewMode === "all"
            ? `Сторінка ${state.pagination.page}`
            : "Фільтрований список";

    prevPageBtn.disabled =
        state.loading || state.viewMode !== "all" || state.pagination.page <= 1;

    nextPageBtn.disabled =
        state.loading || state.viewMode !== "all" || state.items.length < state.pagination.pageSize;
}

function renderTotalInfo(): void {
    totalInfo.textContent = `Усього подій: ${state.totalCount}`;
}

function renderFilterInfo(): void {
    if (state.viewMode === "byDate") {
        activeFilterInfo.textContent =
            `Показано події з ${formatDate(state.filters.from)} по ${formatDate(state.filters.to)}`;
        return;
    }

    if (state.viewMode === "top") {
        activeFilterInfo.textContent =
            "Показано 3 найбільші події за останні 3 місяці";
        return;
    }

    const parts: string[] = [
        `сортування: ${getSortLabel(state.filters.sort)}, ${getDirectionLabel(state.sortDirection)}`
    ];

    if (state.filters.search) {
        parts.unshift(`пошук: “${state.filters.search}”`);
    }

    activeFilterInfo.textContent = `Показано звичайний список подій • ${parts.join(" • ")}`;
}

// ================= FORM =================
function readForm(): CreateTaskDto {

    return {
        title: titleInput.value.trim(),
        date: dateInput.value,
        location: locationInput.value.trim(),
        capacity: Number(capacityInput.value),
        description: descriptionInput.value.trim()
    };
}

// ================= VALIDATION =================
function validate(dto: CreateTaskDto): boolean {

    let ok = true;

    if (!dto.title || dto.title.length < 3) {
        showError("title", "Мінімум 3 символи");
        ok = false;
    }

    if (!dto.date) {
        showError("date", "Дата обовʼязкова");
        ok = false;
    }

    if (!dto.location) {
        showError("location", "Локація обовʼязкова");
        ok = false;
    }

    if (!dto.capacity || dto.capacity <= 0) {
        showError("capacity", "Має бути > 0");
        ok = false;
    }

    return ok;
}

// ================= API ERRORS =================
function handleApiErrors(err: any): void {

    setError(err);

    if (Array.isArray(err.details)) {

        err.details.forEach((msg: string) => {

            if (msg.includes("title")) {
                showError("title", msg);
            }

            if (msg.includes("date")) {
                showError("date", msg);
            }

            if (msg.includes("location")) {
                showError("location", msg);
            }

            if (msg.includes("capacity")) {
                showError("capacity", msg);
            }
        });
    }
}

// ================= UI ERRORS =================
function showError(field: string, msg: string): void {

    const input = document.getElementById(field + "Input");
    const error = document.getElementById(field + "Error");

    input?.classList.add("invalid");

    if (error) {
        error.textContent = msg;
    }
}

function clearErrors(): void {

    [
        "title",
        "date",
        "location",
        "capacity",
        "description"
    ].forEach(f => {

        const input = document.getElementById(f + "Input");
        const error = document.getElementById(f + "Error");

        input?.classList.remove("invalid");

        if (error) {
            error.textContent = "";
        }
    });
}

// ================= EDIT =================
function startEdit(id: string): void {

    const item = state.items.find(x => x.id === id);

    if (!item) return;

    state.editingId = id;

    titleInput.value = item.title;
    dateInput.value = item.date;
    locationInput.value = item.location;
    capacityInput.value = String(item.capacity);
    descriptionInput.value = item.description || "";

    cancelEditBtn.classList.remove("hidden");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm(): void {

    state.editingId = null;
    form.reset();
    cancelEditBtn.classList.add("hidden");
    clearErrors();
}

function resetFilters(): void {
    state.viewMode = "all";
    state.pagination.page = 1;
    state.pagination.pageSize = 5;
    state.filters.search = "";
    state.filters.from = "";
    state.filters.to = "";
    state.filters.sort = "date";
    state.sortDirection = "desc";

    searchInput.value = "";
    fromDateInput.value = "";
    toDateInput.value = "";
}

function syncControlsFromState(): void {
    searchInput.value = state.filters.search;
    fromDateInput.value = state.filters.from;
    toDateInput.value = state.filters.to;
    sortFieldSelect.value = state.filters.sort;
    sortDirectionSelect.value = state.sortDirection;
    pageSizeSelect.value = String(state.pagination.pageSize);
}

// ================= HELPERS =================
function setError(err: any): void {

    let help = "";

    if (err.status === 0) {
        help = " Перевір чи запущений backend.";
    }

    if (err.status >= 500) {
        help = " Спробуй пізніше.";
    }

    notice.innerHTML =
        `Помилка (${err.status ?? 500}): ${escapeHtml(err.message)}.${help}`;
}

function getSortLabel(field: SortField): string {
    const labels: Record<SortField, string> = {
        title: "назва",
        date: "дата",
        location: "локація",
        capacity: "кількість місць"
    };

    return labels[field];
}

function getDirectionLabel(direction: SortDirection): string {
    return direction === "asc" ? "за зростанням" : "за спаданням";
}

function formatDate(value: string): string {
    if (!value) return "-";

    const [year, month, day] = value.split("-");

    if (!year || !month || !day) return escapeHtml(value);

    return `${day}.${month}.${year}`;
}

function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
