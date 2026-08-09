// ===== GALLERY =====
let galleryData = [];
let currentPage = 1;
const itemsPerPage = 12;

document.addEventListener('DOMContentLoaded', function() {
    loadGallery();
    
    const yearFilter = document.getElementById('galleryYearFilter');
    const eventFilter = document.getElementById('galleryEventFilter');
    const searchInput = document.getElementById('gallerySearch');
    const searchBtn = document.getElementById('searchBtn');
    const loadMoreBtn = document.getElementById('loadMoreGallery');
    
    if (yearFilter) yearFilter.addEventListener('change', applyFilters);
    if (eventFilter) eventFilter.addEventListener('change', applyFilters);
    if (searchInput) searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') applyFilters();
    });
    if (searchBtn) searchBtn.addEventListener('click', applyFilters);
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMoreGallery);
});

async function loadGallery() {
    const container = document.getElementById('galleryContainer');
    if (!container) return;
    
    showLoading(container.id);
    
    try {
        const data = await fetchAPI('getPhotos', { 
            limit: itemsPerPage,
            page: currentPage 
        });
        
        if (!data || !data.photos || data.photos.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-image display-1 text-muted"></i>
                    <h4 class="mt-3">No photos found</h4>
                    <p class="text-muted">Photos will appear here as they are added.</p>
                </div>
            `;
            return;
        }
        
        galleryData = data.photos;
        renderGallery(galleryData);
        
        const loadMoreBtn = document.getElementById('loadMoreGallery');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = data.hasMore ? 'inline-block' : 'none';
        }
        
    } catch (error) {
        console.error('Error loading gallery:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
                <h4 class="mt-3">Failed to load gallery</h4>
                <button class="btn btn-gold mt-3" onclick="loadGallery()">Try Again</button>
            </div>
        `;
    }
}

function renderGallery(photos) {
    const container = document.getElementById('galleryContainer');
    if (!container) return;
    
    if (!photos || photos.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-image display-1 text-muted"></i>
                <h4 class="mt-3">No photos found</h4>
                <p class="text-muted">Upload photos from the admin panel.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = photos.map(photo => {
        let imgUrl = photo.url || photo.direct_url || '';
        if (photo.drive_file_id) {
            imgUrl = `https://drive.google.com/uc?export=view&id=${photo.drive_file_id}`;
        }
        if (!imgUrl) imgUrl = 'assets/images/placeholder.jpg';
        
        return `
            <div class="col-6 col-md-4 col-lg-3 gallery-item" data-aos="fade-up">
                <div onclick="openLightbox('${photo.id}')">
                    <img src="${imgUrl}" 
                         alt="${photo.title || 'Temple photo'}" 
                         loading="lazy"
                         class="img-fluid rounded-3" 
                         onerror="this.src='assets/images/placeholder.jpg'" />
                    <div class="overlay">
                        <h6 class="mb-0">${truncateText(photo.title || 'Untitled', 30)}</h6>
                        <small>${photo.event || ''}</small>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

function applyFilters() {
    const yearFilter = document.getElementById('galleryYearFilter');
    const eventFilter = document.getElementById('galleryEventFilter');
    const searchInput = document.getElementById('gallerySearch');
    
    let filtered = [...galleryData];
    
    if (yearFilter && yearFilter.value !== 'all') {
        filtered = filtered.filter(p => getYearFromDate(p.date) == yearFilter.value);
    }
    
    if (eventFilter && eventFilter.value !== 'all') {
        filtered = filtered.filter(p => p.event && p.event.toLowerCase().includes(eventFilter.value));
    }
    
    if (searchInput && searchInput.value.trim()) {
        const search = searchInput.value.toLowerCase().trim();
        filtered = filtered.filter(p => 
            (p.title && p.title.toLowerCase().includes(search)) ||
            (p.description && p.description.toLowerCase().includes(search)) ||
            (p.event && p.event.toLowerCase().includes(search))
        );
    }
    
    renderGallery(filtered);
}

function loadMoreGallery() {
    currentPage++;
    loadGallery();
}

// ===== LIGHTBOX =====
let lightboxImages = [];
let currentImageIndex = 0;

function openLightbox(photoId) {
    const photo = galleryData.find(p => p.id === photoId);
    if (!photo) return;
    
    const container = document.getElementById('galleryContainer');
    const items = container.querySelectorAll('.gallery-item');
    lightboxImages = [];
    
    items.forEach(item => {
        const img = item.querySelector('img');
        if (img) {
            lightboxImages.push({
                src: img.src,
                title: img.alt || 'Temple photo'
            });
        }
    });
    
    currentImageIndex = lightboxImages.findIndex(img => img.src.includes(photoId));
    if (currentImageIndex === -1) currentImageIndex = 0;
    
    updateLightbox();
    
    const modal = new bootstrap.Modal(document.getElementById('lightboxModal'));
    modal.show();
}

function updateLightbox() {
    const img = document.getElementById('lightboxImage');
    const title = document.getElementById('lightboxTitle');
    const counter = document.getElementById('lightboxCounter');
    
    if (img && lightboxImages[currentImageIndex]) {
        img.src = lightboxImages[currentImageIndex].src;
        title.textContent = lightboxImages[currentImageIndex].title;
        counter.textContent = `${currentImageIndex + 1} / ${lightboxImages.length}`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentImageIndex > 0) {
                currentImageIndex--;
                updateLightbox();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentImageIndex < lightboxImages.length - 1) {
                currentImageIndex++;
                updateLightbox();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (document.getElementById('lightboxModal')?.classList?.contains('show')) {
            if (e.key === 'ArrowLeft') {
                document.getElementById('prevImage')?.click();
            } else if (e.key === 'ArrowRight') {
                document.getElementById('nextImage')?.click();
            }
        }
    });
});
