// ===== ADMIN AUTH =====
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'temple@2026' // Change this!
};

function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function login(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUser', username);
        window.location.href = 'dashboard.html';
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUser');
    window.location.href = 'login.html';
}

// ===== DASHBOARD STATS =====
async function loadDashboardStats() {
    if (!checkAuth()) return;
    
    try {
        const data = await fetchAPI('getDashboardStats');
        
        if (data) {
            document.getElementById('totalEvents').textContent = data.totalEvents || 0;
            document.getElementById('totalPhotos').textContent = data.totalPhotos || 0;
            document.getElementById('totalVideos').textContent = data.totalVideos || 0;
            document.getElementById('latestEvent').textContent = data.latestEvent || 'None';
        }
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ===== EVENT MANAGEMENT =====
async function loadAdminEvents() {
    if (!checkAuth()) return;
    
    const container = document.getElementById('adminEventsContainer');
    if (!container) return;
    
    try {
        const data = await fetchAPI('getEvents');
        
        if (data && data.events) {
            container.innerHTML = data.events.map(event => `
                <tr>
                    <td>${event.id}</td>
                    <td>${event.name}</td>
                    <td>${formatDate(event.date)}</td>
                    <td><span class="badge ${event.status === 'published' ? 'bg-success' : 'bg-warning'}">${event.status || 'draft'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editEvent('${event.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEvent('${event.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error loading admin events:', error);
    }
}

function addEvent(eventData) {
    // Implement event addition via API
    alert('Add event functionality - connect to Google Apps Script');
}

function editEvent(eventId) {
    // Implement event editing
    alert(`Edit event ${eventId}`);
}

async function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        try {
            const result = await fetchAPI('deleteEvent', { id: eventId });
            if (result && result.success) {
                alert('Event deleted successfully');
                loadAdminEvents();
            } else {
                alert('Failed to delete event');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Error deleting event');
        }
    }
}

// ===== PHOTO MANAGEMENT =====
async function loadAdminPhotos() {
    if (!checkAuth()) return;
    
    const container = document.getElementById('adminPhotosContainer');
    if (!container) return;
    
    try {
        const data = await fetchAPI('getPhotos');
        
        if (data && data.photos) {
            container.innerHTML = data.photos.map(photo => `
                <tr>
                    <td><img src="${photo.thumbnail || photo.url}" alt="${photo.title}" style="width: 60px; height: 60px; object-fit: cover;" /></td>
                    <td>${photo.title || 'Untitled'}</td>
                    <td>${photo.event || 'None'}</td>
                    <td>${formatDate(photo.date)}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deletePhoto('${photo.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error loading admin photos:', error);
    }
}

function uploadPhotos(formData) {
    // Implement photo upload via API
    alert('Upload photos functionality - connect to Google Apps Script');
}

async function deletePhoto(photoId) {
    if (confirm('Are you sure you want to delete this photo?')) {
        try {
            const result = await fetchAPI('deletePhoto', { id: photoId });
            if (result && result.success) {
                alert('Photo deleted successfully');
                loadAdminPhotos();
            } else {
                alert('Failed to delete photo');
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
            alert('Error deleting photo');
        }
    }
}

// ===== VIDEO MANAGEMENT =====
async function loadAdminVideos() {
    if (!checkAuth()) return;
    
    const container = document.getElementById('adminVideosContainer');
    if (!container) return;
    
    try {
        const data = await fetchAPI('getVideos');
        
        if (data && data.videos) {
            container.innerHTML = data.videos.map(video => `
                <tr>
                    <td>${video.title}</td>
                    <td>${video.event || 'None'}</td>
                    <td><a href="${video.url}" target="_blank" class="btn btn-sm btn-primary"><i class="bi bi-play"></i></a></td>
                    <td>${formatDate(video.date)}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteVideo('${video.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error loading admin videos:', error);
    }
}

function addVideo(videoData) {
    // Implement video addition via API
    alert('Add video functionality - connect to Google Apps Script');
}

async function deleteVideo(videoId) {
    if (confirm('Are you sure you want to delete this video?')) {
        try {
            const result = await fetchAPI('deleteVideo', { id: videoId });
            if (result && result.success) {
                alert('Video deleted successfully');
                loadAdminVideos();
            } else {
                alert('Failed to delete video');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Error deleting video');
        }
    }
}

// ===== INIT ADMIN =====
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin/')) {
        if (!window.location.pathname.includes('login.html') && !checkAuth()) {
            return;
        }
        
        // Load admin data based on page
        if (window.location.pathname.includes('dashboard.html')) {
            loadDashboardStats();
        } else if (window.location.pathname.includes('events.html')) {
            loadAdminEvents();
        } else if (window.location.pathname.includes('photos.html')) {
            loadAdminPhotos();
        } else if (window.location.pathname.includes('videos.html')) {
            loadAdminVideos();
        }
    }
});