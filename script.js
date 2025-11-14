let servers = [];
let currentCategory = 'all';

// Load servers from localStorage
function loadServers() {
    const saved = localStorage.getItem('discordHubServers');
    if (saved) {
        servers = JSON.parse(saved);
    }
    renderServers();
}

// Save servers to localStorage
function saveServers() {
    localStorage.setItem('discordHubServers', JSON.stringify(servers));
}

// Custom cursor
const cursor = document.querySelector('.cursor');
const cursorGlow = document.querySelector('.cursor-glow');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// Cursor hover effect on interactive elements
function updateInteractiveElements() {
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .server-card, .category-tag, .empty-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });
}

// Render servers
function renderServers(serversToRender = servers) {
    const grid = document.getElementById('serversGrid');
    
    if (serversToRender.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🌟</div>
                <div class="empty-text">No Servers Yet</div>
                <div class="empty-subtext">Be the first to add your Discord server to the hub!</div>
                <button class="empty-btn" onclick="document.getElementById('addServerBtn').click()">Add Your Server</button>
            </div>
        `;
        updateInteractiveElements();
        return;
    }

    grid.innerHTML = serversToRender.map((server, index) => `
        <div class="server-card" data-index="${index}">
            <div class="server-header">
                <div class="server-icon">${server.icon}</div>
                <div class="server-info">
                    <div class="server-name">${server.name}</div>
                    <div class="server-members">
                        <span class="online-dot"></span>
                        ${server.online.toLocaleString()} online • ${server.members.toLocaleString()} members
                    </div>
                </div>
            </div>
            <div class="server-description">${server.description}</div>
            <div class="server-tags">
                <span class="server-tag">${server.category.charAt(0).toUpperCase() + server.category.slice(1)}</span>
                ${server.tags ? server.tags.map(tag => `<span class="server-tag">${tag}</span>`).join('') : ''}
            </div>
            <div class="server-footer">
                <div class="server-stats">
                    <span>📅 ${getTimeAgo(server.addedDate)}</span>
                </div>
                <button class="join-btn" data-invite="${server.invite}">Join Server</button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.join-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.open(btn.dataset.invite, '_blank');
        });
    });

    updateInteractiveElements();
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (let [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }
    return 'Just now';
}

// Category filter
document.querySelectorAll('.category-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        
        currentCategory = tag.dataset.category;
        
        if (currentCategory === 'all') {
            renderServers(servers);
        } else {
            const filtered = servers.filter(s => s.category === currentCategory);
            renderServers(filtered);
        }
    });
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = servers.filter(s => 
        s.name.toLowerCase().includes(searchTerm) || 
        s.description.toLowerCase().includes(searchTerm) ||
        s.category.toLowerCase().includes(searchTerm)
    );
    renderServers(filtered);
});

// Modal
const modal = document.getElementById('addServerModal');
const addServerBtn = document.getElementById('addServerBtn');
const modalClose = document.getElementById('modalClose');

addServerBtn.addEventListener('click', () => {
    modal.classList.add('show');
});

modalClose.addEventListener('click', () => {
    modal.classList.remove('show');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// Submit server
document.getElementById('submitServer').addEventListener('click', () => {
    const name = document.getElementById('serverName').value.trim();
    const icon = document.getElementById('serverIcon').value.trim() || '◆';
    const desc = document.getElementById('serverDesc').value.trim();
    const category = document.getElementById('serverCategory').value;
    const members = parseInt(document.getElementById('serverMembers').value) || 0;
    const invite = document.getElementById('serverInvite').value.trim();

    if (!name || !desc || !category || !members || !invite) {
        showToast('Please fill in all required fields');
        return;
    }

    if (!invite.includes('discord.gg/') && !invite.includes('discord.com/invite/')) {
        showToast('Please enter a valid Discord invite link');
        return;
    }

    const newServer = {
        name,
        icon,
        members,
        online: Math.floor(members * 0.3),
        description: desc,
        category,
        tags: ['New'],
        invite,
        addedDate: new Date().toISOString()
    };

    servers.unshift(newServer);
    saveServers();
    renderServers(currentCategory === 'all' ? servers : servers.filter(s => s.category === currentCategory));
    
    modal.classList.remove('show');
    showToast('Server added successfully! 🎉');

    // Clear form
    document.getElementById('serverName').value = '';
    document.getElementById('serverIcon').value = '';
    document.getElementById('serverDesc').value = '';
    document.getElementById('serverCategory').value = '';
    document.getElementById('serverMembers').value = '';
    document.getElementById('serverInvite').value = '';
});

// Toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastText = document.querySelector('.toast-text');
    toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initial load
loadServers();
updateInteractiveElements();
