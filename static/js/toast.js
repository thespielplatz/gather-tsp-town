$(() => {
    const html = `<div class="toast-container position-absolute p-3 bottom-0 end-0" id="toastPlacement">
        <div id="singleToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header text-white">
                <img src="/static/img/tsp_20x20.png" class="rounded me-2" alt="...">
                <strong class="me-auto toast-header-text"></strong>
                <small>now</small>
                <button type="button" class="btn-close text-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                Hello, world! This is a toast message.
            </div>
        </div>
    </div>`;

    $("body").append(html);
    $(".toast-header-text").text($("title").text());

    var toastElList = [].slice.call(document.querySelectorAll('.toast'))
    var toastList = toastElList.map(function (toastEl) {
        return new bootstrap.Toast(toastEl, {});
    });
});

function showToast(data) {
    return
    let status = "default";
    let message = "I did as you asked!";

    if (typeof data === "string") {
        message = data;
    } else if (data !== undefined) {
        if ("message" in data) message = data.message;
        if ("status" in data) status = data.status;
    }

    $("#singleToast .toast-body").text(message);
    $("#singleToast .toast-header").removeClass("bg-success");
    $("#singleToast .toast-header").removeClass("bg-danger");

    switch (status) {
        case "success": $("#singleToast .toast-header").addClass("bg-success"); break;
        case "error": $("#singleToast .toast-header").addClass("bg-danger"); break;
        case "ok":
        default: $("#singleToast .toast-header").addClass("bg-secondary"); break;
    }

    $("#singleToast").toast('show');
}

