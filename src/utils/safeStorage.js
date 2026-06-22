/** Parse localStorage JSON without crashing the app on corrupt data */

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return fallback;
  }
}
