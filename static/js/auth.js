let theAuthModal, theAuthModalCallback;
let tsp = {};
let auth = {};

$(() => {
    const html = `<div id="theAuthModal" class="modal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div data-auth="header" class="modal-header">
        <p class="header-auth">Authentification&nbsp;</p>
      </div>
      <div data-auth="body" class="modal-body">
        <p>You could not be identified.<br>Please reopen this page!</p>
      </div>
    </div>
  </div>
</div>`;

    // Surrounding Page
    $("[data-footer=auth]").text("Status: Who are you?");

    // Auth Modal
    auth.objId = $("#objId").val();

    $("body").append(html);

    auth.modal = new bootstrap.Modal(document.getElementById('theAuthModal'));

    $("[data-auth=body]").hide();

    auth.startTime = Date.now();
    auth.player = undefined;
    auth.retrys = 4 * 3;
    auth.interval = 250;
    auth.callback = undefined;

    function authenticate() {
        $.get(`/auth/auth/${auth.objId}/${auth.startTime}`, (data) => {
            console.log(data);
            if (data.status === "ok") {
                authSuccess(data.player)
                return;
            }

            if (data.status === "error" || auth.retrys <= 0) {
                notAuthenticated();
                return;
            }

            // Retry
            auth.retrys--;
            setTimeout(authenticate, auth.interval);
        });
    }

    $.get(`/auth/identified`, (data) => {
        console.log(data);
        if (data.status === "ok") {
            authSuccess(data.player)
            return;
        }

        auth.modal.show();

        authenticate();
    });

    function authSuccess(player) {
        console.log("authSuccess");
        auth.modal.hide();

        auth.player = player;
        $("[data-footer=auth]").text(`Logged In: ${player.name}`);
        console.log(player);

        if (auth.callback) auth.callback();
    }

    function notAuthenticated() {
        // Surrounding Page
        $("[data-footer=auth]").text("Status: Error");

        // Auth Modal
        $("[data-auth=header] p").removeClass("header-auth");
        $("[data-auth=header] p").addClass("header-error");
        $("[data-auth=header] p").html("Error&nbsp;");

        $("[data-auth=header]").css("border-color", "orange");
        $("[data-auth=body]").slideDown();
    }
});

