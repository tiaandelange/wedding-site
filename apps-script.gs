/**
 * Google Apps Script backend for wedding Cancel RSVP.
 * Deploy as Web App (Execute as: Me, Who has access: Anyone).
 *
 * Optional Script Properties:
 *   SPREADSHEET_ID  — overrides the default spreadsheet ID
 *   SHEET_NAME      — overrides the default tab name
 *   CANCEL_SECRET   — used to sign opaque match tokens
 */
const DEFAULT_SPREADSHEET_ID = "1mdrwlb7pg892_p0MSQvOUc_j8G1ZEGDWA1POhdMRPsM";
const DEFAULT_SHEET_NAME = "Sheet1";
const MAX_MATCHES = 12;
const MIN_QUERY_LENGTH = 1;
const RATE_LIMIT_WINDOW_SEC = 60;
const RATE_LIMIT_MAX = 40;
const TOKEN_TTL_SEC = 600;
const API_VERSION = "cancel-v1";

function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = String(params.action || "").trim().toLowerCase();

    if (action === "search") {
      enforceRateLimit_();
      return jsonResponse_(searchGuest_(params));
    }

    // Prefer POST for cancel; GET is supported as a fallback for stubborn clients.
    if (action === "cancel") {
      enforceRateLimit_();
      return jsonResponse_(cancelRsvp_(params));
    }

    return jsonResponse_({
      success: true,
      api: API_VERSION,
      message: "Cancel RSVP endpoint is online. Use action=search or action=cancel."
    });
  } catch (error) {
    return jsonResponse_({
      success: false,
      api: API_VERSION,
      message: error && error.message ? error.message : "Unexpected server error."
    });
  }
}

function doPost(e) {
  try {
    enforceRateLimit_();
    const payload = parsePayload_(e);
    const action = String(payload.action || "").trim().toLowerCase();

    if (action === "search") {
      return jsonResponse_(searchGuest_(payload));
    }
    if (action === "cancel") {
      return jsonResponse_(cancelRsvp_(payload));
    }

    return jsonResponse_({
      success: false,
      api: API_VERSION,
      message: "RSVP-inskrywings is gesluit. Gebruik Cancel RSVP om ’n bestaande RSVP te kanselleer."
    });
  } catch (error) {
    return jsonResponse_({
      success: false,
      api: API_VERSION,
      message: error && error.message ? error.message : "Unexpected server error."
    });
  }
}

function parsePayload_(e) {
  if (!e) throw new Error("Missing request event.");

  if (e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }

  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      throw new Error("Invalid JSON payload.");
    }
  }

  throw new Error("Request body is empty.");
}

function getConfig_() {
  const props = PropertiesService.getScriptProperties();
  return {
    spreadsheetId: props.getProperty("SPREADSHEET_ID") || DEFAULT_SPREADSHEET_ID,
    sheetName: props.getProperty("SHEET_NAME") || DEFAULT_SHEET_NAME,
    secret: props.getProperty("CANCEL_SECRET") || DEFAULT_SPREADSHEET_ID
  };
}

function openSheet_() {
  const config = getConfig_();
  const ss = SpreadsheetApp.openById(config.spreadsheetId);
  const sheet = ss.getSheetByName(config.sheetName);
  if (!sheet) throw new Error("Sheet tab not found.");
  return sheet;
}

/**
 * Resolve columns dynamically from the header row.
 * Accepts Naam / Naam? and Kan jy kom / Kan jy kom?
 */
function resolveColumns_(sheet) {
  const lastCol = Math.max(1, sheet.getLastColumn());
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const normalized = headers.map(function (h) {
    return String(h == null ? "" : h).trim().toLowerCase().replace(/\s+/g, " ");
  });

  function findExact(candidates) {
    for (var i = 0; i < candidates.length; i++) {
      var idx = normalized.indexOf(candidates[i]);
      if (idx !== -1) return idx;
    }
    return -1;
  }

  const naamIdx = findExact(["naam?", "naam"]);
  const vanIdx = findExact(["van"]);
  const guestNameIdx = findExact(["guest name"]);
  const guestSurnameIdx = findExact(["guest surname"]);
  const statusIdx = findExact(["kan jy kom?", "kan jy kom"]);
  const selNoIdx = findExact(["sel no.", "sel no", "sel nommer"]);
  const eposIdx = findExact(["epos", "e-pos", "email"]);
  const guestCellIdx = findExact(["guest cell no.", "guest cell no", "guest cell"]);

  if (naamIdx === -1 || guestNameIdx === -1 || statusIdx === -1) {
    throw new Error("Required sheet headers were not found.");
  }

  return {
    headers: headers,
    naamIdx: naamIdx,
    vanIdx: vanIdx,
    guestNameIdx: guestNameIdx,
    guestSurnameIdx: guestSurnameIdx,
    statusIdx: statusIdx,
    selNoIdx: selNoIdx,
    eposIdx: eposIdx,
    guestCellIdx: guestCellIdx
  };
}

function normalizeName_(value) {
  return String(value == null ? "" : value)
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("af-ZA");
}

function normalizePhone_(value) {
  return String(value == null ? "" : value).replace(/[^\d]/g, "");
}

function phonesMatch_(a, b) {
  const left = normalizePhone_(a);
  const right = normalizePhone_(b);
  if (!left || !right) return false;
  if (left === right) return true;
  const leftTail = left.slice(-9);
  const rightTail = right.slice(-9);
  return leftTail.length >= 9 && leftTail === rightTail;
}

function fullName_(first, last) {
  return [String(first || "").trim(), String(last || "").trim()]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function isPlaceholderName_(value) {
  const v = String(value == null ? "" : value).trim();
  return !v || v === "-" || v === "–" || v === "—";
}

function nameMatchesQuery_(queryNorm, first, last) {
  if (!queryNorm) return false;
  if (isPlaceholderName_(first) && isPlaceholderName_(last)) return false;

  const firstNorm = normalizeName_(first);
  const lastNorm = normalizeName_(last);
  const combined = normalizeName_(fullName_(first, last));
  const reversed = normalizeName_(fullName_(last, first));

  // Typeahead: prefix match on first name, surname, or full name.
  if (firstNorm && firstNorm.indexOf(queryNorm) === 0) return true;
  if (lastNorm && lastNorm.indexOf(queryNorm) === 0) return true;
  if (combined && combined.indexOf(queryNorm) === 0) return true;
  if (reversed && reversed.indexOf(queryNorm) === 0) return true;

  // Longer queries may match inside the full name (e.g. middle of "Jan van der Berg").
  if (queryNorm.length >= 2 && combined && combined.indexOf(queryNorm) !== -1) return true;
  return false;
}

function maskPhone_(value) {
  const digits = normalizePhone_(value);
  if (digits.length < 4) return "";
  return "••••" + digits.slice(-4);
}

function createMatchToken_(rowNumber, matchField) {
  const config = getConfig_();
  const issuedAt = Date.now();
  const payload = rowNumber + "|" + matchField + "|" + issuedAt;
  const sig = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(payload, config.secret)
  ).slice(0, 24);
  const token = Utilities.base64EncodeWebSafe(payload + "|" + sig);
  CacheService.getScriptCache().put("match:" + token, "1", TOKEN_TTL_SEC);
  return token;
}

function parseMatchToken_(token) {
  const raw = String(token || "").trim();
  if (!raw) throw new Error("Ongeldige bevestigingstoken.");
  const cached = CacheService.getScriptCache().get("match:" + raw);
  if (!cached) throw new Error("Soektog het verval. Soek asseblief weer.");

  const config = getConfig_();
  var decoded;
  try {
    decoded = Utilities.newBlob(Utilities.base64DecodeWebSafe(raw)).getDataAsString();
  } catch (err) {
    throw new Error("Ongeldige bevestigingstoken.");
  }

  const parts = decoded.split("|");
  if (parts.length !== 4) throw new Error("Ongeldige bevestigingstoken.");
  const rowNumber = Number(parts[0]);
  const matchField = parts[1];
  const issuedAt = Number(parts[2]);
  const sig = parts[3];
  if (!rowNumber || (matchField !== "primary" && matchField !== "guest")) {
    throw new Error("Ongeldige bevestigingstoken.");
  }
  if (Date.now() - issuedAt > TOKEN_TTL_SEC * 1000) {
    throw new Error("Soektog het verval. Soek asseblief weer.");
  }
  const expected = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(parts[0] + "|" + parts[1] + "|" + parts[2], config.secret)
  ).slice(0, 24);
  if (sig !== expected) throw new Error("Ongeldige bevestigingstoken.");
  return { rowNumber: rowNumber, matchField: matchField };
}

function searchGuest_(payload) {
  const query = String(payload.query == null ? "" : payload.query).trim().replace(/\s+/g, " ");
  if (query.length < MIN_QUERY_LENGTH) {
    return {
      success: true,
      api: API_VERSION,
      matches: [],
      message: ""
    };
  }

  const queryNorm = normalizeName_(query);
  const sheet = openSheet_();
  const cols = resolveColumns_(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { success: true, api: API_VERSION, matches: [], message: "Geen RSVP gevind nie." };
  }

  const values = sheet.getRange(2, 1, lastRow, sheet.getLastColumn()).getDisplayValues();
  const matches = [];

  for (var i = 0; i < values.length; i++) {
    const row = values[i];
    const rowNumber = i + 2;
    const naam = row[cols.naamIdx] || "";
    const van = cols.vanIdx >= 0 ? row[cols.vanIdx] || "" : "";
    const guestName = row[cols.guestNameIdx] || "";
    const guestSurname = cols.guestSurnameIdx >= 0 ? row[cols.guestSurnameIdx] || "" : "";
    const status = String(row[cols.statusIdx] || "").trim();

    const primaryHit = nameMatchesQuery_(queryNorm, naam, van);
    const guestHit =
      !isPlaceholderName_(guestName) &&
      nameMatchesQuery_(queryNorm, guestName, guestSurname);

    if (!primaryHit && !guestHit) continue;

    const matchField = primaryHit ? "primary" : "guest";
    const displayName =
      matchField === "primary" ? fullName_(naam, van) : fullName_(guestName, guestSurname);

    matches.push({
      token: createMatchToken_(rowNumber, matchField),
      displayName: displayName,
      matchField: matchField,
      status: status,
      alreadyCancelled: status.toLowerCase() === "no",
      partyScope: true,
      requiresPhone: false
    });

    if (matches.length >= MAX_MATCHES) break;
  }

  if (!matches.length) {
    return {
      success: true,
      api: API_VERSION,
      matches: [],
      message: "Geen RSVP vir daardie naam gevind nie. Kontroleer die spelling of kontak die bruidspaar."
    };
  }

  if (matches.length >= MAX_MATCHES) {
    return {
      success: true,
      api: API_VERSION,
      matches: matches,
      message: "Nog resultate beskikbaar — tik meer van die naam om te verfyn."
    };
  }

  return { success: true, api: API_VERSION, matches: matches };
}

function cancelRsvp_(payload) {
  const token = String(payload.token == null ? "" : payload.token).trim();
  if (!token) {
    return { success: false, message: "Soek eers jou naam voordat jy kanselleer." };
  }

  const parsed = parseMatchToken_(token);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return { success: false, message: "Die stelsel is tans besig. Probeer asseblief weer." };
  }

  try {
    const sheet = openSheet_();
    const cols = resolveColumns_(sheet);
    const lastRow = sheet.getLastRow();
    if (parsed.rowNumber < 2 || parsed.rowNumber > lastRow) {
      return { success: false, message: "RSVP kon nie gevind word nie." };
    }

    const statusCell = sheet.getRange(parsed.rowNumber, cols.statusIdx + 1);
    const currentStatus = String(statusCell.getDisplayValue() || "").trim();

    if (currentStatus.toLowerCase() === "no") {
      return {
        success: true,
        alreadyCancelled: true,
        api: API_VERSION,
        message: "Hierdie RSVP is reeds gekanselleer."
      };
    }

    if (currentStatus.toLowerCase() !== "yes") {
      return {
        success: false,
        api: API_VERSION,
        message: "Geen bevestigde RSVP om te kanselleer nie."
      };
    }

    // Write only the attendance cell; preserve formatting by setting the value only.
    statusCell.setValue("No");
    CacheService.getScriptCache().remove("match:" + token);

    return {
      success: true,
      alreadyCancelled: false,
      api: API_VERSION,
      message: "Jou RSVP is suksesvol gekanselleer.",
      partyScope: true
    };
  } finally {
    lock.releaseLock();
  }
}

function enforceRateLimit_() {
  const cache = CacheService.getScriptCache();
  const key = "rl:" + Math.floor(Date.now() / (RATE_LIMIT_WINDOW_SEC * 1000));
  const current = Number(cache.get(key) || "0");
  if (current >= RATE_LIMIT_MAX) {
    throw new Error("Te veel versoeke. Wag ’n oomblik en probeer weer.");
  }
  cache.put(key, String(current + 1), RATE_LIMIT_WINDOW_SEC + 5);
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
