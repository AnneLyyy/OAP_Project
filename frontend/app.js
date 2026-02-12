/* ================= STATE ================= */

const STORAGE_KEY = "lr1_events";

let items = loadFromStorage(); // масив подій
let editingId = null; // якщо редагуємо — тут id

/* ================= ELEMENTS ================= */

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

/* ================= SUBMIT ================= */

form.addEventListener("submit", function (e) {
    e.preventDefault(); // щоб сторінка не перезавантажувалась

    const dto = readForm();

    if (!validate(dto)) return;

    if (editingId) {
        updateItem(dto);
    } else {
        addItem(dto);
    }

    saveToStorage();
    render();
    resetForm();
});

/* ================= SEARCH ================= */

searchInput.addEventListener("input", render);

/* ================= CRUD ================= */

function addItem(dto) {
    const newItem = {
        id: Date.now(), // простий унікальний id
        ...dto
    };

    items.push(newItem);
}

function updateItem(dto) {
    items = items.map(function (item) {
        if (item.id === editingId) {
            return { ...item, ...dto };
        } else {
            return item;
        }
    });
}

function deleteItem(id) {
    items = items.filter(function (item) {
        return item.id !== id;
    });
}

/* ================= RENDER ================= */

function render() {
    tableBody.innerHTML = "";

    const searchValue = searchInput.value.toLowerCase();

    const filtered = items
        .filter(function (item) {
            return item.title.toLowerCase().includes(searchValue);
        })
        .sort(function (a, b) {
            return a.date.localeCompare(b.date); // сортування за датою
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

/* ================= EVENT DELEGATION ================= */

tableBody.addEventListener("click", function (e) {

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
});

/* ================= FORM LOGIC ================= */

function readForm() {
    return {
        title: titleInput.value.trim(),
        date: dateInput.value,
        location: locationInput.value.trim(),
        capacity: Number(capacityInput.value),
        description: descriptionInput.value.trim()
    };
}

function validate(dto) {
    clearErrors();
    let valid = true;

    //Перевірка на дублікат
    const isDuplicate = items.some(item => 
        item.title.toLowerCase() === dto.title.toLowerCase() && 
        item.date === dto.date &&
        item.id !== editingId // зберігати той самий об'єкт при редагуванні
    );

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

function startEdit(id) {
    const item = items.find(function (x) {
        return x.id === id;
    });

    if (!item) return;

    editingId = id;

    titleInput.value = item.title;
    dateInput.value = item.date;
    locationInput.value = item.location;
    capacityInput.value = item.capacity;
    descriptionInput.value = item.description;

    formTitle.textContent = "Редагування події";
    cancelEditBtn.classList.remove("hidden");
}

function resetForm() {
    editingId = null;
    form.reset();
    clearErrors();

    formTitle.textContent = "Нова подія";
    cancelEditBtn.classList.add("hidden");

    // UX focus (після успішного збереження)
    titleInput.focus();
}

/* ================= ERRORS ================= */

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

/* ================= STORAGE ================= */

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/* ================= INIT ================= */

render();
