(function () {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".nav-panel");
    if (!toggle || !panel) return;

    function setOpen(open) {
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        panel.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        setOpen(!open);
    });

    panel.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
            setOpen(false);
        });
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) setOpen(false);
    });
})();
