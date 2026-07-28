(() => {
  "use strict";

  // Public Google Apps Script Web App URL (deployed with "Anyone" access).
  // After changing apps-script.gs you MUST create a new Web App deployment
  // (or a new version of the existing deployment) and paste the URL here if it changes.
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbxmm1e80WT9NW-OVj1Bps9V2d0CwS4Rb8JXslzv6IZjmTq3fyskQ7elWd8BqSFI2o3s/exec";

  const EXPECTED_API = "cancel-v1";
  const DEBOUNCE_MS = 220;

  const dialog = document.getElementById("cancelRsvpDialog");
  const form = document.getElementById("cancelRsvpForm");
  if (!dialog || !form) return;

  const openButtons = Array.from(document.querySelectorAll("[data-open-cancel-rsvp]"));
  const closeButtons = Array.from(dialog.querySelectorAll("[data-close-cancel-rsvp]"));
  const stepSearch = document.getElementById("cancelStepSearch");
  const stepConfirm = document.getElementById("cancelStepConfirm");
  const stepResult = document.getElementById("cancelStepResult");
  const statusEl = document.getElementById("cancelStatus");
  const matchesEl = document.getElementById("cancelMatches");
  const confirmSummary = document.getElementById("cancelConfirmSummary");
  const selectedNameEl = document.getElementById("cancelSelectedName");
  const resultMessage = document.getElementById("cancelResultMessage");
  const nameInput = document.getElementById("cancelName");
  const searchBtn = document.getElementById("cancelSearchBtn");
  const confirmBtn = document.getElementById("cancelConfirmBtn");
  const keepBtn = document.getElementById("cancelKeepBtn");
  const backdrop = dialog.querySelector(".cancel-modal__backdrop");

  const state = {
    busy: false,
    selected: null,
    lastFocus: null,
    backendOk: null,
    searchSeq: 0,
    debounceTimer: null,
    activeIndex: -1,
    matches: [],
  };

  const OLD_BACKEND_MESSAGE =
    "Die Cancel RSVP-bediener is nog die ou RSVP-vorm. Plak die nuwe apps-script.gs in Google Apps Script en Deploy → New deployment (Web app, Anyone), dan werk die naamlys.";

  function trimCollapse(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function setStatus(type, message) {
    if (!statusEl) return;
    statusEl.classList.remove("is-success", "is-error");
    if (type === "success") statusEl.classList.add("is-success");
    if (type === "error") statusEl.classList.add("is-error");
    statusEl.textContent = message || "";
  }

  function showStep(step) {
    [stepSearch, stepConfirm, stepResult].forEach((node) => {
      if (!node) return;
      node.hidden = node !== step;
    });
  }

  function setBusy(isBusy) {
    state.busy = isBusy;
    [confirmBtn, keepBtn, searchBtn].forEach((btn) => {
      if (btn) btn.disabled = isBusy;
    });
    if (nameInput) nameInput.disabled = isBusy && stepSearch && !stepSearch.hidden;
  }

  function interpretBackendError(data, fallback) {
    const message = (data && data.message) || fallback || "Versoek het misluk.";
    if (/naam is required/i.test(message)) return OLD_BACKEND_MESSAGE;
    if (/sel nommer/i.test(message)) {
      return "Die bediener verwag nog ’n ou weergawe. Ontplooi die nuutste apps-script.gs weer.";
    }
    return message;
  }

  function buildUrl(params) {
    const url = new URL(WEB_APP_URL);
    Object.keys(params || {}).forEach((key) => {
      const value = params[key];
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
    return url.toString();
  }

  async function parseJsonResponse(res, context) {
    if (!res.ok) {
      throw new Error(
        "Netwerkfout (HTTP " +
          res.status +
          ") tydens " +
          context +
          ". Ontplooi apps-script.gs weer as Web App (Anyone)."
      );
    }

    const rawText = await res.text();
    let data = null;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      throw new Error(
        "Bediener het ’n ongeldige antwoord teruggestuur. Ontplooi die nuwe apps-script.gs as Web App."
      );
    }
    return data;
  }

  async function callAction(payload, options = {}) {
    if (!WEB_APP_URL) throw new Error("Apps Script URL is nie opgestel nie.");

    const action = String(payload.action || "").trim().toLowerCase();
    const forceGet = options.method === "GET" || action === "search" || action === "ping";

    if (forceGet) {
      const res = await fetch(buildUrl(payload), {
        method: "GET",
        credentials: "omit",
        redirect: "follow",
      });
      return parseJsonResponse(
        res,
        action === "ping" ? "kontrole" : action === "cancel" ? "kansellasie" : "soektog"
      );
    }

    const body = new URLSearchParams();
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value === undefined || value === null) return;
      body.set(key, String(value));
    });

    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      credentials: "omit",
      redirect: "follow",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: body.toString(),
    });
    return parseJsonResponse(res, "kansellasie");
  }

  async function ensureBackend() {
    if (state.backendOk === true) return true;
    try {
      const data = await callAction({ action: "ping" });
      if (data && data.api === EXPECTED_API) {
        state.backendOk = true;
        return true;
      }
      state.backendOk = false;
      setStatus("error", OLD_BACKEND_MESSAGE);
      return false;
    } catch (err) {
      state.backendOk = false;
      setStatus(
        "error",
        err instanceof Error && err.message === "Failed to fetch"
          ? "Kon nie Google Apps Script bereik nie. Ontplooi die Web App weer (Anyone)."
          : err instanceof Error
            ? err.message
            : OLD_BACKEND_MESSAGE
      );
      return false;
    }
  }

  function resetFlow() {
    state.selected = null;
    state.activeIndex = -1;
    state.matches = [];
    if (state.debounceTimer) {
      window.clearTimeout(state.debounceTimer);
      state.debounceTimer = null;
    }
    form.reset();
    if (matchesEl) {
      matchesEl.innerHTML = "";
      matchesEl.hidden = true;
    }
    if (selectedNameEl) selectedNameEl.textContent = "";
    if (nameInput) {
      nameInput.setAttribute("aria-expanded", "false");
      nameInput.removeAttribute("aria-activedescendant");
    }
    setStatus("", "");
    showStep(stepSearch);
  }

  function getFocusable() {
    return Array.from(
      dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  function openDialog() {
    state.lastFocus = document.activeElement;
    resetFlow();
    const nav = document.querySelector(".nav");
    const siteHeader = document.querySelector(".site-header");
    const navToggle = document.querySelector(".nav__toggle");
    if (nav) nav.classList.remove("is-open");
    if (siteHeader) siteHeader.classList.remove("menu-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    }
    document.documentElement.style.overflow = "hidden";
    dialog.classList.add("is-open");
    dialog.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 30);
    ensureBackend();
  }

  function closeDialog() {
    dialog.classList.remove("is-open");
    dialog.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if (state.lastFocus && typeof state.lastFocus.focus === "function") {
      state.lastFocus.focus();
    }
  }

  function clearMatches() {
    state.matches = [];
    state.activeIndex = -1;
    if (!matchesEl) return;
    matchesEl.innerHTML = "";
    matchesEl.hidden = true;
    if (nameInput) {
      nameInput.setAttribute("aria-expanded", "false");
      nameInput.removeAttribute("aria-activedescendant");
    }
  }

  function showConfirm(match) {
    state.selected = match;
    if (selectedNameEl) selectedNameEl.textContent = match.displayName || "Hierdie gas";
    if (confirmSummary) {
      confirmSummary.textContent =
        match.matchField === "guest"
          ? "Hierdie is ’n gas op die RSVP. Kansellasie verander die hele ry / geselskap na Nee."
          : "Dit kanselleer die hele RSVP / geselskap op die lys.";
    }
    showStep(stepConfirm);
    window.setTimeout(() => confirmBtn && confirmBtn.focus(), 30);
  }

  function selectMatch(match) {
    clearMatches();
    setStatus("", "");
    if (nameInput && match.displayName) nameInput.value = match.displayName;

    if (match.alreadyCancelled) {
      if (resultMessage) {
        resultMessage.textContent = "Hierdie RSVP is reeds gekanselleer.";
      }
      showStep(stepResult);
      return;
    }

    showConfirm(match);
  }

  function setActiveOption(index) {
    state.activeIndex = index;
    if (!matchesEl) return;
    const options = Array.from(matchesEl.querySelectorAll(".cancel-match"));
    options.forEach((opt, i) => {
      const active = i === index;
      opt.classList.toggle("is-active", active);
      opt.setAttribute("aria-selected", active ? "true" : "false");
      if (active && nameInput) nameInput.setAttribute("aria-activedescendant", opt.id);
    });
  }

  function renderMatches(matches, notice) {
    if (!matchesEl) return;
    state.matches = matches;
    state.activeIndex = matches.length ? 0 : -1;
    matchesEl.innerHTML = "";

    if (!matches.length) {
      matchesEl.hidden = true;
      if (nameInput) nameInput.setAttribute("aria-expanded", "false");
      return;
    }

    matchesEl.hidden = false;
    if (nameInput) nameInput.setAttribute("aria-expanded", "true");

    const listLabel = document.createElement("p");
    listLabel.className = "cancel-matches__label";
    listLabel.textContent = notice || "Kies jou naam:";
    matchesEl.appendChild(listLabel);

    matches.forEach((match, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cancel-match" + (index === 0 ? " is-active" : "");
      btn.id = "cancel-match-" + index;
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", index === 0 ? "true" : "false");

      const statusLabel = match.alreadyCancelled
        ? "Reeds gekanselleer"
        : match.status === "Yes"
          ? "Bevestig"
          : String(match.status || "");

      btn.innerHTML =
        '<span class="cancel-match__name"></span>' +
        '<span class="cancel-match__meta"></span>';
      btn.querySelector(".cancel-match__name").textContent = match.displayName || "Gas";
      btn.querySelector(".cancel-match__meta").textContent = [
        statusLabel,
        match.matchField === "guest" ? "Gas" : "",
      ]
        .filter(Boolean)
        .join(" · ");

      btn.addEventListener("mousedown", (event) => event.preventDefault());
      btn.addEventListener("click", () => selectMatch(match));
      matchesEl.appendChild(btn);
    });

    if (nameInput && matches[0]) {
      nameInput.setAttribute("aria-activedescendant", "cancel-match-0");
    }
  }

  async function runSearch(query, { fromSubmit } = {}) {
    const q = trimCollapse(query);
    if (!q) {
      clearMatches();
      setStatus("", "Begin tik om name uit die RSVP-lys te sien.");
      return;
    }

    const ok = await ensureBackend();
    if (!ok) return;

    const seq = ++state.searchSeq;
    setStatus("", "Soek tans...");
    if (matchesEl) matchesEl.classList.add("is-loading");

    try {
      const data = await callAction({ action: "search", query: q });
      if (seq !== state.searchSeq) return;

      if (!data || data.success !== true) {
        throw new Error(interpretBackendError(data, "Soektog het misluk."));
      }
      if (data.api && data.api !== EXPECTED_API) {
        state.backendOk = false;
        throw new Error(OLD_BACKEND_MESSAGE);
      }

      const matches = Array.isArray(data.matches) ? data.matches : [];
      if (!matches.length) {
        clearMatches();
        setStatus(
          fromSubmit ? "error" : "",
          data.message || "Geen RSVP vir daardie letters gevind nie."
        );
        return;
      }

      renderMatches(matches, data.message || "Kies jou naam:");
      setStatus("", matches.length === 1 ? "1 resultaat — kies die naam om voort te gaan." : "");
    } catch (err) {
      if (seq !== state.searchSeq) return;
      clearMatches();
      const message =
        err instanceof Error && err.message === "Failed to fetch"
          ? "Kon nie die bediener bereik nie. Probeer later weer of kontak die bruidspaar."
          : err instanceof Error
            ? err.message
            : "Soektog het misluk.";
      setStatus("error", /naam is required/i.test(message) ? OLD_BACKEND_MESSAGE : message);
    } finally {
      if (matchesEl) matchesEl.classList.remove("is-loading");
    }
  }

  function scheduleSearch() {
    if (state.debounceTimer) window.clearTimeout(state.debounceTimer);
    state.debounceTimer = window.setTimeout(() => {
      state.debounceTimer = null;
      runSearch(nameInput && nameInput.value);
    }, DEBOUNCE_MS);
  }

  openButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      openDialog();
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      if (!state.busy) closeDialog();
    });
  });

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      if (!state.busy) closeDialog();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!dialog.classList.contains("is-open")) return;
    if (event.key === "Escape" && !state.busy) {
      event.preventDefault();
      if (matchesEl && !matchesEl.hidden) {
        clearMatches();
        return;
      }
      closeDialog();
      return;
    }

    if (stepSearch && !stepSearch.hidden && state.matches.length) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveOption(Math.min(state.matches.length - 1, state.activeIndex + 1));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveOption(Math.max(0, state.activeIndex - 1));
        return;
      }
      if (event.key === "Enter" && state.activeIndex >= 0 && document.activeElement === nameInput) {
        event.preventDefault();
        selectMatch(state.matches[state.activeIndex]);
        return;
      }
    }

    if (event.key !== "Tab") return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  if (nameInput) {
    nameInput.addEventListener("input", () => {
      state.selected = null;
      scheduleSearch();
    });
    nameInput.addEventListener("focus", () => {
      if (trimCollapse(nameInput.value)) scheduleSearch();
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.busy) return;
    if (state.matches.length && state.activeIndex >= 0) {
      selectMatch(state.matches[state.activeIndex]);
      return;
    }
    await runSearch(nameInput && nameInput.value, { fromSubmit: true });
  });

  if (keepBtn) {
    keepBtn.addEventListener("click", () => {
      if (state.busy) return;
      resetFlow();
      setStatus("success", "RSVP is behou. Geen verandering is gemaak nie.");
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      if (state.busy || !state.selected) return;

      const ok = await ensureBackend();
      if (!ok) return;

      try {
        setBusy(true);
        setStatus("", "Kanselleer tans...");
        let data;
        try {
          data = await callAction({
            action: "cancel",
            token: state.selected.token,
          });
        } catch (postErr) {
          data = await callAction(
            {
              action: "cancel",
              token: state.selected.token,
            },
            { method: "GET" }
          );
        }
        if (!data || data.success !== true) {
          throw new Error(interpretBackendError(data, "Kansellasie het misluk."));
        }
        if (resultMessage) {
          resultMessage.textContent =
            data.message || "Jou RSVP is suksesvol gekanselleer.";
        }
        setStatus("", "");
        showStep(stepResult);
      } catch (err) {
        const message =
          err instanceof Error && err.message === "Failed to fetch"
            ? "Kon nie kanselleer nie. Probeer weer of kontak die bruidspaar."
            : err instanceof Error
              ? err.message
              : "Kansellasie het misluk.";
        setStatus("error", /naam is required/i.test(message) ? OLD_BACKEND_MESSAGE : message);
        showStep(stepConfirm);
      } finally {
        setBusy(false);
      }
    });
  }
})();
