
(() => {
  "use strict";

  // Public Google Apps Script Web App URL (deployed with "Anyone" access).
  // Example: https://script.google.com/macros/s/AKfycb.../exec
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxjIBZd21ggaHNkXbhP8oVbuPvCh3bQgN-jT0aoshpLyl51NI0yl-X8t75FudkdJpLG/exec";

  const form = document.getElementById("rsvpForm");
  const yesOnlyFields = document.getElementById("yesOnlyFields");
  const guestOnlyFields = document.getElementById("guestOnlyFields");
  const submitBtn = document.getElementById("submitBtn");
  const formStatus = document.getElementById("formStatus");

  if (!form || !yesOnlyFields || !guestOnlyFields || !submitBtn || !formStatus) return;

  const fieldContainers = new Map();
  document.querySelectorAll("[data-field]").forEach((node) => {
    fieldContainers.set(node.getAttribute("data-field"), node);
  });

  const errorNodes = new Map();
  document.querySelectorAll("[data-error-for]").forEach((node) => {
    errorNodes.set(node.getAttribute("data-error-for"), node);
  });

  const state = {
    submitting: false,
  };

  function trimValue(v) {
    return String(v || "").trim();
  }

  function getSelectedRadio(name) {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : "";
  }

  function getCheckedValues(name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
  }

  function clearErrors() {
    fieldContainers.forEach((node) => node.classList.remove("is-invalid"));
    errorNodes.forEach((node) => { node.textContent = ""; });
  }

  function setFieldError(fieldKey, message) {
    const container = fieldContainers.get(fieldKey);
    if (container) container.classList.add("is-invalid");
    const error = errorNodes.get(fieldKey);
    if (error) error.textContent = message;
  }

  function setStatus(type, message) {
    formStatus.classList.remove("is-success", "is-error");
    if (type === "success") formStatus.classList.add("is-success");
    if (type === "error") formStatus.classList.add("is-error");
    formStatus.textContent = message || "";
  }

  function updateConditionalVisibility() {
    const attending = getSelectedRadio("kanJyKom");
    const isYes = attending === "Yes";
    yesOnlyFields.hidden = !isYes;

    let guestCount = "";
    if (isYes) {
      guestCount = getSelectedRadio("guestCount");
    }

    // Show guest details only when user selects "1 guest" (UI), which maps to guestCount value "2".
    guestOnlyFields.hidden = !(isYes && guestCount === "2");

    if (!isYes) {
      // Keep hidden-field values blank so "No" submissions write only relevant data.
      form.querySelectorAll('input[name="datum"]').forEach((el) => { el.checked = false; });
      form.querySelectorAll('input[name="guestCount"]').forEach((el) => { el.checked = false; });
      const guestName = document.getElementById("guestName");
      const guestSurname = document.getElementById("guestSurname");
      const guestCell = document.getElementById("guestCell");
      if (guestName) guestName.value = "";
      if (guestSurname) guestSurname.value = "";
      if (guestCell) guestCell.value = "";
      return;
    }

    // If guest details are hidden (0 guests), send placeholders so the backend
    // doesn't reject empty guest name fields.
    if (guestOnlyFields.hidden) {
      const guestName = document.getElementById("guestName");
      const guestSurname = document.getElementById("guestSurname");
      const guestCell = document.getElementById("guestCell");
      if (guestName) guestName.value = "-";
      if (guestSurname) guestSurname.value = "-";
      if (guestCell) guestCell.value = "";
    }
  }

  function collectFormData() {
    const kanJyKom = getSelectedRadio("kanJyKom");
    const yesFlow = kanJyKom === "Yes";

    const datumValues = yesFlow ? getCheckedValues("datum") : [];
    const guestCount = yesFlow ? getSelectedRadio("guestCount") : "";
    // UI "1 guest" corresponds to guestCount value "2" (keeps backend payload compatible).
    const hasOneGuest = yesFlow && guestCount === "2";

    return {
      naam: trimValue(document.getElementById("naam")?.value),
      van: trimValue(document.getElementById("van")?.value),
      selNo: trimValue(document.getElementById("selNo")?.value),
      epos: trimValue(document.getElementById("epos")?.value),
      kanJyKom,
      datum: datumValues.join(", "),
      guestCount,
      guestName: hasOneGuest ? trimValue(document.getElementById("guestName")?.value) : "-",
      guestSurname: hasOneGuest ? trimValue(document.getElementById("guestSurname")?.value) : "-",
      guestCell: hasOneGuest ? trimValue(document.getElementById("guestCell")?.value) : "",
    };
  }

  function validateEmailIfProvided(emailValue) {
    if (!emailValue) return true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(emailValue);
  }

  function validate(data) {
    clearErrors();
    const errors = [];

    if (!data.naam) {
      errors.push("naam");
      setFieldError("naam", "Naam is verpligtend.");
    }
    if (!data.van) {
      errors.push("van");
      setFieldError("van", "Van is verpligtend.");
    }
    if (!data.selNo) {
      errors.push("selNo");
      setFieldError("selNo", "Sel nommer is verpligtend.");
    }
    if (!validateEmailIfProvided(data.epos)) {
      errors.push("epos");
      setFieldError("epos", "Voer asseblief 'n geldige e-posadres in.");
    }
    if (!data.kanJyKom) {
      errors.push("kanJyKom");
      setFieldError("kanJyKom", "Kies asseblief Ja of Nee.");
    }

    if (data.kanJyKom === "Yes") {
      if (!data.datum) {
        errors.push("datum");
        setFieldError("datum", "Kies ten minste een dag.");
      }
      if (!data.guestCount) {
        errors.push("guestCount");
        setFieldError("guestCount", "Kies asseblief hoeveel gaste julle saambring.");
      }

      if (data.guestCount === "2") {
        if (!data.guestName) {
          errors.push("guestName");
          setFieldError("guestName", "Gas se naam is verpligtend.");
        }
        if (!data.guestSurname) {
          errors.push("guestSurname");
          setFieldError("guestSurname", "Gas se van is verpligtend.");
        }
        // Sel nommer (guestCell) is intentionally not required.
      }
    }

    return errors.length === 0;
  }

  function setSubmitting(isSubmitting) {
    state.submitting = isSubmitting;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? "Stuur tans..." : "Stuur RSVP";
  }

  async function submitToGoogleScript(payload) {
    if (!WEB_APP_URL || WEB_APP_URL.includes("PASTE_YOUR")) {
      throw new Error("Apps Script URL is nie opgestel nie.");
    }

    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Netwerkfout tydens die stuur van RSVP.");
    }

    const rawText = await res.text();
    let data = null;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      throw new Error("Bediener het 'n ongeldige antwoord teruggestuur. Ontplooi asseblief weer die Apps Script.");
    }

    if (!data || data.success !== true) {
      throw new Error((data && data.message) || "Stuur het misluk.");
    }
  }

  form.addEventListener("change", (event) => {
    if (event.target && (event.target.name === "kanJyKom" || event.target.name === "guestCount")) {
      updateConditionalVisibility();
      clearErrors();
      setStatus("", "");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.submitting) return;

    setStatus("", "");
    const payload = collectFormData();
    const valid = validate(payload);

    if (!valid) {
      setStatus("error", "Voltooi asseblief die vereiste velde.");
      return;
    }

    try {
      setSubmitting(true);
      await submitToGoogleScript(payload);
      setStatus("success", "Dankie! Jou RSVP is suksesvol gestuur.");
      form.reset();
      updateConditionalVisibility();
      clearErrors();
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Stuur het misluk. Probeer asseblief weer.";
      if (errMessage === "Failed to fetch") {
        setStatus(
          "error",
          "Kon nie die RSVP-bediener bereik nie. Maak seker Apps Script is ontplooi as 'n Web App met toegang gestel op Enigiemand."
        );
      } else {
        setStatus("error", errMessage);
      }
    } finally {
      setSubmitting(false);
    }
  });

  updateConditionalVisibility();
})();
