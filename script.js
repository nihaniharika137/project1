
// ==========================================
// KL UNIVERSITY ONLINE LIBRARY MANAGEMENT
// ==========================================

const DEMO_STUDENTS = [
    {username:"student01",password:"KL@12345",name:"Rohith Kumar",id:"KL2026001",email:"rohith@kluniversity.in"},
    {username:"student02",password:"KL@12345",name:"Mani Deep",id:"KL2026002",email:"mani@kluniversity.in"},
    {username:"student03",password:"KL@12345",name:"Shrishanth",id:"KL2026003",email:"shrishanth@kluniversity.in"}
];

const ADMIN = {
    username:"admin",
    password:"Admin@123",
    name:"Library Administrator"
};

const defaultBooks = [
    {id:1,title:"Introduction to Algorithms",author:"Thomas H. Cormen",category:"Computer Science",isbn:"9780262046305",total:10,available:8,icon:"📘"},
    {id:2,title:"Clean Code",author:"Robert C. Martin",category:"Programming",isbn:"9780132350884",total:8,available:6,icon:"📗"},
    {id:3,title:"Python Crash Course",author:"Eric Matthes",category:"Programming",isbn:"9781718502703",total:12,available:10,icon:"📙"},
    {id:4,title:"Artificial Intelligence",author:"Stuart Russell",category:"Technology",isbn:"9780134610993",total:7,available:5,icon:"🤖"},
    {id:5,title:"Database System Concepts",author:"Abraham Silberschatz",category:"Database",isbn:"9780078022159",total:9,available:7,icon:"📕"},
    {id:6,title:"The Psychology of Money",author:"Morgan Housel",category:"Finance",isbn:"9780857197689",total:6,available:6,icon:"💰"},
    {id:7,title:"Deep Learning",author:"Ian Goodfellow",category:"Technology",isbn:"9780262035613",total:5,available:3,icon:"🧠"},
    {id:8,title:"Java: The Complete Reference",author:"Herbert Schildt",category:"Programming",isbn:"9781260440232",total:10,available:9,icon:"☕"},
    {id:9,title:"Operating System Concepts",author:"Abraham Silberschatz",category:"Computer Science",isbn:"9781119800361",total:8,available:7,icon:"💻"}
];

let books = loadData("kl_books",defaultBooks);
let students = loadData("kl_students",DEMO_STUDENTS);
let loans = loadData("kl_loans",[]);
let currentUser = null;
let currentRole = "student";
let currentPage = "dashboard";
let selectedCategory = "All";

function loadData(key,initial) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : JSON.parse(JSON.stringify(initial));
    } catch(e) {
        return JSON.parse(JSON.stringify(initial));
    }
}

function saveData() {
    localStorage.setItem("kl_books",JSON.stringify(books));
    localStorage.setItem("kl_students",JSON.stringify(students));
    localStorage.setItem("kl_loans",JSON.stringify(loans));
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[c]);
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(()=>toast.classList.remove("show"),2500);
}

// ==========================================
// LOGIN
// ==========================================

function setRole(role,button) {
    currentRole = role;
    document.querySelectorAll(".role-btn").forEach(b=>b.classList.remove("active"));
    button.classList.add("active");

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginError").textContent = "";
}

function togglePassword() {
    const password = document.getElementById("password");
    password.type = password.type === "password" ? "text" : "password";
}

document.getElementById("loginForm").addEventListener("submit",function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    let user = null;

    if(currentRole === "admin") {
        if(username === ADMIN.username && password === ADMIN.password) {
            user = {...ADMIN,id:"ADMIN001"};
        }
    } else {
        user = students.find(s=>s.username === username && s.password === password);
    }

    if(!user) {
        document.getElementById("loginError").textContent =
            "Invalid username or password. Please try again.";
        return;
    }

    currentUser = user;
    localStorage.setItem("kl_session",JSON.stringify({
        user:currentUser,role:currentRole
    }));

    startApplication();
});

function logout() {
    currentUser = null;
    localStorage.removeItem("kl_session");
    document.getElementById("appPage").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("loginForm").reset();
    showToast("Logged out successfully.");
}

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

function startApplication() {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("appPage").classList.remove("hidden");

    document.getElementById("sideName").textContent = currentUser.name;
    document.getElementById("sideRole").textContent =
        currentRole === "admin" ? "Administrator" : "Student Account";

    const initial = currentUser.name.charAt(0).toUpperCase();
    document.getElementById("sideAvatar").textContent = initial;
    document.getElementById("topAvatar").textContent = initial;

    document.getElementById("currentDate").textContent =
        new Date().toLocaleDateString("en-IN",{
            day:"numeric",month:"short",year:"numeric"
        });

    buildNavigation();
    navigate("dashboard");
}

function buildNavigation() {
    const studentMenu = [
        ["dashboard","▦","Dashboard"],
        ["books","📚","Browse Books"],
        ["mybooks","📖","My Borrowed Books"],
        ["profile","👤","My Profile"]
    ];

    const adminMenu = [
        ["dashboard","▦","Dashboard"],
        ["books","📚","Manage Books"],
        ["addbook","＋","Add New Book"],
        ["students","🎓","Students"],
        ["issued","📋","Issue & Return"],
        ["profile","👤","Admin Profile"]
    ];

    const menu = currentRole === "admin" ? adminMenu : studentMenu;

    document.getElementById("navigation").innerHTML = menu.map(item=>`
        <button data-page="${item[0]}" onclick="navigate('${item[0]}')">
            <span>${item[1]}</span>${item[2]}
        </button>
    `).join("");
}

function navigate(page) {
    currentPage = page;

    document.querySelectorAll("#navigation button").forEach(btn=>{
        btn.classList.toggle("active",btn.dataset.page === page);
    });

    const titles = {
        dashboard:"Dashboard",
        books:currentRole === "admin" ? "Manage Books" : "Browse Books",
        mybooks:"My Borrowed Books",
        profile:"My Profile",
        addbook:"Add New Book",
        students:"Student Management",
        issued:"Issue & Return Management"
    };

    document.getElementById("pageHeading").textContent =
        titles[page] || "Dashboard";

    const pages = {
        dashboard:currentRole === "admin" ? adminDashboard : studentDashboard,
        books:booksPage,
        mybooks:myBooksPage,
        profile:profilePage,
        addbook:addBookPage,
        students:studentsPage,
        issued:issuedPage
    };

    if(pages[page]) {
        document.getElementById("pageContent").innerHTML = pages[page]();
    }

    document.querySelector(".sidebar").classList.remove("open");
}

function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("open");
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function myLoans() {
    return loans.filter(l=>l.studentUsername === currentUser.username);
}

function activeLoans() {
    return loans.filter(l=>l.status === "Issued");
}

function bookById(id) {
    return books.find(b=>b.id === Number(id));
}

function dateAfter(days) {
    const date = new Date();
    date.setDate(date.getDate()+days);
    return date.toLocaleDateString("en-IN");
}

function statCard(icon,label,value) {
    return `
    <div class="stat-card">
        <div>
            <p>${label}</p>
            <h2>${value}</h2>
        </div>
        <div class="stat-icon">${icon}</div>
    </div>`;
}

function bookCard(book) {
    return `
    <div class="book-card">
        <div class="book-cover">${escapeHTML(book.icon || "📚")}</div>
        <div class="book-info">
            <h4>${escapeHTML(book.title)}</h4>
            <p>${escapeHTML(book.author)}</p>
            <p>${escapeHTML(book.category)}</p>
            <span class="badge ${book.available>0?"available":"unavailable"}">
                ${book.available>0?book.available+" Available":"Out of Stock"}
            </span>
            ${currentRole==="student"
                ? `<button class="small-btn" ${book.available<=0?"disabled":""}
                     onclick="borrowBook(${book.id})">Borrow Book</button>`
                : `<button class="small-btn" onclick="deleteBook(${book.id})">Delete Book</button>`
            }
        </div>
    </div>`;
}

function tableRows(items) {
    if(!items.length) {
        return `<tr><td colspan="7" class="empty">No records found.</td></tr>`;
    }
    return items.join("");
}

// ==========================================
// STUDENT DASHBOARD
// ==========================================

function studentDashboard() {
    const mine = myLoans();
    const active = mine.filter(l=>l.status==="Issued");
    const overdue = active.filter(l=>new Date(l.dueDate)<new Date());
    const recent = books.slice(0,3);

    return `
    <div class="welcome-banner">
        <div>
            <h2>Welcome back, ${escapeHTML(currentUser.name)}! 👋</h2>
            <p>Explore the KL University digital library and continue learning.</p>
        </div>
        <div class="banner-icon">📚</div>
    </div>

    <div class="stats-grid">
        ${statCard("📚","Total Library Books",books.length)}
        ${statCard("📖","Currently Borrowed",active.length)}
        ${statCard("↩","Books Returned",mine.filter(l=>l.status==="Returned").length)}
        ${statCard("⚠","Overdue Books",overdue.length)}
    </div>

    <div class="section-title">
        <h3>Recommended Books</h3>
        <span onclick="navigate('books')" style="cursor:pointer;color:#4938bd">View All →</span>
    </div>
    <div class="book-grid">
        ${recent.map(bookCard).join("")}
    </div>

    <div class="panel" style="margin-top:25px">
        <div class="section-title"><h3>My Recent Activity</h3></div>
        ${recentActivity(mine)}
    </div>`;
}

function recentActivity(items) {
    const list = items.slice().reverse().slice(0,5);

    if(!list.length) return `<div class="empty">No borrowing activity yet.</div>`;

    return `<div class="table-wrap"><table>
        <thead><tr><th>Book</th><th>Issue Date</th><th>Due Date</th><th>Status</th></tr></thead>
        <tbody>
        ${list.map(l=>`
            <tr>
                <td><strong>${escapeHTML(l.bookTitle)}</strong></td>
                <td>${escapeHTML(l.issueDate)}</td>
                <td>${escapeHTML(l.dueDate)}</td>
                <td><span class="badge ${l.status==="Issued"?"issued":"returned"}">${l.status}</span></td>
            </tr>`).join("")}
        </tbody>
    </table></div>`;
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

function adminDashboard() {
    const active = activeLoans();
    const totalCopies = books.reduce((s,b)=>s+b.total,0);
    const availableCopies = books.reduce((s,b)=>s+b.available,0);

    return `
    <div class="welcome-banner">
        <div>
            <h2>Welcome, Administrator! 🛡</h2>
            <p>Manage the KL University library from your control center.</p>
        </div>
        <div class="banner-icon">🏛️</div>
    </div>

    <div class="stats-grid">
        ${statCard("📚","Total Book Titles",books.length)}
        ${statCard("📖","Total Book Copies",totalCopies)}
        ${statCard("🎓","Registered Students",students.length)}
        ${statCard("📋","Currently Issued",active.length)}
    </div>

    <div class="stats-grid">
        ${statCard("✅","Available Copies",availableCopies)}
        ${statCard("↩","Returned Books",loans.filter(l=>l.status==="Returned").length)}
        ${statCard("⚠","Overdue Books",active.filter(l=>new Date(l.dueDate)<new Date()).length)}
        ${statCard("📊","Total Transactions",loans.length)}
    </div>

    <div class="content-grid">
        <div class="panel">
            <div class="section-title"><h3>Recent Transactions</h3></div>
            ${recentActivity(active.slice(-5))}
        </div>
        <div class="panel">
            <div class="section-title"><h3>Quick Actions</h3></div>
            <button class="primary-btn full-btn" onclick="navigate('addbook')">＋ Add New Book</button>
            <br><br>
            <button class="small-btn full-btn" onclick="navigate('students')">🎓 View Students</button>
            <br><br>
            <button class="small-btn full-btn" onclick="navigate('issued')">📋 Manage Issued Books</button>
        </div>
    </div>`;
}

// ==========================================
// BROWSE / MANAGE BOOKS
// ==========================================

function booksPage() {
    const categories = ["All",...new Set(books.map(b=>b.category))];

    return `
    <div class="panel">
        <div class="section-title">
            <h3>${currentRole==="admin"?"Library Inventory":"Explore Library Collection"}</h3>
            <span>${books.length} book titles</span>
        </div>
        <div class="search-row">
            <input class="field" id="bookSearch" placeholder="Search title, author, ISBN..."
                oninput="filterBooks()">
            <select class="field" id="categoryFilter" onchange="filterBooks()">
                ${categories.map(c=>`<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("")}
            </select>
        </div>
        <div id="bookResults" class="book-grid">
            ${books.map(bookCard).join("")}
        </div>
    </div>`;
}

function filterBooks() {
    const query = document.getElementById("bookSearch").value.toLowerCase();
    const category = document.getElementById("categoryFilter").value;

    const filtered = books.filter(b=>{
        const matches =
            (b.title+" "+b.author+" "+b.isbn).toLowerCase().includes(query);
        return matches && (category==="All" || b.category===category);
    });

    document.getElementById("bookResults").innerHTML =
        filtered.length ? filtered.map(bookCard).join("") :
        `<div class="empty">No matching books found.</div>`;
}

// ==========================================
// STUDENT BORROW AND RETURN
// ==========================================

function borrowBook(id) {
    const book = bookById(id);

    if(!book || book.available<=0) {
        showToast("This book is not available.");
        return;
    }

    const alreadyBorrowed = myLoans().some(l=>
        l.bookId===book.id && l.status==="Issued"
    );

    if(alreadyBorrowed) {
        showToast("You have already borrowed this book.");
        return;
    }

    if(myLoans().filter(l=>l.status==="Issued").length>=3) {
        showToast("Maximum 3 books can be borrowed at a time.");
        return;
    }

    book.available--;

    const now = new Date();
    const due = new Date();
    due.setDate(due.getDate()+14);

    loans.push({
        id:Date.now(),
        bookId:book.id,
        bookTitle:book.title,
        studentUsername:currentUser.username,
        studentName:currentUser.name,
        issueDate:now.toISOString().split("T")[0],
        dueDate:due.toISOString().split("T")[0],
        status:"Issued"
    });

    saveData();
    showToast("Book borrowed successfully!");
    navigate(currentPage);
}

function returnBook(id) {
    const loan = loans.find(l=>l.id===Number(id) &&
        l.studentUsername===currentUser.username &&
        l.status==="Issued");

    if(!loan) return;

    loan.status="Returned";

    const book = bookById(loan.bookId);
    if(book) book.available=Math.min(book.total,book.available+1);

    saveData();
    showToast("Book returned successfully!");
    navigate("mybooks");
}

function myBooksPage() {
    const mine = myLoans();

    return `
    <div class="panel">
        <div class="section-title">
            <h3>My Borrowing History</h3>
            <span>${mine.length} transactions</span>
        </div>
        <div class="table-wrap">
        <table>
            <thead>
                <tr><th>Book Name</th><th>Issue Date</th><th>Due Date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
                ${tableRows(mine.slice().reverse().map(l=>`
                <tr>
                    <td><strong>${escapeHTML(l.bookTitle)}</strong></td>
                    <td>${escapeHTML(l.issueDate)}</td>
                    <td>${escapeHTML(l.dueDate)}</td>
                    <td><span class="badge ${l.status==="Issued"?"issued":"returned"}">${l.status}</span></td>
                    <td>${l.status==="Issued"
                        ? `<button class="small-btn" onclick="returnBook(${l.id})">Return</button>`
                        : "Completed"}</td>
                </tr>`))}
            </tbody>
        </table>
        </div>
    </div>`;
}

// ==========================================
// ADD AND DELETE BOOKS (ADMIN)
// ==========================================

function addBookPage() {
    return `
    <div class="panel">
        <div class="section-title"><h3>Add a New Library Book</h3></div>
        <form onsubmit="addBook(event)">
            <div class="form-grid">
                <div class="form-group">
                    <label>Book Title *</label>
                    <input class="field" id="newTitle" required placeholder="Enter book title">
                </div>
                <div class="form-group">
                    <label>Author Name *</label>
                    <input class="field" id="newAuthor" required placeholder="Enter author">
                </div>
                <div class="form-group">
                    <label>Category *</label>
                    <select class="field" id="newCategory" required>
                        <option value="">Select Category</option>
                        <option>Computer Science</option>
                        <option>Programming</option>
                        <option>Technology</option>
                        <option>Database</option>
                        <option>Finance</option>
                        <option>Science</option>
                        <option>Mathematics</option>
                        <option>Literature</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>ISBN Number *</label>
                    <input class="field" id="newISBN" required placeholder="Enter ISBN">
                </div>
                <div class="form-group">
                    <label>Total Copies *</label>
                    <input class="field" type="number" id="newTotal" min="1" required>
                </div>
                <div class="form-group">
                    <label>Book Icon</label>
                    <select class="field" id="newIcon">
                        <option>📘</option><option>📗</option>
                        <option>📙</option><option>📕</option>
                        <option>💻</option><option>🤖</option>
                    </select>
                </div>
                <div class="form-group full">
                    <button class="primary-btn" type="submit">＋ Add Book to Library</button>
                </div>
            </div>
        </form>
    </div>`;
}

function addBook(event) {
    event.preventDefault();

    const isbn = document.getElementById("newISBN").value.trim();

    if(books.some(b=>b.isbn.toLowerCase()===isbn.toLowerCase())) {
        showToast("This ISBN already exists.");
        return;
    }

    const total = Number(document.getElementById("newTotal").value);

    if(!Number.isInteger(total) || total<1) {
        showToast("Enter a valid number of copies.");
        return;
    }

    books.push({
        id:Date.now(),
        title:document.getElementById("newTitle").value.trim(),
        author:document.getElementById("newAuthor").value.trim(),
        category:document.getElementById("newCategory").value,
        isbn,
        total,
        available:total,
        icon:document.getElementById("newIcon").value
    });

    saveData();
    showToast("New book added successfully!");
    navigate("books");
}

function deleteBook(id) {
    const book = bookById(id);
    if(!book) return;

    if(loans.some(l=>l.bookId===book.id && l.status==="Issued")) {
        showToast("Cannot delete a book currently issued.");
        return;
    }

    if(confirm("Are you sure you want to delete this book?")) {
        books=books.filter(b=>b.id!==book.id);
        saveData();
        showToast("Book deleted successfully!");
        navigate("books");
    }
}

// ==========================================
// STUDENT MANAGEMENT (ADMIN)
// ==========================================

function studentsPage() {
    return `
    <div class="panel">
        <div class="section-title">
            <h3>Registered Students</h3>
            <span>${students.length} accounts</span>
        </div>
        <div class="search-row">
            <input class="field" id="studentSearch"
                placeholder="Search student name, username or ID..."
                oninput="filterStudents()">
        </div>
        <div id="studentResults">
            ${renderStudents(students)}
        </div>
        <div style="margin-top:20px">
            <h3 style="font-size:14px;margin-bottom:15px">Register New Student</h3>
            <form onsubmit="addStudent(event)">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input class="field" id="studentName" required>
                    </div>
                    <div class="form-group">
                        <label>Username</label>
                        <input class="field" id="studentUsername" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input class="field" id="studentPassword" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input class="field" type="email" id="studentEmail" required>
                    </div>
                    <div class="form-group full">
                        <button class="primary-btn">＋ Register Student</button>
                    </div>
                </div>
            </form>
        </div>
    </div>`;
}

function renderStudents(list) {
    return `<div class="table-wrap"><table>
        <thead><tr><th>Student ID</th><th>Name</th><th>Username</th><th>Email</th><th>Action</th></tr></thead>
        <tbody>${tableRows(list.map(s=>`
            <tr>
                <td>${escapeHTML(s.id)}</td>
                <td><strong>${escapeHTML(s.name)}</strong></td>
                <td>${escapeHTML(s.username)}</td>
                <td>${escapeHTML(s.email)}</td>
                <td><button class="small-btn danger-btn" onclick="deleteStudent('${escapeHTML(s.username)}')">Delete</button></td>
            </tr>`))}</tbody>
    </table></div>`;
}

function filterStudents() {
    const q=document.getElementById("studentSearch").value.toLowerCase();
    const filtered=students.filter(s=>
        (s.name+" "+s.username+" "+s.id).toLowerCase().includes(q)
    );
    document.getElementById("studentResults").innerHTML=renderStudents(filtered);
}

function addStudent(event) {
    event.preventDefault();

    const username=document.getElementById("studentUsername").value.trim();
    const password=document.getElementById("studentPassword").value;

    if(students.some(s=>s.username.toLowerCase()===username.toLowerCase())) {
        showToast("Username already exists.");
        return;
    }

    if(username===ADMIN.username) {
        showToast("This username is reserved.");
        return;
    }

    if(password.length<6) {
        showToast("Password must have at least 6 characters.");
        return;
    }

    students.push({
        id:"KL"+Date.now().toString().slice(-8),
        name:document.getElementById("studentName").value.trim(),
        username,
        password,
        email:document.getElementById("studentEmail").value.trim()
    });

    saveData();
    showToast("Student registered successfully!");
    navigate("students");
}

function deleteStudent(username) {
    if(loans.some(l=>l.studentUsername===username && l.status==="Issued")) {
        showToast("Student has active books. Return them first.");
        return;
    }

    if(confirm("Delete this student account?")) {
        students=students.filter(s=>s.username!==username);
        saveData();
        showToast("Student account deleted.");
        navigate("students");
    }
}

// ==========================================
// ADMIN ISSUE AND RETURN MANAGEMENT
// ==========================================

function issuedPage() {
    return `
    <div class="panel">
        <div class="section-title">
            <h3>Book Issue & Return Records</h3>
            <span>${loans.length} transactions</span>
        </div>
        <div class="search-row">
            <input class="field" id="loanSearch" placeholder="Search student or book..."
                oninput="filterLoans()">
            <select class="field" id="loanStatus" onchange="filterLoans()">
                <option value="All">All Status</option>
                <option value="Issued">Issued</option>
                <option value="Returned">Returned</option>
            </select>
        </div>
        <div id="loanResults">${renderLoans(loans)}</div>
        <div style="margin-top:25px;border-top:1px solid #eee;padding-top:20px">
            <h3 style="font-size:14px;margin-bottom:15px">Issue a Book to Student</h3>
            <form onsubmit="adminIssueBook(event)">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Select Student</label>
                        <select class="field" id="issueStudent" required>
                            <option value="">Choose Student</option>
                            ${students.map(s=>`
                                <option value="${escapeHTML(s.username)}">
                                    ${escapeHTML(s.name)} (${escapeHTML(s.username)})
                                </option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Select Book</label>
                        <select class="field" id="issueBook" required>
                            <option value="">Choose Book</option>
                            ${books.filter(b=>b.available>0).map(b=>`
                                <option value="${b.id}">${escapeHTML(b.title)} (${b.available} available)</option>
                            `).join("")}
                        </select>
                    </div>
                    <div class="form-group full">
                        <button class="primary-btn">Issue Book</button>
                    </div>
                </div>
            </form>
        </div>
    </div>`;
}

function renderLoans(list) {
    return `<div class="table-wrap"><table>
        <thead>
            <tr><th>Student</th><th>Book</th><th>Issue Date</th><th>Due Date</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>${tableRows(list.slice().reverse().map(l=>`
            <tr>
                <td><strong>${escapeHTML(l.studentName)}</strong><br>${escapeHTML(l.studentUsername)}</td>
                <td>${escapeHTML(l.bookTitle)}</td>
                <td>${escapeHTML(l.issueDate)}</td>
                <td>${escapeHTML(l.dueDate)}</td>
                <td><span class="badge ${l.status==="Issued"?"issued":"returned"}">${l.status}</span></td>
                <td>${l.status==="Issued"
                    ? `<button class="small-btn" onclick="adminReturnBook(${l.id})">Return</button>`
                    : "Completed"}</td>
            </tr>`))}</tbody>
    </table></div>`;
}

function filterLoans() {
    const q=document.getElementById("loanSearch").value.toLowerCase();
    const status=document.getElementById("loanStatus").value;

    const filtered=loans.filter(l=>
        (l.studentName+" "+l.studentUsername+" "+l.bookTitle).toLowerCase().includes(q) &&
        (status==="All" || l.status===status)
    );

    document.getElementById("loanResults").innerHTML=renderLoans(filtered);
}

function adminIssueBook(event) {
    event.preventDefault();

    const username=document.getElementById("issueStudent").value;
    const book=bookById(document.getElementById("issueBook").value);
    const student=students.find(s=>s.username===username);

    if(!student || !book || book.available<=0) {
        showToast("Please select valid available records.");
        return;
    }

    if(loans.filter(l=>l.studentUsername===username && l.status==="Issued").length>=3) {
        showToast("Student has reached the 3-book limit.");
        return;
    }

    if(loans.some(l=>l.studentUsername===username &&
        l.bookId===book.id && l.status==="Issued")) {
        showToast("This student already has this book.");
        return;
    }

    book.available--;

    const now=new Date();
    const due=new Date();
    due.setDate(due.getDate()+14);

    loans.push({
        id:Date.now(),
        bookId:book.id,
        bookTitle:book.title,
        studentUsername:username,
        studentName:student.name,
        issueDate:now.toISOString().split("T")[0],
        dueDate:due.toISOString().split("T")[0],
        status:"Issued"
    });

    saveData();
    showToast("Book issued successfully!");
    navigate("issued");
}

function adminReturnBook(id) {
    const loan=loans.find(l=>l.id===Number(id) && l.status==="Issued");
    if(!loan) return;

    loan.status="Returned";
    const book=bookById(loan.bookId);

    if(book) book.available=Math.min(book.total,book.available+1);

    saveData();
    showToast("Book returned successfully!");
    navigate("issued");
}

// ==========================================
// PROFILE
// ==========================================

function profilePage() {
    const admin=currentRole==="admin";

    return `
    <div class="profile-card">
        <div class="profile-avatar">${admin?"🛡":"🎓"}</div>
        <div>
            <h2>${escapeHTML(currentUser.name)}</h2>
            <p>${admin?"Library Administrator":"KL University Student"}</p>
            <p>${escapeHTML(currentUser.email || "admin@kluniversity.in")}</p>
        </div>
    </div>

    <div class="panel" style="margin-top:22px">
        <div class="section-title"><h3>Account Information</h3></div>
        <div class="form-grid">
            <div class="form-group">
                <label>Full Name</label>
                <input class="field" value="${escapeHTML(currentUser.name)}" disabled>
            </div>
            <div class="form-group">
                <label>Username</label>
                <input class="field" value="${escapeHTML(currentUser.username)}" disabled>
            </div>
            <div class="form-group">
                <label>Student / Admin ID</label>
                <input class="field" value="${escapeHTML(currentUser.id)}" disabled>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input class="field" value="${escapeHTML(currentUser.email || "admin@kluniversity.in")}" disabled>
            </div>
        </div>
    </div>`;
}

// ==========================================
// SESSION RESTORE
// ==========================================

window.addEventListener("DOMContentLoaded",()=>{
    const session=localStorage.getItem("kl_session");

    if(session) {
        try {
            const data=JSON.parse(session);
            if(data.role==="admin" &&
                data.user.username===ADMIN.username &&
                data.user.password===ADMIN.password) {
                currentUser=ADMIN;
                currentRole="admin";
                startApplication();
                return;
            }

            if(data.role==="student") {
                const valid=students.find(s=>
                    s.username===data.user.username &&
                    s.password===data.user.password
                );

                if(valid) {
                    currentUser=valid;
                    currentRole="student";
                    startApplication();
                    return;
                }
            }
        } catch(e) {
            console.error("Session could not be restored.");
        }

        localStorage.removeItem("kl_session");
    }
});

