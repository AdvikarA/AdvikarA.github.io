/* Private visitor tracker for advikara.github.io.
   Sends pageviews, link/button clicks, and time-on-page to the collector.
   Opt this browser out by visiting any page with ?notrack=1 (undo with ?notrack=0). */
(function () {
  var ENDPOINT = "https://advikara-tracker.vercel.app/api/collect";

  try {
    var q = new URLSearchParams(location.search);
    if (q.get("notrack") === "1") localStorage.setItem("notrack", "1");
    if (q.get("notrack") === "0") localStorage.removeItem("notrack");
    if (localStorage.getItem("notrack") === "1") return;
  } catch (e) {}

  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return;

  var vid = "anon";
  try {
    vid = localStorage.getItem("vid");
    if (!vid) {
      vid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem("vid", vid);
    }
  } catch (e) {}

  function send(type, extra) {
    var payload = {
      type: type,
      vid: vid,
      path: location.pathname + location.search,
      title: document.title,
      ref: document.referrer,
      screen: screen.width + "x" + screen.height,
      lang: navigator.language,
      tz: (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ""; } })()
    };
    if (extra) for (var k in extra) payload[k] = extra[k];
    var body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain" }))) return;
    } catch (e) {}
    try {
      fetch(ENDPOINT, { method: "POST", body: body, keepalive: true, mode: "cors", headers: { "Content-Type": "text/plain" } }).catch(function () {});
    } catch (e) {}
  }

  send("pageview");

  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("a, button") : null;
    if (!el) return;
    send("click", {
      href: el.href || "",
      text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
      tag: el.tagName.toLowerCase()
    });
  }, true);

  var start = Date.now();
  var maxScroll = 0;
  var left = false;
  window.addEventListener("scroll", function () {
    var doc = document.documentElement;
    var pct = Math.round((window.scrollY + window.innerHeight) / Math.max(1, doc.scrollHeight) * 100);
    if (pct > maxScroll) maxScroll = Math.min(100, pct);
  }, { passive: true });

  function leave() {
    if (left) return;
    left = true;
    send("leave", { seconds: Math.round((Date.now() - start) / 1000), scroll: maxScroll });
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") leave();
  });
  window.addEventListener("pagehide", leave);
})();
