const features = [
  {
    title: "Share\nin seconds",
    desc: "Invite the people you shop with and keep one shared version of every list. No screenshots, no messages, no duplicate lists.",
  },
  {
    title: "Keep your lists organized",
    desc: "Use favorites and tags to keep your lists organized and close at hand. Find the ones you need faster, every time you open the app.",
  },
  {
    title: "See your\nshopping habits",
    desc: "Track what gets bought most often and get a clearer view of the lists you use every day. Spot recurring items and make future shopping easier to plan.",
  },
];

const themeRoot = document.querySelector(".page, .legal-shell");
const stickyNav = document.querySelector(".sticky-nav");
const heroTitle = document.querySelector(".hero-title");
const builtImages = document.querySelectorAll(".built-image");
const carouselTrack = document.querySelector(".carousel-track");
const slideTitle = document.querySelector(".carousel-title");
const slideDesc = document.querySelector(".carousel-desc");
const prevButton = document.querySelector(".carousel-prev");
const nextButton = document.querySelector(".carousel-next");
const lightThemeButtons = document.querySelectorAll(".theme-btn-light");
const darkThemeButtons = document.querySelectorAll(".theme-btn-dark");

let currentSlide = 0;
let viewportEffectsFrame = null;
const storedTheme = (() => {
  try {
    return window.localStorage.getItem("rivelo-theme");
  } catch {
    return null;
  }
})();

function setTheme(theme) {
  if (!themeRoot) {
    return;
  }

  if (theme === "dark") {
    themeRoot.setAttribute("data-theme", "dark");
  } else {
    themeRoot.removeAttribute("data-theme");
  }

  try {
    window.localStorage.setItem("rivelo-theme", theme === "dark" ? "dark" : "light");
  } catch {}
}

function syncStickyNav() {
  if (!stickyNav || !heroTitle) {
    return;
  }

  if (window.innerWidth <= 768) {
    stickyNav.classList.remove("visible");
    return;
  }

  const rect = heroTitle.getBoundingClientRect();
  stickyNav.classList.toggle("visible", rect.top <= 0);
}

function syncBuiltScreens() {
  builtImages.forEach((builtImage) => {
    const rect = builtImage.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const start = viewportHeight;
    const end = viewportHeight * 0.18;
    const rawProgress = (start - rect.top) / (start - end);
    const progress = Math.max(0, Math.min(rawProgress, 1));
    const easedProgress = 1 - Math.pow(1 - progress, 2.1);
    const maxSpread = Math.min(Math.max(window.innerWidth * 0.115, 48), 176);

    builtImage.style.setProperty("--stack-spread", `${(easedProgress * maxSpread).toFixed(2)}px`);
  });
}

function syncViewportEffects() {
  syncStickyNav();
  syncBuiltScreens();
}

function requestViewportEffects() {
  if (viewportEffectsFrame !== null) {
    return;
  }

  viewportEffectsFrame = window.requestAnimationFrame(() => {
    syncViewportEffects();
    viewportEffectsFrame = null;
  });
}

function updateCarousel() {
  if (!carouselTrack || !slideTitle || !slideDesc || !prevButton || !nextButton) {
    return;
  }

  const offset = currentSlide * (720 + 48);
  carouselTrack.style.transform = `translateX(-${offset}px)`;

  slideTitle.style.opacity = "0";
  slideDesc.style.opacity = "0";

  window.setTimeout(() => {
    slideTitle.innerHTML = features[currentSlide].title.replace(/\n/g, "<br>");
    slideDesc.textContent = features[currentSlide].desc;
    slideTitle.style.opacity = "1";
    slideDesc.style.opacity = "1";
  }, 250);

  const prevPath = prevButton.querySelector("path");
  const nextPath = nextButton.querySelector("path");

  if (prevPath) {
    prevPath.setAttribute("stroke-opacity", currentSlide === 0 ? "0.3" : "1");
  }

  if (nextPath) {
    nextPath.setAttribute("stroke-opacity", currentSlide === features.length - 1 ? "0.3" : "1");
  }

  prevButton.style.cursor = currentSlide === 0 ? "default" : "pointer";
  nextButton.style.cursor = currentSlide === features.length - 1 ? "default" : "pointer";
}

lightThemeButtons.forEach((button) => {
  button.addEventListener("click", () => setTheme("light"));
});

darkThemeButtons.forEach((button) => {
  button.addEventListener("click", () => setTheme("dark"));
});

if (prevButton) {
  prevButton.addEventListener("click", () => {
    if (currentSlide === 0) {
      return;
    }

    currentSlide -= 1;
    updateCarousel();
  });
}

if (nextButton) {
  nextButton.addEventListener("click", () => {
    if (currentSlide === features.length - 1) {
      return;
    }

    currentSlide += 1;
    updateCarousel();
  });
}

setTheme(storedTheme === "dark" ? "dark" : "light");
updateCarousel();
syncViewportEffects();

window.addEventListener("scroll", requestViewportEffects, { passive: true });
window.addEventListener("resize", requestViewportEffects, { passive: true });
