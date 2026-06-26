const fs = require('fs');
let code = fs.readFileSync('extract-answers.mjs', 'utf8');

// Fix Q8:
code = code.replace(
/  const commitHashes = \[\];\n  let prevConfig = null, prevReadme = null;\n  \n  for \(let i = 0; i < numCommits; i\+\+\) \{[\s\S]*?prevReadme = readmeStr;\n  \}/,
`  const commitsData = [];
  for (let i = 0; i < numCommits; i++) {
    let msg;
    if (i === 0) msg = "Initial commit";
    else if (i === targetIndex) msg = "Update timeout settings";
    else msg = shuffledMsgs[i % shuffledMsgs.length] + \` (#\${randInt(rng, 100, 999)})\`;
    
    const baseTime = new Date("2025-08-01T10:00:00Z").getTime();
    const offset = i * randInt(rng, 7200, 172800) * 1000;
    const timestamp = new Date(baseTime + offset);
    
    const retries = randInt(rng, 1, 5);
    const maxConn = randInt(rng, 10, 100);
    const debug = rng() > .7;
    commitsData.push({ msg, timestamp, retries, maxConn, debug, timeout: commitTimeouts[i], index: i });
  }
  
  const commitHashes = [];
  let prevConfig = null, prevReadme = null;
  let parentHash = null;
  
  for (let i = 0; i < numCommits; i++) {
    const data = commitsData[i];
    const environment = pick(["development", "staging", "production"], rng);
    const logLevel = pick(["debug", "info", "warn", "error"], rng);
    
    const config = {
      appName: id,
      version: \`\${randInt(rng, 1, 3)}.\${i}.\${randInt(rng, 0, 9)}\`,
      environment: environment,
      settings: {
        timeout: data.timeout,
        retries: data.retries,
        maxConnections: data.maxConn,
        debug: data.debug,
        logLevel: logLevel,
      },
      metadata: {
        lastUpdated: data.timestamp.toISOString(),
        updatedBy: author.name,
      },
    };
    
    const configStr = JSON.stringify(config, null, 2);
    const readmeStr = (i === 0 || rng() > .8)
      ? \`# \${id}\\n\\nVersion \${config.version}\\n\\nA sample project for testing.\\n\\n## Configuration\\n\\nSee config.json for settings.\\n\`
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
  }`
);

// Fix Q11:
code = code.replace(
/return \{ id, title: "POST HTTP requests with uv", answer: \`request_id=\$\{requestId\}\`, extra: \`email=\$\{EMAIL\} request_id=\$\{requestId\}\` \};/,
`return { id, title: "POST HTTP requests with uv", answer: JSON.stringify({headers: {Host: "httpbin.org"}, json: {email: EMAIL, request_id: requestId}}) };`
);

// Fix Q17:
code = code.replace(
/return \{ id, title: "SQL: Average Order Value", answer: avg.toFixed\(2\), extra: \`Shipped count: \$\{shipped.length\}\` \};/,
`return { id, title: "SQL: Average Order Value", answer: "SELECT AVG(quantity * unit_price) FROM orders WHERE LOWER(status) = 'shipped';" };`
);

fs.writeFileSync('extract-answers.mjs', code);
