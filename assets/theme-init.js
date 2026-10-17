// Restore the explicit choice before painting; dark remains the default.
try {
    if (localStorage.getItem('pukno-theme') === 'light') {
        document.documentElement.dataset.theme = 'light';
        document.querySelector('meta[name="theme-color"]').content = '#f2f2f4';
    }
} catch (_) { /* Storage may be unavailable in private or restricted contexts. */ }
