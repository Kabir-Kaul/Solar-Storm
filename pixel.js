"use strict";
/* =====================================================================
   PIXEL ICONS: swaps emoji for hand-made pixel-art sprites that match
   the game's retro style. Loaded BEFORE app.js.
   - Any emoji in the page text is replaced automatically (MutationObserver)
   - Pixel.draw(ctx, emoji, x, y, size) paints a sprite onto a canvas
   Sprites are 8x8 (or similar) grids; "@" means "use the text color".
   ===================================================================== */
const Pixel = (() => {
  const DATA = {"PAL":{"k":"#0a1028","w":"#eef2ff","g":"#b8c3df","G":"#6b769c","r":"#ff5a5f","R":"#b3262c","o":"#ff8a3d","y":"#ffd23f","Y":"#ffb020","l":"#4fdc7c","L":"#1c7a40","t":"#3fd9c4","T":"#1d7f78","b":"#6aa8ff","B":"#2f6fd6","p":"#ff8ad8","P":"#c86b9b","n":"#a8703a","N":"#6b4423","c":"#f6f0d8","s":"#e2b26b"},"S":{"heart":[".rr..rr.","rwrrrrrr","rrrrrrrR","rrrrrrrR",".rrrrrR.","..rrrR..","...rR...","........"],"crate":["NNNNNNNN","NsssssnN","NsccccnN","NsssssnN","NsnnnnsN","NsssssnN","NnnnnnnN","NNNNNNNN"],"shield":["bbbbbbbb","bwbbbbBb","bwbbbbBb","bwbbbbBb",".bbbbBB.","..bbBB..","...bB...","........"],"pager":["GGGGGGGG","GkkkkkkG","GkttttkG","GktkkktG","GkkkkkkG","GGGGGGGG","GGrGGyGG","........"],"flask":["...gg...","...ww...","...ww...","..wttw..",".wtttTw.","wttttttw","wTttttTw",".wwwwww."],"filter":["kkkkkkkk","kgwgwgwk","kgwgwgwk","kgwgwgwk","kgwgwgwk","kgwgwgwk","kgwgwgwk","kkkkkkkk"],"sun":["...YY...",".Y.yy.Y.","..yyyy..","YyyyyyyY","YyyyyyyY","..yyyy..",".Y.yy.Y.","...YY..."],"bolt":["....yy..","...yyy..","..yyy...",".yyyyyy.","...yyy..","..yy....",".yy.....",".y......"],"pack":["...bb...","..bbbb..",".bbbbbb.",".bBbbBb.",".bBYYBb.",".bBBBBb.",".bbbbbb.","..bbbb.."],"star":["...yy...","...yy...","yyyyyyyy",".yyyyyy.","..yyyy..",".yyyyyy.",".yy..yy.","yy....yy"],"dish":["bb......","gbbb....",".gbbb...","..gbbb.r","...gggr.","....g...","...ggg..","..gggggg"],"door":[".GGGGGG.",".GggggG.",".GggggG.",".GggggG.",".GggYgG.",".GggggG.",".GggggG.",".GGGGGG."],"rad":["...yyyy...","..yyyyyy..",".ykkyykky.","ykkkyykkky","yykkkkkkyy","yyykkkkyyy","yyyykkyyyy",".yyykkyyy.","..yyyyyy..","...yyyy..."],"check":["........",".......l","......ll","l....ll.","ll..ll..",".llll...","..ll....","........"],"check_c":["........",".......@","......@@","@....@@.","@@..@@..",".@@@@...","..@@....","........"],"drumstick":["..oooo..",".oooooo.",".oooooo.",".oooooo.","..ooon..","..nc....",".cc.....","cc......"],"steak":["..rrrr..",".rrrrrr.","rrRRRrrr","rRwwRRrr","rrRwRRrr","rrrRRrr.",".rrrrr..","........"],"bacon":["........",".rrrrrr.","rppppppr",".RRRRRR.","rppppppr",".rrrrrr.","........","........"],"drop":["...b....","...bb...","..bbbb..",".bbwbbb.",".bwbbbb.",".bbbbbB.","..bbBB..","........"],"can":[".gggggg.","GwwwwwwG","gBBBBBBg","gBwwwwBg","gBBBBBBg","gBBBBBBg",".gggggg.","........"],"medkit":["..gggg..","wwwwwwww","wwwrrwww","wwrrrrww","wwrrrrww","wwwrrwww","wwwwwwww","GGGGGGGG"],"toolbox":["..GGGG..",".G....G.","rrrrrrrr","rRRRRRRr","rrGGGGrr","rrrrrrrr","RRRRRRRR","........"],"rocket":["...rr...","..wwww..","..wbbw..","..wwww..","..wwww..",".rwwwwr.",".r.yy.r.","...yy..."],"warn":["...yy...","..yyyy..","..ykky..",".yykkyy.",".yykkyy.","yyyyyyyy","yyykkyyy","yyyyyyyy"],"nosignal":["r......r",".r....r.","..r..r..","...rr...","...rr...","..r..r..",".r....r.","r......r"],"clock":["..kkkk..",".kwwwwk.","kwwwkwwk","kwwwkwwk","kwwwkkwk","kwwwwwwk",".kwwwwk.","..kkkk.."],"alarm":["rr.kk.rr","r.kwwk.r",".kwwkwk.","kwwwkwwk","kwwwkkwk","kwwwwwwk",".kwwwwk.","..k..k.."],"cart":["nn......",".n......",".nnnnnnn",".gggggg.",".gggggg.","..gggg..","..G..G..",".kk..kk."],"pill":["........","........",".rrrwww.","rrrrwwww","rrrrwwww",".rrrwww.","........","........"],"reddot":["..rrrr..",".rrrrrr.","rrwrrrrr","rwrrrrrR","rrrrrrrR","rrrrrrRR",".rrRRRR.","..rrrr.."],"bulb":["..yyyy..",".yywyyy.",".ywyyyy.",".yyyyyy.","..yyyy..","..gggg..","..GGGG..","...GG..."],"cross":["...rr...","...rr...","...rr...","rrrrrrrr","rrrrrrrr","...rr...","...rr...","...rr..."],"torch":["........","..yy....",".yyGg...","..GggG..","...gGgG.","....GgG.",".....GG.","........"],"clip":["..gggg..",".g....g.",".g.gg.g.",".g.g..g.",".g.g..g.",".g.gggg.",".g......","..gggg.."],"blanket":["........","pppppppp","pwpwpwpw","pppppppp","pppppppp","PPPPPPPP",".PPPPPP.","........"],"battery":["..gggg..",".GGGGGG.",".GllllG.",".GllllG.",".GllllG.",".GkkkkG.",".GGGGGG.","........"],"trophy":["YYYYYYYY","YyyyyyyY",".YyyyyY.","..YyyY..","...YY...","...YY...","..YYYY..",".YYYYYY."],"book":["bbbbbbb.","bBBBBBbk","bBwwwBbc","bBBBBBbc","bBwwwBbc","bBBBBBbc","bbbbbbbk","........"],"wind":["........",".gggggg.",".......g",".gggggg.","g.......",".gggggg.",".......g","........"],"lock":["..gggg..",".g....g.",".g....g.","YYYYYYYY","YYYkkYYY","YYYkkYYY","YYYYYYYY","YYYYYYYY"],"earth":["..bbbb..",".bllbbb.","bblllbbb","bbllbblb","bbbbbllb",".bbbbll.","..bbbb..","........"],"letter":["pppppppp","pPppppPp","ppPppPpp","pppPPppp","pppppppp","pppppppp","PPPPPPPP","........"],"f_smile":["..yyyy..",".yyyyyy.","yykyykyy","yyyyyyyy","ykyyyyky","yykkkkyy",".yyyyyy.","..yyyy.."],"f_meh":["..yyyy..",".yyyyyy.","yykyykyy","yyyyyyyy","yyyyyyyy","yykkkkyy",".yyyyyy.","..yyyy.."],"f_sad":["..yyyy..",".yyyyyy.","yykyykyy","yyyyyyyy","yykkkkyy","ykyyyyky",".yyyyyy.","..yyyy.."],"f_wow":["..yyyy..",".yyyyyy.","yykyykyy","yyyyyyyy","yyykkyyy","yyykkyyy",".yyyyyy.","..yyyy.."],"f_sleep":["..yyyy..",".yyyyyy.","ykkyykky","yyyyyyyy","yyykkyyy","yyyyyyyy",".yyyyyy.","..yyyy.."],"astro":["..wwww..",".wkttkw.",".wkttkw.",".wwwwww.","wwwoowww",".wwwwww.",".ww..ww.",".oo..oo."],"light":["..GGGG..","..GrrG..","..GGGG..","..GyyG..","..GGGG..","..GllG..","..GGGG..","........"],"loop":["..ttttt.",".t...ttt","t.....t.","t.......","t.......",".t....t.","..tttt..","........"],"chart":["G.......","G.....ll","G....ll.","Gl..ll..","Gllll...","GGGGGGGG","........","........"],"sat":["bb....bb","bb.gg.bb","bbggggbb","bb.gg.bb","bb.yy.bb","bb....bb","........","........"],"brick":["rrrrgrrr","gggggggg","rrgrrrrg","gggggggg","rrrrgrrr","gggggggg","rrgrrrrg","gggggggg"],"roll":[".gggggg.","gwwwwwwg","gwGGGGwg","gwGkkGwg","gwGGGGwg","gwwwwwwg",".gggggg.","........"],"moon":["..gggg..",".gwwwwg.","gwwGwwwg","gwwwwwGg","gwGwwwwg","gwwwwGwg",".gwwwwg.","..gggg.."],"confetti":["y..p..t.",".t..y..p","..p..l..","l..t..y.",".y..p...","..l..t.p","p..y..l.",".t...y.."],"eyes":["........",".www.www",".wkw.wkw",".www.www","........","........","........","........"],"brush":[".....NN.","....NN..","...NN...","..NN....",".ppp....","pppp....","pp......","........"],"bandage":["......ss",".....scs","....scs.","...scs..","..scs...",".scs....","scs.....","ss......"],"syringe":["......gg",".....gw.","....gw..","...gw...","..ttw...",".gtt....","gg......","g......."],"bottle":["...bb...","..gggg..",".bBBBBb.",".bwwwwb.",".bBBBBb.",".bBBBBb.",".bbbbbb.","........"],"juice":["...g....","..g.....",".oooooo.",".owwwwo.",".owrrwo.",".owwwwo.",".oooooo.","........"],"toothbrush":["........","........",".b......","bbbwwwww",".bbwwwww",".b......","........","........"],"rock":["........","..gggg..",".gwggGg.","gwggggGg","ggggggGG","GgggggGG",".GGGGGG.","........"],"ice":[".bbbbbb.","bwwbbbbb","bwbbbbbB","bbbbbbbB","bbbbbbBB","bbbbbBBB",".BBBBBB.","........"],"scope":["...gg...","...gg...","..gGg...","..gG....",".gGGg...",".gG.gg..",".gG..gg.","GGGGGGGG"],"mug":["........","..ssss..",".nnnnnn.",".nccccnn",".nccccnn",".nccccn.","..nnnn..","........"],"spoon":[".....gg.","....gwwg","....gwwg",".....gg.","....g...","...g....","..g.....",".g......"],"sock":[".wwwww..",".wppww..",".wwwww..",".wwwww..",".wwwww..","wwwwwww.","wwwwwwww",".wwwwww."],"play":["@...","@@..","@@@.","@@@@","@@@.","@@..","@..."],"bar":["tt.","tt.","tt.","tt.","tt.","tt.","tt."],"x_c":["@....@",".@..@.","..@@..","..@@..",".@..@.","@....@"],"x_red":["r....r",".r..r.","..rr..","..rr..",".r..r.","r....r"],"box":["GGGGGG","G....G","G....G","G....G","G....G","GGGGGG"]},"MAP":{"❤":"heart","📦":"crate","🛡":"shield","📟":"pager","🧪":"flask","🌀":"filter","☀":"sun","⚡":"bolt","🎒":"pack","⭐":"star","📡":"dish","🚪":"door","☢":"rad","✅":"check","🍗":"drumstick","🥩":"steak","🥓":"bacon","💧":"drop","🥫":"can","⛑":"medkit","🚀":"rocket","⚠":"warn","📵":"nosignal","⏱":"clock","🛒":"cart","💊":"pill","🔴":"reddot","💡":"bulb","⚕":"cross","🔦":"torch","📎":"clip","🧣":"blanket","🔋":"battery","🏆":"trophy","🛬":"rocket","📘":"book","💨":"wind","⏰":"alarm","🔒":"lock","🌍":"earth","💌":"letter","😮":"f_wow","🧑‍🚀":"astro","🚦":"light","🔁":"loop","😴":"f_sleep","📈":"chart","🛰":"sat","🧱":"brick","🧻":"roll","😟":"f_sad","😐":"f_meh","🙂":"f_smile","🌕":"moon","🎉":"confetti","👀":"eyes","🖌":"brush","🧰":"toolbox","🩹":"bandage","💉":"syringe","🧴":"bottle","🧃":"juice","🪥":"toothbrush","🪨":"rock","🧊":"ice","🔬":"scope","☕":"mug","🥄":"spoon","🧦":"sock","▶":"play","▮":"bar","✓":"check_c","✕":"x_c","✖":"x_c","↻":"loop","⬜":"box"}};
  const PAL = DATA.PAL, SPR = DATA.S, MAP = DATA.MAP;
  const norm = (e) => e.replace(/️/g, "");
  const nameOf = (e) => SPR[e] ? e : MAP[norm(e)];
  const svgCache = {};
  function svg(name) {
    if (svgCache[name]) return svgCache[name];
    const rows = SPR[name], h = rows.length, w = rows[0].length, by = {};
    rows.forEach((row, y) => {
      for (let x = 0; x < w;) {
        const ch = row[x];
        if (ch === ".") { x++; continue; }
        let n = 1; while (x + n < w && row[x + n] === ch) n++;
        (by[ch] = by[ch] || []).push(`M${x} ${y}h${n}v1h-${n}z`);
        x += n;
      }
    });
    const paths = Object.keys(by).map(ch => `<path fill="${ch === "@" ? "currentColor" : PAL[ch]}" d="${by[ch].join("")}"/>`).join("");
    return svgCache[name] = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${paths}</svg>`;
  }
  // canvas version (cached, drawn without smoothing so pixels stay sharp)
  const cvCache = {};
  function sprite(name) {
    if (cvCache[name]) return cvCache[name];
    const rows = SPR[name], h = rows.length, w = rows[0].length;
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d");
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== ".") { g.fillStyle = ch === "@" ? "#eef2ff" : PAL[ch]; g.fillRect(x, y, 1, 1); } }));
    return cvCache[name] = c;
  }
  function draw(ctx, emoji, x, y, size) {
    const name = nameOf(emoji); if (!name) return false;
    const c = sprite(name), k = size / Math.max(c.width, c.height);
    const old = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(c, Math.round(x), Math.round(y), Math.round(c.width * k), Math.round(c.height * k));
    ctx.imageSmoothingEnabled = old; return true;
  }
  function html(emoji) { const n = nameOf(emoji); return n ? `<span class="pxi" aria-hidden="true">${svg(n)}<span class="pxe">${emoji}</span></span>` : emoji; }
  function dataUri(name) { return "url(\"data:image/svg+xml," + encodeURIComponent(svg(name).replace("<svg ", "<svg xmlns='http://www.w3.org/2000/svg' ")) + "\")"; }

  // ---- page-wide emoji swap ----
  const esc = (k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const RE = new RegExp(Object.keys(MAP).sort((a, b) => b.length - a.length).map(k => esc(k) + "\\uFE0F?").join("|"), "gu");
  const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CANVAS", "SVG", "svg", "TITLE", "OPTION"]);
  function fix(node) {
    const v = node.nodeValue; RE.lastIndex = 0;
    if (!v || !RE.test(v)) return;
    RE.lastIndex = 0;
    const frag = document.createDocumentFragment(); let last = 0, m;
    while ((m = RE.exec(v))) {
      if (m.index > last) frag.appendChild(document.createTextNode(v.slice(last, m.index)));
      const t = document.createElement("template"); t.innerHTML = html(m[0]);
      frag.appendChild(t.content); last = m.index + m[0].length;
    }
    if (last < v.length) frag.appendChild(document.createTextNode(v.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
  function scan(root) {
    if (root.nodeType === 3) { const p = root.parentNode; if (p && p.nodeType === 1 && !SKIP.has(p.nodeName) && !p.closest("svg,.pxi")) fix(root); return; }
    if (root.nodeType !== 1 || SKIP.has(root.nodeName) || root.closest("svg,.pxi")) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(n) {
      const p = n.parentNode; return (!p || p.nodeType !== 1 || SKIP.has(p.nodeName) || p.closest("svg,.pxi")) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    const list = []; while (w.nextNode()) list.push(w.currentNode);
    list.forEach(fix);
  }
  function start() {
    scan(document.body);
    new MutationObserver((recs) => {
      for (const r of recs) {
        if (r.type === "characterData") scan(r.target);
        else r.addedNodes.forEach(scan);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    // CSS can't hold our sprites directly, so inject the few places that use them
    const st = document.createElement("style");
    st.textContent = `.bottle.bad .bbody::after{content:"";width:34px;height:34px;top:6px;background:${dataUri("x_red")} center/contain no-repeat;image-rendering:pixelated}`;
    document.head.appendChild(st);
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  return { svg, html, draw, nameOf, dataUri };
})();