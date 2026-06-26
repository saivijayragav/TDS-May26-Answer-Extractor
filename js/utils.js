// ============================================================
//  Shared Utilities
// ============================================================

window.sha256 = async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(d => d.toString(16).padStart(2, "0"))
    .join("");
}

window.sha1 = async function sha1(data) {
  const buf = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest("SHA-1", buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

window.blobHash = async function blobHash(content) {
  const enc = new TextEncoder();
  const contentBytes = enc.encode(content);
  const header = enc.encode(`blob ${contentBytes.length}\0`);
  const full = new Uint8Array(header.length + contentBytes.length);
  full.set(header, 0);
  full.set(contentBytes, header.length);
  return await sha1(full);
}

window.treeHash = async function treeHash(entries) {
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const parts = [];
  for (const e of entries) {
    const header = new TextEncoder().encode(`${e.mode || "100644"} ${e.name}\0`);
    const hashBytes = new Uint8Array(20);
    for (let i = 0; i < 20; i++)
      hashBytes[i] = parseInt(e.hash.substring(i * 2, i * 2 + 2), 16);
    parts.push(header);
    parts.push(hashBytes);
  }
  const totalLen = parts.reduce((s, p) => s + p.length, 0);
  const body = new Uint8Array(totalLen);
  let off = 0;
  for (const p of parts) { body.set(p, off); off += p.length; }
  const hdr = new TextEncoder().encode(`tree ${body.length}\0`);
  const full = new Uint8Array(hdr.length + body.length);
  full.set(hdr, 0);
  full.set(body, hdr.length);
  return await sha1(full);
}

window.commitHash = async function commitHash({ treeH, parentH, message, author, timestamp }) {
  let content = `tree ${treeH}\n`;
  if (parentH) content += `parent ${parentH}\n`;
  const ts = Math.floor(timestamp.getTime() / 1000);
  content += `author ${author.name} <${author.email}> ${ts} +0000\n`;
  content += `committer ${author.name} <${author.email}> ${ts} +0000\n`;
  content += `\n${message}\n`;
  const str = `commit ${content.length}\0` + content;
  return await sha1(str);
}

// seedrandom-compatible helpers (uses window.Math.seedrandom from CDN)
window.makePRNG = function makePRNG(seed) {
  // Uses seedrandom loaded from CDN (added to Math object)
  return new Math.seedrandom(seed);
}

window.pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
window.randInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;

window.shuffle = function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

window.randomString = function randomString(rng) {
  return Array.from(
    { length: Math.floor(rng() * 10) + 1 },
    () => CHARS[Math.floor(rng() * CHARS.length)]
  ).join("");
}

window.generateRandomChars = function generateRandomChars(len, rng) {
  return Array.from({ length: len }, () => {
    const t = rng();
    return t < 0.8 ? CHARS[Math.floor((t / 0.8) * CHARS.length)] : t < 0.99 ? " " : "\n";
  });
}
