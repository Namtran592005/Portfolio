const CACHE_VERSION = "v3.0.0",
    CACHE_STATIC_CORE = `portfolio-static-core-${CACHE_VERSION}`,
    CACHE_ASSETS = `portfolio-assets-${CACHE_VERSION}`,
    CACHE_DATA = `portfolio-data-${CACHE_VERSION}`,
    CACHE_DYNAMIC_PREDICTIONS = `portfolio-predictions-${CACHE_VERSION}`,
    CACHE_MAX_DYNAMIC_ITEMS = 30,
    CACACHE_MAX_ASSET_ITEMS = 100,
    PREDICTIVE_CACHING_ENABLED = !0,
    SELF_HEALING_CACHE_ENABLED = !0,
    coreStaticUrlsToCache = ["./", "./index.html", "./css/style.css", "./js/main.js", "./js/ui.js", "./js/audio.js", "./js/visuals.js", "./js/i18n.js", "./js/text-scramble.js", "./src/Theme/three.min.js", "./src/Theme/FontAwesome/css/all.min.css", "./src/Theme/FontAwesome/webfonts/fa-solid-900.woff2", "./src/Theme/FontAwesome/webfonts/fa-brands-400.woff2", "./data/en.json", "./data/vi.json", "./data/ja.json", "./data/ko.json", "./data/zh.json", "./data/ru.json", "./data/playlist.json", "./data/playlist.json"],
    essentialAssetsToCache = ["./src/Images/portfolio.webp", "./src/Images/Apple.webp", "./src/Images/Avatar.webp", "./src/Images/Avatar2.webp", "./src/Images/Wallpaper.webp", "./src/Images/Thumbnails/Messy.webp", "./src/Images/Thumbnails/F1.webp", "./src/Videos/about_video.mp4", "./src/Audio/startup.mp3", "./src/Audio/hover.mp3", "./src/Audio/click.mp3", "./src/Audio/Messy.mp3", "./src/Audio/F1.mp3", "./src/Theme/mac-cursors/default.png", "./src/Theme/mac-cursors/handpointing.png", "./src/Product/Chatbot/index.html", "./src/Product/Ultility/index.html", "./src/File/Porfolio.pdf"],
    allActiveCacheNames = [CACHE_STATIC_CORE, CACHE_ASSETS, CACHE_DATA, CACHE_DYNAMIC_PREDICTIONS],
    LOAD_COUNT_KEY = "sw_load_count",
    MAX_LOAD_CYCLES = 3,
    DEBUG = !0;

function log(...e) {
    DEBUG && console.log(`[SW-v${CACHE_VERSION}]`, ...e)
}
async function trimCache(e, s) {
    const t = await caches.open(e),
        a = await t.keys();
    a.length > s && (await t.delete(a[0]), log(`Cache trimmed for ${e}, removed oldest entry.`))
}
async function manageLoadCount() {
    let e = await caches.open(CACHE_STATIC_CORE).then((e => e.match(new Request(LOAD_COUNT_KEY)))).then((e => e ? parseInt(e.text()) : 0)).catch((() => 0));
    return log(`Current Load Cycle: ${e + 1} / 3`), e >= 2 ? (log("Load cycle limit (3 loads) reached. Initiating cache reset."), await caches.keys().then((e => Promise.all(e.map((e => caches.delete(e)))))), log("All caches cleared. Resetting load count."), await caches.open(CACHE_STATIC_CORE).then((e => e.put(new Request(LOAD_COUNT_KEY), new Response("0")))), self.skipWaiting(), !0) : (e++, await caches.open(CACHE_STATIC_CORE).then((s => s.put(new Request(LOAD_COUNT_KEY), new Response(e.toString())))), !1)
}
async function selfHealCache(e, s) {
    const t = await caches.open(e),
        a = (await t.keys()).map((e => e.url)),
        c = s.filter((e => !a.some((s => s.endsWith(e.substring(1))))));
    if (c.length > 0) {
        log(`Self-Healing: Found ${c.length} missing essential assets in ${e}. Attempting to re-cache.`);
        try {
            await t.addAll(c), log(`Self-Healing: Successfully re-cached missing assets in ${e}.`)
        } catch (s) {
            log(`Self-Healing: Failed to re-cache some assets in ${e}:`, s)
        }
    }
}
self.addEventListener("install", (e => {
    log("Service Worker: Installing..."), e.waitUntil((async () => {
        const e = await caches.open(CACHE_STATIC_CORE);
        log("Pre-caching core static assets..."), await e.addAll(coreStaticUrlsToCache), log("Core static assets pre-cached.");
        const s = await caches.open(CACHE_ASSETS);
        log("Pre-caching essential assets..."), await s.addAll(essentialAssetsToCache), log("Essential assets pre-cached."), self.skipWaiting()
    })())
})), self.addEventListener("activate", (e => {
    log("Service Worker: Activating..."), e.waitUntil((async () => {
        const e = await manageLoadCount();
        if (e) {
            log("Service Worker activated AFTER FULL CACHE CLEAR. Re-pre-caching essential assets.");
            const e = await caches.open(CACHE_STATIC_CORE);
            await e.addAll(coreStaticUrlsToCache);
            const s = await caches.open(CACHE_ASSETS);
            await s.addAll(essentialAssetsToCache)
        }
        const s = await caches.keys();
        return await Promise.all(s.map((async e => {
            allActiveCacheNames.includes(e) || (log("Service Worker: Deleting old/unused cache:", e), await caches.delete(e))
        }))), log("Service Worker: Old/unused caches cleared."), e || await selfHealCache(CACHE_ASSETS, essentialAssetsToCache), self.clients.claim()
    })())
})), self.addEventListener("fetch", (e => {
    if ("GET" !== e.request.method) return;
    if (e.request.headers.get("range")) return log("Skipping cache for Range request:", e.request.url), e.respondWith(fetch(e.request));
    const s = coreStaticUrlsToCache.some((s => e.request.url.includes(s.substring(1)))),
        t = essentialAssetsToCache.some((s => e.request.url.includes(s.substring(1)))),
        a = e.request.url.endsWith(".json"),
        c = e.request.url.match(/\.(png|jpg|jpeg|gif|webp|svg|mp4|webm)$/i),
        r = e.request.url.match(/\.(mp3|wav|ogg)$/i);
    s || a ? e.respondWith(caches.match(e.request, {
        cacheName: a ? CACHE_DATA : CACHE_STATIC_CORE
    }).then((async s => {
        const t = fetch(e.request).then((async s => {
            if (s.ok) {
                const t = await caches.open(a ? CACHE_DATA : CACHE_STATIC_CORE);
                await t.put(e.request, s.clone()), log(`Stale-While-Revalidate: Updated cache for ${e.request.url}`)
            }
            return s
        })).catch((t => (log(`Stale-While-Revalidate: Network fetch failed for ${e.request.url}:`, t), s || new Response("Offline Core", {
            status: 503
        }))));
        return s || t
    }))) : t || c || r ? e.respondWith(caches.match(e.request, {
        cacheName: CACHE_ASSETS
    }).then((async s => {
        if (s) {
            log(`Cache-First (Asset): Served from cache: ${e.request.url}`);
            const t = fetch(e.request).then((async s => {
                if (s.ok) {
                    const t = await caches.open(CACHE_ASSETS);
                    await t.put(e.request, s.clone()), await trimCache(CACHE_ASSETS, CACHE_MAX_ASSET_ITEMS), log(`Cache-First (Asset): Updated cache from network: ${e.request.url}`)
                }
                return s
            })).catch((s => log(`Cache-First (Asset): Network update failed for ${e.request.url}:`, s)));
            return e.waitUntil(t), s
        }
        return log(`Cache-First (Asset): Fetching from network: ${e.request.url}`), fetch(e.request).then((async s => {
            if (s.ok) {
                const t = await caches.open(CACHE_ASSETS);
                await t.put(e.request, s.clone()), await trimCache(CACHE_ASSETS, CACHE_MAX_ASSET_ITEMS)
            }
            return s
        })).catch((s => (log(`Cache-First (Asset): Network fetch failed for ${e.request.url}:`, s), new Response("Offline Asset", {
            status: 503
        }))))
    }))) : e.respondWith(fetch(e.request).then((async s => {
        if (s.ok && e.request.url.startsWith(self.location.origin)) {
            const t = await caches.open(CACHE_DYNAMIC_PREDICTIONS);
            await t.put(e.request, s.clone()), await trimCache(CACHE_DYNAMIC_PREDICTIONS, 30), log(`Predictive Cache: Cached dynamic item: ${e.request.url}`)
        }
        return s
    })).catch((async s => {
        log(`Predictive Cache: Network failed for ${e.request.url}. Trying cache.`, s);
        const t = await caches.match(e.request, {
            cacheName: CACHE_DYNAMIC_PREDICTIONS
        });
        return t ? (log(`Predictive Cache: Served from dynamic cache: ${e.request.url}`), t) : new Response("Offline Predicted", {
            status: 503
        })
    })))
})), self.addEventListener("message", (e => {
    e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting()
}));