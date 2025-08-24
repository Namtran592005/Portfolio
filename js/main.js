import { initializeI18n } from "./i18n.js";
import { initializeUI } from "./ui.js";
import { initializeAudio } from "./audio.js";
import { initializeVisuals } from "./visuals.js";
document.addEventListener("DOMContentLoaded", () => {
  initializeUI(), initializeAudio(), initializeVisuals(), initializeI18n();
});
