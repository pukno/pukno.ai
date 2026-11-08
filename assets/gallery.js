(() => {
    const dialog = document.querySelector('.gallery-dialog');
    if (!dialog) return;
    const viewerImage = dialog.querySelector('img');
    const stage = dialog.querySelector('.gallery-dialog-stage');
    const zoom = dialog.querySelector('[data-gallery-zoom]');
    let activeGallery;
    let opener;
    let savedOverflow;

    const resetZoom = () => {
        zoom.setAttribute('aria-pressed', 'false');
        stage.classList.remove('is-zoomed');
        stage.tabIndex = -1;
        stage.scrollTo(0, 0);
    };
    const updateViewer = () => {
        const slide = activeGallery.slides[activeGallery.index];
        resetZoom();
        viewerImage.src = slide.querySelector('img').src;
        viewerImage.alt = slide.querySelector('img').alt;
        dialog.querySelector('[data-viewer-caption]').textContent = slide.dataset.caption;
        dialog.querySelector('[data-viewer-count]').textContent = `${document.getElementById(activeGallery.panel.getAttribute('aria-labelledby')).textContent.trim()} · ${activeGallery.index + 1} / ${activeGallery.slides.length}`;
    };
    const swipe = (element, move, enabled = () => true) => {
        let start;
        let swiped = false;
        element.addEventListener('touchstart', event => {
            swiped = false;
            start = enabled() && event.touches.length === 1
                ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
        }, { passive: true });
        element.addEventListener('touchend', event => {
            if (!start || !event.changedTouches.length) return;
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            start = null;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                swiped = true;
                move(dx < 0 ? 1 : -1);
            }
        }, { passive: true });
        element.addEventListener('touchcancel', () => { start = null; });
        // A swipe must not also activate the screenshot's enlarge button.
        element.addEventListener('click', event => {
            if (swiped) { event.preventDefault(); event.stopPropagation(); swiped = false; }
        }, true);
    };

    const galleries = [...document.querySelectorAll('[data-gallery]')].map(element => ({
        element,
        panel: element.closest('.today-panel'),
        slides: [...element.querySelectorAll('.gallery-slide')],
        index: 0
    }));
    const moveGallery = (gallery, direction) => {
        const nextIndex = gallery.index + direction;
        const focused = document.activeElement;
        let target = gallery;
        let index = nextIndex;
        if (nextIndex < 0 || nextIndex >= gallery.slides.length) {
            const groupIndex = galleries.indexOf(gallery);
            target = galleries[(groupIndex + direction + galleries.length) % galleries.length];
            index = direction > 0 ? 0 : target.slides.length - 1;
            document.getElementById(target.panel.getAttribute('aria-labelledby')).click();
        }
        if (dialog.open) activeGallery = target;
        target.show(index);
        // Keep keyboard focus on the matching control when its old panel is hidden.
        if (!dialog.open && gallery.element.contains(focused)) {
            const control = focused.closest('[data-gallery-prev], [data-gallery-next]');
            const destination = control
                ? target.element.querySelector(control.hasAttribute('data-gallery-prev') ? '[data-gallery-prev]' : '[data-gallery-next]')
                : target.slides[target.index];
            destination.focus({ preventScroll: true });
        }
    };
    galleries.forEach(gallery => {
        const { element } = gallery;
        gallery.show = index => {
            gallery.index = (index + gallery.slides.length) % gallery.slides.length;
            gallery.slides.forEach((slide, i) => { slide.hidden = i !== gallery.index; });
            element.querySelector('[data-gallery-caption]').textContent = gallery.slides[gallery.index].dataset.caption;
            element.querySelector('[data-gallery-count]').textContent = `${gallery.index + 1} / ${gallery.slides.length}`;
            if (dialog.open && activeGallery === gallery) updateViewer();
        };
        const tab = document.getElementById(gallery.panel.getAttribute('aria-labelledby'));
        tab.addEventListener('click', () => gallery.show(0));
        const move = direction => moveGallery(gallery, direction);
        element.querySelector('[data-gallery-prev]').addEventListener('click', () => move(-1));
        element.querySelector('[data-gallery-next]').addEventListener('click', () => move(1));
        element.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
            event.preventDefault();
            move(event.key === 'ArrowRight' ? 1 : -1);
        });
        swipe(element.querySelector('.gallery-viewport'), move);
        gallery.slides.forEach(slide => slide.addEventListener('click', () => {
            activeGallery = gallery;
            opener = slide;
            updateViewer();
            savedOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            dialog.showModal();
            dialog.querySelector('[data-gallery-close]').focus();
        }));
    });
    const moveViewer = direction => moveGallery(activeGallery, direction);
    dialog.querySelector('[data-viewer-prev]').addEventListener('click', () => moveViewer(-1));
    dialog.querySelector('[data-viewer-next]').addEventListener('click', () => moveViewer(1));
    dialog.querySelector('[data-gallery-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('keydown', event => {
        if (stage.classList.contains('is-zoomed')) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            moveViewer(event.key === 'ArrowRight' ? 1 : -1);
        }
    });
    dialog.addEventListener('close', () => {
        document.body.style.overflow = savedOverflow;
        resetZoom();
        // Navigation in the viewer may have hidden the original opener.
        (activeGallery.slides[activeGallery.index] || opener).focus({ preventScroll: true });
    });
    zoom.addEventListener('click', () => {
        const expanded = zoom.getAttribute('aria-pressed') !== 'true';
        zoom.setAttribute('aria-pressed', String(expanded));
        stage.classList.toggle('is-zoomed', expanded);
        stage.tabIndex = expanded ? 0 : -1;
        if (expanded) stage.focus();
    });
    swipe(stage, moveViewer, () => !stage.classList.contains('is-zoomed'));
})();
