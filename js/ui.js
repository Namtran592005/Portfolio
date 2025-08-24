import { updateStarColorsForTheme } from "./visuals.js";
import { handleExitSite } from "./audio.js";
import { getTranslations } from "./i18n.js";
let pageBody,
  mobileNavCatalog,
  ticking = !1;
function makePanelDraggable(e, t, n) {
  const o = e.querySelector(".cc-grabber") || e;
  let i = !1,
    a = 0,
    r = 0,
    s = 0,
    l = 0;
  const d = (t) => {
      (i = !0), e.classList.add("is-dragging");
      const n = "touchstart" === t.type ? t.touches[0] : t;
      (a = n.clientY),
        (r = n.clientX),
        (s = 0),
        (l = 0),
        document.addEventListener("mousemove", c),
        document.addEventListener("touchmove", c, { passive: !1 }),
        document.addEventListener("mouseup", m),
        document.addEventListener("touchend", m);
    },
    c = (n) => {
      if (!i) return;
      n.preventDefault();
      const o = "touchmove" === n.type ? n.touches[0] : n,
        d = o.clientY - a,
        c = o.clientX - r;
      "vertical" === t
        ? ((s = Math.max(0, d)),
          (e.style.transform = `scale(1) translateY(${s}px)`))
        : ((l = Math.min(0, c)), (e.style.transform = `translateX(${l}px)`));
    },
    m = () => {
      if (!i) return;
      (i = !1),
        e.classList.remove("is-dragging"),
        document.removeEventListener("mousemove", c),
        document.removeEventListener("touchmove", c),
        document.removeEventListener("mouseup", m),
        document.removeEventListener("touchend", m);
      const o =
        "vertical" === t ? 0.25 * window.innerHeight : 0.3 * window.innerWidth;
      ("vertical" === t ? s : Math.abs(l)) > o ? n() : (e.style.transform = "");
    };
  o.addEventListener("mousedown", d),
    o.addEventListener("touchstart", d, { passive: !0 });
}
function initializeMusicButtonWrapper() {
  const e = document.getElementById("music-toggle");
  if (!e) return;
  const t = document.createElement("div");
  (t.id = "music-toggle-wrapper"),
    e.parentNode.insertBefore(t, e),
    t.appendChild(e);
}
function initializeTutorialModal() {
  const e = document.getElementById("tutorial-modal"),
    t = document.getElementById("open-tutorial-btn"),
    n = document.getElementById("close-tutorial-btn"),
    o = e?.querySelector(".modal-overlay");
  if (!(e && t && n && o)) return;
  const i = () => {
    e.classList.remove("visible"),
      document
        .getElementById("control-center-nav")
        ?.classList.contains("nav-open") ||
        document.body.classList.remove("no-scroll");
  };
  t.addEventListener("click", () => {
    e.classList.add("visible"), document.body.classList.add("no-scroll");
  }),
    n.addEventListener("click", i),
    o.addEventListener("click", i);
}
function initializeAvatarFlipper() {
  const e = document.getElementById("avatar-container");
  e &&
    e.addEventListener("dblclick", () => {
      e.classList.toggle("is-flipped");
    });
}
export function initializeUI() {
  (pageBody = document.body),
    (mobileNavCatalog = document.getElementById("mobile-nav-catalog")),
    initializeAvatarFlipper(),
    initializeOverlays(),
    initializeMobileNav(),
    initializeMusicButtonWrapper(),
    initializeControlCenter(),
    initializeThemeToggle(),
    initializeScrollBehavior(),
    initializeContactForm(),
    initializeInternetStatus(),
    initializeVideoObserver(),
    initializePrintHandlers(),
    initializeTutorialModal(),
    (document.getElementById("currentYear").textContent =
      new Date().getFullYear()),
    document.addEventListener("contextmenu", (e) => e.preventDefault()),
    document.addEventListener("keydown", (e) => {
      ("F12" === e.key ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && ["S", "U"].includes(e.key.toUpperCase()))) &&
        e.preventDefault();
    });
}
function initializeOverlays() {
  const e = document.getElementById("preloader"),
    t = document.getElementById("welcome-overlay"),
    n = document.getElementById("enter-button"),
    o = document.getElementById("page-wrapper"),
    i = () => {
      pageBody.classList.add("content-visible"),
        pageBody.classList.remove("no-scroll"),
        pageBody.classList.add("loaded-content");
    };
  window.addEventListener("load", () => {
    setTimeout(() => {
      e.classList.add("hidden"),
        setTimeout(() => {
          (e.style.display = "none"),
            t.classList.add("visible"),
            t.setAttribute("aria-hidden", "false");
        }, 500);
    }, 500);
  }),
    n.addEventListener("click", () => {
      const e = document.getElementById("startupSound");
      e &&
        ((e.volume = 0.5),
        e.play().catch((e) => console.log("Startup sound blocked.", e))),
        t.classList.remove("visible"),
        t.setAttribute("aria-hidden", "true"),
        o && o.removeAttribute("aria-hidden"),
        setTimeout(i, 500);
    });
}
function initializeMobileNav() {
  const e = document.getElementById("mobile-nav-handle"),
    t = document.querySelector(".header-logo"),
    n = mobileNavCatalog.querySelector(".panel"),
    o = mobileNavCatalog.querySelector(".overlay"),
    i = document.getElementById("main-nav"),
    a = () => {
      mobileNavCatalog.classList.add("is-open"),
        mobileNavCatalog.setAttribute("aria-hidden", "false"),
        pageBody.classList.add("no-scroll");
    },
    r = () => {
      n && (n.style.transform = ""),
        mobileNavCatalog.classList.remove("is-open"),
        mobileNavCatalog.setAttribute("aria-hidden", "true"),
        document
          .getElementById("control-center-nav")
          .classList.contains("nav-open") ||
          pageBody.classList.remove("no-scroll");
    };
  makePanelDraggable(n, "horizontal", r),
    i && (n.innerHTML = i.innerHTML),
    t.addEventListener("click", (e) => {
      window.innerWidth < 992 && (e.preventDefault(), a());
    }),
    e?.addEventListener("click", a),
    o.addEventListener("click", r),
    n.addEventListener("click", (e) => {
      e.target.matches("a.nav-link") && r();
    });
  const s = () => {
    e &&
      (window.innerWidth < 992
        ? e.classList.add("visible")
        : e.classList.remove("visible"));
  };
  window.addEventListener("resize", s), s();
}
function initializeControlCenter() {
  const e = document.getElementById("control-center-nav"),
    t = document.querySelectorAll(".control-center-toggle"),
    n = document.getElementById("page-wrapper"),
    o = e.querySelector(".panel"),
    i = () => {
      e.classList.add("nav-open"),
        e.setAttribute("aria-hidden", "false"),
        n && n.setAttribute("aria-hidden", "true"),
        pageBody.classList.add("no-scroll");
    },
    a = () => {
      o && (o.style.transform = ""),
        e.classList.remove("nav-open"),
        e.setAttribute("aria-hidden", "true"),
        n && n.removeAttribute("aria-hidden"),
        mobileNavCatalog.classList.contains("is-open") ||
          pageBody.classList.remove("no-scroll");
    };
  makePanelDraggable(o, "vertical", a),
    t.forEach((e) => e.addEventListener("click", i)),
    e.addEventListener("click", (t) => {
      t.target === e && a();
    });
  const r = document.getElementById("cc-clock"),
    s = () => {
      r &&
        (r.textContent = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: !0,
        }));
    };
  setInterval(s, 1e3),
    s(),
    document
      .getElementById("cc-animation-toggle")
      ?.addEventListener("click", () =>
        pageBody.classList.toggle("no-animations")
      ),
    document
      .getElementById("cc-exit-button")
      ?.addEventListener("click", handleExitSite);
}
function initializeThemeToggle() {
  const e = document.getElementById("theme-toggle"),
    t = document.getElementById("cc-theme-toggle-mobile");
  window.matchMedia("(prefers-color-scheme: dark)").matches;
  let n = localStorage.getItem("theme") || "dark";
  const o = (e) => {
      pageBody.classList.toggle("dark-mode", "dark" === e),
        localStorage.setItem("theme", e),
        updateStarColorsForTheme(e);
    },
    i = (e) => {
      const t = pageBody.classList.contains("dark-mode") ? "light" : "dark";
      if (!document.startViewTransition) return void o(t);
      const n = e.clientX ?? window.innerWidth / 2,
        i = e.clientY ?? window.innerHeight / 2,
        a = Math.hypot(
          Math.max(n, window.innerWidth - n),
          Math.max(i, window.innerHeight - i)
        );
      document
        .startViewTransition(() => o(t))
        .ready.then(() => {
          const e = getComputedStyle(document.documentElement)
            .getPropertyValue("--accent-primary")
            .trim();
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${n}px ${i}px)`,
                `circle(${a}px at ${n}px ${i}px)`,
              ],
              filter: [
                `drop-shadow(0 0 45px ${e}) drop-shadow(0 0 20px ${e}) brightness(1.5)`,
                `drop-shadow(0 0 0px ${e}) drop-shadow(0 0 0px ${e}) brightness(1)`,
              ],
            },
            {
              duration: 1200,
              easing: "cubic-bezier(0.4, 0.0, 0, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          ),
            document.documentElement.animate(
              {
                transform: ["scale(1)", "scale(0.98)"],
                filter: ["blur(0)", "blur(4px)"],
                opacity: [1, 0],
              },
              {
                duration: 800,
                easing: "ease-in",
                pseudoElement: "::view-transition-old(root)",
              }
            );
        });
    };
  o(n), e?.addEventListener("click", i), t?.addEventListener("click", i);
}
function initializeScrollBehavior() {
  const e = document.querySelectorAll(".control-center-toggle"),
    t = document.getElementById("language-toggle"),
    n = document.getElementById("theme-toggle"),
    o = document.getElementById("control-center-nav"),
    i = document.querySelectorAll("main section[id]"),
    a = document.getElementById("scrollToTopBtn"),
    r = () => {
      let r = window.scrollY;
      e.forEach((e) => e.classList.toggle("hide-on-scroll", r > 20)),
        t?.classList.toggle("hide-on-scroll", r > 20),
        n?.classList.toggle(
          "move-to-center",
          r > 20 && !o?.classList.contains("nav-open")
        ),
        a?.classList.toggle("show", window.scrollY > window.innerHeight / 2),
        (() => {
          let e = "hero",
            t = window.pageYOffset;
          const n =
            document.querySelector(".header-container")?.offsetHeight || 0;
          i.forEach((o) => {
            t >= o.offsetTop - n - 50 && (e = o.id);
          }),
            document.querySelectorAll("a.nav-link").forEach((t) => {
              if (t) {
                const n = t.getAttribute("href") === `#${e}`;
                t.classList.toggle("active", n),
                  n
                    ? t.setAttribute("aria-current", "page")
                    : t.removeAttribute("aria-current");
              }
            });
        })(),
        (ticking = !1);
    };
  window.addEventListener(
    "scroll",
    () => {
      ticking || (window.requestAnimationFrame(r), (ticking = !0));
    },
    { passive: !0 }
  ),
    a?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }),
    r();
}
function initializeContactForm() {
  const e = document.getElementById("contact-form");
  e &&
    e.addEventListener("submit", async function (e) {
      e.preventDefault();
      const t = e.target,
        n = document.getElementById("form-status"),
        o = getTranslations().other_translations || {};
      (n.textContent = o.formStatusSending || "Sending..."),
        (n.style.color = "var(--text-secondary)");
      try {
        if (
          !(
            await fetch(t.action, {
              method: t.method,
              body: new FormData(t),
              headers: { Accept: "application/json" },
            })
          ).ok
        )
          throw new Error("Response not ok");
        (n.textContent =
          o.formStatusSuccess || "Thank you! Your message has been sent."),
          (n.style.color = "var(--accent-primary)"),
          t.reset();
      } catch (e) {
        (n.textContent = o.formStatusError || "Oops! There was a problem."),
          (n.style.color = "red");
      }
      setTimeout(() => {
        n.textContent = "";
      }, 6e3);
    });
}
function initializeInternetStatus() {
  const e = document.getElementById("internet-status-modal"),
    t = () => {
      e &&
        (e.classList.add("visible"),
        e.setAttribute("aria-hidden", "false"),
        pageBody.classList.add("is-offline"));
    };
  window.addEventListener("online", () => {
    e &&
      (e.classList.remove("visible"),
      e.setAttribute("aria-hidden", "true"),
      pageBody.classList.remove("is-offline"));
  }),
    window.addEventListener("offline", t),
    navigator.onLine || t();
}
function initializeVideoObserver() {
  const e = new IntersectionObserver(
    (e) => {
      e.forEach((e) => {
        const t = e.target;
        e.isIntersecting ? t.play().catch(() => {}) : t.pause();
      });
    },
    { threshold: 0.1 }
  );
  document
    .querySelectorAll("video[autoplay], .portfolio-video")
    .forEach((t) => {
      (t.muted = !0), e.observe(t);
    });
  const t = new MutationObserver((t) => {
      t.forEach((t) => {
        t.addedNodes.forEach((t) => {
          1 === t.nodeType &&
            t.querySelectorAll("video").forEach((t) => {
              (t.muted = !0), e.observe(t);
            });
        });
      });
    }),
    n = document.getElementById("page-content");
  n && t.observe(n, { childList: !0, subtree: !0 });
}
function initializePrintHandlers() {
  window.addEventListener("beforeprint", () => {
    pageBody.classList.add("watermarked");
    const e = document.createElement("pre");
    (e.id = "injected-junk"),
      (e.style.display = "none"),
      (e.textContent = ((e) => {
        let t = "";
        for (let n = 0; n < e; n++)
          t += String.fromCharCode(Math.floor(93 * Math.random()) + 33);
        return `\x3c!-- ${t} --\x3e`;
      })(5e3)),
      document.body.appendChild(e);
  }),
    window.addEventListener("afterprint", () => {
      pageBody.classList.remove("watermarked"),
        document.getElementById("injected-junk")?.remove();
    });
}
