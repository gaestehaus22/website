if (window.self !== window.top) {
    window.top.location = window.self.location;
}

const images = {
    gallery: [
        {
            src: 'assets/images/bedrooms.webp',
            thumb: 'assets/images/bedrooms553x737.webp',
            alt: 'Schlafzimmer'
        },
        {
            src: 'assets/images/livingroom.webp',
            thumb: 'assets/images/livingroom-553x425.webp',
            alt: 'Wohnzimmer'
        },
        {
            src: 'assets/images/kitchen.webp',
            thumb: 'assets/images/kitchen-553x736.webp',
            alt: 'Küche'
        },
        {
            src: 'assets/images/bathroom.webp',
            thumb: 'assets/images/bathroom-553x415.webp',
            alt: 'Badezimmer'
        }
    ]
};

function setLang(lang) {
    document.body.classList.toggle('lang-en', lang === 'en');
    document.getElementById('btn-de').classList.toggle('active', lang === 'de');
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
}

function toggleModal(id) {
    const m = document.getElementById('modal-' + id);
    const isOpen = m.style.display === 'flex';
    m.style.display = isOpen ? 'none' : 'flex';
}

function closeModals(e) {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        document.getElementById('lightbox').style.display = 'none';
    }
});

function openNavigation() {
    window.open('https://www.google.com/maps/dir/?api=1&destination=Eichenstraße+22,+4481+Asten', '_blank');
}

document.getElementById('check-dist-btn').addEventListener('click', () => {
    const distInfo = document.getElementById('dist-info');
    if (!navigator.geolocation) {
        distInfo.textContent = 'Geolocation nicht verfügbar.';
        distInfo.style.display = 'block';
        return;
    }
    distInfo.textContent = 'Standort wird ermittelt…';
    distInfo.style.display = 'block';
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat1 = pos.coords.latitude;
            const lon1 = pos.coords.longitude;
            const lat2 = 48.223023,
                lon2 = 14.4182762;
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) ** 2;
            const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distInfo.textContent = `Ca. ${dist.toFixed(1)} km von dir entfernt`;
        },
        () => {
            distInfo.textContent = 'Standort konnte nicht ermittelt werden.';
        }
    );
});

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('gallery-container');
    const lb = document.getElementById('lightbox');
    const lbi = document.getElementById('lightbox-img');
    images.gallery.forEach(img => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        const el = document.createElement('img');
        el.src = img.thumb;
        el.alt = img.alt;
        el.loading = 'lazy';
        el.width = 400;
        el.height = 300;
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            lbi.src = img.src;
            lbi.alt = img.alt;
            lb.style.display = 'flex';
        });
        div.appendChild(el);
        container.appendChild(div);
    });
});

let deferredPrompt;
const installBtn = document.getElementById('install-button');
const installLabelDe = installBtn.querySelector('.label-de');
const installLabelEn = installBtn.querySelector('.label-en');

function isPwaDisplayMode() {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.navigator.standalone === true;
}

async function isAppInstalled() {
    if (localStorage.getItem('gaestehaus22-installed') === '1') {
        return true;
    }
    if (navigator.getInstalledRelatedApps) {
        try {
            const relatedApps = await navigator.getInstalledRelatedApps();
            if (relatedApps.length > 0) {
                localStorage.setItem('gaestehaus22-installed', '1');
                return true;
            }
        } catch (err) {
            console.warn('getInstalledRelatedApps failed', err);
        }
    }
    return false;
}

async function updateInstallButton() {
    const standalone = isPwaDisplayMode();
    const installed = await isAppInstalled();

    if (standalone) {
        installBtn.dataset.mode = 'close';
        installLabelDe.textContent = 'Schließen';
        installLabelEn.textContent = 'Close';
    } else if (installed) {
        installBtn.dataset.mode = 'open-as';
        installLabelDe.textContent = 'Als App öffnen...';
        installLabelEn.textContent = 'Open as...';
    } else {
        installBtn.dataset.mode = 'install';
        installLabelDe.textContent = 'App';
        installLabelEn.textContent = 'Install';
    }

    // swap icon according to mode
    try {
        const useEl = installBtn.querySelector('use');
        if (useEl) {
            if (standalone) useEl.setAttribute('href', '#lucide-x');
            else useEl.setAttribute('href', '#lucide-icon-download-cloud');
        }
    } catch (err) {
        console.warn('Could not swap install button icon', err);
    }

    installBtn.style.display = 'flex';
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    updateInstallButton();
});

installBtn.addEventListener('click', async () => {
    const mode = installBtn.dataset.mode;

    if (mode === 'close') {
        window.close();
        return;
    }

    if (mode === 'open-as') {
        // Try to open via Android Intent (works on Chrome for Android)
        try {
            const host = window.location.hostname;
            const path = window.location.pathname + window.location.search + window.location.hash;
            const intentUrl = `intent://${host}${path}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
            window.location.href = intentUrl;
        } catch (err) {
            console.warn('Intent navigation failed', err);
            alert('Öffnen als App nicht möglich.');
        }
        return;
    }

    if (deferredPrompt) {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (choiceResult.outcome === 'accepted') {
            localStorage.setItem('gaestehaus22-installed', '1');
        }
        updateInstallButton();
        return;
    }

    alert('Die App kann über das Browser-Menü oder den Installationsbanner installiert werden.');
});

window.addEventListener('appinstalled', () => {
    localStorage.setItem('gaestehaus22-installed', '1');
    updateInstallButton();
});

window.addEventListener('load', updateInstallButton);
window.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateInstallButton();
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW aktiv'))
            .catch(err => console.log('SW Fehler', err));
    });
}

document.querySelectorAll('.email-obfuscated').forEach(el => {
    el.addEventListener('click', function () {
        const contact = this.getAttribute('data-contact');
        const server = this.getAttribute('data-server');
        const extension = this.getAttribute('data-extension');
        const email = `${contact}@${server}.${extension}`;

        window.location.href = `mailto:${email}`;
    });
});

(function () {
    const encodedData = {
        phone: ['2b', '34', '33', '20', '36', '36', '34', '20', '32', '34', '34', '30', '36', '32',
            '35'],
        email: {
            user: ['69', '6e', '66', '6f'],
            domain: ['67', '61', '65', '73', '74', '65', '68', '61', '75', '73', '32', '32'],
            tld: ['61', '74']
        }
    };

    function decodeHex(arr) {
        return arr.map(code => String.fromCharCode(parseInt(code, 16))).join('');
    }

    function buildPhoneNumber() {
        return decodeHex(encodedData.phone);
    }

    function buildEmail() {
        const user = decodeHex(encodedData.email.user);
        const domain = decodeHex(encodedData.email.domain);
        const tld = decodeHex(encodedData.email.tld);
        return `${user}@${domain}.${tld}`;
    }

    function insertPhone(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const phoneNumber = buildPhoneNumber();
            const phoneLink = document.createElement('a');
            const cleanPhone = phoneNumber.replace(/\s/g, '');
            phoneLink.href = `tel:${cleanPhone}`;
            phoneLink.textContent = phoneNumber;
            phoneLink.style.color = 'var(--link)';
            phoneLink.style.textDecoration = 'underline';
            container.appendChild(phoneLink);
        }
    }

    function insertEmail(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const email = buildEmail();
            const emailLink = document.createElement('a');
            emailLink.href = `mailto:${email}`;
            emailLink.textContent = email;
            emailLink.style.color = 'var(--link)';
            emailLink.style.textDecoration = 'underline';
            container.appendChild(emailLink);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        insertPhone('impressum-phone');
        insertEmail('impressum-email');
    });
})();
