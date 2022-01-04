let theAuthModal, theAuthModalCallback;
let tsp = {};
let auth = {};

$(() => {
    const authModalHTML = `<div id="theAuthModal" class="modal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div data-auth="header" class="modal-header">
        <p class="header-auth">Authentification&nbsp;</p>
      </div>
      <div data-auth="body" class="modal-body">
      <div class="iframe-container">
        <iframe class="modal-iframe" data-auth="iframe" scrolling="no"
        title="GatherAuth">
        </iframe>
        </div>
      </div>
    </div>
  </div>
</div>`;

    // Surrounding Page
    $("[data-footer=auth]").text("Status: Who are you?");

    // Auth Modal
    auth.objId = $("#objId").val();

    $("body").append(authModalHTML);

    auth.modal = new bootstrap.Modal(document.getElementById('theAuthModal'));

    auth.startTime = Date.now();
    auth.player = undefined;
    auth.interval = 500;
    auth.callback = undefined;

    function authenticate() {
        auth.modal.show();

        // Load iFrame with https://gather.town/getPublicId?redirectTo=
        // https://gathertown.notion.site/Gather-Identity-Linking-5e4e94bc095244eb9fcc3218babe855e
        const returnUrl = encodeURIComponent(window.location.origin + '/auth/auth?')
        const iframeUrl = `https://gather.town/getPublicId?redirectTo=${returnUrl}`;
        $("[data-auth=iframe]").attr("src", iframeUrl);

        const intervalId = setInterval(() => {
            $.get(`/auth/isidentified`, (data) => {
                console.log(data);
                if (data.status === "ok") {
                    authSuccess(data.player);
                    clearInterval(intervalId);
                    return;
                }
            });
        }, auth.interval);
    }

    $.get(`/auth/isidentified`, (data) => {
        console.log(data);
        if (data.status === "ok") {
            authSuccess(data.player)
            return;
        }

        authenticate();
    });

    function authSuccess(player) {
        console.log("authSuccess");
        auth.modal.hide();

        auth.player = player;
        $("[data-footer=auth]").html(`Logged In: ${player.name}<div id="playerAvatar-footer" class="gatherAvatar-footer"></div>`);
        if ('avatarUrl' in player) {
            $('#playerAvatar-footer').css("background-image", `url("${player.avatarUrl}")`);
        } else {
            $('#playerAvatar-footer').hide();
        }

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

