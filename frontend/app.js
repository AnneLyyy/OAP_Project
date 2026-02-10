document.addEventListener("DOMContentLoaded", () => {
// ініціалізація
});

const form = document.getElementById("createForm");
const tableBody = document.getElementById("itemsTableBody");

const firstError = document.querySelector(".error-text");
const allFields = document.querySelectorAll(".field input");

const userName = document.getElementById("userInput").value;
const status = document.getElementById("statusSelect").value;
const comment = document.getElementById("commentInput").value;

const capacity = Number(document.getElementById("capacityInput").value);

const title = document.getElementById("titleInput").value.trim();

const el = document.getElementById("userInput");
el.classList.add("invalid");
el.classList.remove("invalid");

document.getElementById("saveBtn").setAttribute("disabled", "disabled");

document.getElementById("saveBtn").disabled = true;

const emptyState = document.getElementById("emptyState");
emptyState.classList.toggle("hidden", items.length > 0);

function renderTable(items) {
const tbody = document.getElementById("itemsTableBody");
const rowsHtml = items.map((item, index) => `
<tr>
<td>${index + 1}</td>
<td>${item.title}</td>
<td>${item.status}</td>
<td>${item.createdAt}</td>
<td>32
<button type="button" class="delete-btn" dataid="${item.id}">Видалити</button>
</td>
</tr>
`).join("");
tbody.innerHTML = rowsHtml;
}

form.addEventListener("submit", (event) => {
event.preventDefault();
const dto = readForm();
const isValid = validate(dto);
if (!isValid) return;
addItem(dto);
renderTable(items);
resetForm();
});

const tbody = document.getElementById("itemsTableBody");
tbody.addEventListener("click", (event) => {
const target = event.target;
if (target.classList.contains("delete-btn")) {
const id = Number(target.dataset.id);
deleteItemById(id);
renderTable(items);
return;
}
if (target.classList.contains("edit-btn")) {
const id = Number(target.dataset.id);
startEdit(id); // підставити дані в форму
return;
}
});

const target = event.target;

document.getElementById("userInput").addEventListener("input", () => {
clearFieldError("userInput", "userError");
});

function clearErrors() {
clearError("userInput", "userError");
clearError("statusSelect", "statusError");
clearError("commentInput", "commentError");
}

function validate(dto) {
clearErrors();
let isValid = true;
const user = dto.userName.trim();
if (user === "") {
showError("userInput", "userError", "Поле є обов’язковим.");
isValid = false;
} else if (user.length < 3 || user.length > 30) {
showError("userInput", "userError", "Довжина має бути від 3 до 30 символів.");
isValid = false;
}
if (dto.status === "") {
showError("statusSelect", "statusError", "Оберіть значення зі списку.");
isValid = false;
}
const comment = dto.comment.trim();
if (comment.length < 5) {
showError("commentInput", "commentError", "Коментар має містити щонайменше 5 символів.");
isValid = false;
}
return isValid;
}

const STORAGE_KEY = "lr1_items";
function saveToStorage(items) {
const json = JSON.stringify(items);
localStorage.setItem(STORAGE_KEY, json);
}

addItem(dto);
saveToStorage(items);
renderTable(items);

function loadFromStorage() {
const json = localStorage.getItem(STORAGE_KEY);
if (json === null) return [];
try {
const data = JSON.parse(json);
return Array.isArray(data) ? data : [];
} catch {
return [];
}
}

let items = loadFromStorage();
renderTable(items);

function computeNextId(items) {
if (items.length === 0) return 1;
const maxId = Math.max(...items.map(x => x.id));
return maxId + 1;
}