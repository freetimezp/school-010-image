/*==================================================
  LESSON 010 — IMAGE ELEMENT
  Object-fit, object-position & aspect ratios
==================================================*/

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/*==================================================
  01. OBJECT-FIT PLAYGROUND
==================================================*/

const fitOptions = $$(".fit-option");
const fitPreview =
    $(".preview-frame img") ||
    $(".playground-preview img") ||
    $(".preview-stage img");

const fitValue = $("[data-fit-value], #fitValue, .fit-value");

const fitReset = $("[data-fit-reset], #fitReset, .fit-reset");

const defaultFit = "cover";

function setObjectFit(value) {
    if (!fitPreview) return;

    fitPreview.style.objectFit = value;

    fitOptions.forEach((option) => {
        const isActive = option.dataset.fit === value;

        option.classList.toggle("active", isActive);
        option.setAttribute("aria-pressed", String(isActive));
    });

    if (fitValue) {
        fitValue.textContent = value;
    }
}

fitOptions.forEach((option) => {
    option.addEventListener("click", () => {
        const fit = option.dataset.fit;

        if (fit) setObjectFit(fit);
    });
});

/*==================================================
  02. OBJECT-POSITION CONTROLS
==================================================*/

const positionControls = $$(".position-control input[type='range']");

const positionX =
    $("#positionX") || $("[data-position='x']") || positionControls[0];

const positionY =
    $("#positionY") || $("[data-position='y']") || positionControls[1];

function updatePosition() {
    if (!fitPreview) return;

    const x = positionX ? positionX.value : 50;
    const y = positionY ? positionY.value : 50;

    fitPreview.style.objectPosition = `${x}% ${y}%`;

    updatePositionOutput(positionX, x);
    updatePositionOutput(positionY, y);
}

function updatePositionOutput(input, value) {
    if (!input) return;

    const container = input.closest(".position-control");

    if (!container) return;

    const output =
        $("output", container) ||
        $("[data-position-value]", container) ||
        $(".position-value", container);

    if (output) {
        output.textContent = `${value}%`;
    }
}

[positionX, positionY].forEach((control) => {
    if (!control) return;

    control.addEventListener("input", updatePosition);
});

/*==================================================
  03. RESET OBJECT-FIT PLAYGROUND
==================================================*/

function resetFitPlayground() {
    setObjectFit(defaultFit);

    if (positionX) positionX.value = 50;
    if (positionY) positionY.value = 50;

    updatePosition();
}

if (fitReset) {
    fitReset.addEventListener("click", resetFitPlayground);
}

/*==================================================
  04. ASPECT-RATIO PLAYGROUND
==================================================*/

const ratioOptions = $$(".ratio-option");

const ratioFrame = $(".ratio-preview-frame");

const ratioValue = $("[data-ratio-value], #ratioValue, .ratio-value");

const ratioReset = $("[data-ratio-reset], #ratioReset, .ratio-reset");

const defaultRatio = "16 / 9";

/*
  Convert values such as:
  "16 / 9"
  "16:9"
  "1 / 1"
  into a numeric ratio.
*/

function parseRatio(value) {
    const parts = value
        .replace(":", "/")
        .split("/")
        .map((part) => Number(part.trim()));

    if (
        parts.length !== 2 ||
        !parts[0] ||
        !parts[1] ||
        !Number.isFinite(parts[0]) ||
        !Number.isFinite(parts[1])
    ) {
        return null;
    }

    return parts[0] / parts[1];
}

function setAspectRatio(value) {
    if (!ratioFrame) return;

    const ratio = parseRatio(value);

    if (!ratio) return;

    ratioFrame.style.aspectRatio = value;

    /*
      Keep portrait frames from becoming too tall.
      The frame uses a maximum target height of 420px
      and a maximum target width of 360px.
    */

    const targetWidth = Math.min(360, 420 * ratio);

    ratioFrame.style.width = `min(100%, ${targetWidth}px)`;

    ratioOptions.forEach((option) => {
        const isActive = option.dataset.ratio === value;

        option.classList.toggle("active", isActive);
        option.setAttribute("aria-pressed", String(isActive));
    });

    if (ratioValue) {
        ratioValue.textContent = value.replace("/", ":");
    }
}

ratioOptions.forEach((option) => {
    option.addEventListener("click", () => {
        const ratio = option.dataset.ratio;

        if (ratio) setAspectRatio(ratio);
    });
});

/*==================================================
  05. RESET ASPECT-RATIO PLAYGROUND
==================================================*/

function resetRatioPlayground() {
    setAspectRatio(defaultRatio);
}

if (ratioReset) {
    ratioReset.addEventListener("click", resetRatioPlayground);
}

/*==================================================
  06. LESSON NAVIGATION
==================================================*/

const navLinks = $$(".lesson-nav-link");

const lessonSections = navLinks
    .map((link) => {
        const href = link.getAttribute("href");

        if (!href || !href.startsWith("#")) return null;

        return $(href);
    })
    .filter(Boolean);

function setActiveNav(sectionId) {
    navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${sectionId}`;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

function updateActiveNav() {
    // Position where the active section is detected.
    const scrollPosition = window.scrollY + 180;

    let currentSection = lessonSections[0];

    lessonSections.forEach((section) => {
        if (section.offsetTop <= scrollPosition) {
            currentSection = section;
        }
    });

    if (currentSection) {
        setActiveNav(currentSection.id);
    }
}

/* Avoid running the calculation excessively */

let scrollTicking = false;

window.addEventListener("scroll", () => {
    if (scrollTicking) return;

    scrollTicking = true;

    requestAnimationFrame(() => {
        updateActiveNav();
        scrollTicking = false;
    });
});

window.addEventListener("resize", updateActiveNav);
window.addEventListener("load", updateActiveNav);
window.addEventListener("hashchange", updateActiveNav);

/* Smooth navigation */

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href || !href.startsWith("#")) return;

        const target = $(href);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
            block: "start",
        });

        history.replaceState(null, "", href);

        setActiveNav(target.id);
    });
});

/* Initial state */

updateActiveNav();

/*==================================================
  07. SECTION REVEAL ANIMATION
==================================================*/

const revealElements = $$(
    ".section-heading, .intro-grid, .concept-grid, " +
        ".responsive-layout, .playground, .fit-gallery, " +
        ".ratio-playground, .gallery-project, .summary-content",
);

const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
).matches;

if (!reduceMotion && "IntersectionObserver" in window) {
    revealElements.forEach((element) => {
        element.classList.add("js-reveal");
    });

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px",
        },
    );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });
}

/*==================================================
  08. INITIALIZE PLAYGROUNDS
==================================================*/

setObjectFit(defaultFit);
updatePosition();
setAspectRatio(defaultRatio);

/*==================================================
  09. CURRENT YEAR
==================================================*/

const yearElement = $("[data-current-year]");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

/*==================================================
  LESSON 010 — READY
==================================================*/

console.log("Lesson 010 — Image playground ready.");
