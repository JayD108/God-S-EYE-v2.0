// ─── STATE ────────────────────────────────────────────────────────
let selectedNode  = null;
let entityTabIds  = new Set();
let nodeRatings   = {};
let flaggedSources = {};

// ─── NODE CLICK ───────────────────────────────────────────────────
function onNodeClick(node, event) {
    selectedNode = node;
    document.getElementById('node-title').textContent = node.label || node.id;
    const badge = document.getElementById('node-type-badge');
    badge.textContent = node.type || 'ENTITY';
    badge.style.background = node.type==='Central'?'rgba(255,45,107,0.15)': node.type==='Category'?'rgba(255,215,0,0.15)':'rgba(0,255,225,0.1)';
    badge.style.color      = node.type==='Central'?'#ff2d6b': node.type==='Category'?'#ffd700':'#00ffe1';
    document.getElementById('node-content').innerHTML = node.summary ? marked.parse(node.summary) : '<p>'+(node.details||'No data.')+'</p>';
    document.getElementById('expand-section').classList.add('visible');
    document.getElementById('expand-query-input').value = '';
    document.getElementById('rating-section').style.display = 'block';
    renderStars(nodeRatings[node.id] || 0);
    switchTab('node-info', document.querySelector('[data-tab="node-info"]'));
    addEntityTab(node);
    showExpandPopup(node, event);
}

// ─── TABS ─────────────────────────────────────────────────────────
function switchTab(tabId, btnEl) {
    document.querySelectorAll('.tab-btn').forEach(b  => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    const pane = document.getElementById('tab-pane-'+tabId);
    if (pane) pane.classList.add('active');
}

function addEntityTab(node) {
    const tabId = 'et_'+node.id.replace(/[^a-zA-Z0-9]/g,'_');
    if (entityTabIds.has(tabId)) { switchTab(tabId, document.querySelector('[data-tab="'+tabId+'"]')); return; }
    entityTabIds.add(tabId);
    const tabsHeader = document.getElementById('tabs-header');
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.setAttribute('data-tab', tabId);
    btn.innerHTML = (node.label||node.id).substring(0,9)+' <span class="tab-close">✕</span>';
    btn.addEventListener('click', function(e) {
        if (e.target.classList.contains('tab-close')) {
            btn.remove();
            const p = document.getElementById('tab-pane-'+tabId); if (p) p.remove();
            entityTabIds.delete(tabId);
            switchTab('controls', document.querySelector('[data-tab="controls"]'));
        } else switchTab(tabId, btn);
    });
    tabsHeader.appendChild(btn);

    const pane    = document.createElement('div');
    pane.className = 'tab-pane';
    pane.id        = 'tab-pane-'+tabId;
    const content  = node.summary ? marked.parse(node.summary) : '<p>'+(node.details||'No data.')+'</p>';
    pane.innerHTML =
        '<div style="color:var(--accent);font-weight:700;font-size:1.1rem;margin-bottom:5px;">'+(node.label||node.id)+'</div>'
      + '<div style="font-size:0.7rem;font-family:Share Tech Mono,monospace;color:rgba(200,230,245,0.4);margin-bottom:12px;">'+(node.type||'ENTITY')+'</div>'
      + '<div style="font-size:0.79rem;line-height:1.7;">'+content+'</div>'
      + '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap;">'
      + '<button class="filter-btn" style="flex:1" onclick="selectedNode=allNodeData[\''+node.id+'\'];doQuickExpand()">⊕ Expand</button>'
      + '<button class="filter-btn" style="color:var(--accent2);border-color:rgba(255,45,107,0.35);flex:1" onclick="selectedNode=allNodeData[\''+node.id+'\'];openFeedbackModal()">⚑ Report</button>'
      + '</div>';
    document.querySelector('.tabs-content').appendChild(pane);
    switchTab(tabId, btn);
}

// ─── EXPAND POPUP ─────────────────────────────────────────────────
function showExpandPopup(node, event) {
    const popup = document.getElementById('expand-popup');
    document.getElementById('expand-popup-title').textContent = 'EXPAND: '+(node.label||node.id).substring(0,22);
    document.getElementById('expand-popup-input').value = '';
    const cx = event&&event.center ? event.center.x : window.innerWidth/2;
    const cy = event&&event.center ? event.center.y : window.innerHeight/2;
    let x=cx+18, y=cy-55;
    if (x+240>window.innerWidth)  x = cx-250;
    if (y+130>window.innerHeight) y = window.innerHeight-145;
    popup.style.left = x+'px';
    popup.style.top  = y+'px';
    popup.classList.add('visible');
}
function closeExpandPopup() { document.getElementById('expand-popup').classList.remove('visible'); }

async function doExpand() {
    if (!selectedNode) return;
    const q = document.getElementById('expand-popup-input').value || selectedNode.label || selectedNode.id;
    closeExpandPopup();
    await scanTarget(q, document.getElementById('mode').value, selectedNode.id);
}
async function doQuickExpand() {
    if (!selectedNode) return;
    closeExpandPopup();
    await scanTarget(selectedNode.label || selectedNode.id, document.getElementById('mode').value, selectedNode.id);
}
async function expandFromPanel() {
    if (!selectedNode) return;
    const q = document.getElementById('expand-query-input').value || selectedNode.label || selectedNode.id;
    await scanTarget(q, document.getElementById('mode').value, selectedNode.id);
}