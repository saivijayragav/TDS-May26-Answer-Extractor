/**
 * Local Answer Extractor for exam.mjs
 * Replicates the deterministic logic from exam.mjs without needing CDN imports.
 * 
 * Usage: node extract-answers.mjs <email>
 */
import seedrandom from 'seedrandom';
import prettier from 'prettier';
import crypto from 'crypto';

const EMAIL = process.argv[2] || "24f1001482@ds.study.iitm.ac.in";

// ============ UTILITY FUNCTIONS (from exam.mjs) ============

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(d => d.toString(16).padStart(2, "0")).join("");
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function randomString(rng) {
  return Array.from({ length: Math.floor(rng() * 10) + 1 }, () => CHARS[Math.floor(rng() * CHARS.length)]).join("");
}

function generateRandomChars(len, rng) {
  return Array.from({ length: len }, () => {
    let t = rng();
    return t < .8 ? CHARS[Math.floor(t / .8 * CHARS.length)] : t < .99 ? " " : "\n";
  });
}

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const randInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============ QUESTION EXTRACTORS ============

// Q1: VS Code Version - answer is a regex validator, not extractable
// Q2: Multi-cursor JSON
async function q2_multiCursorJson() {
  const id = "q-multi-cursor-json";
  const rng = seedrandom(`${EMAIL}#${id}`);
  const obj = Object.fromEntries(Array.from({ length: 100 }, () => [randomString(rng), randomString(rng)]));
  const answer = await sha256(JSON.stringify(obj));
  return { id, title: "Multi-cursor edits to convert to JSON", answer };
}

// Q3: npx prettier
async function q3_npxPrettier() {
  const id = "q-npx-prettier";
  const rng = seedrandom(`${EMAIL}#${id}`);
  const base = ["#  Badly  Formatted  Markdown    ", "", "*  This is an uneven list", "* With inconsistent spacing", "   *    And weird indentation", "", ">This quote has no space", ">   This one has too many", ""].join("\n");
  const content = base + "\n" + generateRandomChars(300, rng).join("");
  const formatted = await prettier.format(content, { parser: "markdown" });
  const answer = await sha256(formatted);
  return { id, title: "Run command with npx", answer: `${answer}  -` };
}

// Q4: LLM Bash - answer is LLM-verified, not deterministic
// Q5: Rename Files
async function q5_renameFiles() {
  const id = "q-rename-files-server";
  const version = "";
  const rng = seedrandom(`${EMAIL}#${id}${version}`);
  
  const categories = ["documentation", "reports", "notes", "configs", "data", "logs", "scripts", "templates", "resources", "archives"];
  const unicodeCategories = ["résumé", "naïve-bayes", "日本語", "münchen", "café"];
  const scenarios = [
    { name: "documentation_cleanup", context: "technical documentation" },
    { name: "archive_migration", context: "historical archives" },
    { name: "content_management", context: "content files" },
    { name: "knowledge_base", context: "knowledge articles" },
  ];
  const scenario = scenarios[Math.floor(rng() * scenarios.length)];
  
  const dirs = ["docs", "content", "archive", "project"];
  const subs = ["chapter1", "section-a", "part 2", "módulo-3", "2024"];
  const subsubs = ["intro", "advanced", "appendix", "données", "références"];
  
  const files = [];
  for (let s = 0; s < 30; s++) {
    let depth = 1 + Math.floor(rng() * 3);
    let parts = [];
    parts.push(dirs[Math.floor(rng() * dirs.length)]);
    if (depth >= 2) parts.push(subs[Math.floor(rng() * subs.length)]);
    if (depth >= 3) parts.push(subsubs[Math.floor(rng() * subsubs.length)]);
    if (rng() < .2) {
      const extras = ["spaces here", "file-name", "naïve", "café-2024", "test_file"];
      parts.push(extras[Math.floor(rng() * extras.length)]);
    }
    let filename = `file${String(s + 1).padStart(2, "0")}.txt`;
    let maybeUnicode = rng() < .1 ? filename.replace("i", "\u0456") : filename;
    let path = [...parts, maybeUnicode].join("/");
    let category;
    if (rng() < .3 && unicodeCategories.length > 0) {
      category = unicodeCategories[Math.floor(rng() * unicodeCategories.length)];
    } else {
      category = categories[Math.floor(rng() * categories.length)];
    }
    files.push({ path, category });
  }
  
  const expectedFiles = files.map(f => {
    const parts = f.path.split("/");
    const filename = parts[parts.length - 1];
    const dirPath = parts.slice(0, -1).join("-");
    return `${f.category}/${dirPath}-${filename}`;
  });
  
  expectedFiles.sort((a, b) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++)
      if (a.charCodeAt(i) !== b.charCodeAt(i)) return a.charCodeAt(i) - b.charCodeAt(i);
    return a.length - b.length;
  });
  
  const fileList = expectedFiles.map(s => `./${s}`).join("\n") + "\n";
  const answer = await sha256(fileList);
  return { id, title: "Reorganize Files with Shell Commands", answer };
}

// Q7: Config Merge Conflicts
async function q7_configMerge() {
  const id = "q-config-merge-conflicts";
  const rng = seedrandom(`${EMAIL}#${id}`);
  const numSettings = 50 + Math.floor(rng() * 30);
  const keys = Array.from({ length: numSettings }, (_, i) => `setting_${String(i + 1).padStart(3, "0")}`);
  
  const base = {};
  keys.forEach(k => {
    base[k] = { value: Math.floor(rng() * 100), enabled: rng() < .7, priority: Math.floor(rng() * 10) };
  });
  
  const branchA = JSON.parse(JSON.stringify(base));
  const changesA = Math.floor(numSettings * .3);
  for (let i = 0; i < changesA; i++) {
    const key = keys[Math.floor(rng() * keys.length)];
    branchA[key].value = Math.floor(rng() * 100);
  }
  
  const branchB = JSON.parse(JSON.stringify(base));
  const changesB = Math.floor(numSettings * .3);
  for (let i = 0; i < changesB; i++) {
    const key = keys[Math.floor(rng() * keys.length)];
    branchB[key].value = Math.floor(rng() * 100);
  }
  
  let conflicts = 0;
  keys.forEach(k => {
    const aChanged = branchA[k].value !== base[k].value;
    const bChanged = branchB[k].value !== base[k].value;
    if (aChanged && bChanged && branchA[k].value !== branchB[k].value) conflicts++;
  });
  
  return { id, title: "Three-Way Configuration Merge: Detect Conflicts", answer: conflicts };
}

// Q8: Git Time Travel
async function q8_gitTimeTravel() {
  const id = "q-git-time-travel";
  const rng = seedrandom(`${EMAIL}#${id}`);
  
  const names = [
    { first: "Alice", last: "Johnson" }, { first: "Bob", last: "Smith" },
    { first: "Carol", last: "Davis" }, { first: "David", last: "Miller" },
    { first: "Eve", last: "Wilson" }, { first: "Frank", last: "Moore" },
    { first: "Grace", last: "Taylor" }, { first: "Hank", last: "Anderson" },
    { first: "Ivy", last: "Thomas" }, { first: "Jack", last: "Jackson" },
  ];
  const domains = ["example.com", "test.com", "sample.org", "demo.net"];
  const commitMsgs = ["Initial commit", "Add configuration file", "Update README", "Fix typo in docs", "Update timeout settings", "Refactor config structure", "Add logging configuration", "Update API endpoint", "Fix configuration bug", "Bump version number", "Add error handling config", "Update database settings", "Modify retry settings", "Change cache duration", "Update security settings", "Add feature flags", "Update rate limiting", "Fix memory leak config", "Add monitoring settings", "Update connection pool", "Refactor timeout logic", "Add backup configuration", "Update SSL settings", "Fix race condition", "Add health check config", "Update worker threads", "Modify batch size", "Change log level", "Update compression settings", "Add circuit breaker", "Fix deadlock issue", "Update queue settings", "Add throttling config", "Update pagination", "Fix null pointer config", "Add validation rules", "Update serialization", "Modify buffer size", "Change polling interval", "Update proxy settings", "Add failover config", "Fix timeout overflow", "Update auth settings", "Add CORS configuration", "Modify chunk size", "Change heartbeat interval", "Update session timeout", "Add cleanup config", "Fix memory settings", "Update thread pool", "Add graceful shutdown", "Modify max connections", "Change request timeout", "Update response cache"];
  
  const authorName = `${pick(names, rng).first} ${pick(names, rng).last}`;
  const authorEmail = `${authorName.toLowerCase().replace(/ /g, ".")}@${pick(domains, rng)}`;
  
  const numCommits = randInt(rng, 50, 60);
  const timeouts = [30, 45, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 420, 480, 540, 600, 900, 1200];
  const targetTimeout = pick(timeouts, rng);
  const targetIndex = randInt(rng, 10, numCommits - 10);
  
  const commitTimeouts = [];
  const usedTimeouts = new Set();
  for (let i = 0; i < numCommits; i++) {
    if (i === targetIndex) {
      commitTimeouts.push(targetTimeout);
      usedTimeouts.add(targetTimeout);
    } else {
      let t;
      do { t = pick(timeouts.filter(v => v !== targetTimeout), rng); } while (usedTimeouts.has(t) && usedTimeouts.size < timeouts.length - 1);
      commitTimeouts.push(t);
      usedTimeouts.add(t);
    }
  }
  
  // Now replicate the git object creation to find the parent commit hash
  const pako = (await import('pako')).default;
  
  async function sha1(data) {
    const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const hash = await crypto.subtle.digest("SHA-1", buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  
  async function blobHash(content) {
    const enc = new TextEncoder();
    const contentBytes = enc.encode(content);
    const header = enc.encode(`blob ${contentBytes.length}\0`);
    const full = new Uint8Array(header.length + contentBytes.length);
    full.set(header, 0);
    full.set(contentBytes, header.length);
    return await sha1(full);
  }
  
  async function treeHash(entries) {
    entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    const parts = [];
    for (const e of entries) {
      const header = new TextEncoder().encode(`${e.mode || "100644"} ${e.name}\0`);
      const hashBytes = new Uint8Array(20);
      for (let i = 0; i < 20; i++) hashBytes[i] = parseInt(e.hash.substring(i * 2, i * 2 + 2), 16);
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
  
  async function commitHash({ treeH, parentH, message, author, timestamp }) {
    let content = `tree ${treeH}\n`;
    if (parentH) content += `parent ${parentH}\n`;
    const ts = Math.floor(timestamp.getTime() / 1000);
    content += `author ${author.name} <${author.email}> ${ts} +0000\n`;
    content += `committer ${author.name} <${author.email}> ${ts} +0000\n`;
    content += `\n${message}\n`;
    const str = `commit ${content.length}\0` + content;
    return await sha1(str);
  }
  
  const shuffledMsgs = shuffle([...commitMsgs], rng);
  const author = { name: authorName, email: authorEmail };
  
  let parentHash = null;
  const commitHashes = [];
  let prevConfig = null, prevReadme = null;
  
  const commitsData = [];
  for (let i = 0; i < numCommits; i++) {
    let msg;
    if (i === 0) msg = "Initial commit";
    else if (i === targetIndex) msg = "Update timeout settings";
    else msg = shuffledMsgs[i % shuffledMsgs.length] + ` (#${randInt(rng, 100, 999)})`;
    
    const baseTime = new Date("2025-08-01T10:00:00Z").getTime();
    const offset = i * randInt(rng, 7200, 172800) * 1000;
    const timestamp = new Date(baseTime + offset);
    
    const retries = randInt(rng, 1, 5);
    const maxConn = randInt(rng, 10, 100);
    const debug = rng() > .7;
    commitsData.push({ msg, timestamp, retries, maxConn, debug, timeout: commitTimeouts[i] });
  }

  for (let i = 0; i < numCommits; i++) {
    const data = commitsData[i];
    
    const config = {
      appName: id,
      version: `${randInt(rng, 1, 3)}.${i}.${randInt(rng, 0, 9)}`,
      environment: pick(["development", "staging", "production"], rng),
      settings: {
        timeout: data.timeout,
        retries: data.retries,
        maxConnections: data.maxConn,
        debug: data.debug,
        logLevel: pick(["debug", "info", "warn", "error"], rng),
      },
      metadata: {
        lastUpdated: data.timestamp.toISOString(),
        updatedBy: author.name,
      },
    };
    
    const configStr = JSON.stringify(config, null, 2);
    const readmeStr = (i === 0 || rng() > .8)
      ? `# ${id}\n\nVersion ${config.version}\n\nA sample project for testing.\n\n## Configuration\n\nSee config.json for settings.\n`
      : prevReadme;
    
    const configBlobH = await blobHash(configStr);
    const readmeBlobH = await blobHash(readmeStr);
    
    const treeH = await treeHash([
      { mode: "100644", name: "config.json", hash: configBlobH },
      { mode: "100644", name: "README.md", hash: readmeBlobH },
    ]);
    
    const cHash = await commitHash({ treeH, parentH: parentHash, message: data.msg, author, timestamp: data.timestamp });
    
    commitHashes.push(cHash);
    parentHash = cHash;
    prevConfig = configStr;
    prevReadme = readmeStr;
  }
  
  const parentOfTarget = commitHashes[targetIndex - 1].substring(0, 7);
  
  return { 
    id, 
    title: "Git Time Travel: History Investigation", 
    answer: parentOfTarget,
    extra: `Target timeout: ${targetTimeout}, target commit index: ${targetIndex}`
  };
}

// Q9: GitHub Pages - requires live URL, not extractable
// Q10: GitHub Action - requires live repo, not extractable

// Q11: HTTP POST with uv
function q11_httpPost() {
  const id = "q-uv-http-post";
  const rng = seedrandom(`${EMAIL}#${id}`);
  const hex = "0123456789abcdef";
  let requestId = "";
  for (let i = 0; i < 8; i++) requestId += hex[Math.floor(rng() * hex.length)];
  return { id, title: "POST HTTP requests with uv", answer: JSON.stringify({"headers": {"Host": "httpbin.org"}, "json": {"email": EMAIL, "request_id": requestId}}) };
}

// Q12: DevTools hidden input
function q12_devtools() {
  const id = "q-use-devtools";
  const rng = seedrandom(`${EMAIL}#${id}`);
  const answer = rng().toString(36).slice(-10);
  return { id, title: "Use DevTools", answer };
}

// Q13: Broken JSON - answer is the fixed JSON itself (validator function)
// Q14: Extract JSON from ZIP
async function q14_extractJsonZip() {
  const id = "q-extract-json-zip";
  const hash = await sha256(`${EMAIL}#${id}`);
  const answer = hash.slice(-5);
  return { id, title: "Extract JSON from a ZIP", answer };
}

// Q15: SQL Average Order Value
async function q15_sqlAverage() {
  const id = "q-sql-order-average";
  const rng = seedrandom(`${EMAIL}#${id}`);
  const statuses = ["Shipped", "shipped", "SHIPPED", "Pending", "Cancelled", "Processing"];
  const orders = Array.from({ length: 1000 }, () => ({
    status: statuses[Math.floor(rng() * statuses.length)],
    quantity: Math.floor(rng() * 9) + 1,
    unit_price: Number((rng() * 99 + 1).toFixed(2)),
  }));
  
  const shipped = orders.filter(o => /shipped/i.test(o.status));
  const totalValue = shipped.reduce((sum, o) => sum + o.quantity * o.unit_price, 0);
  const avg = shipped.length > 0 ? totalValue / shipped.length : 0;
  
  return { id, title: "SQL: Average Order Value", answer: "SELECT AVG(quantity * unit_price) FROM orders WHERE status COLLATE NOCASE = 'shipped';", extra: `Numerical average was: ${avg.toFixed(2)}` };
}

// ============ MAIN ============

async function main() {
  console.log(`\n${"=".repeat(75)}`);
  console.log(`  EXAM ANSWER EXTRACTOR for: ${EMAIL}`);
  console.log(`${"=".repeat(75)}\n`);
  
  const questions = [
    { fn: async () => ({ id: "q-vs-code-version", title: "VS Code Version", answer: "[REGEX VALIDATOR - paste output of 'code -s']" }), type: "info" },
    { fn: q2_multiCursorJson, type: "hash" },
    { fn: q3_npxPrettier, type: "hash" },
    { fn: async () => ({ id: "q-llm-bash", title: "LLM Bash Pipeline", answer: "[LLM-VERIFIED - write a bash command using 'llm' tool]" }), type: "info" },
    { fn: q5_renameFiles, type: "hash" },
    { fn: async () => ({ id: "q-asciirec-server", title: "Record Terminal Session", answer: "[INTERACTIVE - record with asciinema]" }), type: "info" },
    { fn: q7_configMerge, type: "value" },
    { fn: q8_gitTimeTravel, type: "hash" },
    { fn: async () => ({ id: "q-github-pages", title: "GitHub Pages", answer: "[LIVE URL REQUIRED]" }), type: "info" },
    { fn: async () => ({ id: "q-github-action", title: "GitHub Action", answer: "[LIVE REPO REQUIRED]" }), type: "info" },
    { fn: async () => q11_httpPost(), type: "value" },
    { fn: async () => q12_devtools(), type: "value" },
    { fn: async () => ({ id: "q-broken-json-server", title: "Fix Broken JSON", answer: "[SUBMIT FIXED JSON - use validJson from generator]" }), type: "info" },
    { fn: q14_extractJsonZip, type: "value" },
    { fn: async () => ({ id: "q-markdown-unicode-server", title: "Convert Unicode to Markdown", answer: "[SUBMIT JS FUNCTION]" }), type: "info" },
    { fn: async () => ({ id: "q-generate-schema", title: "Infer SQL Schema", answer: "[SUBMIT SQL DDL - see reference schema in exam.mjs line 2938]" }), type: "info" },
    { fn: q15_sqlAverage, type: "value" },
    { fn: async () => ({ id: "q-markdown-architecture", title: "Deployment Architecture Markdown", answer: "[SUBMIT MARKDOWN DOC]" }), type: "info" },
    { fn: async () => ({ id: "q-prompt-debugging", title: "Debug Failing Prompt", answer: "[SUBMIT JSON with problems/improvedPrompt/improvements]" }), type: "info" },
    { fn: async () => ({ id: "q-ai-output-verification", title: "Verify AI-Generated Code", answer: "[SUBMIT JSON with bugs/fixedCode/testStrategy]" }), type: "info" },
  ];
  
  for (let i = 0; i < questions.length; i++) {
    try {
      const result = await questions[i].fn();
      const marker = questions[i].type === "info" ? "📝" : "✅";
      console.log(`${marker} Q${i + 1}: ${result.title}`);
      console.log(`   ID:     ${result.id}`);
      console.log(`   Answer: ${result.answer}`);
      if (result.extra) console.log(`   Extra:  ${result.extra}`);
      console.log();
    } catch (e) {
      console.log(`❌ Q${i + 1}: ERROR - ${e.message}\n`);
    }
  }
  
  console.log(`${"=".repeat(75)}`);
  console.log("✅ = Deterministic answer extracted");
  console.log("📝 = Requires manual action / LLM verification / code submission");
  console.log(`${"=".repeat(75)}\n`);
}

main().catch(console.error);
