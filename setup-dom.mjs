import { JSDOM } from 'jsdom';

// Create a fake DOM, window, document, etc.
const dom = new JSDOM(``);

// --- Set up ALL global variables ---
// This code now runs *before* any other script
global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;
global.URL = dom.window.URL;

// --- FIX FOR URL.createObjectURL ---
global.URL.createObjectURL = () => 'blob:fake-url-' + Math.random().toString(36).substring(7);
global.URL.revokeObjectURL = () => {};
// -----------------------------------

// ========================================================
// 🕵️ THE SPY LAYER: DETERMINISTIC DATA EXTRACTION
// ========================================================
// We use this to passively catch the answers as the script 
// calculates them in memory!
global.SPY_DATA = {
    hashes: [],
    files: [],
    configs: []
};

// 1. Spy on WebCrypto (Intercepts SHA-256 hashes for Prettier, Rename, Zip)
// In Node 20+, 'crypto' is already a global variable, so we just patch its methods directly.
const originalDigest = global.crypto.subtle.digest;
global.crypto.subtle.digest = async function(algo, data) {
    const buffer = await originalDigest.call(this, algo, data);
    const hash = Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    global.SPY_DATA.hashes.push(hash);
    return buffer;
};

// Make sure the browser 'window' has access to the spy (bypassing the read-only getter in jsdom)
Object.defineProperty(global.window, 'crypto', {
    value: global.crypto,
    configurable: true,
    writable: true
});

// 2. Spy on Blobs (Extracts JSON and text content before it gets zipped)
const OriginalBlob = dom.window.Blob;
global.Blob = class SpiedBlob extends OriginalBlob {
    constructor(parts, options) {
        super(parts, options);
        if (parts && parts.length > 0 && typeof parts[0] === 'string') {
            const content = parts[0];
            // Save interesting generated file contents
            if (content.includes('total_sales') || content.includes('setting_')) {
                global.SPY_DATA.files.push(content);
            }
        }
    }
};

// 3. Spy on JSON.stringify to catch config objects before manipulation
const origStringify = JSON.stringify;
global.JSON.stringify = function(val, replacer, space) {
    if (val && typeof val === 'object' && val.setting_001) {
        global.SPY_DATA.configs.push(val);
    }
    return origStringify.apply(this, arguments);
};

// 4. Bypass Prompts for LLM questions so the script doesn't hang
global.prompt = (msg) => "sk-fake-ai-pipe-token";
// ========================================================

global.createImageBitmap = () => Promise.resolve({ width: 0, height: 0 });
global.Image = dom.window.Image;

// Mock other browser-specific things the script might need
global.self = global;