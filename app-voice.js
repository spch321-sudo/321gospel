
/* =========================================================
   真人語音朗讀引擎（移植自國度321空中團契）
   繁體 · 簡體 · 英文各有專屬聲音；金鑰保管在後端代理，
   前端只送文字、收音檔。連不上時自動退回系統語音，
   絕不因為後端出狀況就讓長輩按不出聲音。
   ========================================================= */
(function () {
  'use strict';
  var G = window.__G; if (!G) return;
  var LS = G.LS, TTS = G.TTS, toast = G.toast, esc = G.esc,
      ACTS = G.ACTS, SHEETS = G.SHEETS, refreshSheet = G.refreshSheet, S = G.S;

  var EP = 'https://azure-tts.spch321.workers.dev';

  /* 三語聲音清單：key 是存檔用的代號，name 是語音服務的聲音代號 */
  var SAFE = 'zh-TW-YunJheNeural';   /* 空中團契已驗證可用的代號，當作保底 */
  var VOICES = {
    tc: [
      { k:'yunjhe',   name:'zh-TW-YunJheNeural',                label:'雲哲', desc:'溫潤親切男聲（預設）' },
      { k:'yunfan',   name:'zh-CN-Yunfan:DragonHDLatestNeural',  label:'雲帆', desc:'高清男聲 HD' },
      { k:'xiaochen', name:'zh-CN-Xiaochen:DragonHDLatestNeural',label:'曉辰', desc:'高清女聲 HD' }
    ],
    sc: [
      { k:'yunfan',   name:'zh-CN-Yunfan:DragonHDLatestNeural',  label:'云帆', desc:'高清男声 HD（预设）' },
      { k:'xiaochen', name:'zh-CN-Xiaochen:DragonHDLatestNeural',label:'晓辰', desc:'高清女声 HD' },
      { k:'yunjhe',   name:'zh-TW-YunJheNeural',                label:'云哲', desc:'温润男声' }
    ],
    en: [
      { k:'guy',   name:'en-US-GuyNeural',   label:'Guy',   desc:'Warm male voice (default)' },
      { k:'jenny', name:'en-US-JennyNeural', label:'Jenny', desc:'Clear female voice' },
      { k:'aria',  name:'en-US-AriaNeural',  label:'Aria',  desc:'Gentle female voice' }
    ]
  };

  function lang() { return (window.I18N && window.I18N.lang) || 'tc'; }
  function list() { return VOICES[lang()] || VOICES.tc; }
  function voiceKey() {
    var saved = LS.get('rvVoice_' + lang(), '');
    var L = list();
    for (var i = 0; i < L.length; i++) if (L[i].k === saved) return saved;
    return L[0].k;
  }
  function voiceName() {
    var L = list(), k = voiceKey();
    for (var i = 0; i < L.length; i++) if (L[i].k === k) return L[i].name;
    return L[0].name;
  }
  function on() { return LS.get('rvOn', true) !== false; }
  function rateAttr() {
    var r = +S.ttsRate || 0.95;
    var pct = Math.round((r - 1) * 100);
    return (pct >= 0 ? '+' : '') + pct + '%';
  }

  var origSpeak = TTS.speak.bind(TTS);
  var origStop = TTS.stop.bind(TTS);

  var SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
  var rv = { audio:null, cache:{}, unlocked:false, queue:[], idx:0, token:0, active:false };

  function audio() {
    if (!rv.audio) {
      rv.audio = new Audio(); rv.audio.preload = 'auto';
      try { rv.audio.playsInline = true;
            rv.audio.setAttribute('playsinline','');
            rv.audio.setAttribute('webkit-playsinline',''); } catch (e) {}
    }
    return rv.audio;
  }
  /* iOS 必須在使用者手勢裡先播一次無聲，之後才准自動播放 */
  var ssUnlocked = false;
  function unlockSpeech() {
    if (ssUnlocked || !('speechSynthesis' in window)) return;
    try {
      var u = new SpeechSynthesisUtterance(' ');
      u.volume = 0; speechSynthesis.speak(u); ssUnlocked = true;
    } catch (e) {}
  }
  function unlock() {
    unlockSpeech();
    if (rv.unlocked) return;
    try {
      var a = audio(); a.loop = false; a.src = SILENT;
      var p = a.play();
      if (p && p.then) p.then(function () { rv.unlocked = true; try { a.pause(); } catch (e) {} })
                        .catch(function () {});
      else rv.unlocked = true;
    } catch (e) {}
  }

  /* 依標點切句，一段 100 到 300 字，唸起來自然、請求數也不會太多 */
  function chunks(text) {
    var t = String(text || '').replace(/\s+/g, ' ').trim();
    if (!t) return [];
    var enders = '。！？；.!?\n', out = [], buf = '';
    for (var i = 0; i < t.length; i++) {
      buf += t[i];
      if (enders.indexOf(t[i]) >= 0 && buf.length >= 100) { out.push(buf); buf = ''; }
    }
    if (buf.trim()) out.push(buf);
    var fin = [];
    out.forEach(function (seg) {
      while (seg.length > 300) { fin.push(seg.slice(0, 300)); seg = seg.slice(300); }
      if (seg) fin.push(seg);
    });
    return fin.length ? fin : [t];
  }

  /* IndexedDB 永久快取：同一段話同一個聲音，只跟後端要一次 */
  var DBN = 'g321_tts_cache';
  function dbOpen(cb) {
    try {
      if (!window.indexedDB) return cb(null);
      var q = indexedDB.open(DBN, 1);
      q.onupgradeneeded = function () {
        try { var d = q.result;
              if (!d.objectStoreNames.contains('audio')) d.createObjectStore('audio'); } catch (e) {}
      };
      q.onsuccess = function () { cb(q.result); };
      q.onerror = function () { cb(null); };
    } catch (e) { cb(null); }
  }
  function cacheGet(k, cb) {
    dbOpen(function (d) { if (!d) return cb(null);
      try { var r = d.transaction('audio','readonly').objectStore('audio').get(k);
            r.onsuccess = function () { cb(r.result || null); };
            r.onerror = function () { cb(null); };
      } catch (e) { cb(null); }
    });
  }
  function cachePut(k, b) {
    dbOpen(function (d) { if (!d) return;
      try { d.transaction('audio','readwrite').objectStore('audio').put(b, k); } catch (e) {}
    });
  }
  function cacheClear(cb) {
    dbOpen(function (d) { if (!d) { if (cb) cb(false); return; }
      try { var r = d.transaction('audio','readwrite').objectStore('audio').clear();
            r.onsuccess = function () { rv.cache = {}; if (cb) cb(true); };
            r.onerror = function () { if (cb) cb(false); };
      } catch (e) { if (cb) cb(false); }
    });
  }

  function fetchPiece(piece) {
    var key = voiceName() + '|' + rateAttr() + '|' + piece;
    if (rv.cache[key]) return Promise.resolve(rv.cache[key]);
    return new Promise(function (res, rej) {
      cacheGet(key, function (blob) {
        if (blob) { try { var u = URL.createObjectURL(blob); rv.cache[key] = u; res(u); return; } catch (e) {} }
        function ask(vn) {
          return fetch(EP, { method:'POST', headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify({ voice: vn, rate: rateAttr(),
                                   sil:140, silc:140, sile:260, text: piece }) })
            .then(function (r) { if (!r.ok) throw new Error('TTS ' + r.status); return r.blob(); });
        }
        ask(voiceName())
          .catch(function (e) {                    /* 這個聲音後端不收，改用保底聲音再試一次 */
            if (voiceName() === SAFE) throw e;
            return ask(SAFE);
          })
          .then(function (b) {
            try { cachePut(key, b); } catch (e) {}
            var u; try { u = URL.createObjectURL(b); rv.cache[key] = u; } catch (e) {}
            res(u);
          })
          .catch(rej);
      });
    });
  }

  function rvStop() {
    rv.token++; rv.active = false; rv.queue = []; rv.idx = 0;
    if (rv.audio) { try { rv.audio.pause(); } catch (e) {} rv.audio.onended = null; rv.audio.onerror = null; }
    try { if (navigator.mediaSession) navigator.mediaSession.playbackState = 'none'; } catch (e) {}
  }

  /* 某一段抓不到，就用系統語音把這一段補完，唸完再接下一段 */
  function fallbackChunk(piece, cb) {
    if (!('speechSynthesis' in window)) { if (cb) cb(); return; }
    try {
      var u = new SpeechSynthesisUtterance(piece);
      u.lang = (window.I18N && window.I18N.ttsLang) ? window.I18N.ttsLang() : 'zh-TW';
      u.rate = +S.ttsRate || 0.95;
      u.onend = cb; u.onerror = cb;
      speechSynthesis.speak(u);
    } catch (e) { if (cb) cb(); }
  }

  function rvSpeak(text) {
    unlock();
    var q = chunks(text);
    if (!q.length) { toast('這一頁沒有可朗讀的內容'); return; }
    rv.queue = q; rv.idx = 0; rv.active = true;
    var my = ++rv.token, a = audio();
    try {
      if (navigator.mediaSession && window.MediaMetadata) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: '321福音同行' });
        navigator.mediaSession.playbackState = 'playing';
      }
    } catch (e) {}
    function playAt(i) {
      if (my !== rv.token) return;
      if (i >= rv.queue.length) { rvStop(); return; }
      fetchPiece(rv.queue[i]).then(function (url) {
        if (my !== rv.token) return;
        a.onended = null; a.onerror = null; a.src = url;
        a.onended = function () { if (my === rv.token) playAt(i + 1); };
        a.onerror = function () { fallbackChunk(rv.queue[i], function () { if (my === rv.token) playAt(i + 1); }); };
        var p = a.play();
        if (p && p.catch) p.catch(function () {
          fallbackChunk(rv.queue[i], function () { if (my === rv.token) playAt(i + 1); });
        });
        if (rv.queue[i + 1]) fetchPiece(rv.queue[i + 1]).catch(function () {});
      }).catch(function (err) {
        if (i === 0) {                       /* 一開始就連不上：整段交回原本的引擎 */
          rvStop();
          toast('真人語音連不上（' + (err && err.message ? err.message : '無回應') + '），改用系統語音');
          origSpeak(text);
          return;
        }
        fallbackChunk(rv.queue[i], function () { if (my === rv.token) playAt(i + 1); });
      });
    }
    playAt(0);
  }

  /* ---- 接到原本的朗讀鈕上：所有「🔊 朗讀」自動改用真人聲音 ---- */


  TTS.stop = function () { rvStop(); origStop(); };
  TTS.speak = function (text) {
    if (rv.active || TTS.speaking) { TTS.stop(); toast('已停止朗讀'); return; }
    if (on() && /^https?:\/\//i.test(EP)) rvSpeak(text);
    else origSpeak(text);
  };
  window.__rvClearCache = cacheClear;

  document.addEventListener('visibilitychange', function () { if (document.hidden) rvStop(); });

  /* ---- 設定頁：真人語音開關與聲音選擇 ---- */
  ACTS.setRealVoice = function (d) { LS.set('rvOn', d.v === '1'); TTS.stop(); refreshSheet(); };
  ACTS.setRvVoice = function (d) { LS.set('rvVoice_' + lang(), d.v); TTS.stop(); refreshSheet(); };
  ACTS.tryRvVoice = function () {
    var demo = lang() === 'en'
      ? 'Jesus is my Role Model. The Bible is my Standard. The Holy Spirit is my Guide.'
      : lang() === 'sc'
        ? '耶稣是我的榜样，圣经是我的准则，圣灵是我的引导。'
        : '耶穌是我的榜樣，聖經是我的準則，聖靈是我的引導。';
    TTS.stop(); setTimeout(function () { TTS.speak(demo); }, 120);
  };
  ACTS.testVoice = function () {
    var box = document.getElementById('rvDiag');
    if (box) box.innerHTML = '<b>檢查中…</b>';
    var t0 = Date.now();
    fetch(EP, { method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ voice: voiceName(), rate: rateAttr(),
                             sil:140, silc:140, sile:260, text:'主耶穌愛你' }) })
      .then(function (r) {
        var ct = r.headers.get('content-type') || '(無)';
        return r.blob().then(function (b) {
          var ok = r.ok && /audio/i.test(ct) && b.size > 500;
          var msg = '<b>' + (ok ? '✅ 連線正常' : '❌ 沒有拿到音檔') + '</b><br>' +
                    '網址：' + esc(EP) + '<br>' +
                    'HTTP：' + r.status + ' ' + esc(r.statusText || '') + '<br>' +
                    '型態：' + esc(ct) + '<br>' +
                    '大小：' + b.size + ' bytes<br>' +
                    '耗時：' + (Date.now() - t0) + ' ms<br>' +
                    '聲音代號：' + esc(voiceName());
          if (!ok && b.size < 3000 && !/audio/i.test(ct)) {
            return b.text().then(function (txt) {
              if (box) box.innerHTML = msg + '<br>回應內容：' + esc(txt.slice(0, 300));
            });
          }
          if (box) box.innerHTML = msg;
        });
      })
      .catch(function (e) {
        if (box) box.innerHTML = '<b>❌ 完全連不上</b><br>網址：' + esc(EP) +
          '<br>錯誤：' + esc(e && e.message ? e.message : String(e)) +
          '<br>（多半是網址打錯、Worker 沒部署，或被 CORS 擋下）';
      });
  };
  ACTS.clearVoiceCache = function () {
    cacheClear(function (ok) { toast(ok ? '已清空語音快取' : '清除失敗，請稍後再試'); });
  };

  var _set = SHEETS.settings;
  SHEETS.settings = async function () {
    var html = await _set.apply(this, arguments);
    var L = list();
    var block =
      '<div class="card">' +
      '<div class="eyebrow">真人語音</div>' +
      '<p class="tiny">像真人一樣的朗讀聲音，比手機內建的語音自然得多。' +
      '第一次唸會稍等一下，之後同一段話就直接播，不用再等。</p>' +
      '<div class="seg" style="margin-top:8px">' +
      '<button data-act="setRealVoice" data-v="1" aria-pressed="' + on() + '">真人語音</button>' +
      '<button data-act="setRealVoice" data-v="0" aria-pressed="' + (!on()) + '">系統語音</button>' +
      '</div>' +
      (on() ?
        '<div class="eyebrow" style="margin-top:14px">選一個聲音</div><div class="seg">' +
        L.map(function (v) {
          return '<button data-act="setRvVoice" data-v="' + v.k + '" aria-pressed="' +
                 (voiceKey() === v.k) + '">' + esc(v.label) + '</button>';
        }).join('') + '</div>' +
        '<p class="tiny" style="margin-top:8px">' +
        L.map(function (v) { return esc(v.label) + '：' + esc(v.desc); }).join('<br>') + '</p>' +
        '<button class="btn quiet sm" data-act="tryRvVoice" style="width:100%;margin-top:10px">試聽這個聲音</button>' +
        '<button class="btn quiet sm" data-act="clearVoiceCache" style="width:100%;margin-top:8px">清空語音快取</button>' +
        '<button class="btn quiet sm" data-act="testVoice" style="width:100%;margin-top:8px">🔍 檢查真人語音連線</button>' +
        '<div id="rvDiag" class="tiny" style="margin-top:10px;padding:10px;border-radius:10px;' +
        'background:rgba(0,0,0,.05);word-break:break-all">按上面那一顆，會顯示後端實際的回應。</div>' +
        '<p class="tiny" style="margin-top:10px">聲音會依語言自動切換：繁體、簡體、英文各有一組。' +
        '真人語音連不上時，會自動改用系統語音，不會中斷。</p>'
      : '<p class="tiny" style="margin-top:10px">目前使用手機內建的語音。</p>') +
      '</div>';
    return html + block;
  };
})();
