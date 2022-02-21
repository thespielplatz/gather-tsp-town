let Modal = {}

Modal.show = (modalId) => {
    const $el = document.getElementById(modalId);
    if ($el) $el.classList.add('is-active');
}

Modal.close = (modalId) => {
    const $el = document.getElementById(modalId);
    if ($el) Modal.closeByEl($el)
}

Modal.closeByEl = ($el) => {
    if ($el) $el.classList.remove('is-active');
}

Modal.closeAll = () => {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
        Modal.close($modal);
    });
}

Modal.init = (modalId) => {
    const $el = document.getElementById(modalId);

    // Add a click event on various child elements to close the parent modal
    ($el.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
        const $target = $close.closest('.modal');
        $close.addEventListener('click', () => {
            Modal.closeByEl($target);
        });
    });

    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
        const e = event || window.event;

        if (e.keyCode === 27) { // Escape key
            Modal.closeAll()
        }
    });
}

