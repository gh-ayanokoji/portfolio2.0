/* ==========================================================================
   Ayan Mahboob — Portfolio
   Small, dependency-free interactions.
   01. Header & mobile navigation
   02. Scroll spy
   03. Reveal on scroll
   04. Contact form
   05. Footer year
   ========================================================================== */
(function () {
  "use strict";

  /* 01. Header & mobile navigation ---------------------------------------- */
  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  function syncHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  if (toggle && mobileNav) {
    var closeNav = function () {
      toggle.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("is-open");
    };

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      mobileNav.classList.toggle("is-open", !isOpen);
    });

    mobileNav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* 02. Scroll spy -------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav__link[href^="#"]')
  );

  if (navLinks.length && "IntersectionObserver" in window) {
    var linkBySection = new Map();

    navLinks.forEach(function (link) {
      var section = document.querySelector(link.getAttribute("href"));
      if (section) linkBySection.set(section, link);
    });

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.remove("is-active");
          });
          var active = linkBySection.get(entry.target);
          if (active) active.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    linkBySection.forEach(function (_, section) {
      spy.observe(section);
    });
  }

  /* 03. Reveal on scroll -------------------------------------------------- */
  var revealItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (revealItems.length && "IntersectionObserver" in window && !reducedMotion) {
    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, index) {
        child.style.setProperty("--reveal-delay", index * 70 + "ms");
      });
    });

    var revealer = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach(function (item) {
      revealer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* 04. Contact form ------------------------------------------------------ */
  var OWNER_EMAIL = "ayanm4087@gmail.com";
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + OWNER_EMAIL;
  var form = document.querySelector("[data-contact-form]");

  if (form) {
    var status = form.querySelector("[data-form-status]");

    var showSuccess = function () {
      if (!status) return;
      status.hidden = false;
      status.textContent = "Sent — thanks, ";
      var nameEl = form.querySelector('[name="name"]');
      var name = nameEl ? nameEl.value.trim() : "";
      status.append(name ? name + "." : "I'll be in touch soon.");
    };

    var showFallback = function () {
      if (!status) return;
      status.hidden = false;
      status.textContent = "Couldn't send automatically. Your mail app should open with everything filled in; if it didn't, just write to ";
      var directLink = document.createElement("a");
      directLink.href = "mailto:" + OWNER_EMAIL;
      directLink.textContent = OWNER_EMAIL;
      status.append(directLink, ".");
    };

    var serializeServices = function (data) {
      var fields = ["website", "video", "software", "teaching"];
      var picked = [];
      fields.forEach(function (field) {
        var val = data.get(field);
        if (val) picked.push(val.toString());
      });
      return picked.length ? picked.join(", ") : "Not specified";
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var payload = {
        name: name,
        email: (data.get("email") || "").toString().trim(),
        services: serializeServices(data),
        message: (data.get("message") || "").toString().trim(),
        _subject: "Portfolio enquiry from " + (name || "the website"),
        _template: "table",
        _captcha: "false",
      };

      var submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      if (status) {
        status.hidden = false;
        status.textContent = "Sending…";
      }

      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          return response.json().catch(function () {
            return {};
          });
        })
        .then(function (result) {
          if (result && String(result.success) === "true") {
            showSuccess();
            form.reset();
            return;
          }

          var message = (result && result.message) || "";
          // The first submission from a new form address has to be activated once
          // from the owner's inbox before the endpoint starts delivering.
          if (/activ/i.test(message)) {
            if (status) {
              status.hidden = false;
              status.textContent =
                "One-time setup: an activation link was emailed to " +
                OWNER_EMAIL +
                " — click it once and later messages come straight through.";
            }
            return;
          }
          throw new Error(message || "The form endpoint rejected it");
        })
        .catch(function (error) {
          console.error("Contact form: send failed:", error);
          showFallback();
        })
        .then(function () {
          if (submitButton) submitButton.disabled = false;
        });
    });
  }

  /* 05. Footer year ------------------------------------------------------- */
  var year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(year);
  });
})();
