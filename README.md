# Nam Tran's Personal Portfolio - An Interactive Web Experience

Welcome to the source code of Nam Tran's personal portfolio. This is more than just a self-introduction website; it's a showcase of modern Front-end development techniques, focusing on user experience, performance, and high-end interactive effects.

[➡️ **View Live Demo**](https://tranvohoangnam.id.vn/portfolio/)

---

## 🚀 Key Features

This project was built from scratch (Vanilla JS) to demonstrate a deep understanding of the web platform, featuring unique functionalities:

*   **🌐 Multilingual Support:** Smoothly switch between multiple languages (Vietnamese, English, Japanese, Korean) without a page reload, using `JSON` and the `View Transitions API`.
*   **🌌 GPU-Accelerated Starfield:** A 3D starfield background accelerated by the GPU (using `Three.js` and `GLSL shaders`) that moves with the mouse and reacts to music, optimized to have minimal impact on CPU performance.
*   **🎵 Advanced Audio Engine & Player:**
    *   A background music player with a playlist, shuffle/repeat modes.
    *   An advanced Web Audio API chain (EQ, Compressor, Limiter) for crisp and professional sound quality.
    *   Sound effects (SFX) for UI interactions.
*   **🎨 Apple-Inspired UI:**
    *   A sophisticated "Glassmorphism" effect on cards and buttons.
    *   Light/Dark Mode toggle with a beautiful transition effect (`View Transitions API`).
    *   An iOS-style "Control Center" for quick access to settings.
*   **✨ Micro-interactions:**
    *   A "scramble" text effect during language switching.
    *   A light effect that follows the mouse cursor on interactive elements.
    *   Scroll-triggered animations using `IntersectionObserver`.
*   **📱 Comprehensive Optimization:**
    *   **Progressive Web App (PWA):** Installable on the home screen and works offline.
    *   **SEO & Accessibility:** SEO-optimized with dynamic `JSON-LD`, `canonical` tags, and `meta` tags. `aria` attributes are used to improve accessibility.
    *   **Load Performance:** Utilizes `preload`, `loading="lazy"` for images/videos, and next-gen image formats (`.webp`, `.avif`).

---

## 🛠️ Tech Stack

*   **Core Languages:** Vanilla JavaScript (ES6+ Modules), HTML5, CSS3
*   **Graphics & Animation:**
    *   `Three.js` & `GLSL`: For the 3D starfield.
    *   `View Transitions API`: For smooth scene transitions.
    *   `IntersectionObserver`: For scroll animations.
*   **Audio:** `Web Audio API`
*   **Optimization & PWA:**
    *   `Service Worker`: For offline capabilities.
    *   `manifest.json`: PWA configuration.
*   **Fonts & Icons:**
    *   Font Awesome
*   **SEO:**
    *   `JSON-LD` (Schema.org)

---

## 🚀 Getting Started

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Namtran592005/portfolio.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd portfolio
    ```
3.  **Run a local server:**
    Because this project uses ES Modules and a Service Worker, you must run it through a server. You cannot open the `index.html` file directly.
    *   **If you have VS Code:** Install the "Live Server" extension and click "Go Live".
    *   **If you have Python:**
        ```bash
        python -m http.server
        ```
    *   **If you have Node.js:**
        ```bash
        npm install -g serve
        serve .
        ```
4.  Open your browser and navigate to the local server address (usually `http://localhost:5500` or `http://localhost:8000`).

---
## 📄 License

This source code is provided primarily for educational and skill-demonstration purposes. Please refrain from copying the entire project for commercial use or personal use without significant modification. If you use snippets or ideas from this repository, a credit would be highly appreciated.

---
Thank you for visiting! If you have any questions or feedback, feel free to open an [Issue](https://github.com/Namtran592005/portfolio/issues).