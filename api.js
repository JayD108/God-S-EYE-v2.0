// ─── STATE ────────────────────────────────────────────────────────
let nodeSources   = {};
let scanController = null;

// ─── LOADER / STATUS ──────────────────────────────────────────────
function showLoader() { document.getElementById('loader').classList.add('active'); }
function hideLoader() { document.getElementById('loader').classList.remove('active'); }
function setStatus(text, scanning) {
    document.getElementById('status-text').textContent = text;
    document.getElementById('scan-btn').disabled = scanning;
    if (scanning) {
        document.getElementById('dot-api').className = 'status-dot yellow';
    } else {
        checkHealth();
    }
}

// ─── HEALTH CHECK ─────────────────────────────────────────────────
async function checkHealth() {
    const apiDot = document.getElementById('dot-api');
    const dbDot  = document.getElementById('dot-db');
    try {
        const res = await fetch(API+'/api/graph', {signal: AbortSignal.timeout(3000)});
        if (res.ok) {
            apiDot.className = 'status-dot green';
            await res.json();
            dbDot.className  = 'status-dot green';
        } else {
            apiDot.className = 'status-dot green';
            dbDot.className  = 'status-dot red';
        }
    } catch(e) {
        apiDot.className = 'status-dot red';
        dbDot.className  = 'status-dot red';
    }
}
setInterval(checkHealth, 12000);

// ─── FETCH & RENDER ───────────────────────────────────────────────
async function fetchGraph() {
    try {
        const res  = await fetch(API+'/api/graph');
        const data = await res.json();
        if (data.sources) Object.assign(nodeSources, data.sources);
        renderGraph(data.nodes, data.links);
    } catch(e) { loadDemoGraph(); }
}

// ─── SCAN ─────────────────────────────────────────────────────────
async function initiateScan() {
    const target = document.getElementById('target').value.trim();
    if (!target) return;
    await scanTarget(target, document.getElementById('mode').value, null);
}

async function scanTarget(target, mode, parentId) {
    showLoader();
    setStatus('SCANNING', true);
    scanController = new AbortController();
    try {
        const res = await fetch(API+'/api/scan', {
            method:  'POST',
            headers: {'Content-Type':'application/json'},
            body:    JSON.stringify({target, mode}),
            signal:  scanController.signal,
        });
        if (!res.ok) throw new Error('API error');
        const result = await res.json();
        if (result.sources) Object.assign(nodeSources, result.sources);
        await fetchGraph();
    } catch(e) {
        if (e.name === 'AbortError') showToast('✕ Scan cancelled');
        else if (parentId) expandDemoNode(parentId, target);
        else { nodesDS.clear(); edgesDS.clear(); allNodeData={}; loadDemoGraph(); }
    } finally {
        hideLoader(); setStatus('READY', false); scanController = null;
    }
}

function cancelScan() {
    if (scanController) { scanController.abort(); scanController = null; }
    hideLoader(); setStatus('READY', false);
}

// ─── WIPE DB ──────────────────────────────────────────────────────
async function wipeDB() {
    try { await fetch(API+'/api/wipe', {method:'POST'}); } catch(e) {}
    nodesDS.clear(); edgesDS.clear(); allNodeData={};
    nodeRatings={}; nodeSources={}; flaggedSources={};
    entityTabIds.forEach(tabId => {
        const b = document.querySelector('[data-tab="'+tabId+'"]'); if (b) b.remove();
        const p = document.getElementById('tab-pane-'+tabId);      if (p) p.remove();
    });
    entityTabIds.clear();
    updateStats();
    switchTab('controls', document.querySelector('[data-tab="controls"]'));
}

// ─── DEMO EXPAND FALLBACK ─────────────────────────────────────────
function expandDemoNode(parentId, query) {
    const existing = new Set(nodesDS.getIds());
    const extras = [query+' — Context', query+' — Origin', query+' — Impact', query+' — Network', query+' — Timeline'];
    const newN=[], newE=[];
    extras.forEach((label, i) => {
        const id = parentId+'_x'+i; if (existing.has(id)) return;
        const n = {id, type:'Entity', label, summary:'**Expanded from:** '+parentId, details:'Expanded', _expanded:true};
        allNodeData[id] = n; nodeSources[id] = nodeSources[parentId] || [];
        newN.push({id, label, color:getNodeColor('Entity',true), size:10, font:{color:'#a0a8ff',size:10}});
        newE.push({id:'xe_'+parentId+'_'+i, from:parentId, to:id, label:'RELATED_TO', length:165, color:{color:'rgba(120,130,220,0.4)'}, width:1.2});
    });
    nodesDS.add(newN); edgesDS.add(newE); updateStats();
}