// ─── GLOBALS ──────────────────────────────────────────────────────
const API = "http://localhost:8000";
let network = null;
let allNodeData = {};
let physicsOn   = true;
let isDark      = true;

const nodesDS = new vis.DataSet([]);
const edgesDS = new vis.DataSet([]);

// ─── NODE / EDGE STYLING ──────────────────────────────────────────
function getNodeColor(type, isExpanded) {
    if (isExpanded) return {background:'#7c83db',border:'#a0a8ff',highlight:{background:'#9099ff',border:'#c0caff'}};
    if (type==='Central')  return {background:'#ff2d6b',border:'#ff6090',highlight:{background:'#ff4d82',border:'#ff8ab0'}};
    if (type==='Category') return {background:'#ffd700',border:'#ffe55a',highlight:{background:'#ffe040',border:'#ffec80'}};
    return {background:'#00ffe1',border:'#55fff0',highlight:{background:'#33ffe8',border:'#77fff5'}};
}
function getNodeSize(type) { return type==='Central'?30:type==='Category'?19:11; }
function getEdgeLength(s, t) {
    if ((s==='Central'&&t==='Category')||(s==='Category'&&t==='Central')) return 120;
    if ((s==='Central'&&t==='Entity')  ||(s==='Entity'  &&t==='Central'))  return 210;
    if ((s==='Category'&&t==='Entity') ||(s==='Entity'  &&t==='Category')) return 145;
    return 165;
}
function getEdgeColor(s) {
    if (s==='Central')  return {color:'rgba(255,45,107,0.5)', highlight:'#ff2d6b'};
    if (s==='Category') return {color:'rgba(255,215,0,0.4)',  highlight:'#ffd700'};
    return {color:'rgba(0,255,225,0.25)', highlight:'#00ffe1'};
}

// ─── RENDER ───────────────────────────────────────────────────────
function renderGraph(nodes, edges) {
    nodesDS.clear(); edgesDS.clear(); allNodeData = {};
    nodes.forEach(n => { allNodeData[n.id] = n; });
    nodesDS.add(nodes.map(n => ({
        id: n.id, label: n.label || n.id,
        color: getNodeColor(n.type, n._expanded),
        size:  getNodeSize(n.type),
        title: '<div style="font-family:monospace;font-size:10px;max-width:190px;background:#070d17;color:#00ffe1;padding:7px;border-radius:4px;border:1px solid rgba(0,255,225,0.3)">'
             + (n.label||n.id) + '<br><span style="color:#ffd700">' + n.type + '</span></div>',
        font: {color: n.type==='Central'?'#ff6090': n.type==='Category'?'#ffd700':'#c8e6f5', size: n.type==='Central'?13:10},
    })));
    edgesDS.add(edges.map((e, i) => {
        const src = allNodeData[e.source], tgt = allNodeData[e.target];
        return {
            id: 'e_'+i, from: e.source, to: e.target,
            label: e.label || e.relation || '',
            length: getEdgeLength(src&&src.type, tgt&&tgt.type),
            color:  getEdgeColor(src&&src.type),
            width:  src&&src.type==='Central'?2.5:1.5,
            title:  e.desc ? '<div style="font-family:monospace;font-size:9px;background:#070d17;color:#c8e6f5;padding:5px;border-radius:3px;">'+e.desc+'</div>' : undefined,
        };
    }));
    updateStats();
}

// ─── NETWORK INIT ─────────────────────────────────────────────────
function initNetwork() {
    const container = document.getElementById('network');
    const options = {
        nodes: { shape:'dot', font:{color:'#c8e6f5',face:'Share Tech Mono',size:12}, borderWidth:2, shadow:{enabled:true,size:10,color:'rgba(0,255,225,0.25)'} },
        edges: {
            font:{color:'#c8e6f5',face:'Share Tech Mono',size:9,align:'middle',background:'rgba(3,6,13,0.75)'},
            color:{color:'rgba(0,255,225,0.28)',highlight:'#00ffe1',hover:'#ffd700'},
            smooth:{type:'curvedCW',roundness:0.15}, arrows:{to:{enabled:true,scaleFactor:0.45}}, width:1.5, selectionWidth:3,
        },
        physics: {
            enabled: true,
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {gravitationalConstant:-220,centralGravity:0.012,springConstant:0.08,springLength:180,damping:0.5,avoidOverlap:1.0},
            stabilization: {iterations:2500,fit:true,updateInterval:50},
        },
        interaction: { hover:true, tooltipDelay:80, navigationButtons:false, multiselect:false },
    };
    network = new vis.Network(container, {nodes:nodesDS, edges:edgesDS}, options);
    network.on('click', function(params) {
        if (params.nodes.length > 0) {
            const node = allNodeData[params.nodes[0]];
            if (!node) return;
            if (selectMode) {
                toggleNodeSelection(params.nodes[0]);
                switchTab('controls', document.querySelector('[data-tab="controls"]'));
            } else {
                onNodeClick(node, params.event);
            }
        } else closeExpandPopup();
    });
    network.on('stabilized', updateStats);
}

// ─── STATS ────────────────────────────────────────────────────────
function updateStats() {
    const nc = nodesDS.length, ec = edgesDS.length;
    document.getElementById('node-count').textContent = nc + ' nodes';
    document.getElementById('edge-count').textContent = ec + ' edges';
    document.getElementById('stats-bar').textContent  = 'NODES: '+nc+' | EDGES: '+ec+' | CLICK NODE TO EXPAND';
}

// ─── FILTER & PHYSICS ─────────────────────────────────────────────
function filterGraph(type) {
    ['all','central','cat','ent'].forEach(t => { const e=document.getElementById('filter-'+t); if(e) e.classList.remove('active'); });
    const fid = type==='all'?'all': type==='Central'?'central': type==='Category'?'cat':'ent';
    const fel = document.getElementById('filter-'+fid); if (fel) fel.classList.add('active');
    if (type==='all') {
        nodesDS.getIds().forEach(id => nodesDS.update({id, hidden:false}));
        edgesDS.getIds().forEach(id => edgesDS.update({id, hidden:false}));
    } else {
        nodesDS.getIds().forEach(id => { nodesDS.update({id, hidden: allNodeData[id]&&allNodeData[id].type!==type}); });
        edgesDS.getIds().forEach(id => {
            const e = edgesDS.get(id);
            edgesDS.update({id, hidden: (allNodeData[e.from]&&allNodeData[e.from].type!==type)&&(allNodeData[e.to]&&allNodeData[e.to].type!==type)});
        });
    }
}

function togglePhysics() {
    physicsOn = !physicsOn;
    network.setOptions({physics:{enabled:physicsOn}});
    document.getElementById('toggle-physics').textContent = '⚙ PHYSICS: '+(physicsOn?'ON':'OFF');
}

function zoomIn()  { if (network) network.moveTo({scale:network.getScale()*1.25,animation:{duration:280,easingFunction:'easeInOutCubic'}}); }
function zoomOut() { if (network) network.moveTo({scale:network.getScale()*0.8, animation:{duration:280,easingFunction:'easeInOutCubic'}}); }
function toggleTheme() { isDark=!isDark; document.body.setAttribute('data-theme', isDark?'dark':'light'); }