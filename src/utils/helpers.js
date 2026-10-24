/* Small pure helpers shared across the app. */

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const pad = (n) => String(n).padStart(2, '0');

/** Local-time YYYY-MM-DD (toISOString() would give the UTC date, which can be "yesterday"). */
export function toISODate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISODate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(str) {
  return parseISODate(str).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Strip HTML tags from API descriptions without ever executing them. */
export function htmlToText(html = '') {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').trim();
}
