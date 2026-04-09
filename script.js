const MOBILE_BREAKPOINT = 820;

const loadIncludes = async () => {
  const includeTargets = document.querySelectorAll("[data-include]");

  await Promise.all(
    Array.from(includeTargets).map(async (target) => {
      const source = target.dataset.include;

      try {
        const response = await fetch(source);

        if (!response.ok) {
          throw new Error(`Failed to load ${source}`);
        }

        target.outerHTML = await response.text();
      } catch (error) {
        console.error(error);
      }
    })
  );
};

const setupTopbar = () => {
  const topbar = document.querySelector(".topbar");

  if (!topbar) {
    return;
  }

  const syncTopbar = () => {
    topbar.classList.toggle("scrolled", window.scrollY > 24);
  };

  syncTopbar();
  window.addEventListener("scroll", syncTopbar, { passive: true });
};

const setupActiveLinks = () => {
  const allLinks = document.querySelectorAll(".topnav a, .mobile-nav-links a");
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/index.html";
  const currentHash = window.location.hash;

  allLinks.forEach((link) => {
    const url = new URL(link.href, window.location.origin);
    const linkPath = url.pathname.replace(/\/$/, "") || "/index.html";
    const samePath = linkPath === currentPath || (currentPath === "" && linkPath === "/index.html");
    const sameHash = currentHash ? url.hash === currentHash : false;

    link.classList.toggle("is-active", samePath && sameHash);
  });
};

const setupMobileNav = () => {
  const toggleButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (!toggleButton || !mobileNav) {
    return;
  }

  let hideTimer;

  const closeMenu = () => {
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-label", "메뉴 열기");
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("nav-open");

    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      mobileNav.hidden = true;
    }, 260);
  };

  const openMenu = () => {
    mobileNav.hidden = false;
    window.clearTimeout(hideTimer);

    requestAnimationFrame(() => {
      toggleButton.setAttribute("aria-expanded", "true");
      toggleButton.setAttribute("aria-label", "메뉴 닫기");
      mobileNav.classList.add("is-open");
      document.body.classList.add("nav-open");
    });
  };

  toggleButton.addEventListener("click", () => {
    const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";

    if (isExpanded) {
      closeMenu();
      return;
    }

    openMenu();
  });

  mobileNav.querySelectorAll("[data-menu-close], .mobile-nav-links a").forEach((element) => {
    element.addEventListener("click", closeMenu);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggleButton.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      closeMenu();
    }
  });
};

const setupReveal = () => {
  const revealItems = document.querySelectorAll(".reveal-v2");

  if (!revealItems.length) {
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        entry.target
          .querySelectorAll("[data-count]")
          .forEach((item) => !item.dataset.animated && animateCounter(item));

        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
};

const animateCounter = (element) => {
  const target = Number(element.dataset.count);
  const duration = 1200;
  const start = performance.now();
  element.dataset.animated = "true";

  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

const setupGlow = () => {
  const cursorGlow = document.querySelector(".cursor-glow");

  if (!cursorGlow) {
    return;
  }

  const updateGlow = (event) => {
    cursorGlow.animate(
      {
        left: `${event.clientX}px`,
        top: `${event.clientY}px`,
      },
      {
        duration: 280,
        fill: "forwards",
        easing: "ease-out",
      }
    );
  };

  window.addEventListener("pointermove", updateGlow, { passive: true });
};

const setupTilt = () => {
  const tiltItems = document.querySelectorAll(".tilt");

  tiltItems.forEach((element) => {
    const depth = Number(element.dataset.depth || 16);

    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateY = px * depth;
      const rotateX = py * -depth;

      element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
};

const init = async () => {
  await loadIncludes();
  setupTopbar();
  setupActiveLinks();
  setupMobileNav();
  setupReveal();
  setupGlow();
  setupTilt();
  window.addEventListener("hashchange", setupActiveLinks);
};

window.addEventListener("DOMContentLoaded", init);
