function setLang(lang) {
    document.body.classList.toggle('lang-en', lang === 'en');
    document.getElementById('btn-de').classList.toggle('active', lang === 'de');
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

let deferredPrompt;
const installBtn = document.getElementById('install-button');
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') installBtn.style.display = 'none';
        deferredPrompt = null;
    }
});

function toggleModal(id) {
    const m = document.getElementById('modal-' + id);
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
}

function closeModals(e) {
    if (e.target.classList.contains('modal'))
        e.target.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    ['data-as-772', 'data-as-772-en'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = 'rentielhcA lraK';
        }
    });
});
