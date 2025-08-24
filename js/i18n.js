import { renderAllDynamicContent } from "./renderer.js";
import { updateAudioButtonLabels } from "./audio.js";
import { initializeHoverEffects, observeAnimateOnScroll } from "./visuals.js";
import { TextScrambleEffect } from "./text-scramble.js";
const languageToggle = document.getElementById("language-toggle"),
  pageContent = document.getElementById("page-content"),
  supportedLanguages = ["vi", "en", "ja", "ko", "zh", "ru"];
let currentLangIndex = supportedLanguages.indexOf(
  localStorage.getItem("language") || "en"
);
-1 === currentLangIndex && (currentLangIndex = 1);
let translations = {};
const scrambleInstances = new Map();
async function loadTranslations(t) {
  try {
    const e = await fetch(`./data/${t}.json?v=${new Date().getTime()}`);
    if (!e.ok) throw new Error(`Could not load ${t}.json`);
    return await e.json();
  } catch (e) {
    return console.error(e), "en" !== t ? await loadTranslations("en") : {};
  }
}
function applyLanguageUpdates(t) {
  document.querySelectorAll("[data-i18n-key]").forEach((e) => {
    const n = e.getAttribute("data-i18n-key"),
      a =
        (t.static_text && t.static_text[n]) ||
        (t.other_translations && t.other_translations[n]) ||
        "";
    scrambleInstances.has(e) ||
      scrambleInstances.set(e, new TextScrambleEffect(e)),
      scrambleInstances.get(e).setText(a);
  }),
    document.querySelectorAll("[data-i18n-placeholder-key]").forEach((e) => {
      const n = e.getAttribute("data-i18n-placeholder-key");
      t.other_translations &&
        t.other_translations[n] &&
        (e.placeholder = t.other_translations[n]);
    }),
    document.querySelectorAll("[data-i18n-title-key]").forEach((e) => {
      const n = e.getAttribute("data-i18n-title-key");
      t.other_translations &&
        t.other_translations[n] &&
        (e.title = t.other_translations[n]);
    }),
    document.querySelectorAll("[data-i18n-aria-label-key]").forEach((e) => {
      const n = e.getAttribute("data-i18n-aria-label-key");
      t.other_translations &&
        t.other_translations[n] &&
        e.setAttribute("aria-label", t.other_translations[n]);
    }),
    t.meta &&
    ((document.getElementById("meta-description").content =
      t.meta.description),
      (document.getElementById("og-description").content =
        t.meta.ogDescription),
      (document.getElementById("twitter-description").content =
        t.meta.ogDescription),
      (document.getElementById("meta-keywords").content = t.meta.keywords),
      (document.getElementById("og-locale").content = t.meta.lang));
}
function updateLanguageToggleUI() {
  const t = supportedLanguages[currentLangIndex].toUpperCase(),
    e = languageToggle.querySelector(".lang-display");
  e && (e.textContent = t),
    (languageToggle.title = `Switch Language (Current: ${t})`);
}
async function setLanguage(t) {
  currentLangIndex = t;
  const e = supportedLanguages[currentLangIndex];
  localStorage.setItem("language", e),
    (translations = await loadTranslations(e)),
    document.body.classList.remove("lang-vi", "lang-en", "lang-ja", "lang-ko"),
    document.body.classList.add(`lang-${e}`);
  const n = () => {
    (document.documentElement.lang = e),
      applyLanguageUpdates(translations),
      renderAllDynamicContent(translations),
      applyLanguageUpdates(translations),
      initializeHoverEffects(),
      observeAnimateOnScroll(),
      updateAudioButtonLabels(translations),
      updateLanguageToggleUI();
  };
  document.startViewTransition
    ? document.startViewTransition(n)
    : (pageContent.classList.add("translating-page"),
      setTimeout(() => {
        n(), pageContent.classList.remove("translating-page");
      }, 250));
}
export function initializeI18n() {
  languageToggle.addEventListener("click", () => {
    setLanguage((currentLangIndex + 1) % supportedLanguages.length);
  }),
    setLanguage(currentLangIndex);
}
export const getTranslations = () => translations;
export const getCurrentLang = () => supportedLanguages[currentLangIndex];
