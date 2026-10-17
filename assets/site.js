const ui = JSON.parse(document.getElementById("ui-text").textContent);

const themeToggle = document.querySelector('.theme-toggle');
const applyTheme = theme => {
    document.documentElement.dataset.theme = theme;
    const label = theme === 'light' ? ui.dark : ui.light;
    themeToggle.setAttribute('aria-label', label);
    themeToggle.title = label;
    document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#f2f2f4' : '#000000';
    document.querySelectorAll('img[data-light-src]').forEach(img => {
        img.src = theme === 'light' ? img.dataset.lightSrc : img.dataset.darkSrc;
    });
};
applyTheme(document.documentElement.dataset.theme);
themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(theme);
    try { localStorage.setItem('pukno-theme', theme); } catch (_) { /* The toggle still works without storage. */ }
});

var tallyDocument = document;
var tallyEmbedUrl = "https://tally.so/widgets/embed.js";
var loadTallyEmbeds = function () {
    if (typeof Tally !== "undefined") {
        Tally.loadEmbeds();
    } else {
        tallyDocument.querySelectorAll("iframe[data-tally-src]:not([src])").forEach(function (iframe) {
            iframe.src = iframe.dataset.tallySrc;
        });
    }
};
if (typeof Tally !== "undefined") {
    loadTallyEmbeds();
} else if (tallyDocument.querySelector('script[src="' + tallyEmbedUrl + '"]') === null) {
    var tallyScript = tallyDocument.createElement("script");
    tallyScript.src = tallyEmbedUrl;
    tallyScript.onload = loadTallyEmbeds;
    tallyScript.onerror = loadTallyEmbeds;
    tallyDocument.body.appendChild(tallyScript);
}

const ob = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ob.unobserve(e.target) } }), { threshold: .12 }); document.querySelectorAll('.reveal').forEach(el => ob.observe(el));

const heroSlider = document.getElementById('hero-slider');
const heroSlides = [...heroSlider.querySelectorAll('.hero-slide')];
const heroSlideButtons = [...heroSlider.querySelectorAll('[data-slide]')];
const heroSlideCaption = document.getElementById('hero-slide-caption');
const heroViewport = heroSlider.querySelector('.screen-viewport');
let heroSlideIndex = 0;

// Keep accessible numbering accurate when optional slides are re-enabled.
heroSlides.forEach((slide, i) => {
    slide.setAttribute('aria-label', slide.getAttribute('aria-label')
        .replace(/^\d+ (?:of|από) \d+:/, `${i + 1} ${ui.of} ${heroSlides.length}:`));
});

const showHeroSlide = index => {
    heroSlideIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, i) => { slide.hidden = i !== heroSlideIndex; });
    heroSlideButtons.forEach((button, i) => {
        button.setAttribute('aria-pressed', String(i === heroSlideIndex));
    });
    heroSlideCaption.textContent = heroSlides[heroSlideIndex].dataset.caption;
};

heroSlideButtons.forEach((button, i) => {
    button.addEventListener('click', () => showHeroSlide(i));
    button.addEventListener('keydown', event => {
        let nextIndex;
        if (event.key === 'ArrowRight') nextIndex = heroSlideIndex + 1;
        else if (event.key === 'ArrowLeft') nextIndex = heroSlideIndex - 1;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = heroSlides.length - 1;
        else return;
        event.preventDefault();
        showHeroSlide(nextIndex);
        heroSlideButtons[heroSlideIndex].focus();
    });
});
heroSlider.querySelector('[data-slide-prev]').addEventListener('click', () => showHeroSlide(heroSlideIndex - 1));
heroSlider.querySelector('[data-slide-next]').addEventListener('click', () => showHeroSlide(heroSlideIndex + 1));

let heroTouchStart = null;
heroViewport.addEventListener('touchstart', event => {
    heroTouchStart = event.touches.length === 1
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
}, { passive: true });
heroViewport.addEventListener('touchend', event => {
    if (!heroTouchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - heroTouchStart.x;
    const dy = event.changedTouches[0].clientY - heroTouchStart.y;
    heroTouchStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        showHeroSlide(heroSlideIndex + (dx < 0 ? 1 : -1));
    }
}, { passive: true });
heroViewport.addEventListener('touchcancel', () => { heroTouchStart = null; }, { passive: true });

const navHeader = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobile-navigation');
const navLinks = [...document.querySelectorAll('[data-nav-link]')];
const navSections = ['context', 'privacy', 'product', 'future', 'faq']
    .map(id => document.getElementById(id)).filter(Boolean);

const setMenuOpen = open => {
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? ui.close : ui.open);
    mobileMenu.hidden = !open;
};

navToggle.addEventListener('click', () => {
    setMenuOpen(navToggle.getAttribute('aria-expanded') !== 'true');
});

mobileMenu.addEventListener('click', event => {
    if (event.target.closest('a')) setMenuOpen(false);
});

document.addEventListener('click', event => {
    if (!navHeader.contains(event.target)) setMenuOpen(false);
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        navToggle.focus();
    }
});

const desktopNav = window.matchMedia('(min-width: 981px)');
const resetMobileMenu = event => {
    if (event.matches) setMenuOpen(false);
};
desktopNav.addEventListener('change', resetMobileMenu);

const setActiveSection = id => {
    navLinks.forEach(link => {
        if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    });
};

let navFrame;
const updateActiveSection = () => {
    navFrame = null;
    const activationLine = 96;
    let activeId = '';
    navSections.forEach(section => {
        if (section.getBoundingClientRect().top <= activationLine) activeId = section.id;
    });
    setActiveSection(activeId);
};

const requestNavUpdate = () => {
    if (!navFrame) navFrame = requestAnimationFrame(updateActiveSection);
};

window.addEventListener('scroll', requestNavUpdate, { passive: true });
window.addEventListener('resize', requestNavUpdate);
updateActiveSection();

const qs = ui.queries; let qi = 0; const qe = document.getElementById('queryText'); if (qe) setInterval(() => { qi = (qi + 1) % qs.length; qe.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-5px)' }], { duration: 180, fill: 'forwards' }).onfinish = () => { qe.textContent = qs[qi]; qe.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, fill: 'forwards' }) } }, 4200);

const researchAudio = document.getElementById('research-audio');
const researchAudioToggle = document.getElementById('research-audio-toggle');
const researchAudioGlyph = document.getElementById('research-audio-glyph');
const researchAudioProgress = document.getElementById('research-audio-progress');
const researchAudioElapsed = document.getElementById('research-audio-elapsed');
const researchAudioDuration = document.getElementById('research-audio-duration');

const formatAudioTime = seconds => {
    if (!Number.isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
};

const setResearchAudioPlaying = isPlaying => {
    researchAudioGlyph.textContent = isPlaying ? '❚❚' : '▶';
    researchAudioToggle.setAttribute('aria-label', `${isPlaying ? ui.pause : ui.play} Midnight City by M83`);
    researchAudioToggle.setAttribute('aria-pressed', String(isPlaying));
};

const updateResearchAudioProgress = () => {
    researchAudioElapsed.textContent = formatAudioTime(researchAudio.currentTime);
    researchAudioDuration.textContent = formatAudioTime(researchAudio.duration);
    const progress = Number.isFinite(researchAudio.duration) && researchAudio.duration > 0
        ? (researchAudio.currentTime / researchAudio.duration) * 100
        : 0;
    researchAudioProgress.style.width = `${progress}%`;
};

if (researchAudio && researchAudioToggle && researchAudioGlyph && researchAudioProgress && researchAudioElapsed && researchAudioDuration) {
    researchAudioToggle.addEventListener('click', () => {
        if (researchAudio.paused) researchAudio.play().catch(() => setResearchAudioPlaying(false));
        else researchAudio.pause();
    });
    researchAudio.addEventListener('play', () => setResearchAudioPlaying(true));
    researchAudio.addEventListener('pause', () => setResearchAudioPlaying(false));
    researchAudio.addEventListener('loadedmetadata', updateResearchAudioProgress);
    researchAudio.addEventListener('timeupdate', updateResearchAudioProgress);
    researchAudio.addEventListener('ended', () => setResearchAudioPlaying(false));
}

// Both static pages have matching anchors. Keep the reader near the same section.
const languageToggle = document.querySelector('.language-toggle');
const languagePage = languageToggle.getAttribute('href');
const updateLanguageLink = () => {
    let anchor = location.hash === '#notify' ? '#notify' : '#top';
    if (anchor !== '#notify') {
        document.querySelectorAll('main > section[id]').forEach(section => {
            if (section.getBoundingClientRect().top <= innerHeight * .45) anchor = `#${section.id}`;
        });
    }
    languageToggle.href = languagePage + anchor;
};
languageToggle.addEventListener('click', updateLanguageLink);
languageToggle.addEventListener('focus', updateLanguageLink);
languageToggle.addEventListener('pointerdown', updateLanguageLink);
