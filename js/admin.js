// Admin Panel Logic
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!auth.isLoggedIn()) {
        alert('Please login first to access Admin Panel.');
        window.location.href = 'index.html';
        return;
    }

    // Check if user is admin
    if (!auth.isAdmin()) {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return;
    }

    // Load dashboard
    loadDashboard();
    loadUsers();
    loadProducts();
    loadOrders();
});

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-content').forEach(content => content.classList.remove('active'));

    // Show selected tab
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Reload data based on tab
    if (tabName === 'users') {
        loadUsers();
    } else if (tabName === 'products') {
        loadProducts();
    } else if (tabName === 'orders') {
        loadOrders();
    } else if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'aliexpress') {
        // AliExpress tab loaded
    }
}

// Dashboard
function loadDashboard() {
    const users = db.getUsers();
    const products = db.getProducts();
    const orders = db.getOrders();

    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toFixed(2);
}

// Users Management
function loadUsers() {
    const users = db.getUsers();
    const tbody = document.getElementById('usersTableBody');

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name || 'N/A'}</td>
            <td>${user.email}</td>
            <td><span style="padding: 0.25rem 0.5rem; background: ${user.role === 'admin' ? '#d4af37' : '#ccc'}; 
                            color: white; border-radius: 3px;">${user.role}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-edit" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function showUserForm(userId = null) {
    const form = document.getElementById('userForm');
    const title = document.getElementById('userFormTitle');

    if (userId) {
        const user = db.getUserById(userId);
        title.textContent = 'Edit User';
        document.getElementById('userId').value = userId;
        document.getElementById('userName').value = user.name || '';
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPassword').value = '';
        document.getElementById('userRole').value = user.role || 'customer';
    } else {
        title.textContent = 'Add User';
        document.getElementById('userId').value = '';
        document.getElementById('userForm').querySelector('form').reset();
    }

    form.classList.add('active');
}

function closeUserForm() {
    document.getElementById('userForm').classList.remove('active');
}

function saveUser(e) {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value
    };

    if (userId) {
        // Update
        const password = document.getElementById('userPassword').value;
        if (password) {
            userData.password = password;
        }
        db.updateUser(userId, userData);
        alert('User updated successfully!');
    } else {
        // Add new
        const password = document.getElementById('userPassword').value;
        if (!password) {
            alert('Password is required for new users!');
            return;
        }
        db.addUser({ ...userData, password });
        alert('User added successfully!');
    }

    closeUserForm();
    loadUsers();
    loadDashboard();
}

function editUser(userId) {
    showUserForm(userId);
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        db.deleteUser(userId);
        alert('User deleted successfully!');
        loadUsers();
        loadDashboard();
    }
}

// Products Management
function loadProducts() {
    const products = db.getProducts();
    const tbody = document.getElementById('productsTableBody');

    tbody.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.image}" alt="${product.nameEn}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;"></td>
            <td>${product.nameEn || 'N/A'}</td>
            <td>${product.name || 'N/A'}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.category || 'N/A'}</td>
            <td>${product.stock || 0}</td>
            <td>
                <button class="btn btn-edit" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function showProductForm(productId = null) {
    const form = document.getElementById('productForm');
    const title = document.getElementById('productFormTitle');

    if (productId) {
        const product = db.getProductById(productId);
        title.textContent = 'Edit Product';
        document.getElementById('productId').value = productId;
        document.getElementById('productNameEn').value = product.nameEn || '';
        document.getElementById('productNameVi').value = product.name || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productStock').value = product.stock || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productDescEn').value = product.descriptionEn || '';
        document.getElementById('productDescVi').value = product.description || '';
    } else {
        title.textContent = 'Add Product';
        document.getElementById('productId').value = '';
        document.getElementById('productForm').querySelector('form').reset();
    }

    form.classList.add('active');
}

function closeProductForm() {
    document.getElementById('productForm').classList.remove('active');
}

function saveProduct(e) {
    e.preventDefault();
    const productId = document.getElementById('productId').value;
    const productData = {
        nameEn: document.getElementById('productNameEn').value,
        name: document.getElementById('productNameVi').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value,
        descriptionEn: document.getElementById('productDescEn').value,
        description: document.getElementById('productDescVi').value
    };

    if (productId) {
        // Update
        db.updateProduct(productId, productData);
        alert('Product updated successfully!');
    } else {
        // Add new
        db.addProduct(productData);
        alert('Product added successfully!');
    }

    closeProductForm();
    loadProducts();
    loadDashboard();
}

function editProduct(productId) {
    showProductForm(productId);
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        db.deleteProduct(productId);
        alert('Product deleted successfully!');
        loadProducts();
        loadDashboard();
    }
}

// Orders Management
function loadOrders() {
    const orders = db.getOrders();
    const tbody = document.getElementById('ordersTableBody');

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No orders yet</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const user = order.userId ? db.getUserById(order.userId) : null;
        const items = order.items || [{ name: order.productName || 'N/A', price: order.amount || 0 }];
        
        return `
            <tr>
                <td>${order.id}</td>
                <td>${user ? (user.name || user.email) : 'Guest'}</td>
                <td>${items.length} item(s)</td>
                <td>$${(order.total || order.amount || 0).toFixed(2)}</td>
                <td>
                    <span style="padding: 0.25rem 0.5rem; background: ${order.status === 'completed' ? '#27ae60' : '#f39c12'}; 
                                color: white; border-radius: 3px;">${order.status || 'pending'}</span>
                </td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-edit" onclick="updateOrderStatus('${order.id}')">
                        Update Status
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateOrderStatus(orderId) {
    const order = db.getOrderById(orderId);
    const newStatus = prompt('Enter new status (pending/completed/cancelled):', order.status || 'pending');
    
    if (newStatus && ['pending', 'completed', 'cancelled'].includes(newStatus)) {
        db.updateOrder(orderId, { status: newStatus });
        alert('Order status updated!');
        loadOrders();
        loadDashboard();
    }
}

// AliExpress Integration
function searchAliExpressProduct() {
    const url = document.getElementById('aliexpressUrl').value;
    if (!url) {
        alert('Please enter AliExpress product URL');
        return;
    }

    const results = document.getElementById('aliexpressResults');
    results.innerHTML = `
        <div style="background: #e7f3ff; padding: 1.5rem; border-radius: 5px; border-left: 4px solid #2196F3;">
            <h3>Manual Import Required</h3>
            <p>Please copy the product details from the AliExpress page and fill in the form below:</p>
            <ol style="margin-top: 1rem;">
                <li>Open the AliExpress product page in a new tab</li>
                <li>Copy product name, images, and description</li>
                <li>Fill in the form below with the information</li>
                <li>Click "Import Product"</li>
            </ol>
            <button class="btn" onclick="window.open('${url}', '_blank')" style="margin-top: 1rem; background: #2196F3; color: white;">
                <i class="fas fa-external-link-alt"></i> Open AliExpress Page
            </button>
        </div>
    `;
}

function importAliExpressProduct(e) {
    e.preventDefault();
    
    const productData = {
        nameEn: document.getElementById('aliexpressNameEn').value,
        name: document.getElementById('aliexpressNameVi').value,
        price: parseFloat(document.getElementById('aliexpressPrice').value),
        stock: parseInt(document.getElementById('aliexpressStock').value),
        category: document.getElementById('aliexpressCategory').value,
        image: document.getElementById('aliexpressImage').value,
        descriptionEn: document.getElementById('aliexpressDescEn').value,
        description: document.getElementById('aliexpressDescVi').value
    };

    try {
        db.addProduct(productData);
        alert('Product imported successfully!');
        
        // Clear form
        document.getElementById('aliexpressUrl').value = '';
        document.querySelector('#aliexpress form').reset();
        
        // Reload products and dashboard
        loadProducts();
        loadDashboard();
        
        // Switch to Products tab
        document.querySelectorAll('.admin-tab')[2].click();
    } catch (error) {
        alert('Error importing product: ' + error.message);
    }
}

// Auto-fill form helper (for manual use)
function autoFillProductForm(nameEn, nameVi, price, image, category) {
    document.getElementById('aliexpressNameEn').value = nameEn || '';
    document.getElementById('aliexpressNameVi').value = nameVi || '';
    document.getElementById('aliexpressPrice').value = price || '';
    document.getElementById('aliexpressImage').value = image || '';
    document.getElementById('aliexpressCategory').value = category || 'women-watches';
    document.getElementById('aliexpressStock').value = 50;
}

