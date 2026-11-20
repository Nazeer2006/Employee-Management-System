
const STORAGE_KEY = "peoplehub_employees_v1";

const $ = (id) => document.getElementById(id);

const fields = [
  "name", "email", "phone", "department",
  "role", "joinDate", "salary", "status"
];

const starterEmployees = [
  {
    id: "seed-1", name: "Ananya Reddy",
    email: "ananya@company.com", phone: "+91 9876543210",
    department: "Engineering", role: "Software Engineer",
    joinDate: "2025-03-12", salary: 65000, status: "Active"
  },
  {
    id: "seed-2", name: "Rahul Sharma",
    email: "rahul@company.com", phone: "+91 9876543211",
    department: "Marketing", role: "Marketing Executive",
    joinDate: "2025-05-20", salary: 42000, status: "Active"
  },
  {
    id: "seed-3", name: "Priya Kumar",
    email: "priya@company.com", phone: "+91 9876543212",
    department: "Human Resources", role: "HR Specialist",
    joinDate: "2024-11-08", salary: 48000, status: "Active"
  },
  {
    id: "seed-4", name: "Arjun Verma",
    email: "arjun@company.com", phone: "+91 9876543213",
    department: "Finance", role: "Accountant",
    joinDate: "2024-08-15", salary: 38000, status: "Inactive"
  },
  {
    id: "seed-5", name: "Sneha Rao",
    email: "sneha@company.com", phone: "+91 9876543214",
    department: "Design", role: "UI/UX Designer",
    joinDate: "2025-07-01", salary: 55000, status: "Active"
  }
];

let employees = loadEmployees();
let toastTimer;

function loadEmployees() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("Could not load saved employees:", error);
  }

  return starterEmployees.map(employee => ({ ...employee }));
}

function saveEmployees() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    return true;
  } catch (error) {
    console.error("Could not save employees:", error);
    showToast("Storage unavailable. Changes may not persist.");
    return false;
  }
}

// Escape user-entered content before inserting it into HTML.
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2)
    .map(part => part[0] || "").join("").toUpperCase();
}

function money(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function employeeCell(employee) {
  return `
    <div class="employee-cell">
      <div class="avatar">${escapeHTML(initials(employee.name))}</div>
      <div>
        <strong>${escapeHTML(employee.name)}</strong>
        <small>${escapeHTML(employee.email)}</small>
      </div>
    </div>`;
}

function statusBadge(status) {
  const safeStatus = status === "Active" ? "Active" : "Inactive";
  return `<span class="status ${safeStatus.toLowerCase()}">${safeStatus}</span>`;
}

function renderDashboard() {
  $("totalCount").textContent = employees.length;
  $("activeCount").textContent =
    employees.filter(e => e.status === "Active").length;
  $("inactiveCount").textContent =
    employees.filter(e => e.status === "Inactive").length;
  $("departmentCount").textContent =
    new Set(employees.map(e => e.department)).size;

  const recent = [...employees]
    .sort((a, b) => b.joinDate.localeCompare(a.joinDate))
    .slice(0, 5);

  $("recentTable").innerHTML = recent.length
    ? recent.map(e => `
        <tr>
          <td>${employeeCell(e)}</td>
          <td>${escapeHTML(e.department)}</td>
          <td>${escapeHTML(e.role)}</td>
          <td>${statusBadge(e.status)}</td>
        </tr>`).join("")
    : `<tr><td colspan="4" class="empty-state">
         No employees yet. Add your first employee!
       </td></tr>`;
}

function renderDepartmentFilter() {
  const select = $("departmentFilter");
  const current = select.value;

  const departments = [...new Set(employees.map(e => e.department))]
    .sort((a, b) => a.localeCompare(b));

  select.innerHTML = `<option value="">All Departments</option>` +
    departments.map(department =>
      `<option value="${escapeHTML(department)}">${escapeHTML(department)}</option>`
    ).join("");

  if (departments.includes(current)) select.value = current;
}

function renderEmployees() {
  const search = $("searchInput").value.trim().toLowerCase();
  const department = $("departmentFilter").value;
  const status = $("statusFilter").value;

  const filtered = employees.filter(employee => {
    const searchable = [
      employee.name, employee.email, employee.phone,
      employee.department, employee.role
    ].join(" ").toLowerCase();

    return searchable.includes(search) &&
      (!department || employee.department === department) &&
      (!status || employee.status === status);
  });

  $("directoryCount").textContent =
    `${filtered.length} employee${filtered.length === 1 ? "" : "s"} found`;

  $("employeeTable").innerHTML = filtered.length
    ? filtered.map(e => `
        <tr>
          <td>${employeeCell(e)}</td>
          <td>${escapeHTML(e.department)}</td>
          <td>${escapeHTML(e.role)}</td>
          <td>${money(e.salary)}</td>
          <td>${statusBadge(e.status)}</td>
          <td>
            <button class="action-btn edit-btn"
              data-action="edit" data-id="${escapeHTML(e.id)}">Edit</button>
            <button class="action-btn delete-btn"
              data-action="delete" data-id="${escapeHTML(e.id)}">Delete</button>
          </td>
        </tr>`).join("")
    : `<tr><td colspan="6" class="empty-state">
         No matching employees found.
       </td></tr>`;
}

function renderAll() {
  renderDashboard();
  renderDepartmentFilter();
  renderEmployees();
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function switchView(view) {
  const dashboard = view === "dashboard";

  $("dashboardView").hidden = !dashboard;
  $("employeesView").hidden = dashboard;
  $("pageTitle").textContent = dashboard
    ? "Dashboard Overview"
    : "Employee Directory";

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  if (!dashboard) renderEmployees();
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

$("viewAllBtn").addEventListener("click", () => switchView("employees"));

function openModal(employee = null) {
  $("employeeForm").reset();
  $("formError").textContent = "";
  $("employeeId").value = employee ? employee.id : "";
  $("modalTitle").textContent = employee ? "Edit Employee" : "Add New Employee";
  $("saveBtn").textContent = employee ? "Update Employee" : "Save Employee";

  if (employee) {
    fields.forEach(field => {
      $(field).value = employee[field] ?? "";
    });
  } else {
    $("joinDate").value = new Date().toLocaleDateString("en-CA");
    $("status").value = "Active";
  }

  $("modalBackdrop").hidden = false;
  $("name").focus();
}

function closeModal() {
  $("modalBackdrop").hidden = true;
  $("employeeForm").reset();
  $("formError").textContent = "";
}

$("addEmployeeBtn").addEventListener("click", () => openModal());
$("closeModal").addEventListener("click", closeModal);
$("cancelBtn").addEventListener("click", closeModal);

$("modalBackdrop").addEventListener("click", event => {
  if (event.target === $("modalBackdrop")) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !$("modalBackdrop").hidden) closeModal();
});

$("employeeForm").addEventListener("submit", event => {
  event.preventDefault();
  $("formError").textContent = "";

  const id = $("employeeId").value;
  const employee = { id: id || crypto.randomUUID() };

  fields.forEach(field => {
    employee[field] = $(field).value.trim();
  });

  employee.salary = Number(employee.salary);

  if (fields.some(field => !String(employee[field] ?? "").trim())) {
    $("formError").textContent = "Please complete all required fields.";
    return;
  }

  if (!Number.isFinite(employee.salary) || employee.salary < 0) {
    $("formError").textContent = "Please enter a valid salary.";
    return;
  }

  if (new Date(employee.joinDate + "T00:00:00") > new Date()) {
    $("formError").textContent = "Joining date cannot be in the future.";
    return;
  }

  const duplicateEmail = employees.some(e =>
    e.email.toLowerCase() === employee.email.toLowerCase() && e.id !== id
  );

  if (duplicateEmail) {
    $("formError").textContent =
      "This email address already belongs to an employee.";
    return;
  }

  if (id) {
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) {
      $("formError").textContent = "Employee not found. Please try again.";
      return;
    }
    employees[index] = employee;
  } else {
    employees.push(employee);
  }

  saveEmployees();
  closeModal();
  renderAll();
  switchView("employees");
  showToast(id ? "Employee updated successfully!" : "Employee added successfully!");
});

$("employeeTable").addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const employee = employees.find(e => e.id === button.dataset.id);
  if (!employee) return;

  if (button.dataset.action === "edit") {
    openModal(employee);
  }

  if (button.dataset.action === "delete") {
    if (!confirm(`Delete ${employee.name}'s record? This cannot be undone.`)) {
      return;
    }

    employees = employees.filter(e => e.id !== employee.id);
    saveEmployees();
    renderAll();
    showToast("Employee record deleted.");
  }
});

$("searchInput").addEventListener("input", renderEmployees);
$("departmentFilter").addEventListener("change", renderEmployees);
$("statusFilter").addEventListener("change", renderEmployees);

$("exportBtn").addEventListener("click", () => {
  const headers = [
    "Name", "Email", "Phone", "Department",
    "Designation", "Joining Date", "Monthly Salary", "Status"
  ];

  const rows = employees.map(e => [
    e.name, e.email, e.phone, e.department,
    e.role, e.joinDate, e.salary, e.status
  ]);

  // Quote CSV cells and protect against spreadsheet formula injection.
  const csvCell = value => {
    let text = String(value ?? "");
    if (/^[\s]*[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };

  const csv = [headers, ...rows]
    .map(row => row.map(csvCell).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "employee-records.csv";
  link.click();
  URL.revokeObjectURL(url);

  showToast("Employee CSV exported.");
});

// Initial page rendering
renderAll();
