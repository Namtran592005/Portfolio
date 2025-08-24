function _(n, e) {
  return e.other_translations && e.other_translations[n]
    ? e.other_translations[n]
    : e.static_text && e.static_text[n]
    ? e.static_text[n]
    : n;
}
function renderSkills(n, e) {
  const t = document.getElementById("skills-grid-container");
  if (!t) return;
  const i = n
    .map(
      (n) =>
        `\n        <div class="skill-category animate-on-scroll">\n            <div class="apple-card">\n                <h3>\n                    <i class="${
          n.icon
        }"></i>\n                    <span>${_(
          n.titleKey,
          e
        )}</span>\n                </h3>\n                <ul>\n                    ${n.items
          .map((n) => `<li>${_(n, e)}</li>`)
          .join(
            ""
          )}\n                </ul>\n            </div>\n        </div>\n    `
    )
    .join("");
  t.innerHTML = i;
}
function renderExperience(n, e) {
  const t = document.getElementById("experience-grid-container");
  if (!t) return;
  const i = n
    .map(
      (n) =>
        `\n        <div class="experience-item animate-on-scroll">\n            <div class="apple-card">\n                <span class="date">${_(
          n.dateKey,
          e
        )}</span>\n                <h3>${_(
          n.titleKey,
          e
        )}</h3>\n                <p style="color: var(--text-tertiary); font-weight: 500; margin-bottom: 10px;">\n                    ${_(
          n.companyKey,
          e
        )}\n                </p>\n                <p style="color: orange; font-weight: 500; margin-bottom: 10px;">\n                    ${_(
          n.descriptionKey,
          e
        )}\n                </p>\n                <ul>\n                    ${n.tasks
          .map((n) => `<li>${_(n, e)}</li>`)
          .join(
            ""
          )}\n                </ul>\n            </div>\n        </div>\n    `
    )
    .join("");
  t.innerHTML = i;
}
function renderProjects(n, e) {
  const t = document.getElementById("projects-grid-container");
  if (!t) return;
  const i = n
    .map(
      (n) =>
        `\n        <div class="portfolio-item animate-on-scroll">\n            <div class="apple-card">\n                <video src="${
          n.video
        }" class="portfolio-video" autoplay loop muted playsinline preload="metadata" loading="lazy" title="Video demo of ${
          n.title
        } project"></video>\n                <div class="portfolio-content">\n                    <h3>${
          n.title
        }</h3>\n                    <p>${_(
          n.descriptionKey,
          e
        )}</p>\n                    <div class="portfolio-tags">\n                        ${n.tags
          .map((n) => `<span class="tag">${n}</span>`)
          .join(
            ""
          )}\n                    </div>\n                    <div class="portfolio-links">\n                        <a href="${
          n.liveUrl
        }" target="_blank" rel="noopener noreferrer">\n                            <i class="fas fa-external-link-alt"></i> <span>${_(
          "projectLiveDemo",
          e
        )}</span>\n                        </a>\n                    </div>\n                </div>\n            </div>\n        </div>\n    `
    )
    .join("");
  t.innerHTML = i;
}
function renderEducation(n, e) {
  const t = document.getElementById("education-grid-container");
  if (!t) return;
  const i = n
    .map(
      (n) =>
        `\n        <div class="experience-item animate-on-scroll">\n            <div class="apple-card">\n                <i class="${
          n.icon
        } education-icon"></i>\n                <span class="date">${_(
          n.dateKey,
          e
        )}</span>\n                <h3>${_(
          n.schoolKey,
          e
        )}</h3>\n                <p style="color: var(--text-tertiary); font-weight: 500">${_(
          n.majorKey,
          e
        )}</p>\n            </div>\n        </div>\n    `
    )
    .join("");
  t.innerHTML = i;
}
export function renderAllDynamicContent(n) {
  n &&
    n.sections &&
    (renderSkills(n.sections.skills, n),
    renderExperience(n.sections.experience, n),
    renderProjects(n.sections.projects, n),
    renderEducation(n.sections.education, n));
}
