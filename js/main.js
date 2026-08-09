// ===== AOS INIT =====
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 100,
        disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
});

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('mainNav');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== FLOATING PETALS =====
function createPetals() {
    const container = document.getElementById('petalsContainer');
    if (!container) return;
    
    const petalCount = window.innerWidth < 768 ? 8 : 15;
    
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDelay = Math.random() * 15 + 's';
        petal.style.animationDuration = (15 + Math.random() * 10) + 's';
        petal.style.width = (15 + Math.random() * 15) + 'px';
        petal.style.height = (15 + Math.random() * 15) + 'px';
        container.appendChild(petal);
    }
}

// ===== GOLDEN PARTICLES =====
function createParticles() {
    const container = document.querySelector('.golden-particles');
    if (!container) return;
    
    const particleCount = window.innerWidth < 768 ? 20 : 40;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 4) + 's';
        container.appendChild(particle);
    }
}

// ===== CONFIG =====
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbyl_rwaPTR8IL6Xt4T7qbnaB6kFpnmqHiz9_JHCzTjerouhqHHQlyU17orIFu5oYmSk/exec',
    GOOGLE_DRIVE_FOLDER: '1YOUR_DRIVE_FOLDER_ID',
    TEMPLE_NAME: 'శ్రీ శ్రీ కట్లమ్మ అమ్మవారి ఆలయం',
    VILLAGE: 'చిన్నమలం',
    DISTRICT: 'పశ్చిమ గోదావరి',
    STATE: 'ఆంధ్రప్రదేశ్'
};

// ===== UTILITY FUNCTIONS =====
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString('te-IN', options);
}

function truncateText(text, length = 100) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

function getYearFromDate(dateString) {
    return new Date(dateString).getFullYear();
}

// ===== LOADING SPINNER =====
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-gold" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading...</p>
            </div>
        `;
    }
}

function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}

// ===== API CALLS =====
async function fetchAPI(endpoint, params = {}) {
    const url = new URL(CONFIG.API_URL);
    url.searchParams.append('action', endpoint);
    
    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });
    
    try {
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('API request failed');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    createPetals();
    createParticles();
    
    // Close mobile menu on link click
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navCollapse = document.getElementById('navMenu');
    const bsCollapse = new bootstrap.Collapse(navCollapse, { toggle: false });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                bsCollapse.hide();
            }
        });
    });
});

// ===== EXPOSE FOR OTHER SCRIPTS =====
window.CONFIG = CONFIG;
window.fetchAPI = fetchAPI;
window.formatDate = formatDate;
window.truncateText = truncateText;
window.getYearFromDate = getYearFromDate;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
