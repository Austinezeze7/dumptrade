/* ============================================================
   api.js — real backend integration (dumptrade.onrender.com/api)
============================================================ */
const API_BASE = "/api";

const CATEGORIES = [
  { key: "furniture", label: "Furniture", avgKg: 15, tag: "FN" },
  { key: "ewaste", label: "E-Waste", avgKg: 4, tag: "EW" },
  { key: "textiles", label: "Textiles", avgKg: 3, tag: "TX" },
  { key: "construction", label: "Construction", avgKg: 10, tag: "CN" },
  { key: "organic", label: "Organic", avgKg: 2, tag: "OR" },
  { key: "plastic", label: "Plastic / Packaging", avgKg: 1, tag: "PL" },
  { key: "industrial", label: "Industrial Byproduct", avgKg: 18, tag: "IN" },
  { key: "other", label: "Other", avgKg: 3, tag: "OT" },
];
function catMeta(key) {
  return CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1];
}
function timeAgo(iso) {
  const hrs = Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
function cityOf(location) { return location.split(",")[0].trim(); }

/* ---------- session ---------- */
function getToken() { return localStorage.getItem("dumptrade_token"); }
function getCurrentUser() {
  const raw = localStorage.getItem("dumptrade_user");
  return raw ? JSON.parse(raw) : null;
}
function setSession(token, user) {
  localStorage.setItem("dumptrade_token", token);
  localStorage.setItem("dumptrade_user", JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem("dumptrade_token");
  localStorage.removeItem("dumptrade_user");
}
function isLoggedIn() { return !!getToken(); }

/* ---------- low-level fetch wrapper ---------- */
async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (e) { /* empty body is fine */ }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

/* ---------- normalize backend (snake_case) -> frontend (camelCase) ---------- */
function normalizeListing(raw) {
  if (!raw) return raw;
  return {
    id: raw.id,
    userId: raw.user_id,
    title: raw.title,
    category: raw.category,
    description: raw.description,
    photoUrl: raw.photo_url || null,
    qtyLabel: raw.qty_label,
    qtyNum: raw.qty_num,
    condition: raw.condition,
    location: raw.location,
    status: raw.status,
    postedAt: raw.created_at,
    posterName: raw.poster_name,
    accountType: raw.account_type,
    posterEmail: raw.poster_email || null, // only populated on the claim response
  };
}

/* ---------- auth ---------- */
async function apiRegister({ name, email, password, accountType, location }) {
  const data = await apiFetch("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, account_type: accountType, location }),
  });
  setSession(data.token, data.user);
  return data.user;
}

async function apiLogin({ email, password }) {
  const data = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setSession(data.token, data.user);
  return data.user;
}

function apiLogout() { clearSession(); }

/* ---------- listings ---------- */
async function apiGetListings(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  const qs = params.toString();

  const raw = await apiFetch(`/listings${qs ? `?${qs}` : ""}`);
  return (raw || []).map(normalizeListing);
}

async function apiGetListingById(id) {
  const raw = await apiFetch(`/listings/${id}`);
  return normalizeListing(raw);
}

async function apiAddListing(fields) {
  // requires login — throws if not authenticated (caller should check first)
  const raw = await apiFetch("/listings", {
    method: "POST",
    body: JSON.stringify({
      title: fields.title,
      category: fields.category,
      description: fields.description,
      photo_url: fields.photoUrl || "",
      qty_label: fields.qtyLabel,
      qty_num: fields.qtyNum,
      condition: fields.condition,
      location: fields.location,
    }),
  });
  return normalizeListing(raw);
}

async function apiClaimListing(id) {
  try {
    const raw = await apiFetch(`/listings/${id}/claim`, { method: "POST" });
    const listing = normalizeListing(raw);
    const contact = listing.posterEmail
      ? `Contact ${listing.posterName || "the poster"} at ${listing.posterEmail}.`
      : "Claimed — no contact email on file for the poster.";
    return { ok: true, message: `Claimed! ${contact}`, listing };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

async function apiCollectListing(id) {
  try {
    await apiFetch(`/listings/${id}/collect`, { method: "POST" });
    const listing = await apiGetListingById(id);
    const m = catMeta(listing.category);
    return { ok: true, message: `Marked collected — ~${m.avgKg * listing.qtyNum}kg diverted.`, listing };
  } catch (err) {
    return { ok: false, message: err.message };
  }

 // Derives the city dropdown from whatever listings currently exist,
// since the backend has no dedicated /cities endpoint.
async function apiGetCities() {
  const all = await apiGetListings({ status: "all" });
  return Array.from(new Set(all.map(l => cityOf(l.location)))).sort();
} 
}