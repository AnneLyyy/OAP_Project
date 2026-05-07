import { api } from "./apiClient";
import type {
    TaskDto,
    CreateTaskDto
} from "../shared/task.dto";

console.log("APP LOADED");

// ================= STATE =================
const state = {
    items: [] as TaskDto[],
    editingId: null as string | null,
    loading: false,
    requestRunning: false,

    filters: {
        search: "",
        sort: ""
    },

    sortDirection: "asc" as "asc" | "desc"
};

// ================= MAP =================
const sortMap: Record<string, keyof TaskDto> = {
    name: "title",
    local: "location",
    seats: "capacity",
    date: "date"
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

const toggleSortBtn =
    document.getElementById("toggleSort") as HTMLButtonElement;

// ================= INIT =================
(async function init() {
    attachHandlers();
    await fetchTasks();
    render();
})();

// ================= HANDLERS =================
function attachHandlers(): void {

    form.addEventListener("submit", onSubmit);

    document.querySelector("thead")?.addEventListener("click", (e) => {

        const target = e.target as HTMLElement;

        const th = target.closest("th");

        if (!th) return;

        const col = th.dataset.colname;

        if (!col || col === "number") return;

        const mapped = sortMap[col];

        if (!mapped) return;

        state.filters.sort = mapped;

        render();
    });

    tableBody.addEventListener("click", onTableClick);

    searchInput.addEventListener("input", (e) => {

        const target = e.target as HTMLInputElement;

        state.filters.search =
            target.value.toLowerCase();

        render();
    });

    cancelEditBtn.addEventListener("click", resetForm);

    toggleSortBtn.addEventListener("click", () => {

        state.sortDirection =
            state.sortDirection === "asc"
                ? "desc"
                : "asc";

        render();
    });
}

// ================= FETCH =================
async function fetchTasks(): Promise<void> {

    state.loading = true;

    notice.innerHTML = "Завантаження...";

    try {

        const res = await api.getTasks();

        state.items = res.data ?? [];

        if (state.items.length === 0) {
            notice.innerHTML = "Немає даних";
        } else {
            notice.innerHTML = "";
        }

    } catch (err: any) {

        setError(err);

    } finally {

        state.loading = false;
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

            await api.updateTask(
                state.editingId,
                dto
            );

        } else {

            await api.createTask(dto);
        }

        state.filters.search = "";
        searchInput.value = "";

        await fetchTasks();

        render();

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

        if (confirm("Видалити?")) {

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

        await fetchTasks();

        render();

    } catch (err: any) {

        setError(err);
    }
}

// ================= RENDER =================
function render(): void {

    tableBody.innerHTML = "";

    let filtered = [...state.items];

    // SEARCH
    if (state.filters.search) {

        filtered = filtered.filter(item =>
            item.title
                ?.toLowerCase()
                .includes(state.filters.search)
        );
    }

    // SORT
    if (state.filters.sort) {

        const field =
            state.filters.sort as keyof TaskDto;

        filtered.sort((a, b) => {

            let valA = a[field] as any;
            let valB = b[field] as any;

            if (typeof valA === "string") {

                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) {
                return state.sortDirection === "asc"
                    ? -1
                    : 1;
            }

            if (valA > valB) {
                return state.sortDirection === "asc"
                    ? 1
                    : -1;
            }

            return 0;
        });
    }

    if (filtered.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Немає даних
                </td>
            </tr>
        `;

        return;
    }

    filtered.forEach((item, index) => {

        tableBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.title}</td>
                <td>${item.date}</td>
                <td>${item.location}</td>
                <td>${item.capacity}</td>

                <td>
                    <button data-details="${item.id}">
                        Деталі
                    </button>

                    <button data-edit="${item.id}">
                        Ред.
                    </button>

                    <button data-delete="${item.id}">
                        Вид.
                    </button>
                </td>
            </tr>
        `;
    });
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

        showError(
            "title",
            "Мінімум 3 символи"
        );

        ok = false;
    }

    if (!dto.date) {

        showError(
            "date",
            "Дата обовʼязкова"
        );

        ok = false;
    }

    if (!dto.location) {

        showError(
            "location",
            "Локація обовʼязкова"
        );

        ok = false;
    }

    if (!dto.capacity || dto.capacity <= 0) {

        showError(
            "capacity",
            "Має бути > 0"
        );

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
function showError(
    field: string,
    msg: string
): void {

    const input =
        document.getElementById(field + "Input");

    const error =
        document.getElementById(field + "Error");

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

        const input =
            document.getElementById(f + "Input");

        const error =
            document.getElementById(f + "Error");

        input?.classList.remove("invalid");

        if (error) {
            error.textContent = "";
        }
    });
}

// ================= EDIT =================
function startEdit(id: string): void {

    const item =
        state.items.find(x => x.id === id);

    if (!item) return;

    state.editingId = id;

    titleInput.value = item.title;
    dateInput.value = item.date;
    locationInput.value = item.location;
    capacityInput.value = String(item.capacity);

    descriptionInput.value =
        item.description || "";

    cancelEditBtn.classList.remove("hidden");
}

function resetForm(): void {

    state.editingId = null;

    form.reset();

    cancelEditBtn.classList.add("hidden");

    clearErrors();
}

// ================= ERROR =================
function setError(err: any): void {

    let help = "";

    if (err.status === 0) {
        help = " Перевір чи запущений backend.";
    }

    if (err.status >= 500) {
        help = " Спробуй пізніше.";
    }

    notice.innerHTML =
        `Помилка (${err.status ?? 500}): ${err.message}.${help}`;
}