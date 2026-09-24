/**
 * Bus Pass Management System - Main JavaScript Client
 * Handles student registration, login, pass application, payment, receipt, status, and admin dashboard.
 */

// Central API Base URL Configuration
// Directs all requests to FastAPI backend on port 8000 (works seamlessly with VS Code Live Server port 5500)
const API_BASE_URL = "http://127.0.0.1:8000";

// ==============================================================
// Utility Functions
// ==============================================================

/**
 * Display alert messages inside a dedicated element
 */
function showAlert(containerId, message, type = "danger") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.className = `alert alert-${type} alert-feedback d-block`;
    container.innerHTML = `
        <div class="d-flex align-items-center justify-content-between">
            <div>
                <i class="fa-solid ${type === 'success' ? 'fa-circle-check text-success' : 'fa-circle-exclamation text-danger'} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.style.display='none'"></button>
        </div>
    `;
    // Scroll alert into view smoothly
    container.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Toggle password visibility between text and password
 */
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = btn.querySelector("i");
    if (input.type === "password") {
        input.type = "text";
        if (icon) {
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        }
    } else {
        input.type = "password";
        if (icon) {
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    }
}

/**
 * Common API Fetch Wrapper with robust error handling
 */
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
        "Content-Type": "application/json"
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        let data;
        const text = await response.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { detail: text || `Server error (${response.status})` };
        }

        if (!response.ok) {
            let errorMsg = data.detail || data.message || `Request failed with status ${response.status}`;
            if (Array.isArray(errorMsg)) {
                errorMsg = errorMsg.map(e => `${e.loc ? e.loc[e.loc.length - 1] : 'field'}: ${e.msg}`).join(", ");
            }
            throw new Error(errorMsg);
        }

        return data;
    } catch (err) {
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
            throw new Error("Cannot connect to backend server at http://127.0.0.1:8000. Please start it using: python -m uvicorn app.main:app --reload");
        }
        throw err;
    }
}

// ==============================================================
// Session & Auth Helpers
// ==============================================================

function getLoggedInStudent() {
    const studentId = localStorage.getItem("student_id");
    const studentName = localStorage.getItem("student_name");
    const studentEmail = localStorage.getItem("student_email");
    if (!studentId) return null;
    return { id: parseInt(studentId, 10), name: studentName, email: studentEmail };
}

function checkStudentAuth(redirect = true) {
    const student = getLoggedInStudent();
    if (!student && redirect) {
        window.location.href = "login.html";
        return null;
    }
    return student;
}

function studentLogout() {
    localStorage.removeItem("student_id");
    localStorage.removeItem("student_name");
    localStorage.removeItem("student_email");
    localStorage.removeItem("last_pass_id");
    window.location.href = "login.html";
}

function checkAdminAuth(redirect = true) {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken && redirect) {
        window.location.href = "admin.html";
        return false;
    }
    return true;
}

function adminLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    window.location.href = "admin.html";
}

// Update student navbar dynamically if student is logged in
function updateNavbar() {
    const navStudentInfo = document.getElementById("nav-student-info");
    const student = getLoggedInStudent();
    if (navStudentInfo && student) {
        navStudentInfo.innerHTML = `
            <span class="text-primary me-2"><i class="fa-solid fa-circle-user me-1"></i>${student.name}</span>
            <button class="btn btn-sm btn-outline-danger" onclick="studentLogout()"><i class="fa-solid fa-right-from-bracket me-1"></i>Logout</button>
        `;
    }
}

// ==============================================================
// 1. Home Page Logic (index.html)
// ==============================================================
async function initHomePage() {
    try {
        const stats = await apiFetch("/admin/stats");
        if (stats) {
            const elStudents = document.getElementById("stat-students");
            const elApplications = document.getElementById("stat-applications");
            const elApproved = document.getElementById("stat-approved");
            const elRoutes = document.getElementById("stat-routes");

            if (elStudents) elStudents.innerText = stats.total_students || 0;
            if (elApplications) elApplications.innerText = stats.total_applications || 0;
            if (elApproved) elApproved.innerText = stats.approved_applications || 0;
            if (elRoutes) elRoutes.innerText = stats.active_routes || 12;
        }
    } catch (e) {
        console.log("Using default demo statistics for display.");
    }
}

// ==============================================================
// 2. Student Registration Logic (register.html)
// ==============================================================
function initRegisterPage() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = registerForm.querySelector("button[type='submit']");
        const origText = submitBtn.innerHTML;

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const mobile = document.getElementById("mobile").value.trim();
        const college = document.getElementById("college").value.trim();
        const password = document.getElementById("password").value;

        if (!name || !email || !mobile || !college || !password) {
            showAlert("alertBox", "All fields are required. Please fill in all details.", "warning");
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Registering...`;

            const payload = { name, email, mobile, college, password };
            const result = await apiFetch("/student/register", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            showAlert("alertBox", "Registration successful! Redirecting to login...", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } catch (err) {
            showAlert("alertBox", err.message, "danger");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
        }
    });
}

// ==============================================================
// 3. Student Login Logic (login.html)
// ==============================================================
function initLoginPage() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = loginForm.querySelector("button[type='submit']");
        const origText = submitBtn.innerHTML;

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showAlert("alertBox", "Please enter both email and password.", "warning");
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Logging in...`;

            const payload = { email, password };
            const result = await apiFetch("/student/login", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            // Store student credentials in localStorage
            localStorage.setItem("student_id", result.student_id);
            localStorage.setItem("student_name", result.name);
            localStorage.setItem("student_email", result.email);

            showAlert("alertBox", "Login successful! Redirecting...", "success");
            setTimeout(() => {
                window.location.href = "apply.html";
            }, 1000);

        } catch (err) {
            showAlert("alertBox", err.message, "danger");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
        }
    });
}

// ==============================================================
// 4. Apply Bus Pass Logic (apply.html)
// ==============================================================
function initApplyPage() {
    const student = checkStudentAuth(true);
    if (!student) return;

    const studentNameDisplay = document.getElementById("studentDisplayName");
    if (studentNameDisplay) studentNameDisplay.innerText = student.name;

    const applyForm = document.getElementById("applyForm");
    if (!applyForm) return;

    // Set default dates
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    if (startDateInput && !startDateInput.value) {
        const today = new Date().toISOString().split("T")[0];
        startDateInput.value = today;
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        endDateInput.value = nextMonth.toISOString().split("T")[0];
    }

    applyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = applyForm.querySelector("button[type='submit']");
        const origText = submitBtn.innerHTML;

        const source = document.getElementById("source").value.trim();
        const destination = document.getElementById("destination").value.trim();
        const passType = document.getElementById("passType").value;
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;

        if (!source || !destination || !passType || !startDate || !endDate) {
            showAlert("alertBox", "Please fill in all route and pass details.", "warning");
            return;
        }

        if (endDate < startDate) {
            showAlert("alertBox", "End date cannot be earlier than start date.", "warning");
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Submitting...`;

            const payload = {
                student_id: student.id,
                source,
                destination,
                pass_type: passType,
                start_date: startDate,
                end_date: endDate
            };

            const result = await apiFetch("/buspass/apply", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            // Store pass ID for subsequent payment page
            localStorage.setItem("last_pass_id", result.pass_id);
            localStorage.setItem("pass_source", source);
            localStorage.setItem("pass_dest", destination);
            localStorage.setItem("pass_type", passType);

            showAlert("alertBox", "Application submitted! Proceeding to fee payment...", "success");
            setTimeout(() => {
                window.location.href = "payment.html";
            }, 1200);

        } catch (err) {
            showAlert("alertBox", err.message, "danger");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
        }
    });
}

// ==============================================================
// 5. Payment Page Logic (payment.html)
// ==============================================================
function initPaymentPage() {
    const student = checkStudentAuth(true);
    if (!student) return;

    const passId = localStorage.getItem("last_pass_id");
    if (!passId) {
        showAlert("alertBox", "No active pass application found. Please apply first.", "warning");
        setTimeout(() => {
            window.location.href = "apply.html";
        }, 1500);
        return;
    }

    const passIdDisplay = document.getElementById("displayPassId");
    if (passIdDisplay) passIdDisplay.innerText = passId;

    const paymentForm = document.getElementById("paymentForm");
    if (!paymentForm) return;

    // Formatting card number with spaces
    const cardInput = document.getElementById("cardNumber");
    if (cardInput) {
        cardInput.addEventListener("input", (e) => {
            let val = e.target.value.replace(/\D/g, "").substring(0, 16);
            let formatted = val.match(/.{1,4}/g)?.join(" ") || val;
            e.target.value = formatted;
        });
    }

    // Formatting expiry date MM/YY
    const expInput = document.getElementById("expiryDate");
    if (expInput) {
        expInput.addEventListener("input", (e) => {
            let val = e.target.value.replace(/\D/g, "").substring(0, 4);
            if (val.length >= 3) {
                e.target.value = val.substring(0, 2) + "/" + val.substring(2);
            } else {
                e.target.value = val;
            }
        });
    }

    paymentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = paymentForm.querySelector("button[type='submit']");
        const origText = submitBtn.innerHTML;

        const cardHolder = document.getElementById("cardHolder").value.trim();
        const cardNumber = document.getElementById("cardNumber").value.trim();
        const expiryDate = document.getElementById("expiryDate").value.trim();
        const cvv = document.getElementById("cvv").value.trim();

        if (!cardHolder || !cardNumber || !expiryDate || !cvv) {
            showAlert("alertBox", "Please complete all payment card fields.", "warning");
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Processing Payment ₹300...`;

            const payload = {
                student_id: student.id,
                pass_id: parseInt(passId, 10),
                amount: 300.0,
                card_holder: cardHolder,
                card_number: cardNumber,
                expiry_date: expiryDate,
                cvv: cvv
            };

            const result = await apiFetch("/payment/process", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            showAlert("alertBox", "Payment Successful! Generating receipt...", "success");
            setTimeout(() => {
                window.location.href = `receipt.html?pass_id=${passId}`;
            }, 1200);

        } catch (err) {
            showAlert("alertBox", err.message, "danger");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
        }
    });
}

// ==============================================================
// 6. Receipt Page Logic (receipt.html)
// ==============================================================
async function initReceiptPage() {
    const student = checkStudentAuth(true);
    if (!student) return;

    // Get pass ID from URL parameter or fallback to localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const passId = urlParams.get("pass_id") || localStorage.getItem("last_pass_id");

    if (!passId) {
        showAlert("alertBox", "Pass ID not specified. Redirecting to status...", "warning");
        setTimeout(() => {
            window.location.href = "status.html";
        }, 1500);
        return;
    }

    try {
        const pass = await apiFetch(`/buspass/${passId}`);
        
        document.getElementById("rPassId").innerText = `#BP-${pass.id}`;
        document.getElementById("rStudentName").innerText = pass.student_name || student.name;
        document.getElementById("rStudentEmail").innerText = pass.student_email || student.email;
        document.getElementById("rSource").innerText = pass.source;
        document.getElementById("rDestination").innerText = pass.destination;
        document.getElementById("rPassType").innerText = pass.pass_type;
        document.getElementById("rValidity").innerText = `${pass.start_date} to ${pass.end_date}`;
        document.getElementById("rAmount").innerText = `₹${pass.amount || 300.0}`;
        document.getElementById("rStatus").innerText = pass.payment_status || "Payment Successful";
        document.getElementById("rAppStatus").innerText = pass.status;

        // Status badge color
        const appBadge = document.getElementById("rAppStatusBadge");
        if (appBadge) {
            appBadge.className = `badge-status badge-${pass.status.toLowerCase()}`;
            appBadge.innerHTML = `<i class="fa-solid ${pass.status === 'Approved' ? 'fa-circle-check' : pass.status === 'Rejected' ? 'fa-circle-xmark' : 'fa-clock'} me-1"></i>${pass.status}`;
        }

    } catch (err) {
        showAlert("alertBox", "Failed to load receipt: " + err.message, "danger");
    }
}

// ==============================================================
// 7. Student Status Page Logic (status.html)
// ==============================================================
async function initStatusPage() {
    const student = checkStudentAuth(true);
    if (!student) return;

    const studentGreeting = document.getElementById("studentGreeting");
    if (studentGreeting) studentGreeting.innerText = student.name;

    await loadStudentPasses(student.id);
}

async function loadStudentPasses(studentId) {
    const tbody = document.getElementById("statusTableBody");
    const emptyState = document.getElementById("emptyState");
    const loadingState = document.getElementById("loadingState");

    if (loadingState) loadingState.style.display = "block";
    if (emptyState) emptyState.style.display = "none";
    if (tbody) tbody.innerHTML = "";

    try {
        const passes = await apiFetch(`/buspass/student/${studentId}`);

        if (loadingState) loadingState.style.display = "none";

        if (!passes || passes.length === 0) {
            if (emptyState) emptyState.style.display = "block";
            return;
        }

        tbody.innerHTML = passes.map(p => {
            const badgeClass = p.status === "Approved" ? "badge-approved" : (p.status === "Rejected" ? "badge-rejected" : "badge-pending");
            const iconClass = p.status === "Approved" ? "fa-circle-check" : (p.status === "Rejected" ? "fa-circle-xmark" : "fa-clock");

            return `
                <tr>
                    <td class="fw-bold">#BP-${p.id}</td>
                    <td>${p.student_name}</td>
                    <td><span class="badge bg-light text-dark border">${p.source}</span> <i class="fa-solid fa-arrow-right text-primary mx-1"></i> <span class="badge bg-light text-dark border">${p.destination}</span></td>
                    <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">${p.pass_type}</span></td>
                    <td>${p.start_date}</td>
                    <td>${p.end_date}</td>
                    <td>
                        <span class="badge-status ${badgeClass}">
                            <i class="fa-solid ${iconClass}"></i> ${p.status}
                        </span>
                    </td>
                    <td>
                        <a href="receipt.html?pass_id=${p.id}" class="btn btn-sm btn-outline-primary" title="View Receipt">
                            <i class="fa-solid fa-receipt me-1"></i>Receipt
                        </a>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        if (loadingState) loadingState.style.display = "none";
        showAlert("alertBox", "Failed to fetch status: " + err.message, "danger");
    }
}

// ==============================================================
// 8. Admin Login Logic (admin.html)
// ==============================================================
function initAdminLoginPage() {
    const adminForm = document.getElementById("adminLoginForm");
    if (!adminForm) return;

    adminForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = adminForm.querySelector("button[type='submit']");
        const origText = submitBtn.innerHTML;

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!username || !password) {
            showAlert("alertBox", "Please enter admin username and password.", "warning");
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Authenticating...`;

            const payload = { username, password };
            const result = await apiFetch("/admin/login", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            localStorage.setItem("admin_token", result.token);
            localStorage.setItem("admin_username", result.username);

            showAlert("alertBox", "Admin login successful! Entering dashboard...", "success");
            setTimeout(() => {
                window.location.href = "admin_dashboard.html";
            }, 1000);

        } catch (err) {
            showAlert("alertBox", err.message, "danger");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
        }
    });
}

// ==============================================================
// 9. Admin Dashboard Logic (admin_dashboard.html)
// ==============================================================
let allAdminPasses = [];
let currentFilter = "all";

async function initAdminDashboard() {
    if (!checkAdminAuth(true)) return;

    await loadAdminStats();
    await loadAdminApplications();
}

async function loadAdminStats() {
    try {
        const stats = await apiFetch("/admin/stats");
        document.getElementById("cardTotal").innerText = stats.total_applications;
        document.getElementById("cardPending").innerText = stats.pending_applications;
        document.getElementById("cardApproved").innerText = stats.approved_applications;
        document.getElementById("cardRejected").innerText = stats.rejected_applications;
    } catch (e) {
        console.error("Error loading stats:", e);
    }
}

async function loadAdminApplications() {
    const tbody = document.getElementById("adminTableBody");
    const loading = document.getElementById("adminLoading");
    const empty = document.getElementById("adminEmpty");

    if (loading) loading.style.display = "block";
    if (empty) empty.style.display = "none";
    if (tbody) tbody.innerHTML = "";

    try {
        allAdminPasses = await apiFetch("/admin/buspasses");
        if (loading) loading.style.display = "none";

        renderAdminTable();
    } catch (err) {
        if (loading) loading.style.display = "none";
        showAlert("adminAlertBox", "Error fetching applications: " + err.message, "danger");
    }
}

function filterApplications(status, btnElement) {
    currentFilter = status;
    // Update active nav button
    document.querySelectorAll(".admin-filter-btn").forEach(b => b.classList.remove("active"));
    if (btnElement) btnElement.classList.add("active");
    renderAdminTable();
}

function renderAdminTable() {
    const tbody = document.getElementById("adminTableBody");
    const empty = document.getElementById("adminEmpty");
    if (!tbody) return;

    let filtered = allAdminPasses;
    if (currentFilter !== "all") {
        filtered = allAdminPasses.filter(p => p.status.toLowerCase() === currentFilter.toLowerCase());
    }

    if (filtered.length === 0) {
        tbody.innerHTML = "";
        if (empty) empty.style.display = "block";
        return;
    }

    if (empty) empty.style.display = "none";

    tbody.innerHTML = filtered.map(p => {
        const badgeClass = p.status === "Approved" ? "badge-approved" : (p.status === "Rejected" ? "badge-rejected" : "badge-pending");
        const iconClass = p.status === "Approved" ? "fa-circle-check" : (p.status === "Rejected" ? "fa-circle-xmark" : "fa-clock");

        const actionButtons = `
            <div class="btn-group btn-group-sm">
                <button class="btn btn-success" onclick="updatePassStatus(${p.id}, 'Approved')" ${p.status === 'Approved' ? 'disabled' : ''} title="Approve Application">
                    <i class="fa-solid fa-check me-1"></i>Approve
                </button>
                <button class="btn btn-danger" onclick="updatePassStatus(${p.id}, 'Rejected')" ${p.status === 'Rejected' ? 'disabled' : ''} title="Reject Application">
                    <i class="fa-solid fa-xmark me-1"></i>Reject
                </button>
            </div>
        `;

        return `
            <tr>
                <td class="fw-bold">#BP-${p.id}</td>
                <td>
                    <div class="fw-semibold">${p.student_name}</div>
                    <small class="text-muted">${p.student_email}</small>
                </td>
                <td>${p.source}</td>
                <td>${p.destination}</td>
                <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">${p.pass_type}</span></td>
                <td>${p.start_date}</td>
                <td>${p.end_date}</td>
                <td>
                    <span class="badge-status ${badgeClass}">
                        <i class="fa-solid ${iconClass}"></i> ${p.status}
                    </span>
                </td>
                <td>${actionButtons}</td>
            </tr>
        `;
    }).join("");
}

async function updatePassStatus(passId, newStatus) {
    if (!confirm(`Are you sure you want to mark Bus Pass #BP-${passId} as ${newStatus}?`)) {
        return;
    }

    try {
        const result = await apiFetch(`/admin/buspass/${passId}`, {
            method: "PUT",
            body: JSON.stringify({ status: newStatus })
        });

        showAlert("adminAlertBox", `Bus Pass #BP-${passId} marked as ${newStatus}!`, "success");
        // Update local array
        const index = allAdminPasses.findIndex(p => p.id === passId);
        if (index !== -1) {
            allAdminPasses[index].status = newStatus;
        }

        renderAdminTable();
        await loadAdminStats();
    } catch (err) {
        showAlert("adminAlertBox", "Failed to update status: " + err.message, "danger");
    }
}

// ==============================================================
// Page Initialization Dispatcher
// ==============================================================
document.addEventListener("DOMContentLoaded", () => {
    updateNavbar();

    // Check which page is currently open based on element existence
    if (document.getElementById("heroSection")) initHomePage();
    if (document.getElementById("registerForm")) initRegisterPage();
    if (document.getElementById("loginForm")) initLoginPage();
    if (document.getElementById("applyForm")) initApplyPage();
    if (document.getElementById("paymentForm")) initPaymentPage();
    if (document.getElementById("printable-receipt")) initReceiptPage();
    if (document.getElementById("statusTableBody")) initStatusPage();
    if (document.getElementById("adminLoginForm")) initAdminLoginPage();
    if (document.getElementById("adminDashboardView")) initAdminDashboard();
});
