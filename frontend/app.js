import { api } from "./apiClient.js";

console.log("APP LOADED");

// ================= STATE =================
const state = {
    items: [],
    editingId: null,
    loading: false,
    requestRunning: false,
    viewMode: "all",
    totalCount: 0,

    filters: {
        search: "",
        sort: "date",
        from: "",
        to: ""
    },

    pagination: {
        page: 1,
        pageSize: 5
    },

    sortDirection: "desc"
};

// ================= DOM =================
const notice = document.getElementById("notice");
const form = document.getElementById("createForm");
const tableBody = document.getElementById("itemsTableBody");
const searchInput = document.getElementById("searchInput");
const cancelEditBtn = document.getElementById("cancelEdit");
const submitBtn = form.querySelector('button[type="submit"]');
const titleInput = document.getElementById("titleInput");
const dateInput = document.getElementById("dateInput");
const locationInput = document.getElementById("locationInput");
const capacityInput = document.getElementById("capacityInput");
const descriptionInput = document.getElementById("descriptionInput");
const applyFiltersBtn = document.getElementById("applyFilters");
const resetFiltersBtn = document.getElementById("resetFilters");
const fromDateInput = document.getElementById("fromDateInput");
const toDateInput = document.getElementById("toDateInput");
const applyDateBtn = document.getElementById("applyDateFilter");
const topTasksBtn = document.getElementById("topTasks");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
const totalInfo = document.getElementById("totalInfo");
const activeFilterInfo = document.getElementById("activeFilterInfo");
const sortFieldSelect = document.getElementById("sortFieldSelect");
const sortDirectionSelect = document.getElementById("sortDirectionSelect");
const pageSizeSelect = document.getElementById("pageSizeSelect");

// ================= INIT =================
(async function init() {
    attachHandlers();
    syncControlsFromState();
    await refreshCount();
    await fetchTasks();
})();

// ================= HANDLERS =================
function attachHandlers() {
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

    cancelEditBtn.addEventListener("click", resetForm);
}

async function applyMainFilters() {
    state.filters.search = searchInput.value.trim();
    state.filters.sort = sortFieldSelect.value;
    state.sortDirection = sortDirectionSelect.value;
    state.pagination.pageSize = Number(pageSizeSelect.value) || 5;
    state.pagination.page = 1;
    state.viewMode = "all";

    await fetchTasks();
}

// ================= FETCH =================
async function fetchTasks() {
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
    } catch (err) {
        state.items = [];
        render();
        setError(err);
    } finally {
        state.loading = false;
        renderPagination();
    }
}

async function refreshCount() {
    try {
        const res = await api.getTasksCount();
        state.totalCount = Number(res.data?.count ?? 0);
        renderTotalInfo();
    } catch {
        totalInfo.textContent = "";
    }
}

// ================= SUBMIT =================
async function onSubmit(e) {
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
        await fetchTasks();

        resetForm();
        notice.innerHTML = wasEditing ? "Подію оновлено" : "Подію додано";
    } catch (err) {
        handleApiErrors(err);
    } finally {
        state.requestRunning = false;
        submitBtn.disabled = false;
    }
}

// ================= TABLE ACTIONS =================
async function onTableClick(e) {
    const target = e.target;

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
async function showDetails(id) {
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
    } catch (err) {
        setError(err);
    }
}

// ================= DELETE =================
async function deleteTask(id) {
    try {
        await api.deleteTask(id);
        await refreshCount();
        await fetchTasks();
        notice.innerHTML = "Подію видалено";
    } catch (err) {
        setError(err);
    }
}

// ================= RENDER =================
function render() {
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

function renderPagination() {
    pageInfo.textContent =
        state.viewMode === "all"
            ? `Сторінка ${state.pagination.page}`
            : "Фільтрований список";

    prevPageBtn.disabled =
        state.loading || state.viewMode !== "all" || state.pagination.page <= 1;

    nextPageBtn.disabled =
        state.loading || state.viewMode !== "all" || state.items.length < state.pagination.pageSize;
}

function renderTotalInfo() {
    totalInfo.textContent = `Усього подій: ${state.totalCount}`;
}

function renderFilterInfo() {
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

    const parts = [
        `сортування: ${getSortLabel(state.filters.sort)}, ${getDirectionLabel(state.sortDirection)}`
    ];

    if (state.filters.search) {
        parts.unshift(`пошук: “${state.filters.search}”`);
    }

    activeFilterInfo.textContent = `Показано звичайний список подій • ${parts.join(" • ")}`;
}

// ================= FORM =================
function readForm() {
    return {
        title: titleInput.value.trim(),
        date: dateInput.value,
        location: locationInput.value.trim(),
        capacity: Number(capacityInput.value),
        description: descriptionInput.value.trim()
    };
}

// ================= VALIDATION =================
function validate(dto) {
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
function handleApiErrors(err) {
    setError(err);

    if (Array.isArray(err.details)) {
        err.details.forEach((msg) => {
            if (msg.includes("title")) showError("title", msg);
            if (msg.includes("date")) showError("date", msg);
            if (msg.includes("location")) showError("location", msg);
            if (msg.includes("capacity")) showError("capacity", msg);
        });
    }
}

// ================= UI ERRORS =================
function showError(field, msg) {
    const input = document.getElementById(field + "Input");
    const error = document.getElementById(field + "Error");

    input?.classList.add("invalid");

    if (error) {
        error.textContent = msg;
    }
}

function clearErrors() {
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
function startEdit(id) {
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

function resetForm() {
    state.editingId = null;
    form.reset();
    cancelEditBtn.classList.add("hidden");
    clearErrors();
}

function resetFilters() {
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

function syncControlsFromState() {
    searchInput.value = state.filters.search;
    fromDateInput.value = state.filters.from;
    toDateInput.value = state.filters.to;
    sortFieldSelect.value = state.filters.sort;
    sortDirectionSelect.value = state.sortDirection;
    pageSizeSelect.value = String(state.pagination.pageSize);
}

// ================= HELPERS =================
function setError(err) {
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

function getSortLabel(field) {
    const labels = {
        title: "назва",
        date: "дата",
        location: "локація",
        capacity: "кількість місць"
    };

    return labels[field] ?? field;
}

function getDirectionLabel(direction) {
    return direction === "asc" ? "за зростанням" : "за спаданням";
}

function formatDate(value) {
    if (!value) return "-";

    const [year, month, day] = value.split("-");

    if (!year || !month || !day) return escapeHtml(value);

    return `${day}.${month}.${year}`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
