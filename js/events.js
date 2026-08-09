// ===== EVENTS =====
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    
    // Year filter
    const yearFilter = document.getElementById('yearFilter');
    if (yearFilter) {
        yearFilter.addEventListener('change', function() {
            loadEvents(this.value);
        });
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshEvents');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadEvents();
        });
    }
});

async function loadEvents(year = 'all') {
    const container = document.getElementById('allEventsContainer') || document.getElementById('eventCardsContainer');
    if (!container) return;
    
    showLoading(container.id);
    
    try {
        const data = await fetchAPI('getEvents', { year });
        
        if (!data || !data.events || data.events.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-calendar-x display-1 text-muted"></i>
                    <h4 class="mt-3">No events found</h4>
                    <p class="text-muted">Check back later for upcoming events.</p>
                </div>
            `;
            return;
        }
        
        // Update event count
        const countBadge = document.getElementById('eventCount');
        if (countBadge) {
            countBadge.textContent = `${data.events.length} Events`;
        }
        
        // Render events
        container.innerHTML = data.events.map(event => createEventCard(event)).join('');
        
        // Re-init AOS for new elements
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
        
    } catch (error) {
        console.error('Error loading events:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
                <h4 class="mt-3">Failed to load events</h4>
                <button class="btn btn-gold mt-3" onclick="loadEvents()">Try Again</button>
            </div>
        `;
    }
}

function createEventCard(event) {
    const photoCount = event.photos ? event.photos.length : 0;
    const videoCount = event.videos ? event.videos.length : 0;
    
    return `
        <div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="${Math.random() * 200}">
            <div class="event-card h-100">
                <img src="${event.coverImage || 'assets/images/event-default.jpg'}" 
                     class="card-img-top" alt="${event.name}" 
                     loading="lazy" />
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${event.name}</h5>
                    <p class="event-date"><i class="bi bi-clock"></i> ${formatDate(event.date)}</p>
                    <p class="card-text flex-grow-1">${truncateText(event.description, 80)}</p>
                    <div class="event-meta mb-2">
                        <span><i class="bi bi-images"></i> ${photoCount}</span>
                        <span><i class="bi bi-play-circle"></i> ${videoCount}</span>
                    </div>
                    <a href="event-details.html?id=${event.id}" class="btn btn-outline-gold btn-sm mt-2 align-self-start">
                        View Event
                    </a>
                </div>
            </div>
        </div>
    `;
}

// ===== EVENT DETAILS =====
async function loadEventDetails() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');
    
    if (!eventId) {
        window.location.href = 'events.html';
        return;
    }
    
    const container = document.getElementById('eventDetailsContainer');
    if (!container) return;
    
    showLoading(container.id);
    
    try {
        const data = await fetchAPI('getEventDetails', { id: eventId });
        
        if (!data || !data.event) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-exclamation-circle display-1 text-warning"></i>
                    <h4 class="mt-3">Event not found</h4>
                    <a href="events.html" class="btn btn-gold mt-3">Back to Events</a>
                </div>
            `;
            return;
        }
        
        const event = data.event;
        
        container.innerHTML = `
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    <img src="${event.coverImage || 'assets/images/event-default.jpg'}" 
                         class="img-fluid rounded-4 shadow-lg mb-4" 
                         alt="${event.name}" />
                    
                    <h1 class="display-5 fw-bold">${event.name}</h1>
                    <p class="text-gold"><i class="bi bi-calendar3"></i> ${formatDate(event.date)}</p>
                    
                    <div class="event-description mt-4">
                        <h5>About the Event</h5>
                        <p>${event.description || 'No description available.'}</p>
                    </div>
                    
                    ${event.highlights ? `
                        <div class="event-highlights mt-4">
                            <h5>Event Highlights</h5>
                            <ul>
                                ${event.highlights.map(h => `<li>${h}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${event.photos && event.photos.length > 0 ? `
                        <div class="event-photos mt-4">
                            <h5>Photo Gallery <span class="badge bg-gold">${event.photos.length}</span></h5>
                            <div class="row g-3">
                                ${event.photos.map(photo => `
                                    <div class="col-6 col-md-4">
                                        <img src="${photo.url}" class="img-fluid rounded-3" alt="${photo.title}" 
                                             loading="lazy" />
                                    </div>
                                `).join('')}
                            </div>
                            <a href="gallery.html?event=${event.id}" class="btn btn-outline-gold btn-sm mt-3">
                                View Full Gallery
                            </a>
                        </div>
                    ` : ''}
                    
                    ${event.videos && event.videos.length > 0 ? `
                        <div class="event-videos mt-4">
                            <h5>Videos <span class="badge bg-gold">${event.videos.length}</span></h5>
                            <div class="row g-3">
                                ${event.videos.map(video => `
                                    <div class="col-md-6">
                                        <div class="video-card" onclick="playVideo('${video.url}')">
                                            <img src="${video.thumbnail || 'assets/images/video-thumb.jpg'}" 
                                                 class="img-fluid rounded-3" alt="${video.title}" />
                                            <div class="play-btn"><i class="bi bi-play-fill"></i></div>
                                        </div>
                                        <p class="mt-1 small">${video.title}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
        
    } catch (error) {
        console.error('Error loading event details:', error);
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
                <h4 class="mt-3">Failed to load event details</h4>
                <button class="btn btn-gold mt-3" onclick="loadEventDetails()">Try Again</button>
            </div>
        `;
    }
}