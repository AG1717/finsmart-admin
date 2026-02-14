// Configuration
// const API_URL = 'https://finsmart-api.geniusmedia.net/api/v1'; // Production Hostilo
// const API_URL = 'https://finsmart-backend-foc5.onrender.com/api/v1'; // Render.com
const API_URL = 'http://localhost:3000/api/v1'; // Local testing

// State
let accessToken = localStorage.getItem('adminToken') || '';
let currentPeriod = '7days';
let autoRefreshInterval = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const adminEmail = document.getElementById('adminEmail');
const loadingState = document.getElementById('loadingState');
const metricsContent = document.getElementById('metricsContent');
const periodBtns = document.querySelectorAll('.period-btn');
const refreshBtn = document.getElementById('refreshBtn');
const lastUpdateEl = document.getElementById('lastUpdate');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (accessToken) {
        showDashboard();
    } else {
        showLogin();
    }
});

// Show/Hide Screens
function showLogin() {
    loginScreen.classList.remove('hidden');
    dashboardScreen.classList.add('hidden');
}

function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    const userEmail = localStorage.getItem('adminEmail') || 'Admin';
    adminEmail.textContent = userEmail;
    fetchMetrics(currentPeriod);

    // Start auto-refresh every 30 seconds
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(() => {
        fetchMetrics(currentPeriod);
    }, 30000);
}

// Refresh button click
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('spinning');
        fetchMetrics(currentPeriod).then(() => {
            setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
        });
    });
}

// Update last update time
function updateLastUpdateTime() {
    if (lastUpdateEl) {
        const now = new Date();
        lastUpdateEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }
}

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/admin-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            accessToken = data.data.tokens.accessToken;
            localStorage.setItem('adminToken', accessToken);
            localStorage.setItem('adminEmail', email);
            showToast('Login successful!', 'success');
            showDashboard();
        } else {
            showError(data.error?.message || 'Login failed');
        }
    } catch (error) {
        showError('Network error. Is the backend running?');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    accessToken = '';
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    showToast('Logged out successfully', 'success');
    showLogin();
});

// Period Selection
periodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        periodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPeriod = btn.dataset.period;
        fetchMetrics(currentPeriod);
    });
});

// Fetch Metrics
async function fetchMetrics(period = '7days') {
    loadingState.classList.remove('hidden');
    metricsContent.classList.add('hidden');

    try {
        console.log('[DEBUG] Fetching metrics for period:', period);
        const response = await fetch(`${API_URL}/analytics/metrics?period=${period}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            cache: 'no-store'
        });

        console.log('[DEBUG] Metrics response status:', response.status);
        const data = await response.json();
        console.log('[DEBUG] Metrics data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('[DEBUG] Total goals from metrics:', data.data?.overview?.totalGoals);
            displayMetrics(data.data);
            loadingState.classList.add('hidden');
            metricsContent.classList.remove('hidden');
            updateLastUpdateTime();
        } else {
            if (response.status === 401) {
                showToast('Session expired. Please login again.', 'error');
                accessToken = '';
                localStorage.removeItem('adminToken');
                showLogin();
            } else {
                console.error('[DEBUG] Metrics error:', data);
                showToast('Failed to load metrics', 'error');
            }
        }
    } catch (error) {
        console.error('Error fetching metrics:', error);
        showToast('Network error loading metrics', 'error');
        loadingState.classList.add('hidden');
    }
}

// Display Metrics
function displayMetrics(metrics) {
    // Overview
    document.getElementById('totalUsers').textContent = metrics.overview?.totalUsers || 0;
    document.getElementById('newUsers').textContent = metrics.overview?.newUsers || 0;
    document.getElementById('totalGoals').textContent = metrics.overview?.totalGoals || 0;
    document.getElementById('completedGoals').textContent = metrics.overview?.completedGoals || 0;

    // Success Metrics
    document.getElementById('goalsCreationRate').textContent = metrics.successMetrics?.goalsCreationRate || '0%';
    document.getElementById('retentionRate').textContent = metrics.successMetrics?.retentionRate || '0%';
    document.getElementById('goalSuccessRate').textContent = metrics.successMetrics?.goalSuccessRate || '0%';
    document.getElementById('avgWeeklyUsage').textContent = metrics.successMetrics?.avgWeeklyUsage || 0;

    // DAU Chart
    renderDAUChart(metrics.dailyActiveUsers || []);

    // Events Breakdown
    renderEventsList(metrics.eventsByType || {});

    // Goals Distribution
    renderGoalsByCategory(metrics.goalDistribution?.byCategory || []);
    renderGoalsByTimeframe(metrics.goalDistribution?.byTimeframe || []);
}

// Render DAU Chart
function renderDAUChart(dailyData) {
    const chartContainer = document.getElementById('dauChart');
    chartContainer.innerHTML = '';

    if (dailyData.length === 0) {
        chartContainer.innerHTML = '<p style="text-align: center; color: #666;">No data available</p>';
        return;
    }

    const maxValue = Math.max(...dailyData.map(d => d.count), 1);

    dailyData.forEach(day => {
        const barHeight = (day.count / maxValue) * 180;
        const date = new Date(day.date);
        const label = `${date.getDate()}/${date.getMonth() + 1}`;

        const barDiv = document.createElement('div');
        barDiv.className = 'chart-bar';
        barDiv.innerHTML = `
            <div class="chart-bar-value">${day.count}</div>
            <div class="chart-bar-fill" style="height: ${barHeight || 5}px"></div>
            <div class="chart-bar-label">${label}</div>
        `;
        chartContainer.appendChild(barDiv);
    });
}

// Render Events List
function renderEventsList(events) {
    const container = document.getElementById('eventsBreakdown');
    container.innerHTML = '';

    const eventEntries = Object.entries(events);
    if (eventEntries.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No events recorded</p>';
        return;
    }

    eventEntries.forEach(([eventType, count]) => {
        const row = document.createElement('div');
        row.className = 'metric-row';
        row.innerHTML = `
            <span class="metric-label">${formatEventName(eventType)}</span>
            <span class="metric-value">${count}</span>
        `;
        container.appendChild(row);
    });
}

// Render Goals by Category
function renderGoalsByCategory(categories) {
    const container = document.getElementById('goalsByCategory');
    container.innerHTML = '';

    if (categories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No goals recorded</p>';
        return;
    }

    categories.forEach(cat => {
        const row = document.createElement('div');
        row.className = 'metric-row';
        row.innerHTML = `
            <span class="metric-label">${capitalize(cat._id)}</span>
            <span class="metric-value">${cat.count} goals</span>
        `;
        container.appendChild(row);
    });
}

// Render Goals by Timeframe
function renderGoalsByTimeframe(timeframes) {
    const container = document.getElementById('goalsByTimeframe');
    container.innerHTML = '';

    if (timeframes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No goals recorded</p>';
        return;
    }

    timeframes.forEach(tf => {
        const row = document.createElement('div');
        row.className = 'metric-row';
        row.innerHTML = `
            <span class="metric-label">${capitalize(tf._id)}-term</span>
            <span class="metric-value">${tf.count} goals</span>
        `;
        container.appendChild(row);
    });
}

// Helper Functions
function formatEventName(eventType) {
    return eventType
        .split('_')
        .map(word => capitalize(word))
        .join(' ');
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
    setTimeout(() => {
        loginError.classList.remove('show');
    }, 5000);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ============================================
// TAB NAVIGATION
// ============================================

const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');

navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        // Update active tab button
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update active tab content
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Load data based on tab
        if (tabName === 'users') {
            fetchUsers();
        } else if (tabName === 'goals') {
            fetchGoals();
        } else if (tabName === 'notifications') {
            fetchNotifications();
            fetchNotificationStats();
        }
    });
});

// Update unread count periodically
setInterval(() => {
    if (accessToken) {
        updateUnreadCount();
    }
}, 30000); // Every 30 seconds

// ============================================
// USERS MANAGEMENT
// ============================================

let currentUsersPage = 1;
let currentUsersFilters = {};

// Fetch Users
async function fetchUsers(page = 1) {
    const usersLoading = document.getElementById('usersLoading');
    const usersTable = document.getElementById('usersTable');

    usersLoading.classList.remove('hidden');
    usersTable.innerHTML = '';

    try {
        const search = document.getElementById('userSearch').value.trim();
        const role = document.getElementById('roleFilter').value;

        const params = new URLSearchParams({
            page,
            limit: 10,
            ...(search && { search }),
            ...(role && { role })
        });

        const response = await fetch(`${API_URL}/admin/users?${params}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            cache: 'no-store'
        });

        const data = await response.json();

        if (response.ok) {
            if (data.data && data.data.users) {
                currentUsersPage = page;
                currentUsersFilters = { search, role };
                displayUsers(data.data.users, data.data.pagination);
            } else {
                console.error('Invalid response structure:', data);
                showToast('Invalid data format received', 'error');
            }
        } else {
            if (response.status === 403) {
                showToast('Access denied. Admin privileges required.', 'error');
            } else {
                showToast(data.error?.message || 'Failed to load users', 'error');
            }
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        showToast('Network error loading users: ' + error.message, 'error');
    } finally {
        usersLoading.classList.add('hidden');
    }
}

// Display Users Table
function displayUsers(users, pagination) {
    const usersTable = document.getElementById('usersTable');

    if (users.length === 0) {
        usersTable.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No users found</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';

    table.innerHTML = `
        <thead>
            <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Goals</th>
                <th>Total Saved</th>
                <th>Joined</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${users.map(user => `
                <tr>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td><span class="role-badge ${user.role}">${user.role.toUpperCase()}</span></td>
                    <td>${user.stats?.totalGoals || 0} (${user.stats?.completedGoals || 0} completed)</td>
                    <td>$${(user.stats?.totalSaved || 0).toFixed(2)}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="action-btn edit" onclick="openEditUserModal('${user._id}')">Edit</button>
                        <button class="action-btn delete" onclick="deleteUser('${user._id}', '${user.email}')">Delete</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;

    usersTable.appendChild(table);
    displayUsersPagination(pagination);
}

// Display Users Pagination
function displayUsersPagination(pagination) {
    const paginationContainer = document.getElementById('usersPagination');
    paginationContainer.innerHTML = '';

    if (pagination.totalPages <= 1) return;

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Previous';
    prevBtn.disabled = pagination.currentPage === 1;
    prevBtn.onclick = () => fetchUsers(pagination.currentPage - 1);
    paginationContainer.appendChild(prevBtn);

    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
    paginationContainer.appendChild(pageInfo);

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = pagination.currentPage === pagination.totalPages;
    nextBtn.onclick = () => fetchUsers(pagination.currentPage + 1);
    paginationContainer.appendChild(nextBtn);
}

// Search Users
document.getElementById('searchUsersBtn').addEventListener('click', () => {
    fetchUsers(1);
});

// Delete User
async function deleteUser(userId, userEmail) {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"?\n\nThis will also delete all their goals and cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showToast(`User "${userEmail}" deleted successfully`, 'success');
            fetchUsers(currentUsersPage);
        } else {
            showToast(data.error?.message || 'Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Network error deleting user', 'error');
    }
}

// Edit User Modal
let currentEditUserId = null;

function openEditUserModal(userId) {
    currentEditUserId = userId;

    // Find user data
    fetch(`${API_URL}/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const user = data.data.user;
            document.getElementById('editUserId').value = user._id;
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editRole').value = user.role;

            document.getElementById('editUserModal').classList.remove('hidden');
        }
    })
    .catch(err => {
        console.error('Error loading user:', err);
        showToast('Failed to load user details', 'error');
    });
}

// Close Edit User Modal
document.getElementById('closeEditUser').addEventListener('click', () => {
    document.getElementById('editUserModal').classList.add('hidden');
});

document.getElementById('cancelEditUser').addEventListener('click', () => {
    document.getElementById('editUserModal').classList.add('hidden');
});

// Submit Edit User Form
document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const role = document.getElementById('editRole').value;

    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ username, email, role })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('User updated successfully', 'success');
            document.getElementById('editUserModal').classList.add('hidden');
            fetchUsers(currentUsersPage);
        } else {
            showToast(data.error?.message || 'Failed to update user', 'error');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showToast('Network error updating user', 'error');
    }
});

// ============================================
// GOALS MANAGEMENT
// ============================================

let currentGoalsPage = 1;
let currentGoalsFilters = {};

// Fetch Goals
async function fetchGoals(page = 1) {
    const goalsLoading = document.getElementById('goalsLoading');
    const goalsTable = document.getElementById('goalsTable');

    goalsLoading.classList.remove('hidden');
    goalsTable.innerHTML = '';

    try {
        const category = document.getElementById('categoryFilter').value;
        const timeframe = document.getElementById('timeframeFilter').value;
        const status = document.getElementById('statusFilter').value;

        const params = new URLSearchParams({
            page,
            limit: 10,
            ...(category && { category }),
            ...(timeframe && { timeframe }),
            ...(status && { status })
        });

        console.log('[DEBUG] Fetching goals with params:', params.toString());
        console.log('[DEBUG] Token:', accessToken ? accessToken.substring(0, 20) + '...' : 'NO TOKEN');

        const response = await fetch(`${API_URL}/admin/goals?${params}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            cache: 'no-store'
        });

        console.log('[DEBUG] Response status:', response.status);
        const data = await response.json();
        console.log('[DEBUG] Response data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            if (data.data && data.data.goals) {
                console.log('[DEBUG] Goals count:', data.data.goals.length);
                console.log('[DEBUG] Pagination:', data.data.pagination);
                currentGoalsPage = page;
                currentGoalsFilters = { category, timeframe, status };
                displayGoals(data.data.goals, data.data.pagination);
            } else {
                console.error('Invalid response structure:', data);
                showToast('Invalid data format received', 'error');
            }
        } else {
            console.error('[DEBUG] Error response:', data);
            showToast(data.error?.message || 'Failed to load goals', 'error');
        }
    } catch (error) {
        console.error('Error fetching goals:', error);
        showToast('Network error loading goals: ' + error.message, 'error');
    } finally {
        goalsLoading.classList.add('hidden');
    }
}

// Display Goals Table
function displayGoals(goals, pagination) {
    const goalsTable = document.getElementById('goalsTable');

    if (goals.length === 0) {
        goalsTable.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No goals found</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';

    table.innerHTML = `
        <thead>
            <tr>
                <th>Goal Name</th>
                <th>User</th>
                <th>Category</th>
                <th>Timeframe</th>
                <th>Progress</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${goals.map(goal => `
                <tr>
                    <td>${goal.name}</td>
                    <td>${goal.userId?.username || 'Unknown'}</td>
                    <td>${capitalize(goal.category)}</td>
                    <td>${capitalize(goal.timeframe)}-term</td>
                    <td>${goal.progress?.percentage?.toFixed(1) || 0}%</td>
                    <td>${goal.amounts?.currency?.symbol || '$'}${goal.amounts?.current?.toFixed(2) || 0} / ${goal.amounts?.currency?.symbol || '$'}${goal.amounts?.target?.toFixed(2) || 0}</td>
                    <td><span class="status-badge ${goal.status}">${capitalize(goal.status)}</span></td>
                    <td>
                        <button class="action-btn edit" onclick="openEditGoalModal('${goal._id}')">Edit</button>
                        <button class="action-btn delete" onclick="deleteGoal('${goal._id}', '${goal.name}')">Delete</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;

    goalsTable.appendChild(table);
    displayGoalsPagination(pagination);
}

// Display Goals Pagination
function displayGoalsPagination(pagination) {
    const paginationContainer = document.getElementById('goalsPagination');
    paginationContainer.innerHTML = '';

    if (pagination.totalPages <= 1) return;

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Previous';
    prevBtn.disabled = pagination.currentPage === 1;
    prevBtn.onclick = () => fetchGoals(pagination.currentPage - 1);
    paginationContainer.appendChild(prevBtn);

    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
    paginationContainer.appendChild(pageInfo);

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = pagination.currentPage === pagination.totalPages;
    nextBtn.onclick = () => fetchGoals(pagination.currentPage + 1);
    paginationContainer.appendChild(nextBtn);
}

// Search Goals
document.getElementById('searchGoalsBtn').addEventListener('click', () => {
    fetchGoals(1);
});

// Delete Goal
async function deleteGoal(goalId, goalName) {
    if (!confirm(`Are you sure you want to delete goal "${goalName}"?\n\nThis action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/goals/${goalId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showToast(`Goal "${goalName}" deleted successfully`, 'success');
            fetchGoals(currentGoalsPage);
        } else {
            showToast(data.error?.message || 'Failed to delete goal', 'error');
        }
    } catch (error) {
        console.error('Error deleting goal:', error);
        showToast('Network error deleting goal', 'error');
    }
}

// Edit Goal Modal
let currentEditGoalId = null;
let currentGoalData = null;

function openEditGoalModal(goalId) {
    currentEditGoalId = goalId;

    // Find goal in current list
    const goalsTable = document.getElementById('goalsTable');

    // Fetch full goal data
    fetch(`${API_URL}/goals/${goalId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentGoalData = data.data;
            const goal = data.data;

            document.getElementById('editGoalId').value = goal._id;
            document.getElementById('editGoalName').value = goal.name;
            document.getElementById('editGoalCurrent').value = goal.amounts?.current || 0;
            document.getElementById('editGoalTarget').value = goal.amounts?.target || 0;
            document.getElementById('editGoalStatus').value = goal.status;

            document.getElementById('editGoalModal').classList.remove('hidden');
        }
    })
    .catch(err => {
        console.error('Error loading goal:', err);
        showToast('Failed to load goal details', 'error');
    });
}

// Close Edit Goal Modal
document.getElementById('closeEditGoal').addEventListener('click', () => {
    document.getElementById('editGoalModal').classList.add('hidden');
});

document.getElementById('cancelEditGoal').addEventListener('click', () => {
    document.getElementById('editGoalModal').classList.add('hidden');
});

// Submit Edit Goal Form
document.getElementById('editGoalForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const goalId = document.getElementById('editGoalId').value;
    const name = document.getElementById('editGoalName').value;
    const current = parseFloat(document.getElementById('editGoalCurrent').value);
    const target = parseFloat(document.getElementById('editGoalTarget').value);
    const status = document.getElementById('editGoalStatus').value;

    try {
        const response = await fetch(`${API_URL}/admin/goals/${goalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                name,
                amounts: {
                    current,
                    target,
                    currency: currentGoalData.amounts?.currency || { code: 'USD', symbol: '$' }
                },
                status
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Goal updated successfully', 'success');
            document.getElementById('editGoalModal').classList.add('hidden');
            fetchGoals(currentGoalsPage);
        } else {
            showToast(data.error?.message || 'Failed to update goal', 'error');
        }
    } catch (error) {
        console.error('Error updating goal:', error);
        showToast('Network error updating goal', 'error');
    }
});

// ============================================
// NOTIFICATIONS MANAGEMENT
// ============================================

let currentNotificationsPage = 1;
let currentNotificationsFilters = {};

// Fetch Notifications
async function fetchNotifications(page = 1) {
    const notificationsLoading = document.getElementById('notificationsLoading');
    const notificationsList = document.getElementById('notificationsList');

    notificationsLoading.classList.remove('hidden');
    notificationsList.innerHTML = '';

    try {
        const type = document.getElementById('notifTypeFilter').value;
        const severity = document.getElementById('notifSeverityFilter').value;
        const isRead = document.getElementById('notifReadFilter').value;

        const params = new URLSearchParams({
            page,
            limit: 10,
            ...(type && { type }),
            ...(severity && { severity }),
            ...(isRead && { isRead })
        });

        console.log('[DEBUG] Fetching notifications with params:', params.toString());

        const response = await fetch(`${API_URL}/admin/notifications?${params}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            cache: 'no-store'
        });

        console.log('[DEBUG] Notifications response status:', response.status);
        const data = await response.json();
        console.log('[DEBUG] Notifications data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            if (data.data && data.data.notifications) {
                console.log('[DEBUG] Notifications count:', data.data.notifications.length);
                currentNotificationsPage = page;
                currentNotificationsFilters = { type, severity, isRead };
                displayNotifications(data.data.notifications, data.data.pagination);
            } else {
                console.error('Invalid response structure:', data);
                showToast('Invalid data format received', 'error');
            }
        } else {
            console.error('[DEBUG] Notifications error:', data);
            showToast(data.error?.message || 'Failed to load notifications', 'error');
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        showToast('Network error loading notifications: ' + error.message, 'error');
    } finally {
        notificationsLoading.classList.add('hidden');
    }
}

// Display Notifications
function displayNotifications(notifications, pagination) {
    const container = document.getElementById('notificationsList');
    container.innerHTML = '';

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="notifications-empty">
                <div class="notifications-empty-icon">🔔</div>
                <div class="notifications-empty-text">No notifications</div>
                <div class="notifications-empty-subtext">You're all caught up!</div>
            </div>
        `;
        return;
    }

    notifications.forEach(notif => {
        const div = document.createElement('div');
        div.className = `notification-item ${!notif.isRead ? 'unread' : ''} severity-${notif.severity}`;

        const timeAgo = formatTimeAgo(notif.createdAt);

        div.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${notif.title}</div>
                <div class="notification-message">${notif.message}</div>
                <div class="notification-meta">
                    <span class="notification-time">${timeAgo}</span>
                    <span class="notification-type-badge">${formatNotificationType(notif.type)}</span>
                </div>
            </div>
            <div class="notification-actions">
                ${!notif.isRead ? `<button class="mark-read-btn" onclick="markNotificationAsRead('${notif._id}')">Mark Read</button>` : ''}
                <button class="delete-btn" onclick="deleteNotification('${notif._id}')">×</button>
            </div>
        `;
        container.appendChild(div);
    });

    displayNotificationsPagination(pagination);
}

// Display Notifications Pagination
function displayNotificationsPagination(pagination) {
    const paginationContainer = document.getElementById('notificationsPagination');
    paginationContainer.innerHTML = '';

    if (pagination.totalPages <= 1) return;

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Previous';
    prevBtn.disabled = pagination.currentPage === 1;
    prevBtn.onclick = () => fetchNotifications(pagination.currentPage - 1);
    paginationContainer.appendChild(prevBtn);

    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
    paginationContainer.appendChild(pageInfo);

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = pagination.currentPage === pagination.totalPages;
    nextBtn.onclick = () => fetchNotifications(pagination.currentPage + 1);
    paginationContainer.appendChild(nextBtn);
}

// Filter Notifications
document.getElementById('filterNotificationsBtn').addEventListener('click', () => {
    fetchNotifications(1);
});

// Mark Notification as Read
async function markNotificationAsRead(id) {
    try {
        const response = await fetch(`${API_URL}/admin/notifications/${id}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            fetchNotifications(currentNotificationsPage);
            updateUnreadCount();
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Mark All as Read
document.getElementById('markAllReadBtn').addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/admin/notifications/mark-all-read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showToast(`${data.data.modifiedCount} notifications marked as read`, 'success');
            fetchNotifications(currentNotificationsPage);
            updateUnreadCount();
        }
    } catch (error) {
        console.error('Error marking all as read:', error);
        showToast('Failed to mark all as read', 'error');
    }
});

// Delete Notification
async function deleteNotification(id) {
    if (!confirm('Delete this notification?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/notifications/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            showToast('Notification deleted', 'success');
            fetchNotifications(currentNotificationsPage);
            updateUnreadCount();
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        showToast('Failed to delete notification', 'error');
    }
}

// Cleanup Old Notifications
document.getElementById('cleanupNotificationsBtn').addEventListener('click', async () => {
    if (!confirm('This will delete all read notifications older than 30 days. Continue?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/notifications/cleanup`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showToast(`${data.data.deletedCount} old notifications cleaned`, 'success');
            fetchNotifications(currentNotificationsPage);
        }
    } catch (error) {
        console.error('Error cleaning notifications:', error);
        showToast('Failed to cleanup notifications', 'error');
    }
});

// Update Unread Count
async function updateUnreadCount() {
    try {
        const response = await fetch(`${API_URL}/admin/notifications/unread-count`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            cache: 'no-store'
        });

        const data = await response.json();

        if (response.ok) {
            const count = data.data.count;

            // Update header badge
            const headerBadge = document.getElementById('headerUnreadCount');
            if (count > 0) {
                headerBadge.textContent = count;
                headerBadge.classList.remove('hidden');
            } else {
                headerBadge.classList.add('hidden');
            }

            // Update display in notifications tab
            const displayEl = document.getElementById('unreadCountDisplay');
            if (displayEl) {
                displayEl.textContent = count === 0 ? 'No unread' : `${count} unread`;
            }
        }
    } catch (error) {
        console.error('Error updating unread count:', error);
    }
}

// Fetch Notification Stats
async function fetchNotificationStats() {
    try {
        const response = await fetch(`${API_URL}/admin/notifications/stats`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            cache: 'no-store'
        });

        const data = await response.json();

        if (response.ok) {
            const stats = data.data;
            document.getElementById('totalNotifications').textContent = stats.total || 0;
            document.getElementById('unreadNotifications').textContent = stats.unread || 0;
            document.getElementById('recent24hNotifications').textContent = stats.recent24h || 0;
        }
    } catch (error) {
        console.error('Error fetching notification stats:', error);
    }
}

// Helper: Format Notification Type
function formatNotificationType(type) {
    const types = {
        'user_registered': 'New User',
        'user_first_goal': 'First Goal',
        'goal_completed': 'Goal Done',
        'goal_high_value': 'High Value',
        'user_milestone': 'Milestone',
        'admin_action': 'Admin Action',
        'suspicious_activity': 'Alert'
    };
    return types[type] || type;
}

// Helper: Format Time Ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString();
}

// Initialize unread count on dashboard load
if (accessToken) {
    updateUnreadCount();
}
