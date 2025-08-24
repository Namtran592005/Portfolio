let audioContext,
  analyserNode,
  sourceNode,
  mainGainNode,
  advancedAudioChainStart,
  isAudioSetup = !1,
  isMusicPlaying = !1,
  areSfxEnabled = !0,
  userVolume = 0.5,
  isAdvancedAudioEnabled = !0;
const backgroundMusic = document.getElementById("background-music"),
  musicToggleButton = document.getElementById("music-toggle"),
  sfxToggleButton = document.getElementById("sfx-toggle"),
  visualizerCanvas = document.getElementById("music-visualizer"),
  musicPlayerPopup = document.getElementById("music-player-popup"),
  trackTitleElement = document.getElementById("track-title"),
  trackProgressFill = document.getElementById("track-progress-fill"),
  prevTrackBtn = document.getElementById("prev-track-btn"),
  playPausePopupBtn = document.getElementById("play-pause-popup-btn"),
  nextTrackBtn = document.getElementById("next-track-btn"),
  trackThumbnail = document.getElementById("track-thumbnail"),
  currentTimeElement = document.getElementById("current-time"),
  totalTimeElement = document.getElementById("total-time"),
  shuffleBtn = document.getElementById("shuffle-btn"),
  repeatBtn = document.getElementById("repeat-btn");
let musicPlaylist = [],
  currentTrackIndex = 0,
  popupUpdateInterval = null,
  longPressTimer = null,
  isLongPress = !1,
  originalPlaylist = [],
  isShuffle = !1,
  repeatMode = "none",
  clickTimer = null,
  clickCount = 0;
const DOUBLE_CLICK_DELAY = 250;
async function loadPlaylist() {
  try {
    const e = await fetch(`./data/playlist.json?v=${new Date().getTime()}`);
    if (!e.ok) throw new Error("Could not load playlist.json");
    (originalPlaylist = await e.json()),
      (musicPlaylist = [...originalPlaylist]),
      musicPlaylist.length > 0
        ? updatePlayerUI(currentTrackIndex)
        : (console.warn("Music playlist is empty."),
          musicToggleButton?.setAttribute("disabled", "true"));
  } catch (e) {
    console.error("Failed to load music playlist:", e),
      musicToggleButton?.setAttribute("disabled", "true");
  }
}
export function initializeAudio() {
  loadPlaylist();
  const e = document.getElementById("volume-slider"),
    t = document.getElementById("brightness-slider"),
    n = document.getElementById("audio-engine-toggle"),
    a = document.getElementById("hoverSound"),
    o = document.getElementById("clickSound");
  if (
    (document
      .querySelectorAll(
        "a, button, [role='button'], .interactive, .apple-card, .nav-link, .quick-action-btn, .glass-action-button, .profile-pic, .portfolio-tags .tag"
      )
      .forEach((e) => {
        e.addEventListener("mouseenter", () => playSfx(a)),
          e.addEventListener("click", () => playSfx(o));
      }),
      musicToggleButton &&
      musicToggleButton.addEventListener("click", () => {
        clickCount++,
          1 === clickCount
            ? (clickTimer = setTimeout(() => {
              toggleMusic(), (clickCount = 0);
            }, 250))
            : 2 === clickCount &&
            (clearTimeout(clickTimer), showMusicPopup(), (clickCount = 0));
      }),
      sfxToggleButton?.addEventListener("click", toggleSfx),
      backgroundMusic.addEventListener("ended", handleTrackEnd),
      backgroundMusic.addEventListener("loadedmetadata", updateTimeStamps),
      prevTrackBtn?.addEventListener("click", playPreviousTrack),
      playPausePopupBtn?.addEventListener("click", toggleMusic),
      nextTrackBtn?.addEventListener("click", playNextTrack),
      shuffleBtn?.addEventListener("click", toggleShuffle),
      repeatBtn?.addEventListener("click", toggleRepeat),
      document.addEventListener("click", (e) => {
        if (musicPlayerPopup && musicPlayerPopup.classList.contains("visible")) {
          const t = musicPlayerPopup.contains(e.target),
            n = musicToggleButton.contains(e.target);
          t || n || hideMusicPopup();
        }
      }),
      e &&
      ((userVolume = e.value / 100),
        e.addEventListener("input", handleVolumeChange),
        (backgroundMusic.volume = userVolume),
        updateIosSliderProgress(e)),
      t)
  ) {
    const e = document.getElementById("brightness-overlay");
    t.addEventListener("input", () => {
      e && (e.style.opacity = (70 - t.value) / 100), updateIosSliderProgress(t);
    }),
      updateIosSliderProgress(t);
  }
  n?.addEventListener("change", (e) => {
    (isAdvancedAudioEnabled = e.target.checked), toggleAudioPath();
  }),
    document.addEventListener("visibilitychange", () => {
      if (!isAudioSetup || !isMusicPlaying) return;
      const e = document.hidden ? 0.1 * userVolume : userVolume;
      isAdvancedAudioEnabled && mainGainNode
        ? mainGainNode.gain.setTargetAtTime(e, audioContext.currentTime, 0.5)
        : (backgroundMusic.volume = e);
    });
}
function showMusicPopup() {
  musicPlayerPopup &&
    (musicPlayerPopup.classList.add("visible"), startPopupUpdater());
}
function hideMusicPopup() {
  musicPlayerPopup &&
    (musicPlayerPopup.classList.remove("visible"), stopPopupUpdater());
}
function startPopupUpdater() {
  popupUpdateInterval && clearInterval(popupUpdateInterval),
    (popupUpdateInterval = setInterval(updatePopupState, 250)),
    updatePopupState();
}
function stopPopupUpdater() {
  clearInterval(popupUpdateInterval), (popupUpdateInterval = null);
}
function updatePopupState() {
  if (!backgroundMusic) return;
  const e = (backgroundMusic.currentTime / backgroundMusic.duration) * 100;
  (trackProgressFill.style.width = `${e || 0}%`),
    (currentTimeElement.textContent = formatTime(backgroundMusic.currentTime));
  const t = playPausePopupBtn.querySelector("i");
  isMusicPlaying
    ? t.classList.replace("fa-play", "fa-pause")
    : t.classList.replace("fa-pause", "fa-play");
}
function handleVolumeChange(e) {
  (userVolume = e.target.value / 100),
    isAdvancedAudioEnabled && mainGainNode
      ? mainGainNode.gain.setTargetAtTime(
        userVolume,
        audioContext.currentTime,
        0.05
      )
      : (backgroundMusic.volume = userVolume),
    updateIosSliderProgress(e.target);
}
function updateIosSliderProgress(e) {
  const t = document.getElementById(e.id.replace("slider", "progress"));
  t &&
    (t.style.width =
      ((e.value - (e.min || 0)) / ((e.max || 100) - (e.min || 0))) * 100 + "%");
}
function playSfx(e) {
  areSfxEnabled && e && ((e.currentTime = 0), e.play().catch(() => { }));
}
function toggleMusic() {
  if (0 === musicPlaylist.length) return;
  isAudioSetup || setupAudioAPI(),
    "suspended" === audioContext.state && audioContext.resume(),
    (isMusicPlaying = !isMusicPlaying),
    isMusicPlaying
      ? backgroundMusic.play().catch(console.error)
      : backgroundMusic.pause(),
    visualizerCanvas.classList.toggle("visible", isMusicPlaying),
    musicToggleButton.classList.toggle("spinning", isMusicPlaying),
    musicToggleButton.classList.toggle("off", !isMusicPlaying);
  const e = document.getElementById("music-toggle-wrapper");
  e && e.classList.toggle("music-on", isMusicPlaying),
    updateAudioButtonLabels(),
    isMusicPlaying && renderVisualizerFrame();
}
function toggleSfx() {
  (areSfxEnabled = !areSfxEnabled),
    sfxToggleButton.classList.toggle("off", !areSfxEnabled),
    updateAudioButtonLabels();
}
function playTrack(e) {
  0 === musicPlaylist.length ||
    e < 0 ||
    e >= musicPlaylist.length ||
    (updatePlayerUI(e),
      backgroundMusic.load(),
      backgroundMusic.addEventListener(
        "canplay",
        () => {
          isMusicPlaying &&
            backgroundMusic.play().catch((e) => console.error("Play error:", e));
        },
        { once: !0 }
      ));
}
function updatePlayerUI(e) {
  const t = musicPlaylist[e];
  t &&
    (trackThumbnail &&
      ((trackThumbnail.style.opacity = "0"),
        setTimeout(() => {
          (trackThumbnail.src = t.thumbnail),
            (trackThumbnail.style.opacity = "1");
        }, 200)),
      trackTitleElement && (trackTitleElement.textContent = t.title),
      (backgroundMusic.src = t.path));
}
function handleTrackEnd() {
  "one" === repeatMode
    ? ((backgroundMusic.currentTime = 0), backgroundMusic.play())
    : "all" === repeatMode ||
      currentTrackIndex !== musicPlaylist.length - 1 ||
      isShuffle
      ? playNextTrack()
      : ((isMusicPlaying = !0), toggleMusic());
}
function updateTimeStamps() {
  (totalTimeElement.textContent = formatTime(backgroundMusic.duration || 0)),
    (currentTimeElement.textContent = formatTime(
      backgroundMusic.currentTime || 0
    ));
}
function formatTime(e) {
  const t = Math.floor(e / 60),
    n = Math.floor(e % 60)
      .toString()
      .padStart(2, "0");
  return isNaN(t) || isNaN(n) ? "0:00" : `${t}:${n}`;
}
function toggleShuffle() {
  if (
    ((isShuffle = !isShuffle),
      shuffleBtn.classList.toggle("active", isShuffle),
      isShuffle)
  ) {
    let e = musicPlaylist[currentTrackIndex],
      t = musicPlaylist.filter((e, t) => t !== currentTrackIndex);
    for (let e = t.length - 1; e > 0; e--) {
      const n = Math.floor(Math.random() * (e + 1));
      [t[e], t[n]] = [t[n], t[e]];
    }
    (musicPlaylist = [e, ...t]), (currentTrackIndex = 0);
  } else {
    let e = musicPlaylist[currentTrackIndex];
    (musicPlaylist = [...originalPlaylist]),
      (currentTrackIndex = musicPlaylist.findIndex((t) => t.path === e.path));
  }
}
function toggleRepeat() {
  "none" === repeatMode
    ? ((repeatMode = "all"),
      repeatBtn.classList.add("active"),
      (repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>'))
    : "all" === repeatMode
      ? ((repeatMode = "one"),
        (repeatBtn.innerHTML = '<i class="fas fa-repeat-1"></i>'))
      : ((repeatMode = "none"),
        repeatBtn.classList.remove("active"),
        (repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>'));
}
function playNextTrack() {
  (currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length),
    playTrack(currentTrackIndex);
}
function playPreviousTrack() {
  (currentTrackIndex =
    (currentTrackIndex - 1 + musicPlaylist.length) % musicPlaylist.length),
    playTrack(currentTrackIndex);
}
export function updateAudioButtonLabels(e) {
  if (!e || !e.other_translations) return;
  let t = null,
    n = 0;
  if (
    (musicToggleButton &&
      musicToggleButton.addEventListener("click", () => {
        n++,
          1 === n
            ? (t = setTimeout(() => {
              toggleMusic(), (n = 0);
            }, 250))
            : 2 === n && (clearTimeout(t), showMusicPopup(), (n = 0));
      }),
      sfxToggleButton)
  ) {
    const t = areSfxEnabled ? "sfxToggleOff" : "sfxToggleOn",
      n = areSfxEnabled ? "sfxToggleAriaOff" : "sfxToggleAriaOn";
    (sfxToggleButton.title = e.other_translations[t]),
      sfxToggleButton.setAttribute("aria-label", e.other_translations[n]);
  }
}
export function handleExitSite() {
  const e = document.body,
    t = document.getElementById("page-wrapper"),
    n = document.querySelector(".audio-controls"),
    a = document.getElementById("thank-you-overlay"),
    o = document.getElementById("control-center-nav");
  o && o.classList.remove("nav-open"),
    backgroundMusic &&
    isMusicPlaying &&
    (isAdvancedAudioEnabled &&
      audioContext &&
      mainGainNode &&
      mainGainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.5),
      backgroundMusic.pause()),
    visualizerCanvas.classList.remove("visible"),
    t?.classList.add("fade-out"),
    n?.classList.add("fade-out"),
    t?.setAttribute("aria-hidden", "true"),
    e.classList.add("no-scroll"),
    setTimeout(() => {
      a.classList.add("visible"),
        a.setAttribute("aria-hidden", "false"),
        e.classList.remove("loaded-content"),
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            const t = a.querySelector(".closing-message"),
              n = a.querySelector("#manual-close-button");
            t &&
              (t.textContent =
                "Browser blocked auto-close. Please close the tab manually."),
              n &&
              ((n.style.display = "inline-flex"),
                (n.onclick = () => window.close()));
          }
        }, 3e3);
    }, 1e3);
}
function renderVisualizerFrame() {
  if (!document.hidden && isMusicPlaying && isAudioSetup) {
    requestAnimationFrame(renderVisualizerFrame);
    const e = analyserNode.frequencyBinCount,
      t = new Uint8Array(e);
    analyserNode.getByteFrequencyData(t);
    const n = visualizerCanvas.getContext("2d"),
      a = (visualizerCanvas.width = window.innerWidth),
      o = (visualizerCanvas.height = 120);
    n.clearRect(0, 0, a, o);
    const i = (a / 64) * 1.5;
    let c = 0;
    const u = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-primary")
      .trim();
    for (let e = 0; e < 64; e++) {
      const a = 0.45 * t[e],
        l = n.createLinearGradient(0, o - a, 0, o);
      l.addColorStop(0, u),
        l.addColorStop(1, "hsla(var(--hue-accent), 100%, 65%, 0.1)"),
        (n.fillStyle = l),
        n.fillRect(c, o - a, i, a),
        (c += i + 2);
    }
  }
}
function setupAudioAPI() {
  if (isAudioSetup) return;
  (audioContext = new (window.AudioContext || window.webkitAudioContext)()),
    (sourceNode = audioContext.createMediaElementSource(backgroundMusic));
  const e = audioContext.createBiquadFilter();
  (e.type = "highpass"), (e.frequency.value = 30);
  const t = audioContext.createBiquadFilter();
  (t.type = "lowpass"), (t.frequency.value = 250);
  const n = audioContext.createBiquadFilter();
  (n.type = "bandpass"), (n.frequency.value = 2125), (n.Q.value = 1.2);
  const a = audioContext.createBiquadFilter();
  (a.type = "highpass"), (a.frequency.value = 4e3);
  const o = audioContext.createDynamicsCompressor();
  (o.threshold.value = -30), (o.knee.value = 20), (o.ratio.value = 6);
  const i = audioContext.createDynamicsCompressor();
  (i.threshold.value = -24), (i.knee.value = 15), (i.ratio.value = 4);
  const c = audioContext.createDynamicsCompressor();
  (c.threshold.value = -20), (c.knee.value = 10), (c.ratio.value = 3);
  const u = audioContext.createGain(),
    l = audioContext.createBiquadFilter();
  (l.type = "highpass"), (l.frequency.value = 7e3);
  const s = audioContext.createWaveShaper(),
    r = new Float32Array(256);
  for (let e = 0; e < 256; e++) {
    const t = (2 * e) / 255 - 1;
    r[e] = Math.tanh(1.5 * t);
  }
  (s.curve = r), (s.oversample = "4x");
  const d = audioContext.createGain();
  d.gain.value = 0.2;
  const p = audioContext.createConvolver(),
    m = audioContext.createBiquadFilter();
  (m.type = "peaking"), (m.frequency.value = 1500), (m.gain.value = -3);
  const g = audioContext.createGain();
  g.gain.value = 0.12;
  p.buffer = ((e) => {
    const t = e.sampleRate,
      n = 1.8 * t,
      a = e.createBuffer(2, n, t);
    for (let e = 0; e < 2; e++) {
      const t = a.getChannelData(e);
      for (let e = 0; e < n; e++)
        t[e] = (2 * Math.random() - 1) * Math.pow(1 - e / n, 2);
    }
    return a;
  })(audioContext);
  const y = audioContext.createPanner();
  (y.panningModel = "HRTF"), (mainGainNode = audioContext.createGain());
  const f = audioContext.createDynamicsCompressor();
  (f.threshold.value = -0.5),
    (analyserNode = audioContext.createAnalyser()),
    (analyserNode.fftSize = 256),
    (advancedAudioChainStart = audioContext.createGain()),
    sourceNode.connect(advancedAudioChainStart),
    advancedAudioChainStart.connect(e),
    e.connect(t).connect(o).connect(u),
    e.connect(n).connect(i).connect(u),
    e.connect(a).connect(c).connect(u),
    u.connect(y),
    u.connect(l).connect(s).connect(d).connect(y),
    u.connect(m).connect(p).connect(g).connect(y),
    y.connect(mainGainNode),
    mainGainNode.connect(f),
    f.connect(analyserNode),
    analyserNode.connect(audioContext.destination),
    toggleAudioPath(),
    (isAudioSetup = !0),
    renderVisualizerFrame();
}
function toggleAudioPath() {
  isAudioSetup &&
    (sourceNode.disconnect(),
      isAdvancedAudioEnabled
        ? sourceNode.connect(advancedAudioChainStart)
        : (sourceNode.connect(analyserNode),
          analyserNode.connect(audioContext.destination)));
}
export const getAnalyserNode = () => analyserNode;
export const isMusicActive = () => isMusicPlaying;
