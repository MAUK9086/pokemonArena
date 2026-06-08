export function generateSessionId() {
  return crypto.randomUUID();
}

export function getOrCreateSessionId() {
  const key = 'arena_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = generateSessionId();
    sessionStorage.setItem(key, id);
  }
  return id;
}
