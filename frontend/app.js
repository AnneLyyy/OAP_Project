// ================= API =================
const API = "http://localhost:3000/api/tasks";

// ================= STATE =================
const state = {
    items: [],
    editingId: null,
    filters: {
        search: "",
        sort: ""
    },
    sortDirection: "asc"
};

// ================= DOM =================
const form = document.getElementById("createForm");
const tableBody = document.getElementById("itemsTableBody");
const searchInput = document.getElementById("searchInput");
const cancelEditBtn = document.getElementById("cancelEdit");
const formTitle = document.getElementById("formTitle");
const tableHead = document.querySelector("thead");

const titleInput = document.getElementById("titleInput");
const dateInput = document.getElementById("dateInput");
const locationInput = document.getElementById("locationInput");
const capacityInput = document.getElementById("capacityInput");
const descriptionInput = document.getElementById("descriptionInput");

const toggleSortBtn = document.getElementById("toggleSort");

// ================= INIT =================
(async function init() {
    attachHandlers();
    await fetchTasks();
    render();
})();

// ================= HANDLERS =================
function attachHandlers() {
    form.addEventListener("submit", onSubmit);
    tableHead.addEventListener("click", (e) => {
        state.filters.sort = e.target.dataset.colname;
        render();
    });
    tableBody.addEventListener("click", onTableClick);
    searchInput.addEventListener("input", (e) => {
        state.filters.search = e.target.value.toLowerCase();
        render();
    });
    cancelEditBtn.addEventListener("click", resetForm);
    toggleSortBtn.addEventListener("click", () => {
        state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
        render();
    });
}

// ================= FETCH =================
async function fetchTasks() {
    try {
        const res = await fetch(API);
        const data = await res.json();
        state.items = data.items;
    } catch (err) {
        console.error("Помилка завантаження tasks", err);
    }
}

// ================= SUBMIT =================
async function onSubmit(e) {
    e.preventDefault();
    const dto = readForm();
    if (!validate(dto)) return;

    if (state.editingId) {
        await updateTask(state.editingId, dto);
    } else {
        await addTask(dto);
    }

    await fetchTasks();
    render();
    resetForm();
}

// ================= TABLE CLICK =================
function onTableClick(e) {
    const deleteId = e.target.dataset.delete;
    const editId = e.target.dataset.edit;

    if (deleteId) {
        if (confirm("Ви впевнені, що хочете видалити задачу?")) {
            deleteTask(Number(deleteId));
        }
    }

    if (editId) {
        startEdit(Number(editId));
    }
}

// ================= CRUD =================
async function addTask(dto) {
    try {
        await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });
    } catch (err) {
        console.error("Помилка створення task", err);
    }
}

async function updateTask(id, dto) {
    try {
        await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });
    } catch (err) {
        console.error("Помилка оновлення task", err);
    }
}

async function deleteTask(id) {
    try {
        await fetch(`${API}/${id}`, { method: "DELETE" });
        await fetchTasks();
        render();
    } catch (err) {
        console.error("Помилка видалення task", err);
    }
}

// ================= RENDER =================
function render() {
    tableBody.innerHTML = "";

    let filtered = [...state.items];

    if (state.filters.search) {
        filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(state.filters.search)
        );
    }

    filtered.sort((a, b) => {
        let result = 0;
        switch (state.filters.sort) {
            case "number":
                result = a.date.localeCompare(b.date);
                break;
            case "name":
                result = a.title.localeCompare(b.title);
                break;
            case "local":
                result = a.location.localeCompare(b.location);
                break;
            case "seats":
                result = a.capacity - b.capacity;
                break;
            default:
                result = a.date.localeCompare(b.date);
        }
        return state.sortDirection === "asc" ? result : -result;
    });

    filtered.forEach((item, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.title}</td>
                <td>${item.date}</td>
                <td>${item.location}</td>
                <td>${item.capacity}</td>
                <td>
                    <button type="button" data-edit="${item.id}">Ред.</button>
                    <button type="button" data-delete="${item.id}">Вид.</button>
                </td>
            </tr>
        `;
    });
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

function startEdit(id) {
    const item = state.items.find(x => x.id === id);
    if (!item) return;

    state.editingId = id;

    titleInput.value = item.title;
    dateInput.value = item.date;
    locationInput.value = item.location;
    capacityInput.value = item.capacity;
    descriptionInput.value = item.description;

    formTitle.textContent = "Редагування задачі";
    cancelEditBtn.classList.remove("hidden");
}

function resetForm() {
    state.editingId = null;
    form.reset();
    clearErrors();

    formTitle.textContent = "Нова задача";
    cancelEditBtn.classList.add("hidden");

    titleInput.focus();
}

// ================= VALIDATION =================
function validate(dto) {
    clearErrors();
    let valid = true;

    const isDuplicate = state.items.some(item =>
        item.title.toLowerCase() === dto.title.toLowerCase() &&
        item.date === dto.date &&
        item.id !== state.editingId
    );

    if (isDuplicate) {
        showError("titleInput", "titleError", "Така задача вже існує на цю дату");
        valid = false;
    }

    if (!dto.title || dto.title.length < 3) {
        showError("titleInput", "titleError", "Мінімум 3 символи");
        valid = false;
    }

    if (!dto.date) {
        showError("dateInput", "dateError", "Оберіть дату");
        valid = false;
    }

    if (!dto.location) {
        showError("locationInput", "locationError", "Вкажіть локацію");
        valid = false;
    }

    if (!dto.capacity || dto.capacity <= 0 || Number.isNaN(dto.capacity)) {
        showError("capacityInput", "capacityError", "Кількість має бути більше 0");
        valid = false;
    }

    return valid;
}

// ================= ERRORS =================
function showError(inputId, errorId, message) {
    document.getElementById(inputId).classList.add("invalid");
    document.getElementById(errorId).textContent = message;
}

function clearErrors() {
    document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
    document.querySelectorAll(".error-text").forEach(el => el.textContent = "");
}