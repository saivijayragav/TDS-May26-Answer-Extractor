// ============================================================
//  GA Registry — add new GAs here as they are created
// ============================================================
const GA_REGISTRY = {
  1: { label: "GA1 – Tools in Data Science", questions: window.GA1_QUESTIONS },
  // 2: { label: "GA2 – ...", questions: window.GA2_QUESTIONS },
};

// ============================================================
//  DOM refs
// ============================================================
const gaSelect     = document.getElementById("ga-select");
const emailInput   = document.getElementById("email-input");
const extractBtn   = document.getElementById("extract-btn");
const resultsEl    = document.getElementById("results");
const progressEl   = document.getElementById("progress-bar");
const progressWrap = document.getElementById("progress-wrap");
const heroForm     = document.getElementById("hero-form");

// ============================================================
//  Populate GA dropdown
// ============================================================
Object.entries(GA_REGISTRY).forEach(([num, meta]) => {
  const opt = document.createElement("option");
  opt.value = num;
  opt.textContent = meta.label;
  gaSelect.appendChild(opt);
});

// ============================================================
//  Main extraction handler
// ============================================================
extractBtn.addEventListener("click", runExtraction);
emailInput.addEventListener("keydown", e => { if (e.key === "Enter") runExtraction(); });

async function runExtraction() {
  const email = emailInput.value.trim();
  const gaNum  = parseInt(gaSelect.value, 10);

  if (!email || !email.includes("@")) {
    shakeInput(emailInput);
    return;
  }

  const ga = GA_REGISTRY[gaNum];
  if (!ga) { alert("Unknown GA selected."); return; }

  // UI reset
  extractBtn.disabled = true;
  extractBtn.textContent = "Extracting…";
  resultsEl.innerHTML = "";
  progressWrap.classList.remove("hidden");
  setProgress(0);

  const questions = ga.questions;
  const cards = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    setProgress(Math.round((i / questions.length) * 100));

    let resultData = null;
    let error      = null;
    try {
      if (q.type === "deterministic" || q.type === "semi") {
        resultData = await q.extract(email);
      }
    } catch (e) {
      error = e.message;
    }

    cards.push(buildCard(q, resultData, error, i));
  }

  setProgress(100);
  setTimeout(() => progressWrap.classList.add("hidden"), 600);

  // Reveal cards with stagger
  resultsEl.innerHTML = "";
  cards.forEach((card, idx) => {
    card.style.animationDelay = `${idx * 40}ms`;
    resultsEl.appendChild(card);
  });

  extractBtn.disabled = false;
  extractBtn.textContent = "Extract Answers";

  // Smooth scroll to results
  resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ============================================================
//  Card builder
// ============================================================
function buildCard(q, data, error, idx) {
  const card = document.createElement("div");
  card.className = `q-card q-card--${q.type}`;
  card.setAttribute("data-id", q.id);

  const badge = { deterministic: "Auto", semi: "Semi", manual: "Manual" }[q.type];
  const badgeClass = { deterministic: "badge-auto", semi: "badge-semi", manual: "badge-manual" }[q.type];

  let bodyHtml = "";

  if (error) {
    bodyHtml = `<div class="error-box">⚠️ ${escHtml(error)}</div>`;
  } else if (q.type === "deterministic" && data) {
    bodyHtml = `
      <div class="answer-block">
        <div class="answer-label">Answer</div>
        <div class="answer-value" id="ans-${idx}">${escHtml(data.answer)}</div>
        <button class="copy-btn" onclick="copyText('ans-${idx}', this)">Copy</button>
      </div>
      ${data.note ? `<div class="note">${data.note}</div>` : ""}
    `;
  } else if (q.type === "semi" && data) {
    bodyHtml = buildSemiCard(q, data, idx);
  } else if (q.type === "manual") {
    bodyHtml = buildManualCard(q);
  }

  card.innerHTML = `
    <div class="card-header">
      <div class="q-number">Q${q.number}</div>
      <div class="q-title">${escHtml(q.title)}</div>
      <span class="badge ${badgeClass}">${badge}</span>
    </div>
    <div class="card-body">${bodyHtml}</div>
  `;
  return card;
}

function buildSemiCard(q, data, idx) {
  if (q.id === "q-uv-http-post") {
    return `
      <div class="semi-info">
        <div class="info-row"><span class="info-label">Your request_id</span>
          <code class="inline-code" id="rid-${idx}">${escHtml(data.requestId)}</code>
          <button class="copy-btn copy-btn--sm" onclick="copyText('rid-${idx}', this)">Copy</button>
        </div>
      </div>
      <div class="answer-block">
        <div class="answer-label">Command to run</div>
        <pre class="cmd-block" id="cmd-${idx}">${escHtml(data.command)}</pre>
        <button class="copy-btn" onclick="copyText('cmd-${idx}', this)">Copy Command</button>
      </div>
      <div class="note">${data.note}</div>
    `;
  }
  if (q.id === "q-sql-order-average") {
    return `
      <div class="answer-block">
        <div class="answer-label">SQL Query to submit</div>
        <pre class="cmd-block" id="sql-${idx}">${escHtml(data.answer)}</pre>
        <button class="copy-btn" onclick="copyText('sql-${idx}', this)">Copy SQL</button>
      </div>
      <div class="semi-info">
        <div class="info-row"><span class="info-label">Expected result ≈</span>
          <code class="inline-code">${escHtml(data.expectedAvg)}</code>
        </div>
      </div>
      <div class="note">${data.note}</div>
    `;
  }
  return `<div class="note">${data.note || ""}</div>`;
}

function buildManualCard(q) {
  const steps = q.instructions.map((ins, i) => `
    <li class="step-item">
      <span class="step-num">${i + 1}</span>
      <span class="step-text">${ins.step}</span>
    </li>
  `).join("");
  return `
    <div class="manual-label">Steps to complete</div>
    <ol class="step-list">${steps}</ol>
  `;
}

// ============================================================
//  Utilities
// ============================================================
function setProgress(pct) {
  progressEl.style.width = `${pct}%`;
}

function escHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shakeInput(el) {
  el.classList.add("shake");
  el.focus();
  setTimeout(() => el.classList.remove("shake"), 500);
}

// Expose copy helper globally (called from inline onclick)
window.copyText = function(elemId, btn) {
  const el = document.getElementById(elemId);
  if (!el) return;
  const text = el.textContent || el.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = orig; btn.classList.remove("copied"); }, 1500);
  });
};
