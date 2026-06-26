// ============================================================
//  GA1 Question Definitions
// ============================================================

window.GA1_QUESTIONS = [

  // ─────────────────────────────────────────────────────────
  // Q1: VS Code Version
  // ─────────────────────────────────────────────────────────
  {
    number: 1,
    id: "q-vs-code-version",
    title: "Install and run VS Code",
    type: "manual",
    instructions: [
      { step: "Open your terminal in VS Code." },
      { step: 'Run the command: <code>code -s</code>' },
      { step: 'Paste the <strong>full output</strong> into the answer box on the exam.' },
      { step: 'The answer is validated by a regex — just copy-paste the output exactly.' },
    ]
  },

  // ─────────────────────────────────────────────────────────
  // Q2: Multi-cursor JSON
  // ─────────────────────────────────────────────────────────
  {
    number: 2,
    id: "q-multi-cursor-json",
    title: "Multi-cursor edits to convert to JSON",
    type: "deterministic",
    async extract(email) {
      const rng = makePRNG(`${email}#q-multi-cursor-json`);
      const obj = Object.fromEntries(
        Array.from({ length: 100 }, () => [randomString(rng), randomString(rng)])
      );
      const answer = await sha256(JSON.stringify(obj));
      return {
        answer,
        note: 'Go to <a href="https://tools-in-data-science.pages.dev/jsonhash" target="_blank">jsonhash tool</a>, paste your JSON, and verify this hash.'
      };
    }
  },

  // ─────────────────────────────────────────────────────────
  // Q3: npx prettier
  // ─────────────────────────────────────────────────────────
  {
    number: 3,
    id: "q-npx-prettier",
    title: "Run a command with npx",
    type: "deterministic",
    async extract(email) {
      const rng = makePRNG(`${email}#q-npx-prettier`);
      const base = [
        "#  Badly  Formatted  Markdown    ", "",
        "*  This is an uneven list", "* With inconsistent spacing",
        "   *    And weird indentation", "",
        ">This quote has no space", ">   This one has too many", ""
      ].join("\n");
      const content = base + "\n" + generateRandomChars(300, rng).join("");
      // Format using prettier standalone (loaded globally from CDN)
      const formatted = await prettier.format(content, {
        parser: "markdown",
        plugins: [prettierPlugins.markdown]
      });
      const hash = await sha256(formatted);
      return {
        answer: `${hash}  -`,
        note: 'This is the SHA-256 hash of the prettier-formatted content. Paste it exactly as shown (with the two trailing spaces and dash).'
      };
    }
  },

  // ─────────────────────────────────────────────────────────
  // Q4: LLM Bash Pipeline
  // ─────────────────────────────────────────────────────────
  {
    number: 4,
    id: "q-llm-bash",
    title: "Use LLM to process file contents",
    type: "manual",
    instructions: [
      { step: 'Install the <code>llm</code> CLI tool: <code>pip install llm</code>' },
      { step: 'Set your AI Pipe token: <code>llm keys set openai --value &lt;your-aipipe-token&gt;</code> and configure the base URL to <code>https://aipipe.org/openai/v1</code>' },
      { step: 'The exam asks you to write a bash command using the <code>llm</code> tool to perform a specific task on a file.' },
      { step: 'Run the command the exam specifies, then paste the output.' },
      { step: 'The answer is verified by an LLM judge — there is no single fixed answer, just meet the requirement described in the question.' },
    ]
  },

  // ─────────────────────────────────────────────────────────
  // Q5: Reorganize Files with Shell Commands
  // ─────────────────────────────────────────────────────────
  {
    number: 5,
    id: "q-rename-files-server",
    title: "Reorganize files with shell commands",
    type: "deterministic",
    async extract(email) {
      const rng = makePRNG(`${email}#q-rename-files-server`);
      const categories = ["documentation","reports","notes","configs","data","logs","scripts","templates","resources","archives"];
      const unicodeCategories = ["résumé","naïve-bayes","日本語","münchen","café"];
      const dirs = ["docs","content","archive","project"];
      const subs = ["chapter1","section-a","part 2","módulo-3","2024"];
      const subsubs = ["intro","advanced","appendix","données","références"];
      // Consume scenario pick (matches exam.mjs)
      const scenarios = [
        { name: "documentation_cleanup" }, { name: "archive_migration" },
        { name: "content_management" }, { name: "knowledge_base" }
      ];
      scenarios[Math.floor(rng() * scenarios.length)];

      const files = [];
      for (let s = 0; s < 30; s++) {
        const depth = 1 + Math.floor(rng() * 3);
        const parts = [];
        parts.push(dirs[Math.floor(rng() * dirs.length)]);
        if (depth >= 2) parts.push(subs[Math.floor(rng() * subs.length)]);
        if (depth >= 3) parts.push(subsubs[Math.floor(rng() * subsubs.length)]);
        if (rng() < 0.2) {
          const extras = ["spaces here","file-name","naïve","café-2024","test_file"];
          parts.push(extras[Math.floor(rng() * extras.length)]);
        }
        const filename = `file${String(s + 1).padStart(2, "0")}.txt`;
        const maybeUnicode = rng() < 0.1 ? filename.replace("i", "\u0456") : filename;
        const path = [...parts, maybeUnicode].join("/");
        let category;
        if (rng() < 0.3) category = unicodeCategories[Math.floor(rng() * unicodeCategories.length)];
        else category = categories[Math.floor(rng() * categories.length)];
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
      return {
        answer,
        note: 'Hash of the sorted file listing after running the rename command. Run <code>find . -type f | sort | sha256sum</code> in the reorganized folder to verify.'
      };
    }
  },

  // ─────────────────────────────────────────────────────────
  // Q6: Record Terminal Session
  // ─────────────────────────────────────────────────────────
  {
    number: 6,
    id: "q-asciirec-server",
    title: "Record a terminal session",
    type: "manual",
    instructions: [
      { step: 'Install asciinema: <code>pip install asciinema</code> or <code>brew install asciinema</code>' },
      { step: 'Start recording: <code>asciinema rec demo.cast</code>' },
      { step: 'Run the command(s) specified in the exam question.' },
      { step: 'Stop recording with <kbd>Ctrl+D</kbd> or <code>exit</code>.' },
      { step: 'Upload your cast file to <a href="https://asciinema.org" target="_blank">asciinema.org</a> and paste the link in the exam.' },
    ]
  },

  // ─────────────────────────────────────────────────────────
  // Q7: Three-Way Config Merge — Conflict Count
  // ─────────────────────────────────────────────────────────
  {
    number: 7,
    id: "q-config-merge-conflicts",
    title: "Three-way configuration merge",
    type: "deterministic",
    async extract(email) {
      const rng = makePRNG(`${email}#q-config-merge-conflicts`);
      const numSettings = 50 + Math.floor(rng() * 30);
      const keys = Array.from({ length: numSettings }, (_, i) => `setting_${String(i + 1).padStart(3, "0")}`);

      const base = {};
      keys.forEach(k => {
        base[k] = { value: Math.floor(rng() * 100), enabled: rng() < 0.7, priority: Math.floor(rng() * 10) };
      });

      const branchA = JSON.parse(JSON.stringify(base));
      const changesA = Math.floor(numSettings * 0.3);
      for (let i = 0; i < changesA; i++) {
        const key = keys[Math.floor(rng() * keys.length)];
        branchA[key].value = Math.floor(rng() * 100);
      }

      const branchB = JSON.parse(JSON.stringify(base));
      const changesB = Math.floor(numSettings * 0.3);
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

      return {
        answer: String(conflicts),
        note: 'Number of settings changed differently by both branches (true conflicts).'
      };
    }
  },

  // ─────────────────────────────────────────────────────────
  // Q8: Git Time Travel
  // ─────────────────────────────────────────────────────────
  {
    number: 8,
    id: "q-git-time-travel",
    title: "Git time travel: history investigation",
    type: "deterministic",
    async extract(email) {
      const id = "q-git-time-travel";
      const rng = makePRNG(`${email}#${id}`);

      const names = [
        { first: "Alice", last: "Johnson" }, { first: "Bob", last: "Smith" },
        { first: "Carol", last: "Davis" }, { first: "David", last: "Miller" },
        { first: "Eve", last: "Wilson" }, { first: "Frank", last: "Moore" },
        { first: "Grace", last: "Taylor" }, { first: "Hank", last: "Anderson" },
        { first: "Ivy", last: "Thomas" }, { first: "Jack", last: "Jackson" },
      ];
      const domains = ["example.com","test.com","sample.org","demo.net"];
      const commitMsgs = ["Initial commit","Add configuration file","Update README","Fix typo in docs","Update timeout settings","Refactor config structure","Add logging configuration","Update API endpoint","Fix configuration bug","Bump version number","Add error handling config","Update database settings","Modify retry settings","Change cache duration","Update security settings","Add feature flags","Update rate limiting","Fix memory leak config","Add monitoring settings","Update connection pool","Refactor timeout logic","Add backup configuration","Update SSL settings","Fix race condition","Add health check config","Update worker threads","Modify batch size","Change log level","Update compression settings","Add circuit breaker","Fix deadlock issue","Update queue settings","Add throttling config","Update pagination","Fix null pointer config","Add validation rules","Update serialization","Modify buffer size","Change polling interval","Update proxy settings","Add failover config","Fix timeout overflow","Update auth settings","Add CORS configuration","Modify chunk size","Change heartbeat interval","Update session timeout","Add cleanup config","Fix memory settings","Update thread pool","Add graceful shutdown","Modify max connections","Change request timeout","Update response cache"];

      const authorName = `${pick(names, rng).first} ${pick(names, rng).last}`;
      const authorEmail = `${authorName.toLowerCase().replace(/ /g, ".")}@${pick(domains, rng)}`;
      const numCommits = randInt(rng, 50, 60);
      const timeouts = [30,45,60,90,120,150,180,210,240,270,300,330,360,420,480,540,600,900,1200];
      const targetTimeout = pick(timeouts, rng);
      const targetIndex = randInt(rng, 10, numCommits - 10);

      const commitTimeouts = [];
      const usedTimeouts = new Set();
      for (let i = 0; i < numCommits; i++) {
        if (i === targetIndex) {
          commitTimeouts.push(targetTimeout); usedTimeouts.add(targetTimeout);
        } else {
          let t;
          do { t = pick(timeouts.filter(v => v !== targetTimeout), rng); }
          while (usedTimeouts.has(t) && usedTimeouts.size < timeouts.length - 1);
          commitTimeouts.push(t); usedTimeouts.add(t);
        }
      }

      // Pass 1: collect all commit data (messages, timestamps, retries, maxConn, debug)
      const shuffledMsgs = shuffle(commitMsgs, rng);
      const author = { name: authorName, email: authorEmail };
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
        const debug = rng() > 0.7;
        commitsData.push({ msg, timestamp, retries, maxConn, debug, timeout: commitTimeouts[i] });
      }

      // Pass 2: build git objects (uses rng for version, environment, logLevel)
      const commitHashes = [];
      let parentHash = null;
      let prevReadme = null;
      for (let i = 0; i < numCommits; i++) {
        const data = commitsData[i];
        const config = {
          appName: id,
          version: `${randInt(rng, 1, 3)}.${i}.${randInt(rng, 0, 9)}`,
          environment: pick(["development","staging","production"], rng),
          settings: {
            timeout: data.timeout,
            retries: data.retries,
            maxConnections: data.maxConn,
            debug: data.debug,
            logLevel: pick(["debug","info","warn","error"], rng),
          },
          metadata: { lastUpdated: data.timestamp.toISOString(), updatedBy: author.name }
        };
        const configStr = JSON.stringify(config, null, 2);
        const readmeStr = (i === 0 || rng() > 0.8)
          ? `# ${id}\n\nVersion ${config.version}\n\nA sample project for testing.\n\n## Configuration\n\nSee config.json for settings.\n`
          : prevReadme;

        const configBlobH = await blobHash(configStr);
        const readmeBlobH = await blobHash(readmeStr);
        const tH = await treeHash([
          { mode: "100644", name: "config.json", hash: configBlobH },
          { mode: "100644", name: "README.md", hash: readmeBlobH },
        ]);
        const cHash = await commitHash({ treeH: tH, parentH: parentHash, message: data.msg, author, timestamp: data.timestamp });
        commitHashes.push(cHash);
        parentHash = cHash;
        prevReadme = readmeStr;
      }

      const parentOfTarget = commitHashes[targetIndex - 1].substring(0, 7);
      return {
        answer: parentOfTarget,
        note: `The exam asks for the 7-char hash of the <strong>parent</strong> of the commit that set <code>timeout</code> to <strong>${targetTimeout}</strong>. Download the repo zip from the exam, extract it, run <code>git log --oneline</code>, find the "Update timeout settings" commit, and confirm its parent matches this hash.`
      };
    }
  },

  // ─────────────────────────────────────────────────────────
  // Q9: GitHub Pages
  // ─────────────────────────────────────────────────────────
  {
    number: 9,
    id: "q-github-pages",
    title: "Host your portfolio on GitHub Pages",
    type: "manual",
    instructions: [
      { step: 'Create a GitHub repository named <code>&lt;your-username&gt;.github.io</code>.' },
      { step: 'Add an <code>index.html</code> with your email address visible on the page.' },
      { step: 'Enable GitHub Pages from <strong>Settings → Pages → Deploy from branch → main</strong>.' },
      { step: 'Wait a few minutes for deployment, then paste the live URL (e.g. <code>https://username.github.io</code>) in the answer box.' },
      { step: 'Ensure the email address is <strong>not obfuscated</strong> in the page source (disable Cloudflare email obfuscation if applicable).' },
    ]
  },

  // ─────────────────────────────────────────────────────────
  // Q10: GitHub Action
  // ─────────────────────────────────────────────────────────
  {
    number: 10,
    id: "q-github-action",
    title: "Create a GitHub Action",
    type: "manual",
    instructions: [
      { step: 'In any GitHub repository, create <code>.github/workflows/ci.yml</code>.' },
      { step: 'The workflow must run on <code>push</code> and have at least one step.' },
      { step: 'Commit and push — watch the Actions tab to see it succeed (green checkmark).' },
      { step: 'Paste the GitHub repository URL (e.g. <code>https://github.com/user/repo</code>) in the answer box.' },
    ]
  },

  // ─────────────────────────────────────────────────────────
  // Q11: HTTP POST with uv / HTTPie
  // ─────────────────────────────────────────────────────────
  {
    number: 11,
    id: "q-uv-http-post",
    title: "POST HTTP requests with uv",
    type: "semi",
    async extract(email) {
      const rng = makePRNG(`${email}#q-uv-http-post`);
      const hex = "0123456789abcdef";
      let requestId = "";
      for (let i = 0; i < 8; i++) requestId += hex[Math.floor(rng() * hex.length)];
      const command = `uv run --with httpie -- http --json POST https://httpbin.org/post email=${email} request_id=${requestId}`;
      return {
        answer: null,
        requestId,
        command,
        note: `Run the command above in your terminal. <strong>Copy the full JSON response</strong> and paste it into the exam answer box. The validator checks that the response contains <code>headers.Host == "httpbin.org"</code>, <code>json.email == "${email}"</code>, and <code>json.request_id == "${requestId}"</code>.`
      };
    }
  },

  // ─────────────────────────────────────────────────────────
  // Q12: DevTools hidden input
  // ─────────────────────────────────────────────────────────
  {
    number: 12,
    id: "q-use-devtools",
    title: "Use DevTools",
    type: "deterministic",
    async extract(email) {
      const rng = makePRNG(`${email}#q-use-devtools`);
      const answer = rng().toString(36).slice(-10);
      return {
        answer,
        note: 'This is the value hidden in the exam page\'s hidden input field. You can also open DevTools → Elements and search for <code>type="hidden"</code> to verify.'
      };
    }
  },

  // ─────────────────────────────────────────────────────────
  // Q13: Fix Broken JSON
  // ─────────────────────────────────────────────────────────
  {
    number: 13,
    id: "q-broken-json-server",
    title: "Fix broken JSON",
    type: "manual",
    instructions: [
      { step: 'Download the broken JSON file from the exam.' },
      { step: 'Open it in VS Code and use the built-in JSON validation (look for red underlines).' },
      { step: 'Alternatively use <a href="https://jsonlint.com" target="_blank">JSONLint</a> or <a href="https://jsonformatter.org" target="_blank">JSON Formatter</a> to identify and fix each error.' },
      { step: 'Common issues: missing commas, trailing commas, unquoted keys, mismatched brackets/braces.' },
      { step: 'Paste the <strong>valid, fixed JSON</strong> into the answer box.' },
    ]
  },

  // ─────────────────────────────────────────────────────────
  // Q14: Extract JSON from ZIP — total_sales sum
  // ─────────────────────────────────────────────────────────
  {
    number: 14,
    id: "q-extract-json-zip",
    title: "Extract JSON from a ZIP file",
    type: "deterministic",
    async extract(email) {
      const hash = await sha256(`${email}#q-extract-json-zip`);
      const answer = hash.slice(-5);
      return {
        answer,
        note: 'The last 5 characters of the SHA-256 hash of your email seed. This is the answer to the "What is the value of …" question from the JSON inside the ZIP.'
      };
    }
  },

  // ─────────────────────────────────────────────────────────
  // Q15: Unicode → Markdown converter
  // ─────────────────────────────────────────────────────────
  {
    number: 15,
    id: "q-markdown-unicode-server",
    title: "Convert Unicode formatting to Markdown",
    type: "manual",
    instructions: [
      { step: 'The exam gives you text that uses Unicode bold/italic characters (e.g. 𝗯𝗼𝗹𝗱, 𝘪𝘵𝘢𝘭𝘪𝘤).' },
      { step: 'Write a JavaScript function that converts these Unicode characters back to standard Markdown (<code>**bold**</code>, <code>_italic_</code>).' },
      { step: 'Map: Mathematical Bold → <code>**...**</code>, Mathematical Italic → <code>_..._</code>, Mathematical Bold Italic → <code>***...***</code>.' },
      { step: 'Submit your JS function in the answer box. The exam will run it against test cases.' },
    ]
  },

  // ─────────────────────────────────────────────────────────
  // Q16: Infer SQL Schema
  // ─────────────────────────────────────────────────────────
  {
    number: 16,
    id: "q-generate-schema",
    title: "Infer a SQL schema from JSON data",
    type: "manual",
    instructions: [
      { step: 'Download the JSON file from the exam.' },
      { step: 'Inspect its structure — note all keys, value types, nested objects.' },
      { step: 'Write a <code>CREATE TABLE</code> SQL statement that correctly models the data.' },
      { step: 'Use appropriate SQL types: <code>TEXT</code>, <code>INTEGER</code>, <code>FLOAT</code>, <code>BOOLEAN</code>.' },
      { step: 'Paste your SQL DDL in the answer box.' },
    ]
  },

  // ─────────────────────────────────────────────────────────
  // Q17: SQL — Average Order Value
  // ─────────────────────────────────────────────────────────
  {
    number: 17,
    id: "q-sql-order-average",
    title: "SQL: Average order value for shipped orders",
    type: "semi",
    async extract(email) {
      const rng = makePRNG(`${email}#q-sql-order-average`);
      const statuses = ["Shipped","shipped","SHIPPED","Pending","Cancelled","Processing"];
      const orders = Array.from({ length: 1000 }, () => ({
        status: statuses[Math.floor(rng() * statuses.length)],
        quantity: Math.floor(rng() * 9) + 1,
        unit_price: Number((rng() * 99 + 1).toFixed(2)),
      }));
      const shipped = orders.filter(o => /shipped/i.test(o.status));
      const totalValue = shipped.reduce((s, o) => s + o.quantity * o.unit_price, 0);
      const avg = shipped.length > 0 ? totalValue / shipped.length : 0;
      const sql = `SELECT AVG(quantity * unit_price) FROM orders WHERE LOWER(status) = 'shipped';`;
      return {
        answer: sql,
        expectedAvg: avg.toFixed(2),
        note: `Paste the SQL query above into the exam. The exam runs it against an SQLite database and checks the result is within 0.01 of <strong>${avg.toFixed(2)}</strong>. The query uses <code>LOWER(status)</code> for case-insensitive matching.`
      };
    }
  },

  // ─────────────────────────────────────────────────────────
  // Q18: Deployment Architecture Markdown
  // ─────────────────────────────────────────────────────────
  {
    number: 18,
    id: "q-markdown-architecture",
    title: "Write a deployment architecture document",
    type: "manual",
    instructions: [
      { step: 'The exam asks you to write a Markdown document describing a deployment architecture.' },
      { step: 'Include sections: Overview, Components, Data Flow, Deployment Steps, Monitoring.' },
      { step: 'Use proper Markdown: headings, bullet points, code blocks where applicable.' },
      { step: 'An LLM judge evaluates it — be thorough and technically accurate.' },
      { step: 'Paste the full Markdown in the answer text area.' },
    ]
  },

  // ─────────────────────────────────────────────────────────
  // Q19: Debug Failing Prompt
  // ─────────────────────────────────────────────────────────
  {
    number: 19,
    id: "q-prompt-debugging",
    title: "Debug a failing LLM prompt",
    type: "manual",
    instructions: [
      { step: 'The exam provides a prompt that fails to produce the expected output.' },
      { step: 'Identify the problems: ambiguity, missing context, poor instruction format, etc.' },
      { step: 'Write an improved version of the prompt.' },
      { step: 'Submit a JSON object with keys: <code>problems</code> (array), <code>improvedPrompt</code> (string), <code>improvements</code> (array).' },
      { step: 'Example: <code>{"problems":["..."],"improvedPrompt":"...","improvements":["..."]}</code>' },
    ]
  },

  // ─────────────────────────────────────────────────────────
  // Q20: AI Output Verification
  // ─────────────────────────────────────────────────────────
  {
    number: 20,
    id: "q-ai-output-verification",
    title: "Verify AI-generated code",
    type: "manual",
    instructions: [
      { step: 'The exam provides AI-generated code with intentional bugs.' },
      { step: 'Find all bugs — logic errors, edge cases not handled, off-by-one errors, etc.' },
      { step: 'Write corrected code.' },
      { step: 'Submit a JSON object with keys: <code>bugs</code> (array of descriptions), <code>fixedCode</code> (string), <code>testStrategy</code> (string).' },
      { step: 'Example: <code>{"bugs":["..."],"fixedCode":"...","testStrategy":"..."}</code>' },
    ]
  },

];
