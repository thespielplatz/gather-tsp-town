let theAuthModal, theAuthModalCallback;
let tsp = {};
let auth = {};

$(() => {
    const authModalHTML = `
<div id="theAuthModal" class="modal">
  <div class="modal-background"></div>
  <div class="modal-card">
    <header class="modal-card-head" style="background-color: #C56200; color:white;">
      <p class="modal-card-title has-text-white">Authentification&nbsp;</p>
      <button class="delete" aria-label="close"></button>
    </header>
    <section class="modal-card-body has-text-centered">
        <a class="button" href="" data-auth="button">Open Gather Authentification</a>
    <!--
      <div class="iframe-container">
        <iframe class="modal-iframe" data-auth="iframe" scrolling="no" title="GatherAuth">
        </iframe>
      </div>
    </section>
    -->
    <!--
    <footer class="modal-card-foot">
      <button class="button is-success">Save changes</button>
      <button class="button">Cancel</button>
    </footer>
    -->
  </div>
</div>
`;
    // Surrounding Page
    $("[data-footer=auth]").text("Status: Who are you?");

    // Auth Modal
    auth.objId = $("#objId").val();

    auth.player = undefined;
    auth.interval = 500;
    auth.callback = undefined;
    auth.redirectUrl = ""

    function authenticate() {
        $("body").append(authModalHTML);
        Modal.init('theAuthModal')
        Modal.show('theAuthModal')

        // Load iFrame with https://gather.town/getPublicId?redirectTo=
        // https://gathertown.notion.site/Gather-Identity-Linking-5e4e94bc095244eb9fcc3218babe855e

        const returnUrl = encodeURIComponent(`${window.location.origin}/auth/auth?redirect=${auth.redirectUrl}&`)
        //const iframeUrl = `https://gather.town/getPublicId?redirectTo=${returnUrl}`;
        //const iframeUrl = `https://app.gather.town/getPublicId?redirectTo=${returnUrl}`;
        const iframeUrl = `https://app.gather.town/getPublicId?redirectTo=${returnUrl}`;
        //$("[data-auth=iframe]").attr("src", iframeUrl);

        //console.log(iframeUrl)
        $("[data-auth=button]").attr("href", iframeUrl);

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
        Modal.close('theAuthModal')

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

