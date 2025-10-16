let scene,
  camera,
  renderer,
  stars,
  starGeometry,
  starMaterial,
  starfieldCanvas,
  mouseX = 0,
  mouseY = 0,
  isTabActive = !0,
  isStarfieldActive = false,
  clock = new THREE.Clock(),
  smoothedBass = 0,
  smoothedMid = 0;
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
const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uBassIntensity;
  attribute float aScale;
  varying vec3 vColor;
  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }
  void main() {
    vColor = color;
    float zPos = position.z + uTime * 0.3;
    vec3 animatedPosition = vec3(position.x, position.y, mod(zPos + 1000.0, 2000.0) - 1000.0);
    animatedPosition.xy += uMouse * 3.0;
    vec4 modelViewPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
    float size = 1.2 + (1.5 * uBassIntensity);
    gl_PointSize = size * (300.0 / -modelViewPosition.z);
  }
`;
const fragmentShader = `
  uniform float uTime;
  uniform float uBassIntensity;
  uniform float uMidIntensity;
  varying vec3 vColor; 
  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }
  void main() {
    vec3 finalColor = vColor;
    if (uBassIntensity > 0.01) {
        float musicTime = uTime * 0.00005; 
        float hue = mod(musicTime + (vColor.r * 10.0), 1.0);
        float saturation = 0.7 + 0.3 * uMidIntensity;
        float lightness = 0.5 + 0.2 * sin(5.0 * musicTime * 100.0 + (vColor.g * 100.0)) * uBassIntensity;
        vec3 musicColor = hsl2rgb(vec3(hue, saturation, lightness));
        finalColor = mix(vColor, musicColor, uBassIntensity * 0.8 + 0.2);
    }
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
function initStarfield() {
  starfieldCanvas = document.getElementById("starfield-canvas");
  if (!starfieldCanvas || "undefined" == typeof THREE) return;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1e3
  );
  camera.position.z = 5;
  renderer = new THREE.WebGLRenderer({
    canvas: starfieldCanvas,
    alpha: !0,
    antialias: !0,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
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
  starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(r, 3));
  starGeometry.setAttribute("color", new THREE.Float32BufferAttribute(n, 3));
  starMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uBassIntensity: { value: 0.0 },
      uMidIntensity: { value: 0.0 },
    },
    vertexShader,
    fragmentShader,
    depthWrite: !1,
    blending: THREE.AdditiveBlending,
    vertexColors: !0,
    transparent: !0,
  });
  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
  window.addEventListener("resize", onWindowResize, !1);
  document.addEventListener("mousemove", onMouseMove, { passive: !0 });
  document.addEventListener("visibilitychange", () => {
    isTabActive = !document.hidden;
  });
  updateStarColorsForTheme(
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
}
function onWindowResize() {
  if (!isStarfieldActive) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function onMouseMove(e) {
  mouseX = e.clientX - window.innerWidth / 2;
  mouseY = e.clientY - window.innerHeight / 2;
}
function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}
function animateStarfield() {
  requestAnimationFrame(animateStarfield);
  if (
    !isStarfieldActive ||
    !isTabActive ||
    document.body.classList.contains("no-animations")
  ) {
    return;
  }
  const elapsedTime = clock.getElapsedTime();
  const analyser = getAnalyserNode();
  const musicIsActive = isMusicActive();
  starMaterial.uniforms.uTime.value = elapsedTime * 100;
  starMaterial.uniforms.uMouse.value.x = mouseX * 0.0001;
  starMaterial.uniforms.uMouse.value.y = -mouseY * 0.0001;
  if (musicIsActive && analyser) {
    const t = analyser.frequencyBinCount,
      i = new Uint8Array(t);
    analyser.getByteFrequencyData(i);
    const currentBass =
      i.slice(0, t / 8).reduce((e, t) => e + t, 0) / (t / 8) / 255;
    const currentMid =
      i.slice(t / 8, t / 2).reduce((e, t) => e + t, 0) / (t / 2 - t / 8) / 255;
    smoothedBass = lerp(smoothedBass, currentBass, 0.1);
    smoothedMid = lerp(smoothedMid, currentMid, 0.1);
    starMaterial.uniforms.uBassIntensity.value = smoothedBass;
    starMaterial.uniforms.uMidIntensity.value = smoothedMid;
  } else {
    starMaterial.uniforms.uBassIntensity.value = lerp(
      starMaterial.uniforms.uBassIntensity.value,
      0,
      0.05
    );
    starMaterial.uniforms.uMidIntensity.value = lerp(
      starMaterial.uniforms.uMidIntensity.value,
      0,
      0.05
    );
  }
  const CAMERA_SMOOTHING = 0.03;
  const STAR_ROTATION_FACTOR = 3e-6;
  camera.position.x += (mouseX * 0.0003 - camera.position.x) * CAMERA_SMOOTHING;
  camera.position.y +=
    (-mouseY * 0.0003 - camera.position.y) * CAMERA_SMOOTHING;
  camera.lookAt(scene.position);
  stars.rotation.y += -mouseX * STAR_ROTATION_FACTOR;
  stars.rotation.x += -mouseY * STAR_ROTATION_FACTOR;
  renderer.render(scene, camera);
}
export function updateStarColorsForTheme(e) {
  if (!starGeometry) return;
  const t = starGeometry.attributes.color.array,
    r = new THREE.Color();
  for (let n = 0; n < t.length; n += 3) {
    const originalX = starGeometry.attributes.position.array[n];
    const originalY = starGeometry.attributes.position.array[n + 1];
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
export function toggleStarfield(isActive) {
  if (isActive) {
    if (!scene) {
      initStarfield();
    }
    if (starfieldCanvas) starfieldCanvas.style.display = "block";
    isStarfieldActive = true;
  } else {
    if (starfieldCanvas) starfieldCanvas.style.display = "none";
    isStarfieldActive = false;
  }
}
export function initializeVisuals() {
  observeAnimateOnScroll();
  initializeHoverEffects();
  animateStarfield();
  if (document.body.classList.contains("dark-mode")) {
    toggleStarfield(true);
  }
}
