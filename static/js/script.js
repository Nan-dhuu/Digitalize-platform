const USERS_KEY = "nexora_users";
const DATA_KEY = "nexora_records";
const SESSION_KEY = "nexora_current_user";

const defaultUsers = [
    {
        name: "Admin",
        email: "admin@nexora.com",
        password: "Nexora@123"
    }
];

let users = JSON.parse(localStorage.getItem(USERS_KEY)) || defaultUsers;

let records = JSON.parse(localStorage.getItem(DATA_KEY)) || {
    students: [],
    courses: [],
    subjects: []
};

if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveData() {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(DATA_KEY, JSON.stringify(records));
}

/* LOGIN */

function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    const user = users.find(u =>
        u.email.toLowerCase() === email && u.password === password
    );

    if (!user) {
        alert("Invalid email or password!");
        return;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    window.location.href = "/dashboard";
}

/* REGISTER */

function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;

    if (users.some(u => u.email.toLowerCase() === email)) {
        alert("Email already registered!");
        return;
    }

    const user = { name, email, password };

    users.push(user);
    saveData();

    alert("Registration successful!");
    window.location.href = "/";
}

/* PASSWORD SHOW / HIDE */

function togglePassword() {
    const password = document.getElementById("password");

    password.type =
        password.type === "password" ? "text" : "password";
}

/* LOGOUT */

function logoutUser() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "/";
}

/* DASHBOARD */

function updateDashboard() {
    const studentCount = document.getElementById("studentCount");
    const courseCount = document.getElementById("courseCount");
    const subjectCount = document.getElementById("subjectCount");

    if (!studentCount) return;

    studentCount.textContent = records.students.length;
    courseCount.textContent = records.courses.length;
    subjectCount.textContent = records.subjects.length;

    const user = JSON.parse(localStorage.getItem(SESSION_KEY));

    if (user) {
        document.getElementById("welcomeUser").textContent =
            "Welcome, " + user.name;
    }

    const recent = document.getElementById("recentStudents");

    if (records.students.length === 0) {
        recent.innerHTML = "<p>No student records available.</p>";
        return;
    }

    recent.innerHTML = `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Course</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.students.slice(-5).reverse().map(s => `
                        <tr>
                            <td>${escapeHTML(s.name)}</td>
                            <td>${escapeHTML(s.email)}</td>
                            <td>${escapeHTML(s.course)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

/* SAFE HTML DISPLAY */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

/* OPEN FORM */

function openForm(type) {
    const form = document.getElementById(type + "Form");

    form.classList.remove("hidden");

    const idField = document.getElementById(type + "Id");
    if (idField) idField.value = "";
}

/* CLOSE FORM */

function closeForm(type) {
    const form = document.getElementById(type + "Form");

    form.classList.add("hidden");

    const formElement = form.querySelector("form");
    formElement.reset();

    document.getElementById(type + "Id").value = "";
}

/* SAVE RECORD */

function saveRecord(event, type) {
    event.preventDefault();

    const id = document.getElementById(type + "Id").value;

    let data = {};

    if (type === "students") {
        data = {
            name: document.getElementById("studentsName").value.trim(),
            email: document.getElementById("studentsEmail").value.trim(),
            phone: document.getElementById("studentsPhone").value.trim(),
            course: document.getElementById("studentsCourse").value.trim()
        };
    }

    if (type === "courses") {
        data = {
            name: document.getElementById("coursesName").value.trim(),
            duration: document.getElementById("coursesDuration").value.trim(),
            department: document.getElementById("coursesDepartment").value.trim()
        };
    }

    if (type === "subjects") {
        data = {
            name: document.getElementById("subjectsName").value.trim(),
            code: document.getElementById("subjectsCode").value.trim(),
            course: document.getElementById("subjectsCourse").value.trim()
        };
    }

    if (id) {
        const index = records[type].findIndex(item => item.id === id);

        if (index !== -1) {
            records[type][index] = {
                ...records[type][index],
                ...data
            };
        }

        alert("Record updated successfully!");
    } else {
        records[type].push({
            id: Date.now().toString(),
            ...data
        });

        alert("Record added successfully!");
    }

    saveData();
    closeForm(type);
    displayRecords(type);
}

/* DISPLAY RECORDS */

function displayRecords(type, search = "") {
    const table = document.getElementById(type + "Table");

    if (!table) return;

    const filtered = records[type].filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(search.toLowerCase())
        )
    );

    if (filtered.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    No records found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = filtered.map(item => {
        let columns = "";

        if (type === "students") {
            columns = `
                <td>${escapeHTML(item.name)}</td>
                <td>${escapeHTML(item.email)}</td>
                <td>${escapeHTML(item.phone)}</td>
                <td>${escapeHTML(item.course)}</td>
            `;
        }

        if (type === "courses") {
            columns = `
                <td>${escapeHTML(item.name)}</td>
                <td>${escapeHTML(item.duration)}</td>
                <td>${escapeHTML(item.department)}</td>
            `;
        }

        if (type === "subjects") {
            columns = `
                <td>${escapeHTML(item.name)}</td>
                <td>${escapeHTML(item.code)}</td>
                <td>${escapeHTML(item.course)}</td>
            `;
        }

        return `
            <tr>
                ${columns}
                <td>
                    <button class="action-btn"
                        onclick="editRecord('${type}','${item.id}')">
                        Edit
                    </button>

                    <button class="action-btn delete-btn"
                        onclick="deleteRecord('${type}','${item.id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

/* SEARCH */

function searchRecords(type) {
    const search = document.getElementById(type + "Search").value;

    displayRecords(type, search);
}

/* EDIT */

function editRecord(type, id) {
    const item = records[type].find(r => r.id === id);

    if (!item) return;

    openForm(type);

    document.getElementById(type + "Id").value = item.id;

    if (type === "students") {
        document.getElementById("studentsName").value = item.name;
        document.getElementById("studentsEmail").value = item.email;
        document.getElementById("studentsPhone").value = item.phone;
        document.getElementById("studentsCourse").value = item.course;
    }

    if (type === "courses") {
        document.getElementById("coursesName").value = item.name;
        document.getElementById("coursesDuration").value = item.duration;
        document.getElementById("coursesDepartment").value = item.department;
    }

    if (type === "subjects") {
        document.getElementById("subjectsName").value = item.name;
        document.getElementById("subjectsCode").value = item.code;
        document.getElementById("subjectsCourse").value = item.course;
    }
}

/* DELETE */

function deleteRecord(type, id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this record?"
    );

    if (!confirmDelete) return;

    records[type] = records[type].filter(item => item.id !== id);

    saveData();
    displayRecords(type);

    alert("Record deleted successfully!");
}

/* INITIALIZE PAGE */

document.addEventListener("DOMContentLoaded", function() {
    const user = JSON.parse(localStorage.getItem(SESSION_KEY));

    if (window.location.pathname !== "/" &&
        window.location.pathname !== "/register" &&
        !user) {
        window.location.href = "/";
        return;
    }

    if (document.getElementById("studentCount")) {
        updateDashboard();
    }

    ["students", "courses", "subjects"].forEach(type => {
        displayRecords(type);
    });
});