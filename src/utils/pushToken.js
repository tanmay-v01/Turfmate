export function getOrCreatePushToken() {
  const key = 'tm_push_token';
  let token = localStorage.getItem(key);
  if (!token) {
    token = `web-${crypto.randomUUID?.() || Date.now()}`;
    localStorage.setItem(key, token);
  }
  return token;
}
