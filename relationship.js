// ─── MULTI-SELECT STATE ───────────────────────────────────────────
let selectMode    = false;
let selectedNodes = new Set();

// ─── SELECT MODE ──────────────────────────────────────────────────
function toggleSelectMode() {
    selectMode = !selectMode;
    const btn = document.getElementById('select-mode-btn');
    btn.textContent      = '⬡ SELECT MODE: '+(selectMode?'ON':'OFF');
    btn.style.color       = selectMode ? 'var(--accent)' : '';
    btn.style.borderColor = selectMode ? 'var(--accent)' : '';
    btn.style.background  = selectMode ? 'rgba(0,255,225,0.1)' : '';
    document.body.classList.toggle('select-mode-active', selectMode);
    if (!selectMode) clearSelection();
}

function clearSelection() {
    selectedNodes.forEach(id => {
        const n = nodesDS.get(id);
        if (n) nodesDS.update({id, borderWidth:2, borderDashes:false});
    });
    selectedNodes.clear();
    updateSelectionDisplay();
    document.getElementById('find-relation-btn').style.display = 'none';
    document.getElementById('clear-sel-btn').style.display     = 'none';
}

function toggleNodeSelection(nodeId) {
    if (selectedNodes.has(nodeId)) {
        selectedNodes.delete(nodeId);
        nodesDS.update({id:nodeId, borderWidth:2, borderDashes:false});
    } else {
        if (selectedNodes.size >= 4) { showToast('⚠ Max 4 nodes for relationship analysis'); return; }
        selectedNodes.add(nodeId);
        nodesDS.update({id:nodeId, borderWidth:5, borderDashes:[5,3]});
    }
    updateSelectionDisplay();
    const show = selectedNodes.size >= 2;
    document.getElementById('find-relation-btn').style.display = show ? '' : 'none';
    document.getElementById('clear-sel-btn').style.display     = selectedNodes.size > 0 ? '' : 'none';
}

function updateSelectionDisplay() {
    const el = document.getElementById('selected-nodes-display');
    if (!selectedNodes.size) { el.textContent = selectMode ? 'Click nodes to select (max 4)' : ''; return; }
    const labels = Array.from(selectedNodes).map(id => allNodeData[id]?.label||id);
    el.innerHTML = labels.map(l=>`<span style="color:var(--accent);font-size:0.65rem;">▸ ${l}</span>`).join('<br>');
}

// ─── PATH FINDING ─────────────────────────────────────────────────
function findGraphPaths(startId, endId) {
    const allEdges = edgesDS.get();
    const adj = {};
    allEdges.forEach(e => {
        if (!adj[e.from]) adj[e.from] = [];
        if (!adj[e.to])   adj[e.to]   = [];
        adj[e.from].push(e.to);
        adj[e.to].push(e.from);
    });
    const queue = [[startId]], found = [], visited = new Set();
    while (queue.length && found.length < 5) {
        const path = queue.shift();
        const last = path[path.length-1];
        if (last === endId && path.length > 1) { found.push(path); continue; }
        if (path.length > 4) continue;
        const key = path.join('>');
        if (visited.has(key)) continue;
        visited.add(key);
        (adj[last]||[]).forEach(next => { if (!path.includes(next)) queue.push([...path, next]); });
    }
    return found;
}

// ─── RELATIONSHIP MODAL ───────────────────────────────────────────
async function findRelationship() {
    if (selectedNodes.size < 2) return;
    const ids    = Array.from(selectedNodes);
    const labels = ids.map(id => allNodeData[id]?.label||id);
    document.getElementById('rel-subtitle').textContent = labels.join(' ↔ ');
    document.getElementById('rel-content').innerHTML    = '<div class="rel-loading">MAPPING CONNECTIONS…</div>';
    document.getElementById('rel-modal').classList.add('active');

    const paths    = findGraphPaths(ids[0], ids[1]);
    const allEdges = edgesDS.get();

    // Shared connections
    let sharedConnections = [];
    if (ids.length >= 2) {
        const neighborSets = ids.map(id => {
            const s = new Set();
            allEdges.forEach(e => { if(e.from===id) s.add(e.to); if(e.to===id) s.add(e.from); });
            return s;
        });
        const shared = [...neighborSets[0]].filter(n => neighborSets.slice(1).every(s => s.has(n)));
        sharedConnections = shared.filter(n => !ids.includes(n)).map(n => allNodeData[n]?.label||n);
    }

    const directEdges = allEdges.filter(e => ids.includes(e.from) && ids.includes(e.to));

    let html = '';

    if (directEdges.length) {
        html += '<div style="font-family:Share Tech Mono,monospace;font-size:0.68rem;color:rgba(200,230,245,0.45);margin-bottom:8px;letter-spacing:1px;">// DIRECT CONNECTIONS</div>';
        directEdges.forEach(e => {
            const fromLabel = allNodeData[e.from]?.label||e.from;
            const toLabel   = allNodeData[e.to]?.label||e.to;
            html += `<div class="rel-path-item"><span class="rel-hop">
                <span class="rel-node-chip">${fromLabel}</span>
                <span class="rel-arrow">──</span>
                <span class="rel-label-tag">${e.label||'RELATED'}</span>
                <span class="rel-arrow">──▶</span>
                <span class="rel-node-chip">${toLabel}</span>
            </span>${e.desc?`<div style="margin-top:5px;font-size:0.72rem;color:rgba(200,230,245,0.55);">${e.desc}</div>`:''}</div>`;
        });
    }

    if (paths.length) {
        html += '<div style="font-family:Share Tech Mono,monospace;font-size:0.68rem;color:rgba(200,230,245,0.45);margin-bottom:8px;margin-top:14px;letter-spacing:1px;">// CONNECTION PATHS</div>';
        paths.slice(0,5).forEach(path => {
            html += '<div class="rel-path-item"><span class="rel-hop">';
            path.forEach((nodeId, i) => {
                const lbl = allNodeData[nodeId]?.label||nodeId;
                const typ = allNodeData[nodeId]?.type;
                html += `<span class="rel-node-chip${typ==='Central'?' central':''}">${lbl}</span>`;
                if (i < path.length-1) html += `<span class="rel-arrow"> ──▶ </span>`;
            });
            html += '</span></div>';
        });
    }

    if (sharedConnections.length) {
        html += `<div style="font-family:Share Tech Mono,monospace;font-size:0.68rem;color:rgba(200,230,245,0.45);margin-bottom:8px;margin-top:14px;letter-spacing:1px;">// SHARED CONNECTIONS (${sharedConnections.length})</div>`;
        html += `<div class="rel-path-item">${sharedConnections.map(l=>`<span class="rel-node-chip" style="margin:2px;display:inline-block">${l}</span>`).join(' ')}</div>`;
    }

    if (!directEdges.length && !paths.length && !sharedConnections.length) {
        html = '<div style="text-align:center;padding:20px;font-family:Share Tech Mono,monospace;font-size:0.78rem;color:rgba(200,230,245,0.4);">No direct paths found in current graph.<br>Try expanding one of these nodes first.</div>';
    }

    // AI analysis
    html += '<div style="font-family:Share Tech Mono,monospace;font-size:0.68rem;color:rgba(200,230,245,0.45);margin-bottom:8px;margin-top:16px;letter-spacing:1px;">// AI INTELLIGENCE ANALYSIS</div>';
    html += '<div class="rel-summary-box" id="rel-ai-text">Analyzing…</div>';
    document.getElementById('rel-content').innerHTML = html;

    try {
        const prompt = `You are an intelligence analyst. Analyze the relationship between these entities:\n`
            + ids.map(id => `- ${allNodeData[id]?.label||id}: ${allNodeData[id]?.summary?.substring(0,200)||allNodeData[id]?.details||''}`).join('\n')
            + `\n\nDirect graph connections found: ${directEdges.map(e=>`${e.from} -[${e.label}]-> ${e.to}`).join(', ')||'none'}`
            + `\nShared connections: ${sharedConnections.join(', ')||'none'}`
            + `\n\nWrite a concise 120-word intelligence brief on how these entities are connected, what they share, and the nature/significance of their relationship. Be specific and factual.`;

        const res  = await fetch('https://api.anthropic.com/v1/messages', {
            method:  'POST',
            headers: {'Content-Type':'application/json'},
            body:    JSON.stringify({model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:prompt}]}),
        });
        const data = await res.json();
        const text = data.content?.map(c=>c.text||'').join('') || 'Analysis unavailable.';
        const el   = document.getElementById('rel-ai-text');
        if (el) el.textContent = text;
    } catch(e) {
        const el = document.getElementById('rel-ai-text');
        if (el) el.textContent = 'AI analysis unavailable (backend connection needed).';
    }
}

function closeRelModal() { document.getElementById('rel-modal').classList.remove('active'); }