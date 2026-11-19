/* ==========================================================================
   Ayan Mahboob — Portfolio
   Small, dependency-free interactions.
   01. Header & mobile navigation
   02. Scroll spy
   03. Reveal on scroll
   04. Lightbox
   05. Contact form
   06. Footer year
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

  /* 04. Lightbox ---------------------------------------------------------- */
  var galleryItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-lightbox]")
  );

  if (galleryItems.length) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Image viewer");
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close">&times;</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous image">&#8249;</button>' +
      '<figure class="lightbox__figure"><img alt="" /><figcaption class="lightbox__caption"></figcaption></figure>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next image">&#8250;</button>';
    document.body.appendChild(box);

    var boxImage = box.querySelector("img");
    var boxCaption = box.querySelector(".lightbox__caption");
    var currentIndex = 0;

    var renderLightbox = function () {
      var item = galleryItems[currentIndex];
      var thumbnail = item.querySelector("img");
      boxImage.src = item.getAttribute("href");
      boxImage.alt = thumbnail ? thumbnail.alt : "";
      boxCaption.textContent = item.getAttribute("data-caption") || boxImage.alt;
    };

    var openLightbox = function (index) {
      currentIndex = index;
      renderLightbox();
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
      box.querySelector(".lightbox__close").focus();
    };

    var closeLightbox = function () {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    var stepLightbox = function (direction) {
      currentIndex = (currentIndex + direction + galleryItems.length) % galleryItems.length;
      renderLightbox();
    };

    galleryItems.forEach(function (item, index) {
      item.addEventListener("click", function (event) {
        event.preventDefault();
        openLightbox(index);
      });
    });

    box.addEventListener("click", function (event) {
      if (event.target === box || event.target.closest(".lightbox__close")) {
        closeLightbox();
      } else if (event.target.closest(".lightbox__nav--prev")) {
        stepLightbox(-1);
      } else if (event.target.closest(".lightbox__nav--next")) {
        stepLightbox(1);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!box.classList.contains("is-open")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") stepLightbox(-1);
      if (event.key === "ArrowRight") stepLightbox(1);
    });
  }

  /* 05. Contact form ------------------------------------------------------ */
  var form = document.querySelector("[data-contact-form]");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();
      var services = ["website", "video", "software", "teaching"]
        .map(function (field) {
          return data.get(field);
        })
        .filter(Boolean);

      var lines = [
        "Name: " + name,
        "Email: " + email,
        "Services: " + (services.length ? services.join(", ") : "Not specified"),
        "",
        message || "(no message)",
      ];

      var subject = "Project enquiry from " + (name || "your portfolio");
      window.location.href =
        "mailto:ayanmehboob293@gmail.com" +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(lines.join("\n"));
    });
  }

  /* 06. Footer year ------------------------------------------------------- */
  var year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(year);
  });
})();
