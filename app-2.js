(function () {
'use strict';
const G = window.__G;
const { S, saveS, DB, LS, C, $, uid, esc, nl2br, todayISO, daysSince, fmtDate, fmtAgo, toast,
  seedOfDay, stageOf, TTS, readableText, applyLook, VIEWS, SHEETS, ACTS, push, popSheet,
  closeSheet, refreshSheet, render, go, modal, closeModal, confirmBox, loadContent, APP_VERSION } = G;

/* =========================================================
   分頁三　工具
   ========================================================= */
VIEWS.tools = async function () {
  return `
  <div class="card">
    <div class="eyebrow">福音工具箱</div>
    <h2 class="sec">說得出口</h2>
    <p class="muted">怕講不清楚，是裝備的問題，不是愛心的問題。<br>這些都是口語稿，可以照著唸而不尷尬。</p>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn" data-act="openGospel">五幕福音敘事</button>
      <button class="btn quiet" data-act="openSlides">圖解模式（跟他同看）</button>
    </div>
  </div>

  ${C.gospel.scripts.map(s => `<button class="row" data-act="openScript" data-id="${s.id}">
    <span class="grow"><span class="t">${esc(s.title)}</span><span class="s">${esc(s.duration)}．${esc(s.hint)}</span></span>
    <span class="arrow">›</span></button>`).join('')}

  <button class="row" data-act="openDecision">
    <span class="grow"><span class="t">決志禱告文</span><span class="s">可朗讀，可讓對方跟著念</span></span>
    <span class="arrow">›</span></button>
  <button class="row" data-act="openCost">
    <span class="grow"><span class="t">信主之後會怎樣</span><span class="s">福分與代價，兩邊都誠實說</span></span>
    <span class="arrow">›</span></button>

  <div class="card" style="margin-top:16px">
    <div class="eyebrow">不怕被問倒</div>
    <h2 class="sec">疑問解答庫</h2>
    <p class="muted">四十題，每題四層：一句話短答、經文、生活比喻、一個反問回去的問題。</p>
    <button class="btn gold" data-act="openFaq" style="margin-top:10px">打開四十題</button>
    <p class="tiny" style="margin-top:10px">答案的目的不是贏辯論，是打開心門。</p>
  </div>

  <button class="row" data-act="openIce">
    <span class="grow"><span class="t">破冰問題二十則</span><span class="s">從生活話題自然轉入信仰</span></span>
    <span class="arrow">›</span></button>
  <button class="row" data-act="openWitness">
    <span class="grow"><span class="t">見證工作坊</span><span class="s">三段式寫出你的三分鐘見證</span></span>
    <span class="arrow">›</span></button>
  <button class="row" data-act="openFrustration">
    <span class="grow"><span class="t">陪伴者挫折十問</span><span class="s">他不回我、他消失了、我被問倒了……</span></span>
    <span class="arrow">›</span></button>
  <button class="row" data-act="openNewbeliever">
    <span class="grow"><span class="t">初信三十天陪伴腳本</span><span class="s">第 1、3、7、14、21、30 天</span></span>
    <span class="arrow">›</span></button>
  <button class="row" data-act="openCards">
    <span class="grow"><span class="t">金句圖卡</span><span class="s">依處境挑一句，做成圖傳給他</span></span>
    <span class="arrow">›</span></button>
  `;
};

/* ---------------- 五幕福音 ---------------- */
SHEETS.gospel = async function () {
  return `<div class="card tight">
    <p class="tiny" style="margin:0">先禱告，求聖靈引導。你的責任是把福音講清楚，
    使人重生的是聖靈，不是你。</p></div>
  ${C.gospel.acts.map(a => `<div class="card"><div class="act">
    <div class="no">${esc(a.no)}</div>
    <div class="tt">${esc(a.title)}</div>
    <div class="key">${esc(a.key)}</div>
    <div class="bd">${nl2br(a.body)}</div>
    ${a.verses.map(v => `<div class="verse">${esc(v.text)}<span class="ref">${esc(v.ref)}</span></div>`).join('')}
  </div></div>`).join('')}
  <div class="card">
    <p class="muted">這五幕的關鍵在第二幕。當一個人聽懂「罪就是我想自己作主」，
    他往往會安靜下來——因為那正是他一生的寫照。</p>
    <button class="btn gold" data-act="openDecision" style="margin-top:10px">帶他做決志禱告</button>
  </div>`;
};
ACTS.openGospel = () => push('gospel', {}, '五幕福音敘事');

/* ---------------- 圖解模式 ---------------- */
let slideIdx = 0;
SHEETS.slides = async function (arg) {
  slideIdx = Math.max(0, Math.min(+arg.i || 0, C.gospel.acts.length - 1));
  const a = C.gospel.acts[slideIdx];
  return `<div class="slide">
    <div class="no" style="color:var(--gold-t);font-weight:700;letter-spacing:2px">${esc(a.no)}</div>
    <div class="tt">${esc(a.title)}</div>
    <div class="key">${esc(a.key)}</div>
    <div class="vs">${esc(a.verses[0].text)}<br>
      <span class="tiny">${esc(a.verses[0].ref)}</span></div>
  </div>
  <div class="btn-row" style="margin-top:14px">
    ${slideIdx > 0 ? `<button class="btn quiet" data-act="slideGo" data-i="${slideIdx - 1}">‹ 上一幕</button>` : ''}
    ${slideIdx < C.gospel.acts.length - 1
      ? `<button class="btn" data-act="slideGo" data-i="${slideIdx + 1}">下一幕 ›</button>`
      : `<button class="btn gold" data-act="openDecision">邀請他決志</button>`}
  </div>
  <p class="tiny" style="text-align:center;margin-top:12px">第 ${slideIdx + 1} 幕／共 5 幕．把螢幕轉向他，一起看。</p>`;
};
ACTS.openSlides = () => push('slides', { i: 0 }, '圖解模式');
ACTS.slideGo = d => { popSheet(); push('slides', { i: +d.i }, '圖解模式'); };

/* ---------------- 三種長度腳本 ---------------- */
SHEETS.script = async function (arg) {
  const s = C.gospel.scripts.find(x => x.id === arg.id);
  return `<div class="card">
    <div class="eyebrow">${esc(s.duration)}</div>
    <h2 class="sec">${esc(s.title)}</h2>
    <p class="muted">${esc(s.hint)}</p>
  </div>
  <div class="card">
    ${s.lines.map(l => `<p style="font-size:calc(20px * var(--fs));line-height:2;margin-bottom:14px">${esc(l)}</p>`).join('')}
  </div>
  <button class="btn gold" data-act="openDecision">帶他做決志禱告</button>`;
};
ACTS.openScript = d => push('script', { id: d.id }, '福音腳本');

/* ---------------- 決志禱告 ---------------- */
SHEETS.decision = async function () {
  const d = C.gospel.decision;
  const ps = await G.persons();
  const cands = ps.filter(p => ['L0', 'L1', 'L2', 'L3'].includes(p.stage));
  return `<div class="card">
    <h2 class="sec">${esc(d.title)}</h2>
    <p class="muted">${esc(d.intro)}</p>
    <p style="white-space:pre-wrap;font-size:calc(22px * var(--fs));line-height:2.1;margin-top:12px">${esc(d.text)}</p>
    <button class="btn quiet" data-act="speakThis" style="margin-top:14px">🔊 朗讀這段禱告</button>
  </div>
  <div class="card">
    <div class="eyebrow">禱告之後，立刻做這四件事</div>
    ${d.after.map((x, i) => `<p>${i + 1}. ${esc(x)}</p>`).join('')}
  </div>
  ${cands.length ? `<div class="card">
    <div class="eyebrow">決志登錄</div>
    <p class="tiny">登錄後會自動把他移到 L4 歸屬，並開啟初信三十天的陪伴提醒。</p>
    ${cands.map(p => `<button class="row" data-act="doSetStage" data-id="${p.id}" data-s="L4">
      <span class="grow"><span class="t">${esc(p.name)}</span>
      <span class="s">今天決志了　→　登錄</span></span><span class="arrow">›</span></button>`).join('')}
  </div>` : ''}`;
};
ACTS.openDecision = () => push('decision', {}, '決志禱告');

SHEETS.cost = async function () {
  const c = C.gospel.cost;
  return `<div class="card"><h2 class="sec">${esc(c.title)}</h2>
    <p class="muted">只說福分不說代價，是不誠實；只說代價不說福分，是不完整。</p></div>
  <div class="card"><div class="eyebrow">福分</div>
    ${c.blessings.map(x => `<p>・${esc(x)}</p>`).join('')}</div>
  <div class="card"><div class="eyebrow">代價</div>
    ${c.costs.map(x => `<p>・${esc(x)}</p>`).join('')}</div>`;
};
ACTS.openCost = () => push('cost', {}, '福分與代價');

/* ---------------- 疑問解答庫 ---------------- */
let faqCat = 'all';
SHEETS.faq = async function (arg) {
  if (arg && arg.cat) faqCat = arg.cat;
  const cats = C.faq.categories;
  return `<div class="card tight">
    <input type="text" id="faqSearch" placeholder="搜尋疑問…" autocomplete="off">
    <div class="seg" style="margin-top:10px" id="faqCats">
      <button data-act="faqCat" data-c="all" aria-pressed="${faqCat === 'all'}">全部</button>
      <button data-act="faqCat" data-c="fav" aria-pressed="${faqCat === 'fav'}">★ 收藏</button>
      ${cats.map(c => `<button data-act="faqCat" data-c="${c.id}" aria-pressed="${faqCat === c.id}">${esc(c.name)}</button>`).join('')}
    </div>
  </div>
  <div class="card tight">
    <p class="tiny" style="margin:0">每一題開始之前，先問他一句：「你為什麼會這樣想？」<br>
    很多疑問底下藏的不是理性難題，是一段受傷的經歷。</p>
  </div>
  <div id="faqList">
  ${C.faq.items.map(x => `<details data-faq="${x.id}" data-cat="${x.cat}"
      data-text="${esc(x.q + x.short + x.analogy + x.askback)}">
    <summary>${esc(x.q)}</summary>
    <div class="dbody">
      <p style="font-size:calc(20px * var(--fs));line-height:1.9">${esc(x.short)}</p>
      ${x.verses.map(v => `<div class="verse">${esc(v.text)}<span class="ref">${esc(v.ref)}</span></div>`).join('')}
      <p><span style="font-weight:700;color:var(--gold-t)">打個比方　</span>${esc(x.analogy)}</p>
      <p><span style="font-weight:700;color:var(--green)">反問他　</span>${esc(x.askback)}</p>
      <p class="tiny" style="margin-top:10px">不要爭贏，要愛贏。</p>
      <button class="btn quiet sm" data-act="favFaq" data-id="${x.id}" style="width:100%;margin-top:8px">
        ${S.favFaq.includes(x.id) ? '★ 已收藏（點一下取消）' : '☆ 收藏這一題'}</button>
    </div></details>`).join('')}
  </div>
  <div class="empty" id="faqEmpty" style="display:none">
    <div class="big">沒有找到</div>
    <p class="muted">換個關鍵字，或直接把問題丟給你的牧者。<br>「我不知道，我回去查」是一個很好的回答。</p>
  </div>`;
};
function faqFilter() {
  const box = $('#faqSearch');
  if (!box) return;
  const q = box.value.trim();
  let shown = 0;
  document.querySelectorAll('#faqList details').forEach(el => {
    const okCat = faqCat === 'all' ? true
      : faqCat === 'fav' ? S.favFaq.includes(el.dataset.faq)
      : el.dataset.cat === faqCat;
    const okQ = !q || el.dataset.text.indexOf(q) !== -1;
    const on = okCat && okQ;
    el.style.display = on ? '' : 'none';
    if (on) shown++;
  });
  const e = $('#faqEmpty'); if (e) e.style.display = shown ? 'none' : '';
}
ACTS.openFaq = () => { faqCat = 'all'; push('faq', {}, '疑問解答庫'); };
ACTS.faqCat = d => {
  faqCat = d.c;
  document.querySelectorAll('#faqCats button').forEach(b =>
    b.setAttribute('aria-pressed', b.dataset.c === faqCat));
  faqFilter();
};
ACTS.favFaq = (d, el) => {
  const i = S.favFaq.indexOf(d.id);
  if (i >= 0) S.favFaq.splice(i, 1); else S.favFaq.push(d.id);
  saveS('favFaq', S.favFaq);
  el.textContent = S.favFaq.includes(d.id) ? '★ 已收藏（點一下取消）' : '☆ 收藏這一題';
  if (faqCat === 'fav') faqFilter();
};

/* ---------------- 破冰問題 ---------------- */
SHEETS.ice = async function () {
  const groups = {};
  C.gospel.icebreakers.forEach(x => { (groups[x.cat] = groups[x.cat] || []).push(x); });
  return `<div class="card tight">
    <p class="tiny" style="margin:0">問完之後，最重要的是安靜聽完。<br>他講的時間，要比你多。</p></div>
    ${Object.keys(groups).map(k => `<div class="card">
      <div class="eyebrow">${esc(k)}</div>
      ${groups[k].map(x => `<p style="font-size:calc(20px * var(--fs));line-height:1.9">・${esc(x.q)}</p>`).join('')}
    </div>`).join('')}`;
};
ACTS.openIce = () => push('ice', {}, '破冰問題');

/* ---------------- 見證工作坊 ---------------- */
SHEETS.witness = async function () {
  const w = LS.get('witness', { a: '', b: '', c: '', tag: '一般版' });
  return `<div class="card">
    <div class="eyebrow">見證工作坊</div>
    <h2 class="sec">寫出你的三分鐘見證</h2>
    <p class="muted">最有能力的福音，是你自己的故事。<br>不談教義，只談改變。</p>
  </div>
  <div class="card">
    <div class="field">
      <label for="wA">一、信主前的我
        <span class="hint">那時候我最在意什麼？最苦的是什麼？</span></label>
      <textarea id="wA" placeholder="例：那幾年我拼命想證明自己，累到不敢停下來……">${esc(w.a)}</textarea>
    </div>
    <div class="field">
      <label for="wB">二、遇見主的關鍵
        <span class="hint">哪一句話、哪一件事、哪一個人？</span></label>
      <textarea id="wB" placeholder="例：有人跟我說，你不必再自己撐了……">${esc(w.b)}</textarea>
    </div>
    <div class="field">
      <label for="wC">三、現在的改變
        <span class="hint">具體一點。不用說「我變好了」，說「我現在會怎麼做」。</span></label>
      <textarea id="wC" placeholder="例：現在我還是會焦慮，但我知道可以停下來禱告……">${esc(w.c)}</textarea>
    </div>
    <div class="btn-row">
      <button class="btn" data-act="saveWitness">儲存</button>
      <button class="btn quiet" data-act="shareWitness">整理成稿</button>
    </div>
  </div>
  <div class="card">
    <div class="eyebrow">四個禁忌</div>
    <p>・不批評你原本的信仰或你的家人</p>
    <p>・不誇大神蹟，講你真的經歷的</p>
    <p>・不說教，不用「你應該」</p>
    <p>・不超過三分鐘，講完要留白給他</p>
  </div>`;
};
ACTS.openWitness = () => push('witness', {}, '見證工作坊');
ACTS.saveWitness = () => {
  LS.set('witness', { a: $('#wA').value, b: $('#wB').value, c: $('#wC').value });
  toast('已儲存');
};
ACTS.shareWitness = () => {
  const t = `【我的見證】\n\n信主前的我：\n${$('#wA').value}\n\n遇見主的關鍵：\n${$('#wB').value}\n\n現在的改變：\n${$('#wC').value}\n\n（願一切榮耀歸給主耶穌）`;
  if (navigator.share) navigator.share({ text: t }).catch(() => {});
  else if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast('已複製，可以貼到 LINE'));
  else toast('請長按上面的文字複製');
};

/* ---------------- 挫折十問 ---------------- */
SHEETS.frustration = async function () {
  return `<div class="card tight">
    <p class="tiny" style="margin:0">灰心不是失敗。<br>我們負責忠心，生長是神的事。</p></div>
    ${C.prayers.frustrations.map(x => `<details><summary>${esc(x.q)}</summary>
      <div class="dbody"><p>${esc(x.a)}</p></div></details>`).join('')}
    <div class="card"><div class="verse">我們行善，不可喪志；若不灰心，到了時候就要收成。
      <span class="ref">加拉太書六章9節</span></div></div>`;
};
ACTS.openFrustration = () => push('frustration', {}, '挫折十問');

/* ---------------- 初信三十天 ---------------- */
SHEETS.newbeliever = async function () {
  return `<div class="card">
    <div class="eyebrow">初信三十天</div>
    <h2 class="sec">黃金期，也是危險期</h2>
    <p class="muted">一個人若在六週內沒有交到三個教會的朋友，流失的機率極高。
    這個階段的重點不是課程，是關係的移植。</p>
  </div>
  ${C.prayers.newbeliever.map(x => `<details>
    <summary>${esc(x.title)}</summary>
    <div class="dbody">
      <p style="font-weight:700">目標：${esc(x.goal)}</p>
      <p style="white-space:pre-wrap;line-height:2">${esc(x.script)}</p>
    </div></details>`).join('')}`;
};
ACTS.openNewbeliever = () => { closeModal(); push('newbeliever', {}, '初信三十天'); };

/* =========================================================
   分頁四　學習
   ========================================================= */
VIEWS.learn = async function () {
  const prog = await DB.all('progress');
  const done = new Set(prog.filter(x => x.personId === 'self').map(x => x.lessonId));
  return `
  ${C.lessons.tracks.map(t => {
    const n = t.lessons.filter(l => done.has(l.id)).length;
    return `<button class="row" data-act="openTrack" data-id="${t.id}"
      style="border-left:6px solid ${t.color}">
      <span class="grow"><span class="t">${esc(t.name)}</span>
      <span class="s">${esc(t.subtitle)}　．　已讀 ${n}／${t.lessons.length}</span></span>
      <span class="arrow">›</span></button>`;
  }).join('')}

  <div class="card" style="margin-top:16px">
    <div class="eyebrow">初信造就．決志之後的第一段路</div>
    <h2 class="sec">開始你的新生命</h2>
    <p class="muted">七週課程，學生本與老師本合一。決志是出生，這一套是頭七週的哺育——
    受洗、聖靈、讀經、禱告、對付罪、讓耶穌作王。</p>
    <button class="row" data-act="openFrame"
      data-url="a01-new-life.html" data-name="開始你的新生命"
      style="border-left:6px solid #A8172B;margin-top:10px">
      <span class="grow"><span class="t">開始你的新生命．七週</span>
      <span class="s">學生本＋老師本．大字版．可離線閱讀</span></span>
      <span class="arrow">›</span></button>
    <p class="tiny" style="margin-top:10px">陪伴者提示：這一套排在「慕道班八課」之後，受洗及「門訓十二課」之前。
    按右上角「師」可切換老師本督導指引。</p>
  </div>

  <div class="card">
    <div class="eyebrow">資源庫</div>
    <h2 class="sec">隨手可給</h2>
    <p class="muted">陪伴者最常問的一句話是：有沒有什麼可以傳給他看的？</p>
    <button class="btn quiet" data-act="openRes" style="margin-top:10px">打開資源庫</button>
  </div>

  <div class="card">
    <div class="eyebrow">321 生態圈</div>
    <p class="muted">健康與婚姻類的應用是極佳的預工入口——先服事他的需要，再分享救恩。</p>
    ${C.resources.ecosystem.map(e => `<button class="row" data-act="openFrame"
      data-url="${esc(e.url)}" data-name="${esc(e.name)}">
      <span class="grow"><span class="t">${esc(e.name)}</span><span class="s">${esc(e.desc)}</span></span>
      <span class="arrow">›</span></button>`).join('')}
  </div>

  <div class="card tight">
    <p class="tiny" style="margin:0">結業的標準不是「上完了」，是「教過別人了」。<br>
    這一條規則，會從根本上改變整個教會的體質。</p>
  </div>`;
};

SHEETS.track = async function (arg) {
  const t = C.lessons.tracks.find(x => x.id === arg.id);
  const prog = (await DB.all('progress')).filter(x => x.personId === 'self');
  const done = new Set(prog.map(x => x.lessonId));
  return `<div class="card">
    <div class="eyebrow">${esc(t.subtitle)}</div>
    <h2 class="sec">${esc(t.name)}</h2>
    <p class="tiny">每課依八大步驟設計：資訊、啟示、信服、實踐、檢討、修正、反覆、繁殖。</p>
  </div>
  ${t.lessons.map(l => `<button class="row" data-act="openLesson" data-t="${t.id}" data-l="${l.id}"
    style="${done.has(l.id) ? 'border-left:6px solid ' + t.color : ''}">
    <span class="grow"><span class="t">${esc(l.no)}　${esc(l.title)}</span>
    <span class="s">${esc(l.layer || l.summary || '')}</span></span>
    <span class="arrow">${done.has(l.id) ? '✓' : '›'}</span></button>`).join('')}`;
};
ACTS.openTrack = d => push('track', { id: d.id }, '課程');

SHEETS.lesson = async function (arg) {
  const t = C.lessons.tracks.find(x => x.id === arg.t);
  const l = t.lessons.find(x => x.id === arg.l);
  const prog = (await DB.all('progress')).filter(x => x.personId === 'self');
  const rec = prog.find(x => x.lessonId === l.id);
  if (!l.info) {
    return `<div class="card">
      <div class="eyebrow">${esc(t.name)}．${esc(l.no)}</div>
      <h2 class="sec">${esc(l.title)}</h2>
      ${l.layer ? `<span class="chip">${esc(l.layer)}</span>` : ''}
      <p class="muted" style="margin-top:12px">${esc(l.summary)}</p>
      <div class="verse">${esc(l.verse.text)}<span class="ref">${esc(l.verse.ref)}</span></div>
      <p class="tiny">本課目前提供摘要與經文，可作為一對一的討論綱要。</p>
      <button class="btn quiet" data-act="toggleLesson" data-l="${l.id}" style="margin-top:12px">
        ${rec ? '✓ 已讀（點一下取消）' : '標記為已讀'}</button>
    </div>`;
  }
  return `<div class="card">
    <div class="eyebrow">${esc(t.name)}．${esc(l.no)}</div>
    <h2 class="sec">${esc(l.title)}</h2>
    ${l.layer ? `<span class="chip">${esc(l.layer)}</span>` : ''}
    ${l.summary ? `<p class="muted" style="margin-top:10px">${esc(l.summary)}</p>` : ''}
    <div class="verse">${esc(l.verse.text)}<span class="ref">${esc(l.verse.ref)}</span></div>
  </div>
  <div class="card"><div class="eyebrow">資訊</div>
    <p style="white-space:pre-wrap;line-height:2">${esc(l.info)}</p></div>
  <div class="card"><div class="eyebrow">啟示</div>
    <p>${esc(l.reflect)}</p></div>
  <div class="card"><div class="eyebrow">信服</div>
    <p style="font-weight:700">${esc(l.respond)}</p>
    <textarea id="lsNote" placeholder="寫下你的回應（只有你看得見）">${rec ? esc(rec.note || '') : ''}</textarea>
  </div>
  <div class="card"><div class="eyebrow">實踐．七天行動作業</div>
    ${l.practice.map(x => `<p>・${esc(x)}</p>`).join('')}</div>
  <div class="card"><div class="eyebrow">${t.id === 'parent' ? '本課實作' : '陪伴者提示'}</div>
    <p class="muted">${esc(l.tip)}</p></div>
  <div class="card tight">
    <p class="tiny">繁殖：這一課的結業條件，是把它教給另一個人。</p>
    <button class="btn ${rec ? 'quiet' : ''}" data-act="toggleLesson" data-l="${l.id}" style="margin-top:10px">
      ${rec ? '✓ 已讀（點一下取消）' : '標記為已讀並儲存回應'}</button>
  </div>`;
};
ACTS.openLesson = d => push('lesson', { t: d.t, l: d.l }, '課程內容');
ACTS.toggleLesson = async d => {
  const all = (await DB.all('progress')).filter(x => x.personId === 'self');
  const rec = all.find(x => x.lessonId === d.l);
  const note = ($('#lsNote') || {}).value || '';
  if (rec && !note) { await DB.del('progress', rec.id); toast('已取消標記'); }
  else {
    await DB.put('progress', {
      id: rec ? rec.id : uid(), personId: 'self', track: 'self',
      lessonId: d.l, completedAt: todayISO(), note: note.trim()
    });
    toast('已記下');
  }
  refreshSheet();
};

/* ---------------- 資源庫 ---------------- */
let resAud = '全部';
SHEETS.res = async function () {
  const auds = ['全部'].concat(C.resources.audiences);
  const items = resAud === '全部' ? C.resources.items
    : C.resources.items.filter(x => x.aud.includes(resAud));
  return `<div class="card tight">
    <div class="eyebrow">依對象分類</div>
    <div class="seg">${auds.map(a => `<button data-act="resAud" data-a="${a}"
      aria-pressed="${resAud === a}">${a}</button>`).join('')}</div>
  </div>
  ${items.map(x => `<button class="row" data-act="resGo" data-a="${esc(x.action)}" data-n="${esc(x.title)}">
    <span class="grow"><span class="t">${esc(x.title)}</span>
    <span class="s">${esc(x.type)}　．　${esc(x.desc)}</span></span>
    <span class="arrow">›</span></button>`).join('')}`;
};
ACTS.openRes = () => push('res', {}, '資源庫');
ACTS.resAud = d => { resAud = d.a; refreshSheet(); };
ACTS.resGo = d => {
  const [k, v] = d.a.split(':');
  const map = {
    gospel: () => ACTS.openGospel(), decision: () => ACTS.openDecision(),
    ice: () => ACTS.openIce(), faq: () => { faqCat = v || 'all'; push('faq', { cat: v || 'all' }, '疑問解答庫'); },
    prayers: () => ACTS.openPrayers(), newbeliever: () => ACTS.openNewbeliever(),
    f920: () => toast('請到「今日」分頁，按下 920 晚間回顧'),
    frustration: () => ACTS.openFrustration(), witness: () => ACTS.openWitness(),
    map: () => ACTS.openMap(), script: () => push('script', { id: v }, '福音腳本'),
    track: () => push('track', { id: v }, '課程'),
    frame: () => { closeSheet(); ACTS.openFrame({ url: v, name: d.n || '321' }); },
    prayer: () => push('prayers', { focus: v }, '禱告文範本')
  };
  (map[k] || (() => toast('這個資源即將開放')))();
};

/* ---------------- 禱告文範本 ---------------- */
SHEETS.prayers = async function (arg) {
  const groups = {};
  C.prayers.prayers.forEach(p => { (groups[p.cat] = groups[p.cat] || []).push(p); });
  return `<div class="card tight"><p class="tiny" style="margin:0">
    照著念可以，用自己的話說也可以。神聽的是心。</p></div>
    ${Object.keys(groups).map(k => `<div class="eyebrow" style="margin:14px 0 6px">${esc(k)}</div>
      ${groups[k].map(p => `<details ${arg && arg.focus === p.id ? 'open' : ''}>
        <summary>${esc(p.title)}</summary>
        <div class="dbody"><p style="white-space:pre-wrap;font-size:calc(20px * var(--fs));line-height:2">${esc(p.text)}</p></div>
      </details>`).join('')}`).join('')}`;
};
ACTS.openPrayers = () => push('prayers', {}, '禱告文範本');

/* ---------------- 生態圈內嵌檢視 ---------------- */
ACTS.openFrame = async d => {
  const rel = !/^https?:/i.test(d.url);
  if (rel) {
    // 同站頁面：先確認檔案真的在，避免長輩看到一片空白或 404
    let ok = false;
    try { const r = await fetch(d.url, { cache: 'no-store' }); ok = r.ok; } catch (e) { ok = false; }
    if (!ok) { toast('這份教材尚未安裝，請稍後再試'); return; }
  }
  $('#frameTitle').textContent = d.name;
  $('#frameBody').src = d.url;
  $('#frame').dataset.url = d.url;
  $('#frame').classList.remove('hidden');
};

/* =========================================================
   分頁五　我的
   ========================================================= */
VIEWS.me = async function () {
  const ps = await G.persons();
  const inter = await DB.all('interactions');
  const logs = await DB.all('logs');
  const mils = await DB.all('milestones');
  const streak = G.calcStreak(logs.filter(x => x.kind === 'pray').map(x => x.date));
  const mStart = todayISO().slice(0, 8) + '01';
  const mCount = inter.filter(x => x.date >= mStart).length;
  const decided = ps.filter(p => ['L3', 'L4', 'L5', 'L6'].includes(p.stage)).length;
  const backupDays = S.lastBackupAt ? daysSince(S.lastBackupAt) : null;

  return `
  <div class="card">
    <div class="eyebrow">忠心指標．我們可以負責的</div>
    <div class="stat">
      <div class="s"><div class="v">${streak}</div><div class="l">連續代禱天數</div></div>
      <div class="s"><div class="v">${mCount}</div><div class="l">本月主動關心次數</div></div>
      <div class="s"><div class="v">${ps.length}</div><div class="l">名單上的 2</div></div>
      <div class="s"><div class="v">${mils.length}</div><div class="l">里程推進次數</div></div>
    </div>
    <p class="tiny" style="margin-top:12px">禱告是我們唯一完全可以控制的事；<br>愛，是可以被實踐的動詞。</p>
  </div>

  <div class="card">
    <div class="eyebrow">果效指標．神負責的，我們只記念</div>
    <p>已承認耶穌是主的：${decided} 位</p>
    <p class="tiny">感恩用，不設目標值。我栽種了，亞波羅澆灌了，惟有神叫他生長。</p>
  </div>

  <div class="card">
    <div class="eyebrow">月度回顧</div>
    <h3 class="sub">這個月，你更愛他們了嗎？</h3>
    <p class="tiny">這是我們第一個要問的問題，不是「你帶了幾個人」。</p>
    <button class="btn quiet" data-act="openReview" style="margin-top:10px">進入月度回顧</button>
  </div>

  <button class="row" data-act="openPartner">
    <span class="grow"><span class="t">同伴與團隊</span><span class="s">問責五題、代禱牆、卡關求助、彙總回報</span></span>
    <span class="arrow">›</span></button>
  <button class="row" data-act="openTree">
    <span class="grow"><span class="t">屬靈家譜樹</span><span class="s">看見四代的繁殖（v2.0 完整版）</span></span>
    <span class="arrow">›</span></button>
  <button class="row" data-act="openBackup" style="${backupDays === null || backupDays > 30 ? 'border-left:6px solid var(--orange)' : ''}">
    <span class="grow"><span class="t">備份與還原</span>
    <span class="s">${S.lastBackupAt ? '上次備份：' + fmtAgo(S.lastBackupAt) : '還沒有備份過　—　建議現在做一次'}</span></span>
    <span class="arrow">›</span></button>
  <button class="row" data-act="openSettings">
    <span class="grow"><span class="t">設定</span><span class="s">字級、深色模式、朗讀、提醒</span></span>
    <span class="arrow">›</span></button>
  <button class="row" data-act="openAbout">
    <span class="grow"><span class="t">關於與五條守則</span><span class="s">321 理念．版本 ${APP_VERSION}</span></span>
    <span class="arrow">›</span></button>

  <p class="tiny" style="text-align:center;margin-top:20px">
    願我們手機裡的這張名單，<br>有一天成為天上那本冊子的一頁。</p>`;
};

SHEETS.review = async function () {
  const ps = await G.persons();
  const inter = await DB.all('interactions');
  const mStart = todayISO().slice(0, 8) + '01';
  const signs = (await DB.all('signs')).filter(x => x.date >= mStart);
  return `<div class="card">
    <div class="eyebrow">月度回顧</div>
    <h2 class="sec">這個月，你更愛他們了嗎？</h2>
    <p class="muted">不用回答給誰看，安靜地問自己就好。</p>
  </div>
  <div class="card">
    <div class="eyebrow">五個問題</div>
    <p>一、這個月我為誰流過淚、掛過心？</p>
    <p>二、我有沒有把誰當成一個待完成的項目？</p>
    <p>三、我自己的靈修，這個月如何？</p>
    <p>四、有沒有哪一個人，我該去見他一面卻一直沒去？</p>
    <p>五、我看見神在哪裡動工？</p>
  </div>
  ${signs.length ? `<div class="card"><div class="eyebrow">這個月看見的記號</div>
    ${signs.map(s => {
      const p = ps.find(x => x.id === s.personId);
      return `<p>・${p ? esc(p.name) + '：' : ''}${esc(s.text)}<span class="tiny">（${fmtDate(s.date)}）</span></p>`;
    }).join('')}</div>` : ''}
  <div class="card">
    <div class="eyebrow">這個月你走過的路</div>
    ${ps.map(p => {
      const n = inter.filter(x => x.personId === p.id && x.date >= mStart).length;
      return `<p>${esc(p.name)}：主動接觸 ${n} 次</p>`;
    }).join('') || '<p class="tiny">名單還是空的。</p>'}
    <p class="tiny" style="margin-top:10px">這不是成績單。次數少，不代表你不愛他，
    可能只是這個月你自己也很難。神知道。</p>
  </div>`;
};
ACTS.openReview = () => push('review', {}, '月度回顧');

SHEETS.tree = async function () {
  const ps = await G.persons();
  const gen1 = ps.filter(p => ['L4', 'L5', 'L6'].includes(p.stage));
  const gen2 = ps.filter(p => p.stage === 'L6');
  return `<div class="card">
    <div class="eyebrow">屬靈家譜樹</div>
    <h2 class="sec">把加法變成乘法</h2>
    <p class="muted">保羅對提摩太說的是四代：保羅、提摩太、忠心的人、別人。
    四代之後才叫作體系。</p>
    <div class="verse">你在許多見證人面前聽見我所教訓的，也要交託那忠心能教導別人的人。
      <span class="ref">提摩太後書二章2節</span></div>
  </div>
  <div class="card">
    <ul class="tree">
      <li><strong style="font-size:calc(20px * var(--fs))">我</strong>
        <ul>
          ${gen1.length ? gen1.map(p => `<li>${esc(p.name)}
            <span class="chip">${p.stage}</span>
            ${p.stage === 'L6' ? '<ul><li class="tiny">他已經開始帶他自己的 2 了</li></ul>' : ''}
          </li>`).join('') : '<li class="tiny">還沒有屬靈兒女。求主賜下第一位。</li>'}
        </ul>
      </li>
    </ul>
  </div>
  <div class="card tight">
    <p class="tiny" style="margin:0">目前依里程自動推算：受洗（L4）以上算屬靈兒女，
    已開始帶人（L6）算出現第三代。<br>
    完整的跨裝置家譜串接與分享圖，將於 v2.0 開放。</p>
  </div>
  ${gen2.length ? `<div class="card"><div class="eyebrow">感謝主</div>
    <p>你的屬靈孫子出現了。當一個人看見這一幕，他一輩子都不會再說「傳福音不是我的事」。</p></div>` : ''}`;
};
ACTS.openTree = () => push('tree', {}, '屬靈家譜樹');

/* ---------------- 設定 ---------------- */
SHEETS.settings = async function () {
  const lg = (window.I18N && window.I18N.lang) || 'tc';
  return `
  <div class="card">
    <div class="eyebrow">語言</div>
    <p class="tiny">切換後會重新整理，您記錄的資料完全不受影響。</p>
    <div class="seg" style="margin-top:8px">
      <button data-act="setLang" data-v="tc" aria-pressed="${lg === 'tc'}">繁體中文</button>
      <button data-act="setLang" data-v="sc" aria-pressed="${lg === 'sc'}">简体中文</button>
      <button data-act="setLang" data-v="en" aria-pressed="${lg === 'en'}">English</button>
    </div>
    ${lg === 'en' ? `<p class="tiny" style="margin-top:10px">英文版內容正在分批翻譯，尚未翻譯的部分會先顯示中文。</p>` : ''}
  </div>
  <div class="card">
    <div class="eyebrow">字級</div>
    <p class="tiny">全 App 立即生效。看不清楚就調大，不用客氣。</p>
    <div class="seg" style="margin-top:8px">
      ${[['標準', 1], ['大', 1.18], ['特大', 1.35], ['超大', 1.55]].map(([n, v]) =>
        `<button data-act="setFs" data-v="${v}" aria-pressed="${S.fontScale == v}">${n}</button>`).join('')}
    </div>
  </div>
  <div class="card">
    <div class="eyebrow">顯示</div>
    <div class="seg">
      <button data-act="setTheme" data-v="light" aria-pressed="${S.theme !== 'dark'}">淺色</button>
      <button data-act="setTheme" data-v="dark" aria-pressed="${S.theme === 'dark'}">深色</button>
    </div>
    <div class="seg" style="margin-top:10px">
      <button data-act="setBig" data-v="0" aria-pressed="${!S.bigcards}">一般卡片</button>
      <button data-act="setBig" data-v="1" aria-pressed="${!!S.bigcards}">長輩大卡片</button>
    </div>
  </div>
  <div class="card">
    <div class="eyebrow">朗讀</div>
    <p class="tiny">按右上角的「🔊 朗讀」，會念出目前這一頁的內容。</p>
    <div class="seg" style="margin-top:8px">
      ${[['慢', 0.8], ['正常', 0.95], ['快', 1.15]].map(([n, v]) =>
        `<button data-act="setRate" data-v="${v}" aria-pressed="${S.ttsRate == v}">${n}</button>`).join('')}
    </div>
    <button class="btn quiet sm" data-act="testTts" style="width:100%;margin-top:10px">試聽一句</button>
  </div>
  <div class="card">
    <div class="eyebrow">代禱提醒</div>
    <div class="field"><label for="tAm">早晨</label><input type="time" id="tAm" value="${S.amTime}"></div>
    <div class="field"><label for="tPm">睡前</label><input type="time" id="tPm" value="${S.pmTime}"></div>
    <div class="seg" style="margin-bottom:12px">
      <button data-act="setRotate" data-v="1" aria-pressed="${!!S.rotate}">每天輪播三位</button>
      <button data-act="setRotate" data-v="0" aria-pressed="${!S.rotate}">固定前三位</button>
    </div>
    <button class="btn quiet" data-act="saveTimes">儲存提醒時間</button>
    <p class="tiny" style="margin-top:10px">這個 App 沒有伺服器，因此不使用推播。
    請到下面的「提醒與行事曆」，把提醒加入手機行事曆——那才會準時響。</p>
  </div>
  <button class="row" data-act="openRemind">
    <span class="grow"><span class="t">提醒與行事曆</span>
    <span class="s">把每日代禱與他們的日子放進手機行事曆</span></span>
    <span class="arrow">›</span></button>
  <button class="row" data-act="openLockSec">
    <span class="grow"><span class="t">安全與遮罩</span>
    <span class="s">App 鎖、敏感內容隱藏</span></span>
    <span class="arrow">›</span></button>

  <div class="card">
    <div class="eyebrow">更新</div>
    <p class="tiny">改版後若畫面沒有變化，按這裡清除快取重新載入。
    iOS 若仍未更新，請把主畫面圖示刪除後重新加入。</p>
    <button class="btn quiet" data-act="forceUpdate" style="margin-top:10px">強制更新</button>
  </div>
  <p class="tiny" style="text-align:center">版本 ${APP_VERSION}</p>`;
};
ACTS.openSettings = () => push('settings', {}, '設定');
ACTS.setLang = d => { if (window.I18N) window.I18N.set(d.v); };
ACTS.setFs = d => { saveS('fontScale', +d.v); applyLook(); refreshSheet(); };
ACTS.setTheme = d => { saveS('theme', d.v); applyLook(); refreshSheet(); };
ACTS.setBig = d => { saveS('bigcards', d.v === '1'); applyLook(); refreshSheet(); };
ACTS.setRate = d => { saveS('ttsRate', +d.v); refreshSheet(); };
ACTS.setRotate = d => { saveS('rotate', d.v === '1'); refreshSheet(); render(); };
ACTS.testTts = () => TTS.speak('耶穌是我的榜樣，聖經是我的準則，聖靈是我的引導。');
ACTS.saveTimes = () => {
  saveS('amTime', $('#tAm').value); saveS('pmTime', $('#tPm').value);
  toast('已儲存');
};
ACTS.forceUpdate = () => {
  confirmBox('強制更新', '將清除快取並重新載入最新版本。\n你的資料不會受影響。', '確定', async () => {
    try {
      if ('caches' in window) { const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); }
      if (navigator.serviceWorker) {
        const rs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(rs.map(r => r.unregister()));
      }
    } catch (e) {}
    location.reload(true);
  });
};

/* ---------------- 備份與還原 ---------------- */
SHEETS.backup = async function () {
  const counts = {};
  for (const s of G.STORES)
    counts[s] = (await DB.all(s)).length;
  return `<div class="card">
    <div class="eyebrow">資料留在你自己的手機裡</div>
    <h2 class="sec">備份與還原</h2>
    <p class="muted">這個 App 不設伺服器、不上傳任何資料、不需要註冊。
    所以備份的責任在你——請每三十天做一次。</p>
    <p class="tiny">目前：${counts.persons} 位同行對象、${counts.interactions} 筆關心紀錄、
    ${counts.prayers} 項代禱、${counts.milestones} 次里程推進。</p>
  </div>
  <div class="card">
    <div class="eyebrow">匯出</div>
    <p class="tiny">會產生一個 JSON 檔。建議存到雲端硬碟或傳給自己。</p>
    <button class="btn" data-act="doExport" style="margin-top:10px">匯出備份檔</button>
  </div>
  <div class="card">
    <div class="eyebrow">匯入</div>
    <p class="tiny">選擇之前匯出的 JSON 檔。匯入會「合併」資料，不會刪除現有內容。</p>
    <input type="file" id="impFile" accept="application/json,.json" style="margin-top:10px">
    <button class="btn quiet" data-act="doImport" style="margin-top:10px">從檔案還原</button>
  </div>
  <div class="card">
    <div class="eyebrow">危險操作</div>
    <button class="btn quiet" data-act="wipeAll">清除這個裝置上的所有資料</button>
  </div>
  <p class="tiny" style="text-align:center">iOS Safari 長期未使用可能會清除本機資料庫，<br>這就是備份重要的原因。</p>`;
};
ACTS.openBackup = () => push('backup', {}, '備份與還原');
ACTS.doExport = async () => {
  const data = { app: '321福音同行', version: APP_VERSION, exportedAt: new Date().toISOString(), settings: {}, stores: {} };
  ['fontScale', 'theme', 'bigcards', 'ttsRate', 'amTime', 'pmTime', 'favFaq', 'rotate'].forEach(k => data.settings[k] = S[k]);
  data.settings.witness = LS.get('witness', null);
  data.settings.partner = LS.get('partner', null);
  for (const s of G.STORES)
    data.stores[s] = await DB.all(s);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `321福音同行_備份_${todayISO()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  saveS('lastBackupAt', todayISO());
  toast('已匯出。請把檔案存到安全的地方');
};
ACTS.doImport = () => {
  const f = $('#impFile').files[0];
  if (!f) { toast('請先選擇備份檔'); return; }
  const rd = new FileReader();
  rd.onload = async () => {
    let d;
    try { d = JSON.parse(rd.result); } catch (e) { toast('這個檔案讀不出來'); return; }
    if (!d.stores) { toast('這不是 321 福音同行的備份檔'); return; }
    let n = 0;
    for (const s of Object.keys(d.stores)) {
      for (const row of d.stores[s]) { try { await DB.put(s, row); n++; } catch (e) {} }
    }
    if (d.settings) Object.keys(d.settings).forEach(k => { if (k !== 'witness' && k !== 'partner' && d.settings[k] !== undefined) saveS(k, d.settings[k]); });
    if (d.settings && d.settings.witness) LS.set('witness', d.settings.witness);
    if (d.settings && d.settings.partner) LS.set('partner', d.settings.partner);
    applyLook(); closeSheet(); render(); toast(`已還原 ${n} 筆資料`);
  };
  rd.readAsText(f);
};
ACTS.wipeAll = () => {
  confirmBox('清除所有資料', '所有同行對象、紀錄、代禱、課程進度都會被永久刪除，無法復原。\n\n如果還沒備份，請先取消並匯出。', '我確定要清除', async () => {
    for (const s of G.STORES)
      await DB.clear(s);
    closeSheet(); render(); toast('已清除');
  }, true);
};

/* ---------------- 關於 ---------------- */
SHEETS.about = async function () {
  return `<div class="card">
    <div class="eyebrow">五條使用者倫理守則</div>
    ${C.core.ethics.map((e, i) => `<p style="font-size:calc(19px * var(--fs));line-height:1.9">
      ${['一', '二', '三', '四', '五'][i]}、${esc(e)}</p>`).join('')}
  </div>
  <div class="card">
    <div class="eyebrow">321 理念</div>
    <p><strong>三個基礎</strong>：耶穌是我的榜樣．聖經是我的準則．聖靈是我的引導</p>
    <p><strong>兩個核心</strong>：讓耶穌作王．讓耶穌得著一切的榮耀</p>
    <p><strong>一個目的</strong>：建立屬神的體系</p>
    <hr class="sep">
    <p>先生命，再關係，後事工。</p>
    <p>舊人有己的生命，變成新人無己的生命。<br>謙卑戰勝驕傲，無己戰勝撒但。</p>
    <p>焦點在耶穌，不在自己、不在別人、不在環境。</p>
  </div>
  <div class="card">
    <div class="eyebrow">隱私</div>
    <p class="tiny">本 App 不設伺服器、不上傳任何個人資料、不需要註冊帳號、不放置任何追蹤程式碼。
    所有慕道友的資料只存在你自己的手機中。</p>
  </div>
  <div class="card">
    <div class="eyebrow">異象</div>
    <p>我們要興起一萬個屬靈父母，讓每一個信主的人都被人陪伴，也去陪伴一個人；
    直到福音從一個人流向一個家、一個群體、一個城市、一個國家，
    在地上建立屬神的體系，迎接主耶穌再來。</p>
    <div class="verse">且有紀念冊在他面前，記錄那敬畏耶和華、思念他名的人。
      <span class="ref">瑪拉基書三章16節</span></div>
  </div>
  <p class="tiny" style="text-align:center">國度321空中團契　敬上<br>版本 ${APP_VERSION}</p>`;
};
ACTS.openAbout = () => push('about', {}, '關於');


/* =========================================================
   第六部　同伴與團隊．金句圖卡．初信三十天排程
   落實 235：陪伴者自己也需要被陪伴。
   ========================================================= */
(function () {
'use strict';
const G = window.__G;
const { S, saveS, DB, LS, C, $, uid, esc, nl2br, todayISO, daysSince, fmtDate, fmtAgo,
  toast, VIEWS, SHEETS, ACTS, push, popSheet, closeSheet, refreshSheet, render,
  modal, closeModal, confirmBox } = G;

/* ---------------- 共用：複製到剪貼簿 ---------------- */
async function copyText(t) {
  try {
    await navigator.clipboard.writeText(t);
    toast('已複製，可以貼到 LINE 傳給他');
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('已複製'); }
    catch (x) { toast('這個瀏覽器不支援複製，請長按選取'); }
    ta.remove();
  }
}
ACTS.copyBox = d => { const el = $('#' + d.box); if (el) copyText(el.value || el.textContent); };

/* =========================================================
   M11　同伴與團隊
   ========================================================= */
const ACC_Q = [
  '這一週，你與主如何？',
  '有沒有什麼是你一直藏著、不敢說出來的？',
  '你為誰禱告了？',
  '你關心了誰？做了什麼？',
  '你現在最需要什麼幫助？'
];

function partnerCfg() { return LS.get('partner', { name: '', day: 'SUN' }); }

SHEETS.partner = async function () {
  const cfg = partnerCfg();
  const cks = (await DB.all('checkins')).sort((a, b) => b.date.localeCompare(a.date));
  const wall = (await DB.all('wall')).filter(x => !x.answeredAt);
  return `
  <div class="card">
    <div class="eyebrow">235　不再孤單</div>
    <h2 class="sec">陪伴者自己也需要被陪伴</h2>
    <p class="muted">2 是屬靈同伴，3 是屬靈父母與兒女，5 是五重職份的團隊。
    一個人撐太久會乾涸；有人知道你真實的光景，你就不必再假裝。</p>
    <div class="verse">有人攻勝孤身一人，若有二人便能敵擋他；三股合成的繩子不容易折斷。
      <span class="ref">傳道書四章12節</span></div>
  </div>

  <div class="card">
    <div class="eyebrow">我的屬靈同伴（2）</div>
    <div class="field">
      <label>同伴的名字或稱呼</label>
      <input type="text" id="pName" value="${esc(cfg.name)}" placeholder="例如：志明弟兄">
    </div>
    <div class="field">
      <label>每週問責日 <span class="hint">到了那天，這裡會提醒你</span></label>
      <div class="seg">
        ${[['SUN', '主日'], ['MON', '一'], ['TUE', '二'], ['WED', '三'], ['THU', '四'], ['FRI', '五'], ['SAT', '六']]
          .map(([v, n]) => `<button data-act="pDay" data-v="${v}" aria-pressed="${cfg.day === v}">${n}</button>`).join('')}
      </div>
    </div>
    <button class="btn quiet" data-act="pSave">儲存</button>
    <p class="tiny" style="margin-top:10px">這只存在你的手機裡，不會傳給任何人。</p>
  </div>

  <div class="card">
    <div class="eyebrow">每週問責五題</div>
    <h3 class="sub">${cfg.name ? '與「' + esc(cfg.name) + '」的約定' : '先找一位同伴，兩人一組'}</h3>
    <p class="tiny">問責不是被檢查，是有人肯陪你誠實。
    ${cks.length ? '上一次：' + fmtAgo(cks[0].date) : '還沒有開始過。'}</p>
    <button class="btn gold" data-act="openCheckin" style="margin-top:10px">開始這一週的問責</button>
  </div>

  ${cks.length ? `<div class="card">
    <div class="eyebrow">問責紀錄</div>
    ${cks.slice(0, 6).map(c => `<details><summary>${fmtDate(c.date)}　${esc((c.a[0] || '').slice(0, 14) || '（未填）')}</summary>
      <div class="dbody">${ACC_Q.map((q, i) => `<p class="tiny" style="font-weight:700;margin-bottom:2px">${esc(q)}</p>
        <p>${nl2br(c.a[i] || '—')}</p>`).join('')}</div></details>`).join('')}
  </div>` : ''}

  <button class="row" data-act="openWall">
    <span class="grow"><span class="t">代禱牆</span>
    <span class="s">${wall.length ? '目前有 ' + wall.length + ' 項還在等候' : '同工彼此的代禱事項'}</span></span>
    <span class="arrow">›</span></button>
  <button class="row" data-act="openHelp">
    <span class="grow"><span class="t">卡關求助</span><span class="s">一鍵寫好求助的話，傳給同伴或牧者</span></span>
    <span class="arrow">›</span></button>
  <button class="row" data-act="openTeam">
    <span class="grow"><span class="t">團隊彙總回報</span><span class="s">只有數字，絕不含任何個資</span></span>
    <span class="arrow">›</span></button>

  <p class="tiny" style="text-align:center;margin-top:16px">
    無己才能合一，無己才能建立屬神的體系。</p>`;
};
ACTS.openPartner = () => push('partner', {}, '同伴與團隊');
ACTS.pDay = d => {
  const cfg = partnerCfg(); cfg.day = d.v; LS.set('partner', cfg);
  document.querySelectorAll('[data-act="pDay"]').forEach(b =>
    b.setAttribute('aria-pressed', b.dataset.v === d.v));
};
ACTS.pSave = () => {
  const cfg = partnerCfg();
  cfg.name = ($('#pName').value || '').trim();
  LS.set('partner', cfg); refreshSheet(); toast('已儲存');
};

SHEETS.checkin = async function () {
  return `<div class="card">
    <div class="eyebrow">每週問責五題</div>
    <p class="muted">誠實一點就好，不必寫得好看。
    寫完可以複製，傳給你的同伴，或當面一題一題談。</p>
  </div>
  ${ACC_Q.map((q, i) => `<div class="card">
    <div class="field" style="margin:0">
      <label>${['一', '二', '三', '四', '五'][i]}、${esc(q)}</label>
      <textarea id="ck${i}" placeholder="（可以只寫一行）"></textarea>
    </div>
  </div>`).join('')}
  <div class="btn-row">
    <button class="btn quiet" data-act="ckCopy">複製給同伴</button>
    <button class="btn green" data-act="ckSave">儲存</button>
  </div>
  <p class="tiny" style="margin-top:12px">提醒：談到別人的事時，請只說你自己的部分。
  我絕不把他的私事告訴不相干的人，包括在代禱時。</p>`;
};
ACTS.openCheckin = () => push('checkin', {}, '每週問責');
function ckRead() { return ACC_Q.map((q, i) => (($('#ck' + i) || {}).value || '').trim()); }
ACTS.ckCopy = () => {
  const a = ckRead();
  copyText(`【本週問責】${fmtDate(todayISO())}\n` +
    ACC_Q.map((q, i) => `${i + 1}. ${q}\n${a[i] || '（還沒想好）'}`).join('\n\n'));
};
ACTS.ckSave = async () => {
  const a = ckRead();
  if (!a.some(x => x)) { toast('至少寫一題再存'); return; }
  await DB.put('checkins', { id: uid(), date: todayISO(), a, createdAt: new Date().toISOString() });
  popSheet(); toast('已記下。感謝主，你沒有一個人走');
};

/* ---------------- 代禱牆 ---------------- */
SHEETS.wall = async function () {
  const all = (await DB.all('wall')).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const open = all.filter(x => !x.answeredAt);
  const done = all.filter(x => x.answeredAt);
  const item = w => `<div class="card tight" style="border-left:4px solid ${w.answeredAt ? 'var(--green)' : 'var(--gold)'}">
    <p style="margin-bottom:6px">${nl2br(w.text)}</p>
    <p class="tiny" style="margin:0">${w.who ? esc(w.who) + '．' : ''}${fmtDate(w.date)}
      ${w.answeredAt ? '．已應允 ' + fmtDate(w.answeredAt) : ''}</p>
    <div class="btn-row" style="margin-top:10px">
      <button class="btn quiet sm" data-act="wallToggle" data-id="${w.id}">
        ${w.answeredAt ? '改回等候中' : '主應允了'}</button>
      <button class="btn quiet sm" data-act="wallDel" data-id="${w.id}">刪除</button>
    </div>
  </div>`;
  return `<div class="card">
    <div class="eyebrow">代禱牆</div>
    <h2 class="sec">彼此扶持，一同記念</h2>
    <p class="muted">寫下同工彼此的代禱事項。<strong>請用代號或只寫事情</strong>，
    不要寫出別人的隱私——這是我們的第二條守則。</p>
    <div class="field" style="margin-top:12px">
      <label>代禱事項</label>
      <textarea id="wText" placeholder="例如：一位長輩的手術，求主保守。"></textarea>
    </div>
    <div class="field">
      <label>是誰的（選填）<span class="hint">可用代號，例如「小組的一位姊妹」</span></label>
      <input type="text" id="wWho" placeholder="（選填）">
    </div>
    <button class="btn" data-act="wallAdd">加入代禱牆</button>
  </div>
  ${open.length ? `<div class="card tight"><div class="eyebrow" style="margin:0">等候中（${open.length}）</div></div>
    ${open.map(item).join('')}` : '<div class="empty"><div class="big">還沒有代禱事項</div><p class="muted">寫下第一項，就從今天開始一同記念。</p></div>'}
  ${done.length ? `<div class="card tight"><div class="eyebrow" style="margin:0">主應允了（${done.length}）</div></div>
    ${done.slice(0, 12).map(item).join('')}` : ''}
  ${all.length ? `<button class="btn quiet" data-act="wallCopy" style="margin-top:6px">複製代禱單給同工</button>` : ''}`;
};
ACTS.openWall = () => push('wall', {}, '代禱牆');
ACTS.wallAdd = async () => {
  const t = ($('#wText').value || '').trim();
  if (!t) { toast('先寫一句代禱事項'); return; }
  await DB.put('wall', {
    id: uid(), text: t, who: ($('#wWho').value || '').trim(),
    date: todayISO(), answeredAt: null, createdAt: new Date().toISOString()
  });
  refreshSheet(); toast('已加入。求主垂聽');
};
ACTS.wallToggle = async d => {
  const w = await DB.get('wall', d.id);
  w.answeredAt = w.answeredAt ? null : todayISO();
  await DB.put('wall', w); refreshSheet();
  if (w.answeredAt) toast('感謝主。記得回去告訴那個人');
};
ACTS.wallDel = d => confirmBox('刪除這一項', '刪除之後無法復原。', '刪除', async () => {
  await DB.del('wall', d.id); refreshSheet();
}, true);
ACTS.wallCopy = async () => {
  const all = (await DB.all('wall')).filter(x => !x.answeredAt);
  copyText('【代禱單】' + fmtDate(todayISO()) + '\n' +
    (all.length ? all.map((w, i) => `${i + 1}. ${w.text}${w.who ? '（' + w.who + '）' : ''}`).join('\n')
      : '目前沒有等候中的事項。') +
    '\n\n— 願神的旨意成就，榮耀歸給耶穌。');
};

/* ---------------- 卡關求助 ---------------- */
SHEETS.help = async function () {
  const fr = (C.prayers.frustrations || []);
  const cfg = partnerCfg();
  return `<div class="card">
    <div class="eyebrow">卡關求助</div>
    <h2 class="sec">說出來，捆綁就鬆了一半</h2>
    <p class="muted">一個人撐得太久，是我們三個斷層裡最傷人的一個。
    挑一個最接近你現在光景的情況，我幫你把話寫好。</p>
  </div>
  <div class="card">
    <div class="eyebrow">我現在的情況</div>
    <div class="seg">
      ${fr.map((f, i) => `<button data-act="helpPick" data-i="${i}" aria-pressed="${i === 0}"
        style="text-align:left">${esc(f.q)}</button>`).join('')}
    </div>
  </div>
  <div class="card">
    <div class="eyebrow">要傳出去的話</div>
    <textarea id="helpText" style="min-height:170px">${esc(helpDraft(fr[0] ? fr[0].q : '', cfg.name))}</textarea>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn quiet" data-act="copyBox" data-box="helpText">複製</button>
      <button class="btn gold" data-act="helpPray">先為這件事禱告</button>
    </div>
  </div>
  <div class="card" id="helpAns">
    <div class="eyebrow">先聽一句話</div>
    <p>${esc(fr[0] ? fr[0].a : '')}</p>
  </div>
  <p class="tiny" style="text-align:center">忠心比成果重要。我栽種了，亞波羅澆灌了，惟有神叫他生長。</p>`;
};
function helpDraft(q, name) {
  return `${name ? name + '，' : '弟兄／姊妹，'}想請你為我禱告。\n` +
    `我在陪伴一位朋友，現在卡在這裡：${q}\n` +
    `我有點灰心，也怕自己是不是做錯了什麼。\n` +
    `可以找個時間聽我說一下嗎？謝謝你。`;
}
ACTS.openHelp = () => push('help', {}, '卡關求助');
ACTS.helpPick = d => {
  const fr = C.prayers.frustrations[+d.i];
  document.querySelectorAll('[data-act="helpPick"]').forEach(b =>
    b.setAttribute('aria-pressed', b.dataset.i === d.i));
  $('#helpText').value = helpDraft(fr.q, partnerCfg().name);
  $('#helpAns').innerHTML = `<div class="eyebrow">先聽一句話</div><p>${esc(fr.a)}</p>`;
};
ACTS.helpPray = () => modal(`<h3 class="sub">灰心時的禱告</h3>
  <div class="verse" style="white-space:pre-wrap">${esc((C.prayers.prayers.find(p => p.id === 'pr20') || {}).text || '')}</div>
  <div class="btn-row" style="margin-top:14px"><button class="btn quiet" data-act="closeModal">阿們</button></div>`);

/* ---------------- 團隊彙總回報 ---------------- */
SHEETS.team = async function () {
  const ps = await G.persons();
  const inter = await DB.all('interactions');
  const mStart = todayISO().slice(0, 8) + '01';
  const byStage = {};
  ps.forEach(p => byStage[p.stage] = (byStage[p.stage] || 0) + 1);
  const mCount = inter.filter(x => x.date >= mStart).length;
  const text = `【同行回報】${todayISO().slice(0, 7)}\n` +
    `名單上的 2：${ps.length} 位\n` +
    C.core.stages.map(s => `${s.id} ${s.name}：${byStage[s.id] || 0} 位`).join('\n') +
    `\n本月主動關心：${mCount} 次\n` +
    `（本回報不含任何姓名與個人資料）`;
  return `<div class="card">
    <div class="eyebrow">團隊彙總回報</div>
    <h2 class="sec">只有數字，沒有名字</h2>
    <p class="muted">牧者需要知道整體的光景，但慕道友的個人紀錄永遠只留在你這裡。
    這是我們隱私的鐵律。</p>
  </div>
  <div class="card">
    <div class="eyebrow">這個月的彙總</div>
    <div class="stat">
      <div class="s"><div class="v">${ps.length}</div><div class="l">名單上的 2</div></div>
      <div class="s"><div class="v">${mCount}</div><div class="l">本月關心次數</div></div>
    </div>
    <div style="margin-top:12px">
      ${C.core.stages.map(s => `<p class="tiny" style="margin-bottom:4px">
        <span class="chip stage" style="background:${s.color}">${s.id}</span>
        ${esc(s.name)}：${byStage[s.id] || 0} 位</p>`).join('')}
    </div>
  </div>
  <div class="card">
    <div class="eyebrow">可以傳給小組長的內容</div>
    <textarea id="teamText" style="min-height:200px">${esc(text)}</textarea>
    <button class="btn quiet" data-act="copyBox" data-box="teamText" style="margin-top:12px">複製</button>
  </div>
  <p class="tiny" style="text-align:center">我不把人數當成績。一個靈魂比一百個數字寶貴。</p>`;
};
ACTS.openTeam = () => push('team', {}, '團隊彙總回報');

/* =========================================================
   金句圖卡　——　依處境挑一句，做成圖傳給他
   ========================================================= */
const CARD_VERSES = [
  { cat: '壓力', ref: '馬太福音十一章28節', text: '凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。' },
  { cat: '壓力', ref: '彼得前書五章7節', text: '你們要將一切的憂慮卸給神，因為他顧念你們。' },
  { cat: '壓力', ref: '腓立比書四章6至7節', text: '應當一無掛慮，只要凡事藉著禱告、祈求和感謝，將你們所要的告訴神。' },
  { cat: '壓力', ref: '以賽亞書四十章31節', text: '但那等候耶和華的必從新得力。他們必如鷹展翅上騰。' },
  { cat: '家庭', ref: '約書亞記二十四章15節', text: '至於我和我家，我們必定事奉耶和華。' },
  { cat: '家庭', ref: '使徒行傳十六章31節', text: '當信主耶穌，你和你一家都必得救。' },
  { cat: '家庭', ref: '以弗所書六章2節', text: '要孝敬父母，使你得福，在世長壽。' },
  { cat: '家庭', ref: '詩篇一百二十七篇1節', text: '若不是耶和華建造房屋，建造的人就枉然勞力。' },
  { cat: '疾病', ref: '出埃及記十五章26節', text: '因為我耶和華是醫治你的。' },
  { cat: '疾病', ref: '詩篇一百四十七篇3節', text: '他醫好傷心的人，裹好他們的傷處。' },
  { cat: '疾病', ref: '哥林多後書十二章9節', text: '我的恩典夠你用的，因為我的能力是在人的軟弱上顯得完全。' },
  { cat: '迷惘', ref: '箴言三章5至6節', text: '你要專心仰賴耶和華，不可倚靠自己的聰明；在你一切所行的事上都要認定他，他必指引你的路。' },
  { cat: '迷惘', ref: '詩篇一百一十九篇105節', text: '你的話是我腳前的燈，是我路上的光。' },
  { cat: '迷惘', ref: '耶利米書二十九章11節', text: '我知道我向你們所懷的意念是賜平安的意念，不是降災禍的意念，要叫你們末後有指望。' },
  { cat: '安慰', ref: '詩篇三十四篇18節', text: '耶和華靠近傷心的人，拯救靈性痛悔的人。' },
  { cat: '安慰', ref: '詩篇二十三篇4節', text: '我雖然行過死蔭的幽谷，也不怕遭害，因為你與我同在。' },
  { cat: '安慰', ref: '約翰福音十四章27節', text: '我留下平安給你們；我將我的平安賜給你們。' },
  { cat: '安慰', ref: '啟示錄二十一章4節', text: '神要擦去他們一切的眼淚；不再有死亡，也不再有悲哀、哭號、疼痛。' },
  { cat: '盼望', ref: '羅馬書八章28節', text: '我們曉得萬事都互相效力，叫愛神的人得益處。' },
  { cat: '盼望', ref: '哥林多後書五章17節', text: '若有人在基督裡，他就是新造的人，舊事已過，都變成新的了。' },
  { cat: '盼望', ref: '腓立比書四章13節', text: '我靠著那加給我力量的，凡事都能做。' },
  { cat: '救恩', ref: '約翰福音三章16節', text: '神愛世人，甚至將他的獨生子賜給他們，叫一切信他的，不至滅亡，反得永生。' },
  { cat: '救恩', ref: '啟示錄三章20節', text: '看哪，我站在門外叩門，若有聽見我聲音就開門的，我要進到他那裡去。' },
  { cat: '救恩', ref: '羅馬書五章8節', text: '惟有基督在我們還作罪人的時候為我們死，神的愛就在此向我們顯明了。' },
  { cat: '救恩', ref: '加拉太書二章20節', text: '現在活著的不再是我，乃是基督在我裡面活著。' }
];
function allCards() {
  return CARD_VERSES.concat((C.core.dailyVerses || []).map(v => ({ cat: '每日', ref: v.ref, text: v.text })));
}
let cardCat = '全部';
const CARD_CATS = ['全部', '壓力', '家庭', '疾病', '迷惘', '安慰', '盼望', '救恩', '每日'];

SHEETS.cards = async function () {
  const all = allCards();
  const list = all.map((v, i) => ({ v, i }))
    .filter(o => cardCat === '全部' || o.v.cat === cardCat);
  return `<div class="card">
    <div class="eyebrow">金句圖卡</div>
    <h2 class="sec">先給他一句話</h2>
    <p class="muted">撒種階段最自然的一步：把一句適合他現在處境的話，做成一張圖傳給他。
    不講道理，只送一句祝福。</p>
    <div class="seg" style="margin-top:12px">
      ${CARD_CATS.map(c => `<button data-act="cardCat" data-v="${c}" aria-pressed="${cardCat === c}">${c}</button>`).join('')}
    </div>
  </div>
  ${list.map(o => `<div class="card">
    <div class="verse" style="margin-top:0">${esc(o.v.text)}<span class="ref">${esc(o.v.ref)}</span></div>
    <button class="btn quiet sm" data-act="makeCard" data-i="${o.i}">做成圖卡</button>
  </div>`).join('')}
  <p class="tiny" style="text-align:center">傳出去之前，先為他禱告一分鐘。<br>是聖靈感動人，不是圖片。</p>`;
};
ACTS.openCards = () => push('cards', {}, '金句圖卡');
ACTS.cardCat = d => { cardCat = d.v; refreshSheet(); };

let cardState = { i: 0, ratio: '16:9', dark: true };
ACTS.makeCard = d => { cardState.i = +d.i; openCardModal(); };
ACTS.cardRatio = d => { cardState.ratio = d.v; openCardModal(); };
ACTS.cardTone = d => { cardState.dark = d.v === 'dark'; openCardModal(); };

function openCardModal() {
  const v = allCards()[cardState.i];
  modal(`<h3 class="sub">金句圖卡</h3>
    <canvas id="cardCv" style="width:100%;border-radius:10px;border:1px solid var(--line)"></canvas>
    <div class="seg" style="margin-top:12px">
      <button data-act="cardRatio" data-v="16:9" aria-pressed="${cardState.ratio === '16:9'}">橫式 16:9</button>
      <button data-act="cardRatio" data-v="1:1" aria-pressed="${cardState.ratio === '1:1'}">方形 1:1</button>
      <button data-act="cardRatio" data-v="4:5" aria-pressed="${cardState.ratio === '4:5'}">直式 4:5</button>
      <button data-act="cardTone" data-v="dark" aria-pressed="${cardState.dark}">深色</button>
      <button data-act="cardTone" data-v="light" aria-pressed="${!cardState.dark}">淺色</button>
    </div>
    <div class="btn-row" style="margin-top:14px">
      <button class="btn quiet" data-act="closeModal">關閉</button>
      <button class="btn" data-act="cardSave">儲存圖片</button>
      <button class="btn gold" data-act="cardShare">分享</button>
    </div>
    <p class="tiny" style="margin-top:10px">若沒有出現分享選單，請先儲存圖片，再從相簿傳到 LINE。</p>`);
  drawCard($('#cardCv'), v, cardState.ratio, cardState.dark);
}

function drawCard(cv, v, ratio, dark) {
  const W = 1200, H = ratio === '1:1' ? 1200 : ratio === '4:5' ? 1500 : 675;
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  const g = x.createLinearGradient(0, 0, W, H);
  if (dark) { g.addColorStop(0, '#1B4B7A'); g.addColorStop(1, '#0E2540'); }
  else { g.addColorStop(0, '#FBFAF7'); g.addColorStop(1, '#F0EBE1'); }
  x.fillStyle = g; x.fillRect(0, 0, W, H);

  const ink = dark ? '#FFFFFF' : '#1F2937';
  const gold = dark ? '#E2BE6A' : '#8C6608';
  x.fillStyle = gold; x.fillRect(88, H * 0.16, 8, H * 0.52);

  const F = w => `${w} 46px "PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif`;
  const pad = 140, maxW = W - pad - 96;
  let size = v.text.length > 60 ? 46 : v.text.length > 38 ? 54 : 62;
  let lines = [];
  for (;;) {
    x.font = F('700').replace('46px', size + 'px');
    lines = wrap(x, v.text, maxW);
    if (lines.length * size * 1.85 < H * 0.56 || size <= 34) break;
    size -= 4;
  }
  const lh = size * 1.85;
  let y = H / 2 - (lines.length * lh) / 2 - 10;
  x.fillStyle = ink; x.textBaseline = 'middle';
  lines.forEach(t => { x.fillText(t, pad, y); y += lh; });

  x.font = F('700').replace('46px', Math.round(size * 0.62) + 'px');
  x.fillStyle = gold;
  x.fillText(v.ref + '（和合本）', pad, y + size * 0.5);

  x.font = F('400').replace('46px', '28px');
  x.fillStyle = dark ? 'rgba(255,255,255,.55)' : 'rgba(31,41,55,.5)';
  x.textAlign = 'right';
  x.fillText('321 福音同行．國度321空中團契', W - 88, H - 62);
  x.textAlign = 'left';
}
function wrap(x, text, maxW) {
  const out = []; let cur = '';
  for (const ch of text) {
    if (x.measureText(cur + ch).width > maxW && cur) { out.push(cur); cur = ''; }
    cur += ch;
    if ('，。；、！？'.includes(ch) && x.measureText(cur).width > maxW * 0.72) { out.push(cur); cur = ''; }
  }
  if (cur) out.push(cur);
  return out;
}
function cardBlob() {
  return new Promise(res => $('#cardCv').toBlob(b => res(b), 'image/png'));
}
ACTS.cardSave = async () => {
  const b = await cardBlob(); if (!b) { toast('這個裝置無法產生圖片'); return; }
  const url = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = url; a.download = `321金句_${allCards()[cardState.i].ref}.png`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast('已儲存。iPhone 請長按圖片選「加入照片」');
};
ACTS.cardShare = async () => {
  const v = allCards()[cardState.i];
  const b = await cardBlob();
  const f = b ? new File([b], '321金句.png', { type: 'image/png' }) : null;
  try {
    if (f && navigator.canShare && navigator.canShare({ files: [f] })) {
      await navigator.share({ files: [f], text: `${v.text}（${v.ref}）` });
    } else if (navigator.share) {
      await navigator.share({ text: `${v.text}（${v.ref}）\n— 321 福音同行` });
    } else {
      copyText(`${v.text}（${v.ref}）`);
    }
  } catch (e) { /* 使用者取消 */ }
};

/* =========================================================
   初信三十天陪伴排程
   ========================================================= */
const NB_DAYS = [1, 3, 7, 14, 21, 30];

G.newbelieverCard = async function (ps) {
  const news = ps.filter(p => p.decidedAt && daysSince(p.decidedAt) <= 45);
  if (!news.length) return '';
  const done = (await DB.all('logs')).filter(x => x.kind === 'nb');
  const rows = [];
  news.forEach(p => {
    const n = daysSince(p.decidedAt) + 1;
    const due = NB_DAYS.filter(d => d <= n && !done.some(x => x.personId === p.id && x.day === d));
    const next = NB_DAYS.find(d => d > n);
    if (due.length) {
      rows.push({ p, day: due[0], late: n - due[0], n });
    } else if (next) {
      rows.push({ p, day: next, late: -(next - n), n });
    }
  });
  if (!rows.length) return '';
  return `<div class="card" style="border-left:6px solid var(--gold)">
    <div class="eyebrow">初信三十天．黃金期</div>
    <h3 class="sub">決志後的前六週，是最需要你的時候</h3>
    <p class="tiny" style="margin-bottom:10px">一個人若在六週內沒有交到三個教會的朋友，流失的機率極高。
    重點不是課程，是關係的移植。</p>
    ${rows.map(r => `<button class="row" data-act="openNbFor" data-id="${r.p.id}" data-day="${r.day}">
      <span class="grow"><span class="t">${esc(r.p.name)}　決志第 ${r.n} 天</span>
      <span class="s">${r.late >= 0
        ? '第 ' + r.day + ' 天的跟進' + (r.late > 0 ? '　已經晚了 ' + r.late + ' 天' : '　就是今天')
        : '下一次跟進：第 ' + r.day + ' 天（還有 ' + (-r.late) + ' 天）'}</span></span>
      <span class="arrow">›</span></button>`).join('')}
  </div>`;
};

SHEETS.nbFor = async function (arg) {
  const p = await DB.get('persons', arg.id);
  const sc = (C.prayers.newbeliever || []).find(x => x.day === +arg.day) || {};
  const done = (await DB.all('logs')).filter(x => x.kind === 'nb' && x.personId === p.id);
  const n = daysSince(p.decidedAt) + 1;
  return `<div class="card">
    <div class="eyebrow">${esc(p.name)}．決志第 ${n} 天</div>
    <h2 class="sec">${esc(sc.title || '')}</h2>
    <p class="muted">${esc(sc.goal || '')}</p>
  </div>
  <div class="card">
    <div class="eyebrow">可以照著說的話</div>
    <p style="white-space:pre-wrap;font-size:calc(20px * var(--fs));line-height:2">${esc(sc.script || '')}</p>
    <button class="btn quiet" data-act="nbCopy" data-day="${arg.day}" style="margin-top:12px">複製這段話</button>
  </div>
  <div class="card">
    <div class="eyebrow">三十天的進度</div>
    ${NB_DAYS.map(d => {
      const ok = done.some(x => x.day === d);
      return `<p style="display:flex;align-items:center;gap:10px">
        <span class="chip" style="${ok ? 'background:var(--green);color:#fff;border:0' : ''}">第 ${d} 天</span>
        <span class="tiny">${ok ? '已跟進' : (d <= n ? '還沒跟進' : '尚未到')}</span></p>`;
    }).join('')}
  </div>
  <div class="btn-row">
    <button class="btn quiet" data-act="quickLog" data-id="${p.id}">記一筆</button>
    <button class="btn green" data-act="nbDone" data-id="${p.id}" data-day="${arg.day}">第 ${arg.day} 天已跟進</button>
  </div>
  <p class="tiny" style="text-align:center;margin-top:14px">
    別忘了最重要的一件事：帶他認識三位弟兄姊妹。</p>`;
};
ACTS.openNbFor = d => push('nbFor', { id: d.id, day: d.day }, '初信三十天');
ACTS.nbCopy = d => {
  const sc = (C.prayers.newbeliever || []).find(x => x.day === +d.day);
  if (sc) copyText(sc.script);
};
ACTS.nbDone = async d => {
  await DB.put('logs', {
    id: uid(), kind: 'nb', personId: d.id, day: +d.day,
    date: todayISO(), createdAt: new Date().toISOString()
  });
  const p = await DB.get('persons', d.id);
  if (p) {
    p.lastContactAt = todayISO(); p.updatedAt = new Date().toISOString();
    await DB.put('persons', p);
  }
  popSheet(); render(); toast('感謝主。你出現了，這比什麼都重要');
};

})();


/* =========================================================
   第七部　v1.2　提醒．保護．備援．開口
   1 行事曆提醒（.ics）　2 App 鎖與敏感遮罩　3 本機快照雙保險
   4 訊息草稿產生器　5 生日與屬靈生日　6 朗讀穩定化（見第一部）
   ========================================================= */
(function () {
'use strict';
const G = window.__G;
const { S, saveS, DB, LS, C, $, uid, esc, nl2br, todayISO, daysSince, fmtDate, fmtAgo,
  toast, VIEWS, SHEETS, ACTS, push, popSheet, closeSheet, refreshSheet, render, go,
  modal, closeModal, confirmBox, applyLook } = G;

const pad2 = n => String(n).padStart(2, '0');
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); toast('已複製，可以貼到 LINE 傳給他'); }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('已複製'); } catch (x) { toast('請長按選取複製'); }
    ta.remove();
  }
}
function download(name, text, mime) {
  const b = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* =========================================================
   一　行事曆提醒（.ics）
   無伺服器就無法推播；行事曆是最可靠、最不會失效的一條路。
   ========================================================= */
function icsWrap(body) {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//321福音同行//TW', 'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH', 'X-WR-CALNAME:321福音同行', body, 'END:VCALENDAR'].join('\r\n');
}
function stamp() {
  const d = new Date();
  return d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + 'T' +
    pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + pad2(d.getUTCSeconds()) + 'Z';
}
function fold(s) {
  /* RFC 5545：每行不超過 75 位元組，中文以保守長度切 */
  return s.split('\r\n').map(l => {
    if (l.length <= 40) return l;
    const out = [];
    for (let i = 0; i < l.length; i += 40) out.push((i ? ' ' : '') + l.slice(i, i + 40));
    return out.join('\r\n');
  }).join('\r\n');
}
function dailyEvent(hhmm, title, desc, uidSeed) {
  const d = new Date();
  const [h, m] = hhmm.split(':').map(Number);
  const start = d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) +
    'T' + pad2(h) + pad2(m) + '00';
  const end = d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) +
    'T' + pad2(h) + pad2(Math.min(59, m + 10)) + '00';
  return ['BEGIN:VEVENT', 'UID:' + uidSeed + '@321gospel', 'DTSTAMP:' + stamp(),
    'DTSTART:' + start, 'DTEND:' + end, 'RRULE:FREQ=DAILY',
    'SUMMARY:' + title, 'DESCRIPTION:' + desc,
    'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:' + title,
    'END:VALARM', 'END:VEVENT'].join('\r\n');
}
ACTS.icsDaily = () => {
  const body = [
    dailyEvent(S.amTime, '為我的 2 禱告', '打開 321福音同行，為今天輪到的三位禱告。禱告是我們唯一完全可以負責的事。', 'am' + Date.now()),
    dailyEvent(S.pmTime, '920 晚間回顧', '今天對他操練了哪一個果子？一行就好。', 'pm' + Date.now())
  ].join('\r\n');
  download('321福音同行_每日提醒.ics', fold(icsWrap(body)), 'text/calendar;charset=utf-8');
  toast('已產生。請點開檔案並選「加入行事曆」');
};
ACTS.icsBirthday = async () => {
  const ps = await G.persons();
  const evs = [];
  ps.forEach(p => {
    if (p.birthday) {
      const b = p.birthday.replace(/-/g, '');
      evs.push(['BEGIN:VEVENT', 'UID:b' + p.id + '@321gospel', 'DTSTAMP:' + stamp(),
        'DTSTART;VALUE=DATE:' + b, 'RRULE:FREQ=YEARLY',
        'SUMMARY:' + p.name + ' 生日', 'DESCRIPTION:記得他的日子，就是在愛他。傳一句祝福給他。',
        'BEGIN:VALARM', 'TRIGGER:PT9H', 'ACTION:DISPLAY', 'DESCRIPTION:' + p.name + ' 生日',
        'END:VALARM', 'END:VEVENT'].join('\r\n'));
    }
    if (p.decidedAt) {
      const b = p.decidedAt.replace(/-/g, '');
      evs.push(['BEGIN:VEVENT', 'UID:s' + p.id + '@321gospel', 'DTSTAMP:' + stamp(),
        'DTSTART;VALUE=DATE:' + b, 'RRULE:FREQ=YEARLY',
        'SUMMARY:' + p.name + ' 屬靈生日', 'DESCRIPTION:他重生的日子。為他感謝主，並告訴他你記得。',
        'BEGIN:VALARM', 'TRIGGER:PT9H', 'ACTION:DISPLAY', 'DESCRIPTION:' + p.name + ' 屬靈生日',
        'END:VALARM', 'END:VEVENT'].join('\r\n'));
    }
  });
  if (!evs.length) { toast('名單裡還沒有生日或決志日'); return; }
  download('321福音同行_日子提醒.ics', fold(icsWrap(evs.join('\r\n'))), 'text/calendar;charset=utf-8');
  toast(`已產生 ${evs.length} 個日子`);
};

SHEETS.remind = async function () {
  return `<div class="card">
    <div class="eyebrow">提醒與行事曆</div>
    <h2 class="sec">讓禱告有一個固定的時刻</h2>
    <p class="muted">這個 App 沒有伺服器，所以不靠推播。我們用一個更可靠的方式：
    把提醒放進你手機原本的行事曆，它一定會響。</p>
    <div class="verse">靠著聖靈，隨時多方禱告祈求。<span class="ref">以弗所書六章18節</span></div>
  </div>
  <div class="card">
    <div class="eyebrow">每日提醒</div>
    <p class="tiny">目前設定：早晨 ${S.amTime}、睡前 ${S.pmTime}（可在設定裡改）。</p>
    <button class="btn gold" data-act="icsDaily" style="margin-top:10px">加入每日代禱提醒</button>
    <p class="tiny" style="margin-top:10px">按下後會下載一個行事曆檔，點開它、選「加入行事曆」即可。
    之後每天到時間，手機就會提醒你。</p>
  </div>
  <div class="card">
    <div class="eyebrow">他們的日子</div>
    <p class="tiny">生日、屬靈生日（決志日）都會變成每年重複的提醒。
    記得一個人的日子，就是在愛他。</p>
    <button class="btn quiet" data-act="icsBirthday" style="margin-top:10px">加入生日與屬靈生日</button>
  </div>
  <div class="card">
    <div class="eyebrow">iPhone 進階作法</div>
    <p class="tiny">若你希望每天固定時間「自動打開這個 App」，可以用 iPhone 內建的「捷徑」。</p>
    <button class="btn quiet" data-act="shortcutHelp" style="margin-top:10px">看步驟</button>
  </div>
  <p class="tiny" style="text-align:center">提醒響起的時候，先禱告，再看名單。</p>`;
};
ACTS.openRemind = () => push('remind', {}, '提醒與行事曆');
ACTS.shortcutHelp = () => modal(`<h3 class="sub">用「捷徑」每天自動打開</h3>
  <p>一、打開 iPhone 內建的「捷徑」App。</p>
  <p>二、下方選「自動化」→ 右上角「＋」。</p>
  <p>三、選「時間」，設成你要的時間，選「每天」。</p>
  <p>四、執行方式選「立即執行」，並關掉「執行前先詢問」。</p>
  <p>五、動作選「打開 App」，選「321福音同行」。</p>
  <p class="tiny">若找不到這個 App，請先把它加入主畫面。</p>
  <div class="btn-row" style="margin-top:14px">
    <button class="btn quiet" data-act="closeModal">知道了</button></div>`);

/* =========================================================
   二　App 鎖與敏感遮罩
   我們記的是別人靈魂最深的傷處，不能讓任何人隨手翻到。
   ========================================================= */
function lockCfg() { return LS.get('lock', { on: false, salt: '', hash: '' }); }
async function hashPin(pin, salt) {
  const raw = salt + '|' + pin + '|321';
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let h = 5381;
    for (let i = 0; i < raw.length; i++) h = ((h << 5) + h + raw.charCodeAt(i)) >>> 0;
    return 'f' + h.toString(16);
  }
}
G.lockRequired = () => !!lockCfg().on;

let _pin = '';
function pinDots() {
  const el = document.getElementById('pinDots');
  if (el) el.textContent = '●'.repeat(_pin.length) + '○'.repeat(Math.max(0, 4 - _pin.length));
}
function lockHTML(title, hint) {
  return `<div class="inner">
    <div class="eyebrow">${esc(title)}</div>
    <h2 class="sec" style="font-size:calc(25px * var(--fs))">請輸入四位數密碼</h2>
    <p class="muted">${esc(hint)}</p>
    <div id="pinDots" style="font-size:calc(34px * var(--fs));letter-spacing:14px;
      text-align:center;margin:18px 0;color:var(--navy)">○○○○</div>
    <div id="pinPad" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="btn quiet" data-k="${n}"
        style="min-height:64px;font-size:calc(26px * var(--fs))">${n}</button>`).join('')}
      <button class="btn quiet" data-k="x" style="min-height:64px">清除</button>
      <button class="btn quiet" data-k="0" style="min-height:64px;font-size:calc(26px * var(--fs))">0</button>
      <button class="btn quiet" data-k="b" style="min-height:64px">←</button>
    </div>
    <p class="tiny" style="text-align:center;margin-top:16px" id="pinMsg">　</p>
    <button class="btn quiet sm" id="pinForgot" style="width:100%;margin-top:8px">我忘記密碼了</button>
  </div>`;
}
function ensureLockEl() {
  let el = document.getElementById('lock');
  if (!el) {
    el = document.createElement('div');
    el.id = 'lock'; el.className = 'hidden';
    document.body.appendChild(el);
  }
  return el;
}
function bindPad(onFull) {
  const pad = document.getElementById('pinPad');
  pad.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.k;
    if (k === 'x') _pin = '';
    else if (k === 'b') _pin = _pin.slice(0, -1);
    else if (_pin.length < 4) _pin += k;
    pinDots();
    if (_pin.length === 4) setTimeout(() => onFull(_pin), 120);
  }));
  pinDots();
}
G.askUnlock = function () {
  return new Promise(res => {
    const el = ensureLockEl();
    el.innerHTML = lockHTML('321 福音同行', '這些名字很寶貴，所以我們把門關上了。');
    el.classList.remove('hidden');
    _pin = '';
    bindPad(async pin => {
      const cfg = lockCfg();
      const h = await hashPin(pin, cfg.salt);
      if (h === cfg.hash) {
        el.classList.add('hidden'); el.innerHTML = ''; res(true);
      } else {
        _pin = ''; pinDots();
        const m = document.getElementById('pinMsg');
        m.textContent = '密碼不對，再試一次。';
        m.style.color = 'var(--orange-t)';
      }
    });
    document.getElementById('pinForgot').addEventListener('click', () => {
      const m = document.getElementById('pinMsg');
      m.innerHTML = '為了保護資料，密碼無法被找回。<br>若真的忘記，只能清除本機資料重新開始' +
        '（若你有備份檔，還原後一切都在）。';
      m.style.color = 'var(--ink-2)';
      const b = document.getElementById('pinForgot');
      b.textContent = '我確定要清除本機資料';
      b.onclick = async () => {
        if (!confirm('所有同行紀錄將被永久清除，確定嗎？')) return;
        for (const st of G.STORES) { try { await DB.clear(st); } catch (e) {} }
        LS.set('lock', { on: false, salt: '', hash: '' });
        location.reload();
      };
    });
  });
};

SHEETS.locksec = async function () {
  const cfg = lockCfg();
  const ps = await G.persons();
  const hidden = ps.filter(p => p.locked).length;
  return `<div class="card">
    <div class="eyebrow">保護</div>
    <h2 class="sec">別人的私事，值得一道門</h2>
    <p class="muted">我絕不把他的私事告訴不相干的人——這是第二條守則。
    手機被隨手翻到，也算。</p>
  </div>
  <div class="card">
    <div class="eyebrow">App 鎖</div>
    <p class="tiny">開啟後，每次打開 App 都要輸入四位數密碼。</p>
    <div class="seg" style="margin-top:10px">
      <button data-act="lockOn" aria-pressed="${cfg.on}">開啟</button>
      <button data-act="lockOff" aria-pressed="${!cfg.on}">關閉</button>
    </div>
    ${cfg.on ? `<button class="btn quiet" data-act="lockOn" style="margin-top:12px">變更密碼</button>` : ''}
    <p class="tiny" style="margin-top:10px">密碼只存在這支手機裡，而且只存加密後的結果，
    連我們自己也還原不了。忘記密碼只能清除重來，所以請務必先備份。</p>
  </div>
  <div class="card">
    <div class="eyebrow">敏感內容遮罩</div>
    <p class="tiny">在每個人的「編輯資料」裡，可以把他的背景、難處、代禱與紀錄設為隱藏。
    設定後，打開他的卡片要再點一下才會顯示。</p>
    <p style="margin-top:8px">目前有 <strong>${hidden}</strong> 位設為隱藏。</p>
  </div>
  <p class="tiny" style="text-align:center">保護他，也是愛他的一部分。</p>`;
};
ACTS.openLockSec = () => push('locksec', {}, '安全與遮罩');
ACTS.lockOff = () => {
  const cfg = lockCfg();
  if (!cfg.on) return;
  confirmBox('關閉 App 鎖', '關閉之後，任何拿到這支手機的人都能看見名單。確定嗎？', '關閉', () => {
    LS.set('lock', { on: false, salt: '', hash: '' });
    refreshSheet(); toast('已關閉');
  });
};
ACTS.lockOn = () => {
  const el = ensureLockEl();
  el.innerHTML = lockHTML('設定密碼', '請設定一組四位數密碼，並且記牢。');
  el.classList.remove('hidden');
  document.getElementById('pinForgot').style.display = 'none';
  _pin = '';
  let first = null;
  bindPad(async pin => {
    const m = document.getElementById('pinMsg');
    if (!first) {
      first = pin; _pin = ''; pinDots();
      m.textContent = '請再輸入一次確認。'; m.style.color = 'var(--ink-2)';
      return;
    }
    if (first !== pin) {
      first = null; _pin = ''; pinDots();
      m.textContent = '兩次不一樣，請重新設定。'; m.style.color = 'var(--orange-t)';
      return;
    }
    const salt = uid();
    LS.set('lock', { on: true, salt, hash: await hashPin(pin, salt) });
    el.classList.add('hidden'); el.innerHTML = '';
    refreshSheet(); toast('已開啟 App 鎖。請記牢你的密碼');
  });
};
ACTS.reveal = d => { G.revealPid = d.id; refreshSheet(); };

/* =========================================================
   三　本機快照雙保險
   iOS 長期未用會清除 IndexedDB，但 localStorage 是另一個籃子。
   ========================================================= */
const SNAP = 'snap';
async function snapshot() {
  try {
    const ps = await DB.all('persons');
    if (!ps.length) return;
    const prs = await DB.all('prayers');
    LS.set(SNAP, {
      at: new Date().toISOString(),
      persons: ps.map(p => ({
        id: p.id, name: p.name, relation: p.relation, stage: p.stage,
        birthday: p.birthday, decidedAt: p.decidedAt, baptizedAt: p.baptizedAt,
        prayFrom: p.prayFrom, lastContactAt: p.lastContactAt, locked: p.locked,
        background: (p.background || '').slice(0, 300),
        prayerFocus: (p.prayerFocus || '').slice(0, 300),
        createdAt: p.createdAt, order: p.order
      })),
      prayers: prs.map(x => ({
        id: x.id, personId: x.personId, item: x.item,
        startedAt: x.startedAt, answeredAt: x.answeredAt, active: x.active
      }))
    });
  } catch (e) { /* 空間不足就安靜略過 */ }
}
G.snapStart = function () {
  setInterval(snapshot, 90000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) snapshot(); });
  window.addEventListener('pagehide', snapshot);
  setTimeout(snapshot, 5000);
};
G.snapCheck = async function () {
  const snap = LS.get(SNAP, null);
  if (!snap || !snap.persons || !snap.persons.length) return;
  const ps = await DB.all('persons');
  if (ps.length) return;
  await new Promise(res => {
    modal(`<h3 class="sub">要不要把名單救回來？</h3>
      <p class="muted">這支手機的資料庫是空的，但我們留有一份 ${fmtDate(snap.at.slice(0, 10))} 的快照，
      裡面有 ${snap.persons.length} 位同行對象。</p>
      <p class="tiny">（iOS 長期未開啟 App 時會清除資料庫，這是我們預備的第二層保險。
      關心紀錄與課程進度無法從快照還原，請以備份檔為準。）</p>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn quiet" data-act="snapSkip">先不要</button>
        <button class="btn gold" data-act="snapRestore">救回名單</button>
      </div>`);
    ACTS.snapSkip = () => { closeModal(); res(); };
    ACTS.snapRestore = async () => {
      let n = 0;
      for (const p of snap.persons) { try { await DB.put('persons', p); n++; } catch (e) {} }
      for (const x of snap.prayers || []) { try { await DB.put('prayers', x); } catch (e) {} }
      closeModal(); toast(`已救回 ${n} 位。請盡快匯出一次備份`); res();
    };
  });
};

/* =========================================================
   四　訊息草稿產生器　——　解決「不知道怎麼開口」
   ========================================================= */
const DRAFTS = {
  L0: [
    ['溫和問候', '{n}，最近好嗎？沒什麼事，就是想到你，問候一聲。不用急著回我。'],
    ['具體關心', '{n}，上次聽你提到{c}，後來還好嗎？我一直記著這件事。'],
    ['實際幫忙', '{n}，這幾天我剛好有空，如果有什麼我幫得上忙的，儘管跟我說，別客氣。']
  ],
  L1: [
    ['分享一小段', '{n}，跟你說一件事。我最近遇到一個難關，本來很慌，後來心裡竟然安穩下來了。改天見面再跟你細講。'],
    ['送一句話', '{n}，看到這句話就想到你，送給你。願你這陣子平安。'],
    ['讓他知道你記念他', '{n}，我最近有為你禱告。不用你信什麼，就當我掛念你。']
  ],
  L2: [
    ['回應他的問題', '{n}，你上次問我的那個問題，我認真想過，也去查了一些資料。找個時間我們好好聊，好嗎？'],
    ['邀他一起讀', '{n}，我想邀你陪我做一件事——一起讀約翰福音，一天五分鐘就好。你陪我，我也陪你。'],
    ['先問他的心', '{n}，你會這樣想，是不是曾經遇過什麼事？我很想聽你說，不會急著給你答案。']
  ],
  L3: [
    ['約一次好好談', '{n}，有一件我心裡覺得很重要的事想跟你講，大概二十分鐘。這禮拜哪天方便？'],
    ['溫和的邀請', '{n}，我一直在為你禱告。如果哪一天你願意，我想帶你做一個很簡單的禱告，把心門打開。'],
    ['誠實地問一次', '{n}，不論你信或不信，我們都是朋友，這一點不會變。但我想誠實地問你一次：你願意讓耶穌作你生命的主嗎？']
  ],
  L4: [
    ['四十八小時內', '{n}，今天怎麼樣？我一早就想到你。你做的那個決定，是你一生最重要的一件事，我為你高興。這禮拜找一天吃飯好嗎？'],
    ['介紹朋友給他', '{n}，這禮拜聚會我想介紹幾位朋友給你認識，都是很好相處的人，不會給你壓力。'],
    ['談受洗', '{n}，關於受洗，你心裡有什麼想法嗎？不用急著決定，我只是想先聽聽你怎麼想。']
  ],
  L5: [
    ['約定的時間', '{n}，這禮拜我們的時間照舊嗎？想聽你說說這幾天讀到什麼。'],
    ['陪他面對難處', '{n}，最近哪一件事最卡住你？我們一起把它帶到主面前，不用你一個人扛。'],
    ['帶他去看', '{n}，這禮拜我要去關心一位朋友，你要不要跟我一起去？你在旁邊聽就好。']
  ],
  L6: [
    ['問他的名單', '{n}，你心裡有沒有一個想帶的人？我們一起為他禱告。'],
    ['放手讓他做', '{n}，下次換你講，我在旁邊聽就好。講得怎麼樣都沒關係，我會陪你。'],
    ['為他的兒女禱告', '{n}，我今天為你正在陪伴的那位禱告了。有需要我隨時在。']
  ]
};
function clue(p) {
  const t = (p.background || p.prayerFocus || '').replace(/\s+/g, ' ').trim();
  if (!t) return '你最近的事';
  return t.length > 16 ? t.slice(0, 16) + '……' : t;
}
SHEETS.draft = async function (arg) {
  const p = await DB.get('persons', arg.id);
  if (!p) return '<p class="muted">找不到這個人。</p>';
  const st = G.stageOf(p.stage);
  const list = DRAFTS[p.stage] || DRAFTS.L0;
  return `<div class="card">
    <div class="eyebrow">寫給 ${esc(p.name)}</div>
    <h2 class="sec">先禱告，再送出</h2>
    <p class="muted">現在的里程：${st.id}　${esc(st.name)}。
    這些都只是草稿，請改成你自己的話——你的語氣比句子重要。</p>
    <div class="verse">你們的言語要常常帶著和氣，好像用鹽調和。<span class="ref">歌羅西書四章6節</span></div>
  </div>
  ${list.map((d, i) => `<div class="card">
    <div class="eyebrow">${esc(d[0])}</div>
    <textarea id="dr${i}" style="min-height:120px">${esc(d[1].replace(/\{n\}/g, p.name).replace(/\{c\}/g, clue(p)))}</textarea>
    <div class="btn-row" style="margin-top:10px">
      <button class="btn quiet sm" data-act="draftCopy" data-i="${i}">複製</button>
      <button class="btn sm" data-act="draftSent" data-id="${p.id}" data-i="${i}">已傳出，記一筆</button>
    </div>
  </div>`).join('')}
  <p class="tiny" style="text-align:center">傳出去之前，先為他禱告一分鐘。<br>
  是聖靈感動人，不是句子。</p>`;
};
ACTS.openDraft = d => push('draft', { id: d.id }, '訊息草稿');
ACTS.draftCopy = d => { const el = $('#dr' + d.i); if (el) copyText(el.value); };
ACTS.draftSent = async d => {
  const el = $('#dr' + d.i);
  await DB.put('interactions', {
    id: uid(), personId: d.id, date: todayISO(), type: '訊息',
    note: (el ? el.value : '').slice(0, 200), mood: '', createdAt: new Date().toISOString()
  });
  const p = await DB.get('persons', d.id);
  if (p) { p.lastContactAt = todayISO(); p.updatedAt = new Date().toISOString(); await DB.put('persons', p); }
  popSheet(); render(); toast('記下了。愛要親自去給');
};

/* =========================================================
   五　生日與屬靈生日
   記得一個人的日子，就是在愛他。
   ========================================================= */
function nextIn(mmdd) {
  if (!mmdd) return null;
  const now = new Date();
  const [m, d] = mmdd.split('-').map(Number);
  let t = new Date(now.getFullYear(), m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (t < today) t = new Date(now.getFullYear() + 1, m - 1, d);
  return Math.round((t - today) / 86400000);
}
G.daysCard = async function (ps) {
  const rows = [];
  ps.forEach(p => {
    if (p.birthday) {
      const n = nextIn(p.birthday.slice(5));
      if (n !== null && n <= 7) rows.push({ p, n, what: '生日' });
    }
    if (p.decidedAt && daysSince(p.decidedAt) >= 300) {
      const n = nextIn(p.decidedAt.slice(5));
      const yr = new Date().getFullYear() - +p.decidedAt.slice(0, 4) + (n === 0 ? 0 : 1);
      if (n !== null && n <= 7) rows.push({ p, n, what: `屬靈生日．第 ${yr} 年` });
    }
    if (p.baptizedAt && daysSince(p.baptizedAt) >= 300) {
      const n = nextIn(p.baptizedAt.slice(5));
      if (n !== null && n <= 7) rows.push({ p, n, what: '受洗週年' });
    }
  });
  if (!rows.length) return '';
  rows.sort((a, b) => a.n - b.n);
  return `<div class="card" style="border-left:6px solid var(--green)">
    <div class="eyebrow">本週的日子</div>
    <h3 class="sub">記得一個人的日子，就是在愛他</h3>
    ${rows.map(r => `<button class="row" data-act="openDraft" data-id="${r.p.id}">
      <span class="grow"><span class="t">${esc(r.p.name)}　${esc(r.what)}</span>
      <span class="s">${r.n === 0 ? '就是今天　—　現在就傳一句祝福' : '還有 ' + r.n + ' 天'}</span></span>
      <span class="arrow">›</span></button>`).join('')}
    <p class="tiny" style="margin-top:8px">屬靈生日是他重生的日子。那一天告訴他你還記得，
    對他是極大的堅固。</p>
  </div>`;
};

})();


/* =========================================================
   小智 · AI 傳福音的屬靈同伴
   針對傳福音的各種不同需要，隨時可問的最佳幫手。
   小智不是聖靈，也不能代替真實的屬靈同伴——他只是陪你想、
   陪你預備，把你和你的 2 一起帶回耶穌面前。
   ========================================================= */



/* =========================================================
   福音卡片工作室
   參考「321愛的關懷」的卡片引擎：版型、邊框、相片、署名、分享。
   撒種階段最自然的一步——把一句合適的話，做成一張圖傳給他。
   ========================================================= */


/* =========================================================
   十全大福帖　　社區關懷．陪談佈道
   把「先談福氣、再談福音」的十帖小冊，整本放進口袋裡。
   內容依印刷版逐頁收錄：五個要方、十帖福氣與禱告良方、
   指點迷津四篇、初信造就、以及陪談使用流程與記錄表。
   ========================================================= */



/* =========================================================
   十全祝福單　　傳遞真愛．傳送祝福
   上帝是賜福的上帝，我們是祝福的天使，別人成為蒙福的人。
   依印刷版逐頁收錄：十全祝福單、使用方法、祝福名單，
   以及每一位蒙福的人的祝福清單、祝福計劃單、祝福成長單。
   ========================================================= */


/* =========================================================
   奇妙的雙手
   十指認十人、雙手抓雙人、至少救一人。
   六隻手三十根手指：捆綁咒詛與釋放祝福、開啟心靈與領受救恩、
   關懷需要與傳講福音。宣告禱告會自動代入他的名字。
   ========================================================= */


/* =========================================================
   啟動
   ========================================================= */
async function boot() {
  applyLook();
  TTS.init();
  /* App 鎖：在任何資料被畫到畫面上之前先擋住 */
  if (G.lockRequired && G.lockRequired()) await G.askUnlock();
  await loadContent();

  if (!C.core) {
    $('#view').innerHTML = `<div class="empty"><div class="big">內容檔載入失敗</div>
      <p class="muted">請確認 data 資料夾與 index.html 放在同一層，並用網址開啟（而非直接雙擊檔案）。</p></div>`;
    return;
  }

  /* 資料庫若被系統清空，先問要不要從本機快照救回 */
  if (G.snapCheck) await G.snapCheck();

  /* 五條守則閘門 */
  if (!S.gateOk) {
    const g = $('#gate');
    $('#gateList').innerHTML = C.core.ethics.map((e, i) =>
      `<li><span class="n">${['一', '二', '三', '四', '五'][i]}</span><span>${esc(e)}</span></li>`).join('');
    g.classList.remove('hidden');
    $('#gateOk').onclick = () => { saveS('gateOk', true); g.classList.add('hidden'); afterGate(); };
  } else afterGate();

  /* 主畫面長按捷徑（manifest shortcuts） */
  const h = (location.hash || '').replace('#', '');
  go(['walk', 'tools', 'cards', 'learn', 'me'].includes(h) ? h : 'today');
  if (h === 'pray') setTimeout(() => ACTS.prayStart && ACTS.prayStart(), 400);
  if (G.snapStart) G.snapStart();
}

function afterGate() {
  /* 備份提醒：超過 30 天 */
  const d = S.lastBackupAt ? daysSince(S.lastBackupAt) : null;
  if (d === null || d > 30) {
    setTimeout(async () => {
      const ps = await DB.all('persons');
      if (!ps.length) return;
      modal(`<h3 class="sub">請備份您的資料</h3>
        <p class="muted">${d === null ? '你還沒有備份過。' : `上次備份已經是 ${d} 天前。`}
        資料只存在這支手機裡，換手機或系統清理都可能遺失。</p>
        <div class="btn-row" style="margin-top:14px">
          <button class="btn quiet" data-act="closeModal">稍後</button>
          <button class="btn gold" data-act="gotoBackup">現在備份</button>
        </div>`);
    }, 1200);
  }
}
ACTS.gotoBackup = () => { closeModal(); go('me'); setTimeout(() => ACTS.openBackup(), 120); };

/* ---------------- 全域事件 ---------------- */
document.querySelectorAll('.nav button').forEach(b =>
  b.addEventListener('click', () => go(b.dataset.tab)));
$('#sheetBack').addEventListener('click', () => popSheet());
$('#speakBtn').addEventListener('click', () => TTS.speak(readableText($('#view'))));
$('#setBtn').addEventListener('click', () => { if (window.__G && window.__G.ACTS.openSettings) window.__G.ACTS.openSettings(); });
$('#sheetSpeak').addEventListener('click', () => TTS.speak(readableText($('#sheetView'))));
$('#frameClose').addEventListener('click', () => {
  $('#frame').classList.add('hidden'); $('#frameBody').src = 'about:blank';
});
$('#frameOpen').addEventListener('click', () => {
  const u = $('#frame').dataset.url; if (u) window.open(u, '_blank', 'noopener');
});
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('input', e => {
  if (e.target.id === 'faqSearch') faqFilter();
});
/* 開啟疑問解答庫後套用目前的分類篩選 */
const _origDraw = SHEETS.faq;
SHEETS.faq = async function (arg) {
  const html = await _origDraw(arg);
  setTimeout(faqFilter, 0);
  return html;
};
window.addEventListener('pagehide', () => TTS.stop());

if ('serviceWorker' in navigator)
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

boot();
})();

