/**
 * Google Apps Script backend for wedding RSVP submissions.
 */
const SPREADSHEET_ID = "1mdrwlb7pg892_p0MSQvOUc_j8G1ZEGDWA1POhdMRPsM";
const SHEET_NAME = "Sheet1"; // Change this if your tab name is different.

function doGet() {
  return jsonResponse_({
    success: true,
    message: "RSVP endpoint is online. Use POST to submit data."
  });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const clean = normalizePayload_(payload);
    validatePayload_(clean);
    writeRow_(clean);

    return jsonResponse_({
      success: true,
      message: "RSVP saved."
    });
  } catch (error) {
    return jsonResponse_({
      success: false,
      message: error && error.message ? error.message : "Unexpected server error."
    });
  }
}

function parsePayload_(e) {
  if (!e) throw new Error("Missing request event.");

  // First support form-urlencoded submissions (no preflight).
  if (e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }

  // Fallback for JSON payloads.
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      throw new Error("Invalid JSON payload.");
    }
  }

  throw new Error("Request body is empty.");
}

function normalizePayload_(payload) {
  const asText = (v) => (v === null || v === undefined ? "" : String(v).trim());
  return {
    naam: asText(payload.naam),
    van: asText(payload.van),
    selNo: asText(payload.selNo),
    epos: asText(payload.epos),
    kanJyKom: asText(payload.kanJyKom),
    datum: asText(payload.datum),
    guestCount: asText(payload.guestCount),
    guestName: asText(payload.guestName),
    guestSurname: asText(payload.guestSurname),
    guestCell: asText(payload.guestCell),
  };
}

function validatePayload_(data) {
  if (!data.naam) throw new Error("Naam is required.");
  if (!data.van) throw new Error("Van is required.");
  if (!data.selNo) throw new Error("Sel No. is required.");
  if (data.kanJyKom !== "Yes" && data.kanJyKom !== "No") {
    throw new Error("Kan jy kom? must be Yes or No.");
  }

  if (data.kanJyKom === "Yes") {
    if (!data.datum) throw new Error("Datum is required.");
    if (!data.guestCount) throw new Error("How many Guests? is required.");
    if (!data.guestName) throw new Error("Guest Name is required.");
    if (!data.guestSurname) throw new Error("Guest Surname is required.");
  } else {
    data.datum = "";
    data.guestCount = "";
    data.guestName = "";
    data.guestSurname = "";
    data.guestCell = "";
  }
}

function writeRow_(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Sheet tab not found.");

  sheet.appendRow([
    data.naam,
    data.van,
    data.selNo,
    data.epos,
    data.kanJyKom,
    data.datum,
    data.guestCount,
    data.guestName,
    data.guestSurname,
    data.guestCell,
  ]);
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
