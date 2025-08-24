let scene,
  camera,
  renderer,
  stars,
  starGeometry,
  starMaterial,
  mouseX = 0,
  mouseY = 0,
  isTabActive = !0;
import { getAnalyserNode, isMusicActive } from "./audio.js";
function updateMouseEffect(e) {
  const t = e.currentTarget,
    r = t.getBoundingClientRect();
  t.style.setProperty("--mouse-x", e.clientX - r.left + "px"),
    t.style.setProperty("--mouse-y", e.clientY - r.top + "px");
}
export function initializeHoverEffects() {
  const e = document.querySelectorAll(
      "\n        .apple-card, .glass-action-button, button[type='submit'].contact-button, \n        #theme-toggle, #language-toggle, .control-center-toggle, \n        .quick-action-btn, .audio-control-btn\n    "
    ),
    t = new IntersectionObserver(
      (e) => {
        e.forEach((e) => {
          e.isIntersecting
            ? e.target.addEventListener("mousemove", updateMouseEffect)
            : e.target.removeEventListener("mousemove", updateMouseEffect);
        });
      },
      { rootMargin: "100px" }
    );
  e.forEach((e) => t.observe(e));
}
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  repeatingObserver = new IntersectionObserver((e) => {
    e.forEach((e) => e.target.classList.toggle("is-visible", e.isIntersecting));
  }, observerOptions);
export function observeAnimateOnScroll() {
  document
    .querySelectorAll(".animate-on-scroll")
    .forEach((e) => repeatingObserver.observe(e));
}
function initStarfield() {
  const e = document.getElementById("starfield-canvas"),
    t = document.body;
  if (!e || "undefined" == typeof THREE) return;
  (scene = new THREE.Scene()),
    (camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1e3
    )),
    (camera.position.z = 5),
    (renderer = new THREE.WebGLRenderer({
      canvas: e,
      alpha: !0,
      antialias: !0,
    })),
    renderer.setSize(window.innerWidth, window.innerHeight),
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const r = [],
    n = [];
  for (let e = 0; e < 15e3; e++)
    r.push(
      THREE.MathUtils.randFloatSpread(2e3),
      THREE.MathUtils.randFloatSpread(2e3),
      THREE.MathUtils.randFloat(-1e3, 1e3)
    ),
      n.push(0, 0, 0);
  (starGeometry = new THREE.BufferGeometry()),
    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(r, 3)
    ),
    starGeometry.setAttribute("color", new THREE.Float32BufferAttribute(n, 3)),
    (starMaterial = new THREE.PointsMaterial({
      size: 1.2,
      sizeAttenuation: !0,
      depthWrite: !1,
      blending: THREE.AdditiveBlending,
      vertexColors: !0,
      transparent: !0,
    })),
    (stars = new THREE.Points(starGeometry, starMaterial)),
    scene.add(stars),
    window.addEventListener("resize", onWindowResize, !1),
    document.addEventListener("mousemove", onMouseMove, { passive: !0 }),
    document.addEventListener("visibilitychange", () => {
      isTabActive = !document.hidden;
    }),
    animateStarfield(),
    updateStarColorsForTheme(
      t.classList.contains("dark-mode") ? "dark" : "light"
    );
}
function onWindowResize() {
  camera &&
    renderer &&
    ((camera.aspect = window.innerWidth / window.innerHeight),
    camera.updateProjectionMatrix(),
    renderer.setSize(window.innerWidth, window.innerHeight));
}
function onMouseMove(e) {
  (mouseX = e.clientX - window.innerWidth / 2),
    (mouseY = e.clientY - window.innerHeight / 2);
}
const STAR_SPEED_FORWARD = 0.3,
  MOUSE_INFLUENCE_FACTOR = 3e-4,
  CAMERA_SMOOTHING = 0.03,
  STAR_ROTATION_FACTOR = 3e-6;
function lerp(e, t, r) {
  return (1 - r) * e + r * t;
}
function animateStarfield() {
  if (!stars) return void requestAnimationFrame(animateStarfield);
  const e = getAnalyserNode(),
    t = isMusicActive();
  if (isTabActive && !document.body.classList.contains("no-animations")) {
    const r = starGeometry.attributes.position.array,
      n = starGeometry.attributes.color.array;
    if (t && e) {
      const t = e.frequencyBinCount,
        i = new Uint8Array(t);
      e.getByteFrequencyData(i);
      const o = i.slice(0, t / 8).reduce((e, t) => e + t, 0) / (t / 8) / 255,
        a =
          i.slice(t / 8, t / 2).reduce((e, t) => e + t, 0) /
          (t / 2 - t / 8) /
          255,
        s = 5e-4 * Date.now();
      starMaterial.size = lerp(starMaterial.size, 1.2 + 1.5 * o, 0.1);
      for (let e = 0; e < n.length; e += 3) {
        const t = (s + 0.001 * r[e]) % 1,
          i = 0.7 + 0.3 * a,
          c = 0.5 + 0.2 * Math.sin(5 * s + 0.01 * r[e + 1]) * o,
          d = new THREE.Color();
        d.setHSL(t, i, c),
          (n[e] = lerp(n[e], d.r, 0.1)),
          (n[e + 1] = lerp(n[e + 1], d.g, 0.1)),
          (n[e + 2] = lerp(n[e + 2], d.b, 0.1));
      }
      starGeometry.attributes.color.needsUpdate = !0;
    } else starMaterial.size = lerp(starMaterial.size, 1.2, 0.05);
    r.forEach((e, t) => {
      t % 3 == 2 && ((r[t] += STAR_SPEED_FORWARD), r[t] > 1e3 && (r[t] = -1e3));
    }),
      (starGeometry.attributes.position.needsUpdate = !0),
      (camera.position.x +=
        (mouseX * MOUSE_INFLUENCE_FACTOR - camera.position.x) *
        CAMERA_SMOOTHING),
      (camera.position.y +=
        (-mouseY * MOUSE_INFLUENCE_FACTOR - camera.position.y) *
        CAMERA_SMOOTHING),
      camera.lookAt(scene.position),
      (stars.rotation.y += -mouseX * STAR_ROTATION_FACTOR),
      (stars.rotation.x += -mouseY * STAR_ROTATION_FACTOR),
      renderer.render(scene, camera);
  }
  requestAnimationFrame(animateStarfield);
}
export function updateStarColorsForTheme(e) {
  if (!starGeometry) return;
  const t = starGeometry.attributes.color.array,
    r = new THREE.Color();
  for (let n = 0; n < t.length; n += 3) {
    const i = 0.5 * Math.random() + 0.5;
    "dark" === e
      ? r.setRGB(i, i, i)
      : r.setHSL(0.6, 0.9, 0.5 * Math.random() + 0.2),
      (t[n] = r.r),
      (t[n + 1] = r.g),
      (t[n + 2] = r.b);
  }
  starGeometry.attributes.color.needsUpdate = !0;
}
export function initializeVisuals() {
  initStarfield(), observeAnimateOnScroll(), initializeHoverEffects();
}
