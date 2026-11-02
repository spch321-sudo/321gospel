/* =========================================================
   321福音同行　段落畫線與閱讀工具（gx1103）
   這個 App 的內容沒有「一句一句」的結構，所以畫線以「段落」為單位：
   在福音腳本、五幕敘事、疑問解答、禱告文、課程等閱讀頁，點一下段落
   就會出現畫線面板（顏色、範圍、默想、問小智、做成美圖、複製、分享、朗讀）。
   表單、打卡、名單、設定等頁一律不啟用。
   畫線只存在這台裝置（localStorage），不上傳、不進備份、不參與共讀。
   ========================================================= */
(function () {
  'use strict';
  var G = window.__G; if (!G || !window.GXR) return;
  var X = GXR.hl, T = X.t, LS = G.LS, esc = G.esc, ACTS = G.ACTS, SHEETS = G.SHEETS, TTS = G.TTS, R = G.R;

  var COLORS = ['gold', 'green', 'blue', 'pink', 'purple', 'maroon', 'brown', 'charcoal'];
  var SW = { gold: '#D9B168', green: '#6FAE71', blue: '#6C93D1', pink: '#E58FA0', purple: '#A48AC9', maroon: '#8C4A4E', brown: '#8A6740', charcoal: '#54534E' };
  /* 只有真正的閱讀頁才啟用（名稱是 SHEETS 的名字） */
  var OK_SHEETS = { gospel: 1, slides: 1, script: 1, decision: 1, cost: 1, faq: 1, ice: 1, frustration: 1, newbeliever: 1, prayers: 1, lesson: 1 };
  var SEL = 'p,li,.key,.bd,.verse';
  var SKIP = 'button,a,input,textarea,select,label,summary,.row,.seg,.nav,.tiny,.eyebrow,.chip,.sec,[data-act],.gxh-hint,.gxh-mask';
  var HK = 'gxhHl';

  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function txt(e) { return String(e.textContent || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, ''); }
  function hid(s) { var h = 5381, i; for (i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) | 0; } return (h >>> 0).toString(36); }
  function loadH() { var o = LS.get(HK, {}); return (o && typeof o === 'object') ? o : {}; }
  function saveH(o) { LS.set(HK, o); }
  function top() { return (R && R.stack && R.stack.length) ? R.stack[R.stack.length - 1] : null; }
  function sv() { return document.getElementById('sheetView'); }
  function active() { var t = top(); return t && OK_SHEETS[t.name] ? t : null; }

  function okUnit(e) {
    if (!e || e.closest(SKIP)) return false;
    if (e.querySelector(SEL)) return false;
    return txt(e).length >= 8;
  }
  function units() { var r = sv(); return r ? qsa(SEL, r).filter(okUnit) : []; }
  function keyOf(u) { var t = top(); return hid((t ? t.name : '') + '|' + txt(u).slice(0, 120)); }
  function groupOf(u) { return u.closest('.act,.dbody,.card,details') || sv(); }

  /* ── 上色 ── */
  function paint() {
    var t = active(), us, H, byKey = {}, i, k, h, j;
    qsa('.gxh-hl').forEach(function (e) { e.classList.remove('gxh-hl'); e.removeAttribute('data-gxh-c'); });
    if (!t) return;
    us = units(); H = loadH();
    for (i = 0; i < us.length; i++) { k = keyOf(us[i]); if (H[k] && !byKey[k]) { byKey[k] = i; } }
    Object.keys(byKey).forEach(function (kk) {
      h = H[kk]; i = byKey[kk];
      for (j = 0; j < (h.sp || 1) && i + j < us.length; j++) { us[i + j].classList.add('gxh-hl'); us[i + j].setAttribute('data-gxh-c', h.c || 'gold'); }
    });
    hint(us);
  }
  function hint(us) {
    var r = sv(); if (!r || r.querySelector('.gxh-hint') || !us.length) return;
    var n = +LS.get('gxhHintN', 0) || 0; if (n >= 6) return;
    LS.set('gxhHintN', n + 1);
    var p = document.createElement('p'); p.className = 'tiny gxh-hint';
    p.textContent = T('💡 點一下段落，可以畫線、寫默想、問小智、做成美圖。', '💡 Tap a paragraph to highlight it, add a note, ask Xiaozhi or make a picture.');
    r.insertBefore(p, r.firstChild);
  }
  var pt = 0;
  function schedule() { clearTimeout(pt); pt = setTimeout(function () { try { paint(); } catch (e) {} }, 90); }
  var root0 = sv();
  if (root0) { new MutationObserver(schedule).observe(root0, { childList: true, subtree: true }); }

  /* ── 點段落 ── */
  if (root0) {
    root0.addEventListener('click', function (e) {
      var t = active(); if (!t) return;
      var sel = window.getSelection ? window.getSelection() : null;
      if (sel && !sel.isCollapsed && String(sel).replace(/\s/g, '')) return;
      var el = e.target && e.target.closest ? e.target.closest(SEL) : null, guard = 0;
      while (el && !okUnit(el) && guard++ < 6) { el = el.parentElement ? el.parentElement.closest(SEL) : null; }
      if (!el || !okUnit(el)) return;
      openPanel(el);
    });
  }

  /* ── 畫線面板 ── */
  function textOf(us, i, n) { var out = [], j; for (j = 0; j < n && i + j < us.length; j++) { out.push(txt(us[i + j])); } return out.join('\n'); }
  function openPanel(u) {
    var us = units(), i = us.indexOf(u); if (i < 0) return;
    var t = top(), H = loadH(), k = keyOf(u), h = H[k];
    if (!h) { h = { c: LS.get('gxhC', 'gold'), sp: 1, n: '', ts: Date.now() }; }
    h.sheet = t.name; h.ut = t.title || ''; h.src = 'para';
    function sync() { h.t = textOf(units(), units().indexOf(u) < 0 ? i : units().indexOf(u), h.sp || 1); }
    sync();
    var mask = document.createElement('div'); mask.className = 'gxh-mask';
    var sw = COLORS.map(function (c) { return '<button class="gxh-sw' + (h.c === c ? ' on' : '') + '" data-c="' + c + '" style="background:' + SW[c] + '" aria-label="' + c + '"></button>'; }).join('');
    mask.innerHTML = '<div class="gxh-card" role="dialog" aria-label="' + esc(T('畫線', 'Highlight')) + '">' +
      '<div class="gxh-title">' + esc(T('這一段', 'This passage')) + (t.title ? '<span class="gxh-ref">' + esc(t.title) + '</span>' : '') + '</div>' +
      '<div class="gxh-quote" id="gxhQ"></div>' +
      '<div class="gxh-row"><span class="gxh-lb">' + esc(T('顏色', 'Color')) + '</span><div class="gxh-sws">' + sw + '</div></div>' +
      '<div class="gxh-row"><span class="gxh-lb">' + esc(T('範圍', 'Range')) + '</span><button class="gxh-sp" data-sp="-1" aria-label="-">－</button><span id="gxhN" class="gxh-n"></span><button class="gxh-sp" data-sp="1" aria-label="+">＋</button>' +
      '<button class="gxh-sp w" data-sp="g">' + esc(T('整段', 'To end')) + '</button><button class="gxh-sp w" data-sp="all">' + esc(T('整張', 'Whole card')) + '</button></div>' +
      '<textarea class="gxh-ta" id="gxhNote" placeholder="' + esc(T('寫下領受、要怎麼對他說……', 'Write a note…')) + '"></textarea>' +
      '<div class="gxh-acts"><button class="gxh-b pri" data-a="save">' + esc(T('儲存', 'Save')) + '</button><button class="gxh-b" data-a="ask">' + esc(T('問小智', 'Ask Xiaozhi')) + '</button><button class="gxh-b" data-a="card">🖼 ' + esc(T('做成美圖', 'Make picture')) + '</button></div>' +
      '<div class="gxh-acts"><button class="gxh-b" data-a="read">' + esc(T('朗讀這段', 'Read this')) + '</button><button class="gxh-b" data-a="from">' + esc(T('從這段朗讀', 'Read from here')) + '</button><button class="gxh-b" data-a="copy">' + esc(T('複製', 'Copy')) + '</button></div>' +
      '<div class="gxh-acts"><button class="gxh-b" data-a="share">' + esc(T('分享', 'Share')) + '</button><button class="gxh-b danger" data-a="del">' + esc(T('刪除畫線', 'Remove')) + '</button><button class="gxh-b" data-a="close">' + esc(T('關閉', 'Close')) + '</button></div></div>';
    document.body.appendChild(mask);
    var ta = mask.querySelector('#gxhNote'); ta.value = h.n || '';
    function fill() { mask.querySelector('#gxhQ').textContent = h.t; mask.querySelector('#gxhN').textContent = (h.sp || 1) + T(' 段', ' para'); }
    fill();
    function close() { if (mask.parentNode) { mask.parentNode.removeChild(mask); } }
    function keep() { h.n = ta.value.replace(/^\s+|\s+$/g, ''); var H2 = loadH(); H2[k] = h; saveH(H2); paint(); }
    function setSp(n) {
      var cur = units(), idx = cur.indexOf(u); if (idx < 0) { idx = i; }
      h.sp = Math.max(1, Math.min(n, cur.length - idx, 30));
      sync(); fill(); keep();
    }
    mask.addEventListener('click', function (e) {
      var b = e.target;
      if (b === mask) { close(); return; }
      if (b.hasAttribute('data-c')) {
        h.c = b.getAttribute('data-c'); LS.set('gxhC', h.c);
        qsa('.gxh-sw', mask).forEach(function (x) { x.className = 'gxh-sw' + (x === b ? ' on' : ''); });
        keep(); return;
      }
      if (b.hasAttribute('data-sp')) {
        var v = b.getAttribute('data-sp'), cur = units(), idx = cur.indexOf(u), g = groupOf(u), inG = [], q;
        if (idx < 0) { idx = i; }
        if (v === 'g' || v === 'all') {
          cur.forEach(function (x, ix) { if (g.contains(x)) { inG.push(ix); } });
          if (v === 'g') { setSp(inG.length ? inG[inG.length - 1] - idx + 1 : 1); X.toast(T('已畫到這一組的結尾', 'Highlighted to the end of this block'), 2200); return; }
          /* 整張：從這一組的第一段開始，換成以第一段當記號 */
          if (inG.length) {
            var first = cur[inG[0]], fk = keyOf(first), H3 = loadH();
            delete H3[k]; h.sp = inG.length; u = first; k = fk; i = inG[0];
            sync(); fill(); H3[k] = h; saveH(H3); paint();
            X.toast(T('已畫整張，共 ' + inG.length + ' 段', 'Highlighted the whole card'), 2200);
          }
          return;
        }
        setSp((h.sp || 1) + (+v)); return;
      }
      var a = b.getAttribute('data-a'); if (!a) { return; }
      e.stopPropagation();
      if (a === 'save') { keep(); close(); X.toast(T('已儲存', 'Saved'), 1600); }
      else if (a === 'close') { close(); }
      else if (a === 'del') { var H4 = loadH(); delete H4[k]; saveH(H4); close(); paint(); }
      else if (a === 'read') { keep(); close(); speak(h.t); }
      else if (a === 'from') { keep(); close(); var c2 = units(), ix2 = c2.indexOf(u); speak(textOf(c2, ix2 < 0 ? i : ix2, 400)); }
      else if (a === 'card') { keep(); close(); X.card(h); }
      else if (a === 'copy') { keep(); X.copy(h); }
      else if (a === 'share') { keep(); X.share(h); }
      else if (a === 'ask') {
        keep(); close();
        if (window.__xzAsk) { window.__xzAsk(T('請針對這一段，告訴我傳福音時可以怎麼運用、怎麼對他說：「', 'About this passage: how can I use it when sharing the gospel, and what could I say to him? "') + h.t + T('」', '"')); }
        else { X.toast(T('小智還沒準備好', 'Xiaozhi is not ready'), 1800); }
      }
    });
  }
  function speak(text) {
    try { if (TTS.speaking) { TTS.stop(); } } catch (e) {}
    setTimeout(function () { TTS.speak(text); }, 120);
  }

  /* ── 設定頁：我的畫線清單 ── */
  ACTS.gxhDel = function (d) { var H = loadH(); delete H[d.k]; saveH(H); G.refreshSheet(); };
  ACTS.gxhCard = function (d) { var h = loadH()[d.k]; if (h) { X.card(h); } };
  ACTS.gxhAsk = function (d) { var h = loadH()[d.k]; if (h && window.__xzAsk) { G.closeSheet(); window.__xzAsk(T('請針對這一段，告訴我傳福音時可以怎麼運用、怎麼對他說：「', 'About this passage: how can I use it when sharing the gospel? "') + h.t + T('」', '"')); } };
  ACTS.gxhClear = function () {
    if (!window.confirm(T('要清除全部的畫線與默想嗎？', 'Remove all highlights and notes?'))) return;
    saveH({}); G.refreshSheet(); schedule();
  };
  var _set = SHEETS.settings;
  if (_set) {
    SHEETS.settings = async function () {
      var html = await _set.apply(this, arguments);
      var H = loadH(), ks = Object.keys(H).sort(function (a, b) { return (H[b].ts || 0) - (H[a].ts || 0); });
      var h = '<div class="card"><div class="eyebrow">' + esc(T('我的畫線與默想', 'My highlights & notes')) + '（' + ks.length + '）</div>' +
        '<p class="tiny">' + esc(T('在福音腳本、疑問解答、禱告文、課程等閱讀頁，點一下段落就能畫線。只存在這台裝置，不上傳、不跟著備份走。', 'Tap a paragraph on reading pages to highlight. Stored on this device only.')) + '</p>';
      if (!ks.length) { h += '<p class="tiny">' + esc(T('還沒有畫線。', 'No highlights yet.')) + '</p>'; }
      ks.slice(0, 20).forEach(function (k) {
        var x = H[k], s = String(x.t || '');
        h += '<div class="gxh-li"><span class="gxh-dot" style="background:' + SW[x.c || 'gold'] + '"></span><div class="gxh-lt"><div>' + esc(s.length > 70 ? s.slice(0, 70) + '…' : s) + '</div>' +
          (x.ut ? '<div class="tiny">' + esc(x.ut) + '</div>' : '') + (x.n ? '<div class="tiny">✎ ' + esc(x.n) + '</div>' : '') +
          '<div class="gxh-lacts"><button class="gxh-mini" data-act="gxhAsk" data-k="' + k + '">' + esc(T('問小智', 'Ask')) + '</button><button class="gxh-mini" data-act="gxhCard" data-k="' + k + '">🖼</button><button class="gxh-mini" data-act="gxhDel" data-k="' + k + '">🗑</button></div></div></div>';
      });
      if (ks.length > 20) { h += '<p class="tiny">' + esc(T('只列出最近 20 筆。', 'Showing the latest 20.')) + '</p>'; }
      if (ks.length) { h += '<button class="btn quiet sm" data-act="gxhClear" style="width:100%;margin-top:8px">' + esc(T('清除全部畫線', 'Remove all')) + '</button>'; }
      return html + h + '</div>';
    };
  }

  /* ── 樣式 ── */
  var css = document.createElement('style'); css.id = 'gxhCss';
  var cc = { gold: '217,177,104', green: '111,174,113', blue: '108,147,209', pink: '229,143,160', purple: '164,138,201', maroon: '140,74,78', brown: '138,103,64', charcoal: '84,83,78' };
  css.textContent = Object.keys(cc).map(function (c) { return '[data-gxh-c=' + c + ']{--gxh:rgba(' + cc[c] + ',.42)}'; }).join('') + [
    '.gxh-hl{background:var(--gxh);border-radius:4px;-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:1px 3px}',
    '.gxh-hint{margin:0 0 8px}',
    '.gxh-mask{position:fixed;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,.5);z-index:140;display:flex;align-items:flex-end}',
    '.gxh-card{background:var(--bg,#fff);color:var(--ink,#222);width:100%;max-width:720px;margin:0 auto;max-height:92dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;border-radius:18px 18px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:10px;box-sizing:border-box}',
    '.gxh-title{font-weight:700;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}',
    '.gxh-ref{font-weight:400;font-size:.8em;color:var(--ink-2,#666)}',
    '.gxh-quote{background:var(--soft,#f3f1f6);border-left:4px solid var(--gold,#B8860B);border-radius:8px;padding:10px 12px;line-height:1.8;max-height:28dvh;overflow-y:auto;white-space:pre-wrap;word-break:break-word}',
    '.gxh-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.gxh-lb{font-size:.82em;color:var(--ink-2,#666);min-width:2.6em}',
    '.gxh-sws{display:flex;gap:10px;flex-wrap:wrap}',
    '.gxh-sw{width:30px;height:30px;border-radius:50%;border:2px solid transparent;padding:0;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}',
    '.gxh-sw.on{border-color:var(--ink,#222)}',
    '.gxh-sp{min-width:38px;height:36px;border-radius:9px;border:1px solid var(--line,#ccc);background:var(--card,#fff);color:inherit;font:inherit;padding:0 8px}',
    '.gxh-sp.w{white-space:nowrap;font-size:.9em}',
    '.gxh-n{min-width:3.4em;text-align:center}',
    '.gxh-ta{width:100%;box-sizing:border-box;min-height:76px;border:1px solid var(--line,#ccc);border-radius:10px;padding:10px 12px;font:inherit;font-size:16px;background:var(--card,#fff);color:inherit;resize:vertical}',
    '.gxh-acts{display:flex;gap:8px}',
    '.gxh-b{flex:1 1 0;min-width:0;min-height:42px;padding:8px 4px;border-radius:10px;border:1px solid var(--line,#ccc);background:var(--card,#fff);color:inherit;font:inherit;font-size:.92em;font-weight:600;white-space:nowrap}',
    '.gxh-b.pri{background:var(--navy,#4E2061);border-color:var(--navy,#4E2061);color:#fff}',
    '[data-theme=dark] .gxh-b.pri{color:#11161C}',
    '.gxh-b.danger{color:#B3261E}',
    '.gxh-li{display:flex;gap:10px;padding:10px 0;border-top:1px solid var(--line,#ddd)}',
    '.gxh-dot{flex:0 0 14px;height:14px;border-radius:50%;margin-top:5px}',
    '.gxh-lt{flex:1;min-width:0;word-break:break-word}',
    '.gxh-lacts{display:flex;gap:8px;margin-top:6px}',
    '.gxh-mini{padding:5px 11px;min-height:34px;border-radius:8px;border:1px solid var(--line,#ccc);background:var(--soft,#f3f1f6);color:inherit;font:inherit;font-size:.85em}'
  ].join('\n');
  document.head.appendChild(css);
  schedule();
})();
