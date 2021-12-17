var theModal, theModalCallback;

$(() => {
    const html = `<div id="theModal" class="modal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Modal title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Modal body text goes here.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" action="save">Save</button>
      </div>
    </div>
  </div>
</div>`;

    $("body").append(html);
    theModal = new bootstrap.Modal(document.getElementById('theModal'));
    $("#theModal .modal-footer [action=save]").click(() => {
        console.log("save");
        theModal.hide();
        if (theModalCallback) theModalCallback();
        theModalCallback = undefined;
    });
});

function showModal(title, body, callback) {
    $(".modal-title").text(title);
    $(".modal-body").html(body);
    theModalCallback = callback;

    theModal.show();
}

