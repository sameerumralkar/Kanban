/*
 * Meeting reminder hook
 * ---------------------
 * Shows a popup about the IT Project Briefing once the visitor has spent
 * 10 seconds on the page (only time while the tab is visible counts).
 * Shown once per browser session; dismiss with the button, the X, Esc,
 * or a click on the backdrop.
 *
 * Usage: include on any page of the site, e.g.
 *   <script src="meeting-reminder.js" defer></script>
 */
(function () {
  "use strict";

  var CONFIG = {
    delayMs: 10000,
    storageKey: "itBriefingReminderShown",
    title: "IT Project Briefing",
    when: "Wednesday, 14 October 2026 · 2:00 PM",
    where: "Town Hall meeting room",
    // Stop showing the reminder once the meeting has started.
    expiresAt: new Date(2026, 9, 14, 14, 0, 0)
  };

  function alreadyShown() {
    try { return sessionStorage.getItem(CONFIG.storageKey) === "1"; } catch (e) { return false; }
  }

  function markShown() {
    try { sessionStorage.setItem(CONFIG.storageKey, "1"); } catch (e) { /* storage unavailable */ }
  }

  if (alreadyShown() || Date.now() >= CONFIG.expiresAt.getTime()) return;

  var css =
    ".mr-backdrop{position:fixed;inset:0;background:rgba(13,42,77,.45);display:flex;align-items:center;justify-content:center;padding:16px;z-index:2147483000;animation:mr-fade .2s ease-out}" +
    ".mr-dialog{position:relative;background:#fff;color:#1b2430;max-width:420px;width:100%;border-radius:12px;border-top:6px solid #0b4f9c;box-shadow:0 20px 50px rgba(0,0,0,.25);padding:24px 24px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;animation:mr-pop .25s ease-out}" +
    ".mr-eyebrow{margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#0b4f9c}" +
    ".mr-title{margin:0 0 16px;font-size:20px;line-height:1.3}" +
    ".mr-row{display:flex;gap:10px;align-items:flex-start;margin:0 0 10px;font-size:15px;line-height:1.4}" +
    ".mr-label{min-width:56px;color:#5b6878;font-weight:600}" +
    ".mr-actions{display:flex;justify-content:flex-end;margin-top:20px}" +
    ".mr-btn{background:#0b4f9c;color:#fff;border:0;border-radius:8px;padding:10px 18px;font:inherit;font-size:14px;font-weight:600;cursor:pointer}" +
    ".mr-btn:hover{background:#093f7d}" +
    ".mr-btn:focus-visible,.mr-close:focus-visible{outline:3px solid #8bb8ee;outline-offset:2px}" +
    ".mr-close{position:absolute;top:10px;right:10px;width:32px;height:32px;border:0;background:transparent;color:#5b6878;font-size:22px;line-height:1;border-radius:6px;cursor:pointer}" +
    ".mr-close:hover{background:#e3edf9;color:#1b2430}" +
    "@media (prefers-color-scheme:dark){.mr-dialog{background:#1b2430;color:#f4f7fb}.mr-label{color:#a9b4c2}.mr-close{color:#a9b4c2}.mr-close:hover{background:#2a3646;color:#f4f7fb}.mr-eyebrow{color:#8bb8ee}}" +
    "@media (prefers-reduced-motion:reduce){.mr-backdrop,.mr-dialog{animation:none}}" +
    "@keyframes mr-fade{from{opacity:0}to{opacity:1}}" +
    "@keyframes mr-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}";

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  function row(label, value) {
    var r = el("p", "mr-row");
    r.appendChild(el("span", "mr-label", label));
    r.appendChild(el("span", null, value));
    return r;
  }

  function showPopup() {
    if (alreadyShown()) return;
    markShown();

    var style = el("style");
    style.textContent = css;
    document.head.appendChild(style);

    var previousFocus = document.activeElement;
    var backdrop = el("div", "mr-backdrop");
    var dialog = el("div", "mr-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "mr-title");

    var close = el("button", "mr-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close reminder");

    var title = el("h2", "mr-title", CONFIG.title);
    title.id = "mr-title";

    var actions = el("div", "mr-actions");
    var ok = el("button", "mr-btn", "Got it");
    ok.type = "button";
    actions.appendChild(ok);

    dialog.appendChild(close);
    dialog.appendChild(el("p", "mr-eyebrow", "Upcoming meeting"));
    dialog.appendChild(title);
    dialog.appendChild(row("When", CONFIG.when));
    dialog.appendChild(row("Where", CONFIG.where));
    dialog.appendChild(actions);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    ok.focus();

    function dismiss() {
      document.removeEventListener("keydown", onKey, true);
      backdrop.remove();
      style.remove();
      if (previousFocus && previousFocus.focus) previousFocus.focus();
    }

    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); dismiss(); }
      else if (e.key === "Tab") {
        // Keep focus inside the dialog.
        e.preventDefault();
        (document.activeElement === ok ? close : ok).focus();
      }
    }

    ok.addEventListener("click", dismiss);
    close.addEventListener("click", dismiss);
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) dismiss(); });
    document.addEventListener("keydown", onKey, true);
  }

  // Count only time the page is actually visible.
  var remaining = CONFIG.delayMs;
  var startedAt = 0;
  var timer = null;

  function start() {
    if (timer || remaining <= 0) return;
    startedAt = Date.now();
    timer = setTimeout(function () { timer = null; remaining = 0; showPopup(); }, remaining);
  }

  function pause() {
    if (!timer) return;
    clearTimeout(timer);
    timer = null;
    remaining -= Date.now() - startedAt;
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) pause(); else start();
  });

  function init() { if (!document.hidden) start(); }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
