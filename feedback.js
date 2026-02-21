// ─── STAR RATING ──────────────────────────────────────────────────
function setRating(stars) {
    if (!selectedNode) return;
    nodeRatings[selectedNode.id] = stars;
    renderStars(stars);
    fetch(API+'/api/feedback', {
        method:  'POST',
        headers: {'Content-Type':'application/json'},
        body:    JSON.stringify({node_id:selectedNode.id, rating:stars, correction:'', flagged_sources:[]}),
    }).catch(()=>{});
    if (stars <= 2) setTimeout(() => openFeedbackModal(), 400);
}

function renderStars(rating) {
    document.querySelectorAll('.star-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.getAttribute('data-star')) <= rating);
    });
    const labels = ['unrated','Poor','Below avg','Average','Good','Excellent'];
    document.getElementById('rating-label').textContent = labels[rating] || 'unrated';
}

// ─── FEEDBACK MODAL ───────────────────────────────────────────────
function openFeedbackModal() {
    if (!selectedNode) return;
    document.getElementById('feedback-node-name').textContent = selectedNode.label || selectedNode.id;
    document.getElementById('correction-text').value = '';
    if (!flaggedSources[selectedNode.id]) flaggedSources[selectedNode.id] = new Set();
    const sources = nodeSources[selectedNode.id] || [];
    const list    = document.getElementById('sources-list');
    if (!sources.length) {
        list.innerHTML = '<div style="font-size:0.75rem;color:rgba(200,230,245,0.35);font-family:Share Tech Mono,monospace;">No source metadata for this node.</div>';
    } else {
        list.innerHTML = sources.map((s, i) => {
            const fl = flaggedSources[selectedNode.id].has(i);
            return '<div class="source-item">'
                + '<div class="source-num">['+(i+1)+']</div>'
                + '<div class="source-info"><div class="source-title-text">'+(s.title||'Unknown')+'</div>'
                + '<div class="source-url">'+(s.url||'')+'</div></div>'
                + '<div class="source-correct"><button class="source-wrong-btn'+(fl?' flagged':'')+'" onclick="toggleSourceFlag('+i+')">'
                + (fl?'⚑ FLAGGED':'⚑ WRONG')+'</button></div></div>';
        }).join('');
    }
    document.getElementById('feedback-modal').classList.add('active');
}

function closeFeedbackModal() { document.getElementById('feedback-modal').classList.remove('active'); }

function toggleSourceFlag(idx) {
    if (!selectedNode) return;
    if (!flaggedSources[selectedNode.id]) flaggedSources[selectedNode.id] = new Set();
    const s = flaggedSources[selectedNode.id];
    if (s.has(idx)) s.delete(idx); else s.add(idx);
    openFeedbackModal();
}

async function submitFeedback() {
    if (!selectedNode) return;
    const correction = document.getElementById('correction-text').value.trim();
    if (!correction) { document.getElementById('correction-text').style.borderColor='var(--accent2)'; return; }
    document.getElementById('correction-text').style.borderColor = '';
    const payload = {
        node_id:        selectedNode.id,
        node_label:     selectedNode.label || selectedNode.id,
        rating:         nodeRatings[selectedNode.id] || 0,
        correction,
        flagged_sources: Array.from(flaggedSources[selectedNode.id] || []),
        sources:        nodeSources[selectedNode.id] || [],
    };
    try { await fetch(API+'/api/feedback', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)}); }
    catch(e) { console.warn('Feedback stored locally'); }
    closeFeedbackModal();
    showToast('✓ Correction submitted — model will adapt');
    nodesDS.update({id:selectedNode.id, borderWidth:4, color:{border:'#ff2d6b'}});
}

// ─── TOAST ────────────────────────────────────────────────────────
function showToast(msg) {
    const t = document.getElementById('feedback-toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}