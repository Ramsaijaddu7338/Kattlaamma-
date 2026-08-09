// ===== VIDEOS =====
let videoData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadVideos();
    
    const yearFilter = document.getElementById('videoYearFilter');
    const eventFilter = document.getElementById('videoEventFilter');
    const searchInput = document.getElementById('videoSearch');
    
    if (yearFilter) yearFilter.addEventListener('change', applyVideoFilters);
    if (eventFilter) eventFilter.addEventListener('change', applyVideoFilters);
    if (searchInput) searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') applyVideoFilters();
    });
});

async function loadVideos() {
    const container = document.getElementById('videoContainer');
    if (!container) return;
    
    showLoading(container.id);
    
    try {
        const data = await fetchAPI('getVideos');
        
        if (!data || !data.videos || data.videos.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-film display-1 text-muted"></i>
                    <h4 class="mt-3">No videos found</h4>
                    <p class="text-muted">Videos will appear here as they are added.</p>
                </div>
            `;
            return;
        }
        
        videoData = data.videos;
        renderVideos(videoData);
        
    } catch (error) {
        console.error('Error loading videos:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
                <h4 class="mt-3">Failed to load videos</h4>
                <button class="btn btn-gold mt-3" onclick="loadVideos()">Try Again</button>
            </div>
        `;
    }
}

function renderVideos(videos) {
    const container = document.getElementById('videoContainer');
    if (!container) return;
    
    container.innerHTML = videos.map(video => `
        <div class="col-md-6 col-lg-4" data-aos="fade-up">
            <div class="video-card" onclick="playVideo('${video.url}', '${video.title}', '${video.description || ''}', '${video.date || ''}')">
                <img src="${video.thumbnail || 'assets/images/video-thumb.jpg'}" 
                     alt="${video.title}" 
                     loading="lazy"
                     class="img-fluid rounded-3" />
                <div class="play-btn"><i class="bi bi-play-fill"></i></div>
                <div class="video-info p-2">
                    <h6 class="mb-0 text-white">${truncateText(video.title, 40)}</h6>
                    <small class="text-light">${video.event || ''}</small>
                </div>
            </div>
        </div>
    `).join('');
    
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

function applyVideoFilters() {
    const yearFilter = document.getElementById('videoYearFilter');
    const eventFilter = document.getElementById('videoEventFilter');
    const searchInput = document.getElementById('videoSearch');
    
    let filtered = [...videoData];
    
    if (yearFilter && yearFilter.value !== 'all') {
        filtered = filtered.filter(v => getYearFromDate(v.date) == yearFilter.value);
    }
    
    if (eventFilter && eventFilter.value !== 'all') {
        filtered = filtered.filter(v => v.event && v.event.toLowerCase().includes(eventFilter.value));
    }
    
    if (searchInput && searchInput.value.trim()) {
        const search = searchInput.value.toLowerCase().trim();
        filtered = filtered.filter(v => 
            (v.title && v.title.toLowerCase().includes(search)) ||
            (v.description && v.description.toLowerCase().includes(search)) ||
            (v.event && v.event.toLowerCase().includes(search))
        );
    }
    
    renderVideos(filtered);
}

// ===== VIDEO PLAYER =====
function playVideo(url, title, description, date) {
    const modal = new bootstrap.Modal(document.getElementById('videoModal'));
    const player = document.getElementById('videoPlayer');
    const modalTitle = document.getElementById('videoModalTitle');
    const modalDesc = document.getElementById('videoModalDescription');
    const modalDate = document.getElementById('videoModalDate');
    
    // Handle YouTube URLs
    let embedUrl = url;
    if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
    } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
    }
    
    player.src = embedUrl;
    modalTitle.textContent = title || 'Video';
    modalDesc.textContent = description || '';
    modalDate.textContent = date ? formatDate(date) : '';
    
    modal.show();
}

// Clean up video on modal close
document.addEventListener('DOMContentLoaded', function() {
    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        videoModal.addEventListener('hidden.bs.modal', function() {
            const player = document.getElementById('videoPlayer');
            if (player) {
                player.src = '';
            }
        });
    }
});