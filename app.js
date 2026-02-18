// ================= STATE =================

const STORAGE_KEY = "lr1_events";

const state = {
    items: loadFromStorage(),
    editingId: null,
    filters: {
        search: ""
    }
};

// ================= DOM =================

const form = document.getElementById("createForm");
const tableBody = document.getElementById("itemsTableBody");
const searchInput = document.getElementById("searchInput");
const cancelEditBtn = document.getElementById("cancelEdit");
const formTitle = document.getElementById("formTitle");

const titleInput = document.getElementById("titleInput");
const dateInput = document.getElementById("dateInput");
const locationInput = document.getElementById("locationInput");
const capacityInput = document.getElementById("capacityInput");
const descriptionInput = document.getElementById("descriptionInput");

// ================= INIT =================

(function init() {
    attachHandlers();
    render();
})();

// ================= HANDLERS =================

function attachHandlers() {

    form.addEventListener("submit", onSubmit);

    tableBody.addEventListener("click", onTableClick);

    searchInput.addEventListener("input", function (e) {
        state.filters.search = e.target.value.toLowerCase();
        render();
    });

    cancelEditBtn.addEventListener("click", resetForm);
}

function onSubmit(e) {
    e.preventDefault();

    const dto = readForm();
    if (!validate(dto)) return;

    if (state.editingId) {
        updateItem(dto);
    } else {
        addItem(dto);
    }

    saveToStorage();
    render();
    resetForm();
}

function onTableClick(e) {

    const deleteId = e.target.dataset.delete;
    const editId = e.target.dataset.edit;

    if (deleteId) {
        deleteItem(Number(deleteId));
        saveToStorage();
        render();
    }

    if (editId) {
        startEdit(Number(editId));
    }
}

// ================= CRUD =================

function addItem(dto) {
    state.items.push({
        id: Date.now(),
        ...dto
    });
}

function updateItem(dto) {
    state.items = state.items.map(function (item) {
        return item.id === state.editingId
            ? { ...item, ...dto }
            : item;
    });
}

function deleteItem(id) {
    state.items = state.items.filter(function (item) {
        return item.id !== id;
    });
}

// ================= RENDER =================

function render() {
    tableBody.innerHTML = "";

    let filtered = [...state.items];

    if (state.filters.search) {
        filtered = filtered.filter(function (item) {
            return item.title
                .toLowerCase()
                .includes(state.filters.search);
        });
    }

    filtered.sort(function (a, b) {
        return a.date.localeCompare(b.date);
    });

    filtered.forEach(function (item, index) {
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
    const item = state.items.find(function (x) {
        return x.id === id;
    });

    if (!item) return;

    state.editingId = id;

    titleInput.value = item.title;
    dateInput.value = item.date;
    locationInput.value = item.location;
    capacityInput.value = item.capacity;
    descriptionInput.value = item.description;

    formTitle.textContent = "Редагування події";
    cancelEditBtn.classList.remove("hidden");
}

function resetForm() {
    state.editingId = null;
    form.reset();
    clearErrors();

    formTitle.textContent = "Нова подія";
    cancelEditBtn.classList.add("hidden");

    titleInput.focus(); // UX focus
}

// ================= VALIDATION =================

function validate(dto) {
    clearErrors();
    let valid = true;

    const isDuplicate = state.items.some(function (item) {
        return item.title.toLowerCase() === dto.title.toLowerCase() &&
               item.date === dto.date &&
               item.id !== state.editingId;
    });

    if (isDuplicate) {
        showError("titleInput", "titleError", "Така подія вже існує на цю дату");
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
    document.querySelectorAll(".invalid").forEach(function (el) {
        el.classList.remove("invalid");
    });

    document.querySelectorAll(".error-text").forEach(function (el) {
        el.textContent = "";
    });
}

// ================= STORAGE =================

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}
