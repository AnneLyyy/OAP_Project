/* ===== STATE ===== */
const STORAGE_KEY = "lr1_events";
let items = loadFromStorage();
let editingId = null;

/* ===== ELEMENTS ===== */
const form = document.getElementById("createForm");
const tableBody = document.getElementById("itemsTableBody");

const titleInput = document.getElementById("titleInput");
const dateInput = document.getElementById("dateInput");
const locationInput = document.getElementById("locationInput");
const capacityInput = document.getElementById("capacityInput");
const descriptionInput = document.getElementById("descriptionInput");

const searchInput = document.getElementById("searchInput");
const cancelEditBtn = document.getElementById("cancelEdit");
const formTitle = document.getElementById("formTitle");

/* ===== SUBMIT ===== */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const dto = readForm();
    if (!validate(dto)) return;

    if (editingId) {
        updateItem(dto);
    } else {
        addItem(dto);
    }

    saveToStorage();
    renderTable();
    resetForm();
});

/* ===== SEARCH ===== */
searchInput.addEventListener("input", renderTable);

/* ===== CRUD ===== */
function addItem(dto) {
    items.push({
        id: Date.now(),
        ...dto
    });
}

function updateItem(dto) {
    items = items.map(item =>
        item.id === editingId ? { ...item, ...dto } : item
    );
}

function deleteItem(id) {
    items = items.filter(item => item.id !== id);
}

/* ===== RENDER ===== */
function renderTable() {
    tableBody.innerHTML = "";

    const searchValue = searchInput.value.toLowerCase();

    const filtered = items
        .filter(item => item.title.toLowerCase().includes(searchValue))
        .sort((a, b) => a.date.localeCompare(b.date));

    filtered.forEach((item, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.title}</td>
                <td>${item.date}</td>
                <td>${item.location}</td>
                <td>${item.capacity}</td>
                <td>
                    <button type="button" data-edit="${item.id}">Редагувати</button>
                    <button type="button" data-delete="${item.id}">Видалити</button>
                </td>
            </tr>
        `;
    });
}

/* ===== EVENT DELEGATION ===== */
tableBody.addEventListener("click", (e) => {

    if (e.target.dataset.delete) {
        deleteItem(Number(e.target.dataset.delete));
        saveToStorage();
        renderTable();
    }

    if (e.target.dataset.edit) {
        startEdit(Number(e.target.dataset.edit));
    }
});

/* ===== FORM ===== */
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

    if (!dto.title || dto.title.length < 3)
        showError("titleInput", "titleError", "Мінімум 3 символи"), valid = false;

    if (!dto.date)
        showError("dateInput", "dateError", "Оберіть дату"), valid = false;

    if (!dto.location)
        showError("locationInput", "locationError", "Вкажіть місце"), valid = false;

    if (!dto.capacity || dto.capacity <= 0)
        showError("capacityInput", "capacityError", "Кількість має бути більше 0"), valid = false;

    return valid;
}

function startEdit(id) {
    const item = items.find(x => x.id === id);
    editingId = id;

    titleInput.value = item.title;
    dateInput.value = item.date;
    locationInput.value = item.location;
    capacityInput.value = item.capacity;
    descriptionInput.value = item.description;

    formTitle.textContent = "Редагування події";
    cancelEditBtn.classList.remove("hidden");
}

cancelEditBtn.addEventListener("click", resetForm);

function resetForm() {
    editingId = null;
    form.reset();
    clearErrors();
    formTitle.textContent = "Нова подія";
    cancelEditBtn.classList.add("hidden");
    titleInput.focus();
}

/* ===== ERRORS ===== */
function showError(inputId, errorId, message) {
    document.getElementById(inputId).classList.add("invalid");
    document.getElementById(errorId).textContent = message;
}

function clearErrors() {
    document.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));
    document.querySelectorAll(".error-text").forEach(e => e.textContent = "");
}

/* ===== STORAGE ===== */
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadFromStorage() {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
}

renderTable();
