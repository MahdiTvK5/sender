(function () {
  "use strict";

  const faDigits = (s) =>
    String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

  /* ------------------------------------------------------------------ */
  /* Theme                                                              */
  /* ------------------------------------------------------------------ */
  function setupTheme() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      const root = document.documentElement;
      const next = root.classList.contains("light") ? "dark" : "light";
      root.classList.remove("light", "dark");
      root.classList.add(next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
  }

  /* ------------------------------------------------------------------ */
  /* Toast                                                              */
  /* ------------------------------------------------------------------ */
  const ICON_OK =
    '<svg class="icon icon-sm icon-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>';
  const ICON_ERR =
    '<svg class="icon icon-sm icon-err" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>';

  function toast(message, variant) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = (variant === "error" ? ICON_ERR : ICON_OK) + "<span></span>";
    el.querySelector("span").textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add("hide");
      setTimeout(() => el.remove(), 260);
    }, 2400);
  }

  /* ------------------------------------------------------------------ */
  /* Clipboard                                                          */
  /* ------------------------------------------------------------------ */
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast("کپی شد.", "success");
    } catch (e) {
      toast("کپی ناموفق بود.", "error");
    }
  }

  function setupCopyDelegation() {
    document.addEventListener("click", function (ev) {
      const btn = ev.target.closest("[data-copy]");
      if (!btn) return;
      copyText(btn.getAttribute("data-copy"));
    });
  }

  /* ------------------------------------------------------------------ */
  /* Countdown                                                          */
  /* ------------------------------------------------------------------ */
  function pad(n) {
    return String(n).padStart(2, "0");
  }
  function fmt(ms) {
    const t = Math.max(0, Math.floor(ms / 1000));
    return pad(Math.floor(t / 3600)) + ":" + pad(Math.floor((t % 3600) / 60)) + ":" + pad(t % 60);
  }
  function initCountdown(el, onExpire) {
    const expiresAt = parseInt(el.getAttribute("data-countdown"), 10);
    const valueEl = el.querySelector(".countdown-value");
    function tick() {
      const left = expiresAt - Date.now();
      if (valueEl) valueEl.textContent = fmt(left);
      if (left <= 0) {
        clearInterval(timer);
        el.classList.add("expired");
        if (valueEl) valueEl.textContent = "00:00:00";
        if (el.getAttribute("data-expire-reload")) {
          location.reload();
        } else if (typeof onExpire === "function") {
          onExpire();
        }
      }
    }
    tick();
    const timer = setInterval(tick, 1000);
    return timer;
  }
  function setupCountdowns() {
    document.querySelectorAll("[data-countdown]").forEach((el) => initCountdown(el));
  }

  /* ------------------------------------------------------------------ */
  /* Dates                                                              */
  /* ------------------------------------------------------------------ */
  function setupDates() {
    document.querySelectorAll("[data-datetime]").forEach((el) => {
      const ts = parseInt(el.getAttribute("data-datetime"), 10);
      if (!ts) return;
      try {
        el.textContent = new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(ts));
      } catch (e) {
        el.textContent = new Date(ts).toLocaleString();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Generator                                                          */
  /* ------------------------------------------------------------------ */
  const ICON_LINK =
    '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  const ICON_COPY =
    '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
  const ICON_TRASH =
    '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';
  const ICON_EXT =
    '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';

  function escapeAttr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderResult(data) {
    const link = escapeAttr(data.shareLink);
    return (
      '<div class="divider"></div>' +
      '<div class="inner-card">' +
        '<div class="field">' +
          '<label class="label">لینک مستقیم اشتراک</label>' +
          '<div class="copy-row">' +
            '<input class="input mono" dir="ltr" readonly value="' + link + '" onfocus="this.select()" />' +
            '<button class="btn btn-ghost btn-icon" type="button" data-copy="' + link + '">' + ICON_COPY + "</button>" +
          "</div>" +
        "</div>" +
        '<div class="two-col">' +
          '<div class="code-block">' +
            '<p class="code-label">کد اختصاصی شما</p>' +
            '<p class="neon-code" dir="ltr">' + data.code + "</p>" +
            '<div style="margin-top:0.9rem"><span class="status-pill status-active" data-status><span class="dot dot-green"></span><span>فعال</span></span></div>' +
            '<div class="timer-box" style="margin-top:0.9rem">' +
              '<p class="mini-label">زمان باقی‌مانده تا انقضا</p>' +
              '<div class="countdown" data-countdown="' + data.expiresAt + '">' +
                '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' +
                '<span class="countdown-value" dir="ltr">24:00:00</span>' +
              "</div>" +
            "</div>" +
          "</div>" +
          '<div class="qr-wrap">' +
            '<div class="qr-box"><img src="' + escapeAttr(data.qr) + '" alt="QR" width="176" height="176" /></div>' +
            '<p class="mini-label center">اسکن برای باز کردن لینک</p>' +
          "</div>" +
        "</div>" +
        '<div class="actions">' +
          '<button class="btn btn-ghost" type="button" data-copy="' + data.code + '">' + ICON_COPY + '<span class="btn-label">کپی کد</span></button>' +
          '<button class="btn btn-ghost" type="button" data-copy="' + link + '">' + ICON_LINK + '<span class="btn-label">کپی لینک</span></button>' +
          '<a class="btn btn-ghost" href="' + link + '" target="_blank" rel="noopener noreferrer">' + ICON_EXT + '<span class="btn-label">باز کردن</span></a>' +
          '<button class="btn btn-ghost btn-danger" type="button" data-delete="' + data.code + '">' + ICON_TRASH + '<span class="btn-label">حذف</span></button>' +
        "</div>" +
      "</div>"
    );
  }

  function setupGenerator() {
    const input = document.getElementById("config-input");
    const btn = document.getElementById("generate-btn");
    const result = document.getElementById("result");
    const charCount = document.getElementById("char-count");
    if (!input || !btn || !result) return;

    input.addEventListener("input", function () {
      if (charCount) charCount.textContent = faDigits(input.value.length) + " کاراکتر";
    });

    btn.addEventListener("click", async function () {
      const config = input.value;
      if (config.trim().length === 0) {
        toast("کانفیگ نمی‌تواند خالی باشد.", "error");
        return;
      }
      const label = btn.querySelector(".btn-label");
      const original = label ? label.textContent : "";
      btn.disabled = true;
      if (label) label.textContent = "در حال ساخت...";
      try {
        const res = await fetch("/api/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: config }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast(data.error || "خطا در ساخت لینک.", "error");
          return;
        }
        result.innerHTML = renderResult(data);
        result.classList.add("show");
        const cd = result.querySelector("[data-countdown]");
        if (cd) {
          initCountdown(cd, function () {
            const pill = result.querySelector("[data-status]");
            if (pill) {
              pill.className = "status-pill status-expired";
              pill.innerHTML = '<span class="dot dot-red"></span><span>منقضی شده</span>';
            }
            const banner = document.createElement("p");
            banner.className = "expired-banner";
            banner.textContent = "این لینک منقضی شده است.";
            result.querySelector(".inner-card").appendChild(banner);
          });
        }
        toast("لینک هوشمند ساخته شد.", "success");
      } catch (e) {
        toast("خطای شبکه. دوباره تلاش کنید.", "error");
      } finally {
        btn.disabled = false;
        if (label) label.textContent = original;
      }
    });

    // Delete (event delegation, scoped to result)
    result.addEventListener("click", async function (ev) {
      const del = ev.target.closest("[data-delete]");
      if (!del) return;
      const code = del.getAttribute("data-delete");
      del.disabled = true;
      try {
        const res = await fetch("/api/config/" + code, { method: "DELETE" });
        if (res.ok || res.status === 404) {
          toast("کانفیگ حذف شد.", "success");
          result.classList.remove("show");
          result.innerHTML = "";
          input.value = "";
          if (charCount) charCount.textContent = "۰ کاراکتر";
        } else {
          const data = await res.json().catch(() => ({}));
          toast(data.error || "حذف ناموفق بود.", "error");
        }
      } catch (e) {
        toast("خطای شبکه هنگام حذف.", "error");
      } finally {
        del.disabled = false;
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Receive                                                            */
  /* ------------------------------------------------------------------ */
  function setupReceive() {
    const input = document.getElementById("receive-input");
    const btn = document.getElementById("receive-btn");
    if (!input || !btn) return;

    input.addEventListener("input", function () {
      input.value = input.value.replace(/\D/g, "").slice(0, 5);
    });

    async function go() {
      const code = input.value;
      if (code.length !== 5) {
        toast("کد باید ۵ رقم باشد.", "error");
        return;
      }
      const label = btn.querySelector(".btn-label");
      const original = label ? label.textContent : "";
      btn.disabled = true;
      if (label) label.textContent = "در حال بررسی...";
      try {
        const res = await fetch("/api/config/" + code);
        if (res.status === 404) {
          toast("کانفیگی پیدا نشد.", "error");
          return;
        }
        if (res.status === 410) {
          toast("این لینک منقضی شده است.", "error");
          return;
        }
        window.location.href = "/s/" + code;
      } catch (e) {
        toast("خطای شبکه. دوباره تلاش کنید.", "error");
      } finally {
        btn.disabled = false;
        if (label) label.textContent = original;
      }
    }

    btn.addEventListener("click", go);
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") go();
    });
  }

  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    setupTheme();
    setupCopyDelegation();
    setupCountdowns();
    setupDates();
    setupGenerator();
    setupReceive();
  });
})();
