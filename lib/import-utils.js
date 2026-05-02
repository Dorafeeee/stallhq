// lib/import-utils.js
// Schemas, parsing, and helpers for spreadsheet import

export const IMPORT_SCHEMAS = {
  products: {
    label: "Products",
    description: "Items you sell — your catalog",
    fields: [
      { key: "name", label: "Product name", required: true, type: "string", aliases: ["item", "title", "product", "name", "product name", "item name", "description", "what", "service"] },
      { key: "price", label: "Selling price", required: true, type: "number", aliases: ["price", "selling price", "sale price", "sell price", "rate", "unit price", "retail", "list price", "naira", "ngn"] },
      { key: "cost_price", label: "Cost price", required: false, type: "number", aliases: ["cost", "cost price", "buy price", "buying price", "purchase price", "wholesale", "wholesale price", "cogs", "supplier price"] },
      { key: "supplier", label: "Supplier", required: false, type: "string", aliases: ["supplier", "vendor", "source", "wholesaler", "bought from", "from"] },
      { key: "stock", label: "Stock / Quantity", required: false, type: "number", aliases: ["stock", "qty", "quantity", "inventory", "available", "units", "in stock", "count", "remaining", "on hand"] },
      { key: "sku", label: "SKU / Code", required: false, type: "string", aliases: ["sku", "code", "id", "product code", "item code", "ref", "reference"] },
      { key: "category", label: "Category", required: false, type: "string", aliases: ["category", "type", "group", "tag", "classification", "kind"] },
      { key: "description", label: "Description", required: false, type: "string", aliases: ["description", "details", "notes", "info", "about", "remarks"] },
    ],
  },
  customers: {
    label: "Customers",
    description: "People who buy from you",
    fields: [
      { key: "name", label: "Customer name", required: true, type: "string", aliases: ["name", "customer", "customer name", "client", "client name", "buyer", "full name", "first name", "contact name", "person"] },
      { key: "phone", label: "Phone", required: false, type: "string", aliases: ["phone", "mobile", "contact", "tel", "phone number", "whatsapp", "wa", "cell", "phone no", "mobile number", "gsm"] },
      { key: "email", label: "Email", required: false, type: "string", aliases: ["email", "mail", "e-mail", "email address", "email id"] },
      { key: "address", label: "Address", required: false, type: "string", aliases: ["address", "location", "delivery address", "street", "home address", "residence", "shipping address"] },
      { key: "notes", label: "Notes", required: false, type: "string", aliases: ["notes", "remarks", "comments", "info", "additional info", "memo"] },
    ],
  },
  orders: {
    label: "Orders / Sales",
    description: "Past and current transactions",
    fields: [
      { key: "customer_name", label: "Customer name", required: true, type: "string", aliases: ["customer", "name", "client", "buyer", "customer name", "client name", "sold to", "ordered by", "person"] },
      { key: "item", label: "Item / Product", required: true, type: "string", aliases: ["item", "product", "description", "what they bought", "service", "item name", "product name", "details", "ordered", "bought"] },
      { key: "amount", label: "Amount / Total", required: true, type: "number", aliases: ["amount", "total", "price", "cost", "value", "sale", "naira", "ngn", "grand total", "sum", "subtotal", "paid", "received"] },
      { key: "date", label: "Date", required: false, type: "date", aliases: ["date", "order date", "sale date", "when", "timestamp", "transaction date", "purchase date", "day"] },
      { key: "status", label: "Status", required: false, type: "string", aliases: ["status", "state", "paid", "completed", "stage", "payment status", "order status", "delivered"] },
      { key: "phone", label: "Customer phone", required: false, type: "string", aliases: ["phone", "mobile", "contact", "tel", "whatsapp", "wa", "phone number", "customer phone", "cell"] },
      { key: "notes", label: "Notes", required: false, type: "string", aliases: ["notes", "remarks", "comments", "memo", "additional"] },
    ],
  },
};

// Parse CSV (basic, handles quoted values with commas)
export function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line) => {
    const cells = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        cells.push(cur.trim());
        cur = "";
      } else cur += c;
    }
    cells.push(cur.trim());
    return cells;
  };

  const headers = parseLine(lines[0]).map(h => h.replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map(line => {
    const cells = parseLine(line).map(c => c.replace(/^"|"$/g, ""));
    return headers.reduce((obj, h, i) => { obj[h] = cells[i] || ""; return obj; }, {});
  });
  return { headers, rows };
}

// Smarter heuristic auto-mapping using scoring + sample data analysis
// No API keys needed - handles messy real-world column names
export function autoMapHeuristic(headers, schemaKey, sampleRows = []) {
  const fields = IMPORT_SCHEMAS[schemaKey].fields;
  const mapping = {};
  const used = new Set();

  // Normalize: lowercase, strip non-alphanumeric, collapse whitespace
  const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const tokens = (s) => norm(s).split(/\s+/).filter(Boolean);

  // Score how well a header matches a field
  const scoreMatch = (header, field) => {
    const h = norm(header);
    const hTokens = tokens(header);
    let best = 0;

    for (const alias of field.aliases) {
      const a = norm(alias);
      const aTokens = tokens(alias);

      // Exact match (highest score)
      if (h === a) return 100;

      // All alias tokens appear in header (very high)
      if (aTokens.every(t => hTokens.includes(t))) {
        best = Math.max(best, 90 - Math.abs(hTokens.length - aTokens.length) * 5);
        continue;
      }

      // Header is contained in alias or vice versa (high)
      if (h.includes(a) || a.includes(h)) {
        best = Math.max(best, 75);
        continue;
      }

      // Token overlap (medium)
      const overlap = aTokens.filter(t => hTokens.some(ht => ht.includes(t) || t.includes(ht)));
      if (overlap.length > 0) {
        best = Math.max(best, 40 + overlap.length * 10);
        continue;
      }

      // Levenshtein-lite: shared prefix of 4+ chars
      const minLen = Math.min(h.length, a.length);
      if (minLen >= 4) {
        let prefixLen = 0;
        for (let i = 0; i < minLen; i++) {
          if (h[i] === a[i]) prefixLen++;
          else break;
        }
        if (prefixLen >= 4) best = Math.max(best, 30 + prefixLen * 2);
      }
    }
    return best;
  };

  // Boost score by checking if sample data matches expected type
  const sampleBoost = (header, field) => {
    if (sampleRows.length === 0) return 0;
    const samples = sampleRows.map(r => r[header]).filter(v => v !== null && v !== undefined && v !== "");
    if (samples.length === 0) return 0;

    if (field.type === "number") {
      // Most samples should be parseable as numbers (after currency stripping)
      const numCount = samples.filter(v => {
        const cleaned = String(v).replace(/[₦$£€¥,\s]/g, "");
        return !isNaN(parseFloat(cleaned)) && isFinite(cleaned);
      }).length;
      const ratio = numCount / samples.length;
      if (ratio > 0.8) return 15;
      if (ratio < 0.3) return -20; // strong negative signal
    }

    if (field.type === "date") {
      const dateCount = samples.filter(v => !isNaN(new Date(v).getTime())).length;
      const ratio = dateCount / samples.length;
      if (ratio > 0.8) return 15;
      if (ratio < 0.3) return -20;
    }

    if (field.key === "phone" || field.key === "customer_phone") {
      // Phone numbers: lots of digits, often start with 0, 8, 9, or +
      const phoneCount = samples.filter(v => {
        const s = String(v).replace(/[\s\-()]/g, "");
        return /^[+\d]{7,15}$/.test(s);
      }).length;
      const ratio = phoneCount / samples.length;
      if (ratio > 0.7) return 20;
    }

    if (field.key === "email") {
      const emailCount = samples.filter(v => /@.+\..+/.test(String(v))).length;
      const ratio = emailCount / samples.length;
      if (ratio > 0.7) return 25;
      if (ratio < 0.1) return -15;
    }

    return 0;
  };

  // Build all (field, header, score) tuples then greedy-assign best matches first
  const candidates = [];
  for (const field of fields) {
    for (const header of headers) {
      const nameScore = scoreMatch(header, field);
      const dataScore = sampleBoost(header, field);
      const total = nameScore + dataScore;
      if (total > 20) candidates.push({ field, header, score: total });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  for (const c of candidates) {
    if (mapping[c.field.key]) continue; // field already assigned
    if (used.has(c.header)) continue; // header already used
    mapping[c.field.key] = c.header;
    used.add(c.header);
  }

  // Fill in nulls for unmatched fields
  for (const f of fields) {
    if (!mapping[f.key]) mapping[f.key] = null;
  }
  return mapping;
}

// Coerce a cell value to expected type
export function coerceValue(raw, type) {
  if (raw === null || raw === undefined || raw === "") return null;
  const s = String(raw).trim();
  if (type === "number") {
    // Strip currency symbols, commas, whitespace
    const cleaned = s.replace(/[₦$£€¥,\s]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }
  if (type === "date") {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  return s;
}

// Apply mapping to rows -> produce target-shaped objects with validation
export function applyMapping(rows, mapping, schemaKey) {
  const fields = IMPORT_SCHEMAS[schemaKey].fields;
  const fieldByKey = Object.fromEntries(fields.map(f => [f.key, f]));
  const results = [];
  const errors = [];

  rows.forEach((row, idx) => {
    const obj = {};
    let rowErrors = [];
    for (const [targetKey, sourceCol] of Object.entries(mapping)) {
      if (!sourceCol) continue;
      const f = fieldByKey[targetKey];
      if (!f) continue;
      const v = coerceValue(row[sourceCol], f.type);
      if (v === null && f.required) rowErrors.push(`Missing ${f.label}`);
      obj[targetKey] = v;
    }
    // Check required fields
    for (const f of fields) {
      if (f.required && (obj[f.key] === null || obj[f.key] === undefined)) {
        if (!rowErrors.some(e => e.includes(f.label))) rowErrors.push(`Missing ${f.label}`);
      }
    }
    if (rowErrors.length) errors.push({ row: idx + 2, issues: rowErrors }); // +2 because of header + 1-indexed
    results.push(obj);
  });
  return { results, errors };
}
