(function () {
'use strict';
const G = window.__G;
const { S, saveS, DB, C, $, uid, esc, nl2br, todayISO, daysSince, fmtDate, fmtAgo, toast,
  seedOfDay, stageOf, VIEWS, SHEETS, ACTS, push, popSheet, closeSheet, refreshSheet,
  render, modal, closeModal, confirmBox } = G;

/* ---------------- 共用查詢 ---------------- */
async function persons() {
  const a = await DB.all('persons');
  return a.sort((x, y) => (x.order || 0) - (y.order || 0) || x.createdAt.localeCompare(y.createdAt));
}
async function byPerson(store, pid) {
  const a = await DB.all(store);
  return a.filter(x => x.personId === pid);
}
async function touch(pid, iso) {
  const p = await DB.get('persons', pid);
  if (!p) return;
  if (!p.lastContactAt || iso > p.lastContactAt) p.lastContactAt = iso;
  p.updatedAt = new Date().toISOString();
  await DB.put('persons', p);
}
function warnClass(p) {
  const n = daysSince(p.lastContactAt);
  if (n === null || n > 30) return 'w30';
  if (n > 14) return 'w14';
  return '';
}
function stageChip(p) {
  const st = stageOf(p.stage);
  return `<span class="chip stage" style="background:${st.color}">${st.id}　${esc(st.name)}</span>`;
}
function personCard(p) {
  const st = stageOf(p.stage);
  const prayDays = p.prayFrom ? daysSince(p.prayFrom) + 1 : 0;
  return `<button class="pcard ${warnClass(p)}" style="border-left-color:${st.color}"
      data-act="openPerson" data-id="${p.id}">
    <div class="nm">${esc(p.name)}</div>
    <div class="meta">${stageChip(p)}
      ${p.relation ? `<span class="chip">${esc(p.relation)}</span>` : ''}
      ${prayDays > 0 ? `<span class="chip">已代禱 ${prayDays} 天</span>` : ''}</div>
    <div class="last">上次接觸：${fmtAgo(p.lastContactAt)}</div>
  </button>`;
}

/* =========================================================
   分頁一　今日
   ========================================================= */
VIEWS.today = async function () {
  const ps = await persons();
  const v = C.core.dailyVerses[seedOfDay(C.core.dailyVerses.length)];
  const fruit = C.prayers.fruits[seedOfDay(C.prayers.fruits.length)];

  /* 今日輪值代禱（每天輪播三位） */
  let todays = [];
  if (ps.length) {
    if (S.rotate && ps.length > 3) {
      const start = seedOfDay(ps.length);
      for (let i = 0; i < 3; i++) todays.push(ps[(start + i) % ps.length]);
    } else todays = ps.slice(0, 3);
  }
  const f920 = todays[0] || ps[0];

  /* 需要關心的人 */
  const cold = ps.filter(p => { const n = daysSince(p.lastContactAt); return n === null || n > 14; })
    .sort((a, b) => (daysSince(b.lastContactAt) ?? 9999) - (daysSince(a.lastContactAt) ?? 9999))
    .slice(0, 4);

  /* 下一步建議 */
  let nextHtml = '';
  if (ps.length) {
    const target = cold[0] || todays[0];
    const st = stageOf(target.stage);
    const tip = st.next[seedOfDay(st.next.length)];
    nextHtml = `<div class="card">
      <div class="eyebrow">下一步建議</div>
      <h3 class="sub">對「${esc(target.name)}」，今天可以做的一件小事</h3>
      <p style="font-size:calc(20px * var(--fs));line-height:1.9">${esc(tip)}</p>
      <p class="tiny">現在的里程：${st.id}　${esc(st.name)}．先禱告，求聖靈引導。</p>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn quiet sm" data-act="openPerson" data-id="${target.id}">打開他的卡片</button>
        <button class="btn sm" data-act="openDraft" data-id="${target.id}">寫訊息</button>
      </div></div>`;
  }

  /* 本週同行 */
  const logs = await DB.all('interactions');
  const wk = todayISO(new Date(Date.now() - 6 * 86400000));
  const wkCount = logs.filter(x => x.date >= wk).length;
  const prayLogs = (await DB.all('logs')).filter(x => x.kind === 'pray');
  const streak = calcStreak(prayLogs.map(x => x.date));
  const prayedToday = prayLogs.some(x => x.date === todayISO());

  return `
  <div class="card">
    <div class="eyebrow">今日經文</div>
    <div class="verse" style="margin-top:2px">${esc(v.text)}<span class="ref">${esc(v.ref)}</span></div>
  </div>

  <div class="card">
    <div class="eyebrow">每日代禱</div>
    <h2 class="sec">為我的 2 禱告</h2>
    ${ps.length ? `<p class="muted">今天輪到：${todays.map(p => esc(p.name)).join('、')}</p>`
      : `<p class="muted">還沒有人在你的名單上。先寫下一個名字，就從那裡開始。</p>`}
    <button class="btn gold" data-act="prayStart" style="margin-top:8px">
      ${prayedToday ? '再禱告一次' : '開始禱告'}</button>
    <p class="tiny" style="margin-top:10px">
      ${streak > 0 ? `已連續 ${streak} 天為他們禱告。` : '禱告是我們唯一完全可以負責的事。'}
    </p>
  </div>

  ${f920 ? `<div class="card">
    <div class="eyebrow">920 每日操練</div>
    <h3 class="sub">今天，對「${esc(f920.name)}」，操練「${esc(fruit.name)}」</h3>
    <p class="muted">${esc(fruit.teach)}</p>
    <div class="verse">${esc(fruit.verse.text)}<span class="ref">${esc(fruit.verse.ref)}</span></div>
    <p style="font-weight:700">今日行動：${esc(fruit.action)}</p>
    <button class="btn quiet" data-act="open920" data-pid="${f920.id}">晚間回顧</button>
  </div>` : ''}

  ${G.daysCard ? await G.daysCard(ps) : ''}

  ${G.newbelieverCard ? await G.newbelieverCard(ps) : ''}

  ${cold.length ? `<div class="card">
    <div class="eyebrow">需要關心的人</div>
    <p class="tiny" style="margin-bottom:10px">這不是責備，只是提醒你別讓愛停在心裡。</p>
    ${cold.map(p => `<button class="row" data-act="openPerson" data-id="${p.id}">
      <span class="grow"><span class="t">${esc(p.name)}</span>
      <span class="s">上次接觸：${fmtAgo(p.lastContactAt)}</span></span>
      <span class="arrow">›</span></button>`).join('')}
  </div>` : ''}

  ${nextHtml}

  ${ps.length ? `<div class="card tight">
    <div class="eyebrow">本週我的同行</div>
    <p class="muted" style="margin:0">這七天，你主動接觸了 ${wkCount} 次，名單上有 ${ps.length} 位。</p>
  </div>` : `<div class="empty">
    <div class="big">先寫下一個名字</div>
    <p class="muted">每一位基督徒的心裡，都有一張看不見的名單。<br>把它變成看得見的，就是第一步。</p>
    <button class="btn" data-act="addPerson" style="margin-top:14px">加入我的第一位 2</button>
  </div>`}

  <p class="tiny" style="text-align:center;margin-top:18px">
    放下手機，去見他一面。<br>App 只是提醒，愛要親自去給。</p>
  `;
};

function calcStreak(dates) {
  const set = new Set(dates);
  let n = 0, d = new Date();
  if (!set.has(todayISO(d))) d = new Date(Date.now() - 86400000);
  while (set.has(todayISO(d))) { n++; d = new Date(d.getTime() - 86400000); }
  return n;
}

/* ---------------- 代禱進行 ---------------- */
SHEETS.pray = async function (arg) {
  const ps = await persons();
  if (!ps.length) return `<div class="empty"><div class="big">名單還是空的</div>
    <p class="muted">先加入一位，我們就從他開始禱告。</p>
    <button class="btn" data-act="addPerson" style="margin-top:12px">加入一位 2</button></div>`;
  const i = Math.max(0, Math.min(+arg.i || 0, ps.length - 1));
  const p = ps[i];
  const items = (await byPerson('prayers', p.id)).filter(x => x.active !== false);
  const st = stageOf(p.stage);
  const tmpl = C.prayers.prayers[seedOfDay(C.prayers.prayers.length)];

  return `
  <div class="card">
    <div class="eyebrow">第 ${i + 1} 位／共 ${ps.length} 位</div>
    <h2 class="sec">${esc(p.name)}</h2>
    <div class="meta" style="display:flex;gap:8px;flex-wrap:wrap">${stageChip(p)}
      ${p.relation ? `<span class="chip">${esc(p.relation)}</span>` : ''}</div>
    ${p.background ? `<p class="muted" style="margin-top:10px">${nl2br(p.background)}</p>` : ''}
  </div>

  ${items.length ? `<div class="card">
    <div class="eyebrow">為這些事求</div>
    ${items.map(x => `<p style="font-size:calc(20px * var(--fs))">・${esc(x.item)}</p>`).join('')}
  </div>` : ''}

  <div class="card">
    <div class="eyebrow">可以這樣禱告</div>
    <p style="white-space:pre-wrap;font-size:calc(20px * var(--fs));line-height:2">${esc(tmpl.text)}</p>
    <p class="tiny" style="margin-top:8px">（${esc(tmpl.title)}．也可以用自己的話說，神聽的是心。）</p>
    <button class="btn quiet sm" data-act="speakThis" style="margin-top:10px;width:100%">🔊 朗讀這段禱告</button>
  </div>

  <div class="card">
    <div class="eyebrow">主動工的記號</div>
    <p class="tiny">看見一點小改變就記下來，日後這些會成為你信心的見證。</p>
    <textarea id="signText" placeholder="例：他今天主動問我週末在忙什麼"></textarea>
    <button class="btn quiet sm" data-act="addSign" data-pid="${p.id}" style="width:100%;margin-top:8px">記下這個記號</button>
  </div>

  <div class="btn-row">
    ${i > 0 ? `<button class="btn quiet" data-act="prayGo" data-i="${i - 1}">‹ 上一位</button>` : ''}
    ${i < ps.length - 1
      ? `<button class="btn" data-act="prayGo" data-i="${i + 1}">下一位 ›</button>`
      : `<button class="btn green" data-act="prayDone">禱告完成，阿們</button>`}
  </div>
  <p class="tiny" style="text-align:center;margin-top:14px">我栽種了，亞波羅澆灌了，惟有神叫他生長。（哥林多前書三章6節）</p>
  `;
};

ACTS.prayStart = () => push('pray', { i: 0 }, '每日代禱');
ACTS.prayGo = d => { G.R_i = +d.i; push('pray', { i: +d.i }, '每日代禱'); };
ACTS.prayDone = async () => {
  const iso = todayISO();
  const logs = await DB.all('logs');
  if (!logs.some(x => x.kind === 'pray' && x.date === iso))
    await DB.put('logs', { id: uid(), kind: 'pray', date: iso });
  closeSheet(); toast('願主記念你的忠心'); render();
};
ACTS.speakThis = (d, el) => {
  const card = el.closest('.card');
  G.TTS.speak(G.readableText(card));
};
ACTS.addSign = async d => {
  const t = $('#signText').value.trim();
  if (!t) { toast('先寫一句再記下'); return; }
  await DB.put('signs', { id: uid(), personId: d.pid, date: todayISO(), text: t });
  $('#signText').value = '';
  toast('記下了。這是主在動工的記號');
};

/* ---------------- 920 晚間回顧 ---------------- */
SHEETS.f920 = async function (arg) {
  const p = await DB.get('persons', arg.pid);
  const fruit = C.prayers.fruits[seedOfDay(C.prayers.fruits.length)];
  const iso = todayISO();
  const logs = (await DB.all('logs')).filter(x => x.kind === 'f920' && x.date === iso);
  const done = logs[0];
  return `
  <div class="card">
    <div class="eyebrow">920 晚間回顧</div>
    <h2 class="sec">今天，對「${esc(p ? p.name : '他')}」，操練「${esc(fruit.name)}」</h2>
    <p style="font-weight:700">今日行動：${esc(fruit.action)}</p>
    <div class="verse">${esc(fruit.verse.text)}<span class="ref">${esc(fruit.verse.ref)}</span></div>
  </div>
  <div class="card">
    <h3 class="sub">今天做到了嗎？發生了什麼？</h3>
    <p class="tiny">一行就好，不用寫得漂亮。</p>
    <textarea id="f920note" placeholder="例：忍住沒有回嘴，他好像有點意外">${done ? esc(done.note || '') : ''}</textarea>
    <div class="btn-row" style="margin-top:10px">
      <button class="btn quiet" data-act="f920save" data-pid="${arg.pid}" data-ok="0">還沒做到</button>
      <button class="btn green" data-act="f920save" data-pid="${arg.pid}" data-ok="1">做到了</button>
    </div>
  </div>
  <p class="tiny" style="text-align:center">不是我努力做好人，是讓基督在我裡面活。</p>`;
};
ACTS.open920 = d => push('f920', { pid: d.pid }, '920 操練');
ACTS.f920save = async d => {
  const note = $('#f920note').value.trim();
  const iso = todayISO();
  const all = await DB.all('logs');
  const old = all.find(x => x.kind === 'f920' && x.date === iso);
  const rec = old || { id: uid(), kind: 'f920', date: iso };
  rec.note = note; rec.ok = d.ok === '1'; rec.personId = d.pid;
  await DB.put('logs', rec);
  closeSheet(); toast(d.ok === '1' ? '感謝主，記下了' : '沒關係，明天再來一次'); render();
};

/* =========================================================
   分頁二　同行
   ========================================================= */
let sortMode = 'cold';
VIEWS.walk = async function () {
  let ps = await persons();
  if (sortMode === 'cold') ps.sort((a, b) => (daysSince(b.lastContactAt) ?? 99999) - (daysSince(a.lastContactAt) ?? 99999));
  if (sortMode === 'stage') ps.sort((a, b) => b.stage.localeCompare(a.stage));
  if (sortMode === 'new') ps.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const counts = {};
  C.core.stages.forEach(s => counts[s.id] = 0);
  ps.forEach(p => counts[p.stage] = (counts[p.stage] || 0) + 1);

  return `
  <div class="btn-row" style="margin-bottom:14px">
    <button class="btn" data-act="addPerson">＋ 加入一位 2</button>
    <button class="btn quiet" data-act="openMap">看七里程地圖</button>
  </div>

  ${ps.length ? `
  <div class="card tight">
    <div class="eyebrow">排序</div>
    <div class="seg">
      <button data-act="setSort" data-m="cold" aria-pressed="${sortMode === 'cold'}">最久沒聯絡</button>
      <button data-act="setSort" data-m="stage" aria-pressed="${sortMode === 'stage'}">里程進度</button>
      <button data-act="setSort" data-m="new" aria-pressed="${sortMode === 'new'}">加入時間</button>
    </div>
  </div>
  ${ps.map(personCard).join('')}
  <div class="card tight">
    <div class="eyebrow">名單分布</div>
    <div class="meta" style="display:flex;flex-wrap:wrap;gap:8px">
      ${C.core.stages.filter(s => counts[s.id]).map(s =>
        `<span class="chip stage" style="background:${s.color}">${s.id} ${esc(s.name)}　${counts[s.id]}</span>`).join('')}
    </div>
    <p class="tiny" style="margin-top:10px">這只是牧養的參考，不是成績。一個靈魂比一百個數字寶貴。</p>
  </div>`
  : `<div class="empty">
      <div class="big">你心裡的那張名單，是誰？</div>
      <p class="muted">父母、配偶、兒女、同事、老同學……<br>先寫下三個名字，就從今天開始。</p>
      <button class="btn" data-act="addPerson" style="margin-top:14px">寫下第一個名字</button>
    </div>`}`;
};
ACTS.setSort = d => { sortMode = d.m; render(); };

/* ---------------- 新增／編輯 ---------------- */
SHEETS.editPerson = async function (arg) {
  const p = arg.id ? await DB.get('persons', arg.id) : null;
  const rel = C.core.relations;
  return `
  <div class="card">
    <div class="field">
      <label for="fName">他的名字或稱呼　<span class="hint">（建議用暱稱或代號，保護他的隱私）</span></label>
      <input type="text" id="fName" value="${p ? esc(p.name) : ''}" placeholder="例：陳大哥、小美、老同學W">
    </div>
    <div class="field">
      <label>關係</label>
      <div class="seg" id="fRel">
        ${rel.map(r => `<button type="button" data-act="pickRel" data-v="${r}"
          aria-pressed="${p && p.relation === r}">${r}</button>`).join('')}
      </div>
    </div>
    <div class="field">
      <label>現在在哪一個里程　<span class="hint">（隨時可以改，可以前進也可以後退）</span></label>
      <div class="seg" id="fStage">
        ${C.core.stages.map(s => `<button type="button" data-act="pickStage" data-v="${s.id}"
          aria-pressed="${(p ? p.stage : 'L0') === s.id}">${s.id}　${s.name}</button>`).join('')}
      </div>
    </div>
    <div class="field">
      <label for="fBirth">生日　<span class="hint">（選填，會提醒你）</span></label>
      <input type="date" id="fBirth" value="${p && p.birthday ? p.birthday : ''}">
    </div>
    <div class="field">
      <label for="fBg">他的背景與難處　<span class="hint">（選填，幫助你記得為什麼要愛他）</span></label>
      <textarea id="fBg" placeholder="家庭、工作、興趣、最近的壓力……">${p ? esc(p.background || '') : ''}</textarea>
    </div>
    <div class="field">
      <label for="fFocus">代禱重點　<span class="hint">（選填）</span></label>
      <textarea id="fFocus" placeholder="例：身體、婚姻、心裡的剛硬" style="min-height:80px">${p ? esc(p.prayerFocus || '') : ''}</textarea>
    </div>
    <div class="field">
      <label>保護這個人的紀錄　<span class="hint">（開啟後，打開他的卡片要再點一下才顯示）</span></label>
      <div class="seg" id="fLock">
        <button type="button" data-act="pickLock" data-v="1" aria-pressed="${!!(p && p.locked)}">隱藏</button>
        <button type="button" data-act="pickLock" data-v="0" aria-pressed="${!(p && p.locked)}">正常顯示</button>
      </div>
    </div>
    <button class="btn" data-act="savePerson" data-id="${p ? p.id : ''}">${p ? '儲存' : '加入名單'}</button>
  </div>
  ${p ? `<div class="card">
    <div class="eyebrow">危險操作</div>
    <p class="tiny">刪除後所有相關的紀錄、代禱、歷程都會一併消失，且無法復原。</p>
    <button class="btn quiet" data-act="delPerson" data-id="${p.id}" data-name="${esc(p.name)}">刪除這個人的所有資料</button>
  </div>` : `<p class="tiny" style="text-align:center">除了名字，其他全部可以略過。<br>記錄的成本要低，愛才走得遠。</p>`}`;
};
let _rel = null, _stage = null;
ACTS.addPerson = () => { _rel = null; _stage = 'L0'; push('editPerson', {}, '加入一位 2'); };
ACTS.editPerson = d => { _rel = null; _stage = null; push('editPerson', { id: d.id }, '編輯資料'); };
ACTS.pickRel = (d, el) => {
  _rel = d.v;
  el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === el));
};
ACTS.pickLock = (d, el) => {
  el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === el));
};
ACTS.pickStage = (d, el) => {
  _stage = d.v;
  el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === el));
};
ACTS.savePerson = async d => {
  const name = $('#fName').value.trim();
  if (!name) { toast('請至少填一個名字或代號'); $('#fName').focus(); return; }
  const now = new Date().toISOString();
  let p = d.id ? await DB.get('persons', d.id) : null;
  const relSel = $('#fRel').querySelector('[aria-pressed="true"]');
  const stSel = $('#fStage').querySelector('[aria-pressed="true"]');
  const stage = _stage || (stSel ? stSel.dataset.v : 'L0');
  const oldStage = p ? p.stage : null;
  if (!p) p = { id: uid(), createdAt: now, prayFrom: todayISO(), order: Date.now() };
  p.name = name;
  p.relation = _rel || (relSel ? relSel.dataset.v : '') || p.relation || '';
  p.stage = stage;
  p.birthday = $('#fBirth').value || '';
  p.background = $('#fBg').value.trim();
  p.prayerFocus = $('#fFocus').value.trim();
  const lkSel = $('#fLock') ? $('#fLock').querySelector('[aria-pressed="true"]') : null;
  p.locked = !!(lkSel && lkSel.dataset.v === '1');
  p.updatedAt = now;
  await DB.put('persons', p);
  if (oldStage && oldStage !== stage)
    await DB.put('milestones', { id: uid(), personId: p.id, fromStage: oldStage, toStage: stage, date: todayISO(), story: '' });
  popSheet(); render();
  toast(d.id ? '已儲存' : `已把「${name}」加入你的名單`);
};
ACTS.delPerson = d => {
  confirmBox('確定要刪除嗎？', `「${d.name}」的所有紀錄、代禱與歷程都會被清除，無法復原。`, '確定刪除', async () => {
    for (const s of ['interactions', 'prayers', 'progress', 'milestones', 'signs']) {
      const rows = await DB.all(s);
      for (const r of rows) if (r.personId === d.id) await DB.del(s, r.id);
    }
    await DB.del('persons', d.id);
    closeSheet(); render(); toast('已刪除');
  }, true);
};

/* ---------------- 個人卡 ---------------- */
SHEETS.person = async function (arg) {
  const p = await DB.get('persons', arg.id);
  if (!p) return '<p class="muted">找不到這個人。</p>';
  const st = stageOf(p.stage);
  const inter = (await byPerson('interactions', p.id)).sort((a, b) => b.date.localeCompare(a.date));
  const prs = (await byPerson('prayers', p.id));
  const mils = (await byPerson('milestones', p.id)).sort((a, b) => b.date.localeCompare(a.date));
  const sgs = (await byPerson('signs', p.id)).sort((a, b) => b.date.localeCompare(a.date));
  const prayDays = p.prayFrom ? daysSince(p.prayFrom) + 1 : 0;
  const tip = st.next[seedOfDay(st.next.length)];
  const hide = !!p.locked && G.revealPid !== p.id;

  return `
  <div class="card">
    <h2 class="sec" style="font-size:calc(27px * var(--fs))">${esc(p.name)}</h2>
    <div class="meta" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
      ${stageChip(p)}${p.relation ? `<span class="chip">${esc(p.relation)}</span>` : ''}
      ${prayDays > 0 ? `<span class="chip">已代禱 ${prayDays} 天</span>` : ''}
    </div>
    <p class="tiny">上次接觸：${fmtAgo(p.lastContactAt)}${p.birthday ? `　．　生日 ${fmtDate(p.birthday)}` : ''}${p.decidedAt ? `　．　屬靈生日 ${fmtDate(p.decidedAt)}` : ''}</p>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn sm" data-act="quickLog" data-id="${p.id}">記一筆</button>
      <button class="btn gold sm" data-act="openDraft" data-id="${p.id}">寫訊息</button>
      <button class="btn quiet sm" data-act="editPerson" data-id="${p.id}">編輯</button>
      <button class="btn quiet sm" data-act="openMapFor" data-id="${p.id}">同行地圖</button>
    </div>
  </div>

  <div class="card">
    <div class="eyebrow">下一步建議</div>
    <p style="font-size:calc(20px * var(--fs));line-height:1.9">${esc(tip)}</p>
    <p class="tiny">先禱告，求聖靈引導；不是你在說服他，是聖靈在感動他。</p>
  </div>

  ${hide ? `<div class="card" style="border-left:6px solid var(--navy)">
    <div class="eyebrow">已保護</div>
    <p class="muted">他的背景、代禱與關心紀錄已設為隱藏，避免旁人不小心看見。</p>
    <button class="btn quiet" data-act="reveal" data-id="${p.id}" style="margin-top:10px">點一下顯示</button>
  </div>` : ''}
  ${!hide && p.background ? `<div class="card"><div class="eyebrow">背景與難處</div>
    <p>${nl2br(p.background)}</p></div>` : ''}

  ${hide ? '' : `<div class="card">
    <div class="eyebrow">代禱事項</div>
    ${p.prayerFocus ? `<p>${nl2br(p.prayerFocus)}</p>` : ''}
    ${prs.length ? prs.map(x => `<button class="row" data-act="togglePrayer" data-id="${x.id}">
      <span class="grow"><span class="t" style="${x.answeredAt ? 'text-decoration:line-through;opacity:.7' : ''}">${esc(x.item)}</span>
      <span class="s">${x.answeredAt ? '已蒙應允　' + fmtDate(x.answeredAt) : '從 ' + fmtDate(x.startedAt) + ' 開始求'}</span></span>
      <span class="arrow">${x.answeredAt ? '✓' : '○'}</span></button>`).join('') : '<p class="tiny">還沒有列出具體的事項。</p>'}
    <div style="display:flex;gap:8px;margin-top:8px">
      <input type="text" id="newPrayer" placeholder="加一項代禱事項">
      <button class="btn sm" data-act="addPrayer" data-id="${p.id}">加入</button>
    </div>
  </div>`}

  ${sgs.length ? `<div class="card"><div class="eyebrow">主動工的記號</div>
    ${sgs.slice(0, 6).map(s => `<p style="margin-bottom:8px">・${esc(s.text)}
      <span class="tiny">（${fmtDate(s.date)}）</span></p>`).join('')}</div>` : ''}

  ${hide ? '' : `<div class="card">
    <div class="eyebrow">關心紀錄</div>
    ${inter.length ? inter.slice(0, 12).map(x => `<div style="padding:10px 0;border-bottom:1px solid var(--line)">
      <div style="font-weight:700">${fmtDate(x.date)}　${esc(x.type || '')}
        ${x.mood ? `<span class="chip" style="margin-left:6px">${esc(moodLabel(x.mood))}</span>` : ''}</div>
      ${x.note ? `<div class="muted">${nl2br(x.note)}</div>` : ''}
    </div>`).join('') : '<p class="tiny">還沒有紀錄。按「記一筆」，一句話就好。</p>'}
  </div>`}

  ${mils.length ? `<div class="card"><div class="eyebrow">里程歷程</div>
    ${mils.map(m => `<p>・${fmtDate(m.date)}　${m.fromStage} → ${m.toStage}
      ${m.story ? `<br><span class="muted">${esc(m.story)}</span>` : ''}</p>`).join('')}</div>` : ''}
  `;
};
function moodLabel(id) { const m = C.core.moods.find(x => x.id === id); return m ? m.label : id; }
ACTS.openPerson = d => { G.revealPid = null; push('person', { id: d.id }, '同行紀錄'); };
ACTS.addPrayer = async d => {
  const t = $('#newPrayer').value.trim();
  if (!t) return;
  await DB.put('prayers', { id: uid(), personId: d.id, item: t, startedAt: todayISO(), answeredAt: null, active: true });
  refreshSheet(); toast('加入了');
};
ACTS.togglePrayer = async d => {
  const x = await DB.get('prayers', d.id);
  if (!x) return;
  if (x.answeredAt) { x.answeredAt = null; await DB.put('prayers', x); refreshSheet(); return; }
  x.answeredAt = todayISO(); await DB.put('prayers', x); refreshSheet();
  toast('感謝主！這是祂動工的記號');
};

/* ---------------- 記一筆 ---------------- */
SHEETS.log = async function (arg) {
  const p = await DB.get('persons', arg.id);
  return `<div class="card">
    <div class="eyebrow">記一筆</div>
    <h2 class="sec">${esc(p.name)}</h2>
    <div class="field">
      <label for="lDate">日期</label>
      <input type="date" id="lDate" value="${todayISO()}">
    </div>
    <div class="field">
      <label>這次是怎麼接觸的</label>
      <div class="seg" id="lType">
        ${C.core.quickNotes.map((t, i) => `<button type="button" data-act="pickType" data-v="${t}"
          aria-pressed="${i === 0}">${t}</button>`).join('')}
      </div>
    </div>
    <div class="field">
      <label>他今天的狀態　<span class="hint">（選填）</span></label>
      <div class="seg" id="lMood">
        ${C.core.moods.map(m => `<button type="button" data-act="pickMood" data-v="${m.id}"
          aria-pressed="false">${m.label}</button>`).join('')}
      </div>
    </div>
    <div class="field">
      <label for="lNote">發生了什麼　<span class="hint">（選填，一行就好）</span></label>
      <textarea id="lNote" placeholder="例：聊到他爸爸住院，他很累"></textarea>
    </div>
    <button class="btn" data-act="saveLog" data-id="${p.id}">記下來</button>
    <p class="tiny" style="margin-top:12px;text-align:center">
      只按「記下來」也算完成。記錄的成本要低，你才走得久。</p>
  </div>`;
};
ACTS.quickLog = d => push('log', { id: d.id }, '記一筆');
ACTS.pickType = (d, el) => el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === el));
ACTS.pickMood = (d, el) => {
  const on = el.getAttribute('aria-pressed') === 'true';
  el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
  el.setAttribute('aria-pressed', on ? 'false' : 'true');
};
ACTS.saveLog = async d => {
  const date = $('#lDate').value || todayISO();
  const type = ($('#lType').querySelector('[aria-pressed="true"]') || {}).dataset;
  const mood = $('#lMood').querySelector('[aria-pressed="true"]');
  await DB.put('interactions', {
    id: uid(), personId: d.id, date,
    type: type ? type.v : '', mood: mood ? mood.dataset.v : '',
    note: $('#lNote').value.trim(), createdAt: new Date().toISOString()
  });
  await touch(d.id, date);
  popSheet(); refreshSheet(); render(); toast('記下了');
};

/* ---------------- 七里程地圖 ---------------- */
SHEETS.map = async function (arg) {
  const p = arg && arg.id ? await DB.get('persons', arg.id) : null;
  const cur = p ? p.stage : null;
  return `
  ${p ? `<div class="card tight"><div class="eyebrow">正在陪伴</div>
    <h3 class="sub" style="margin:0">${esc(p.name)}　現在在 ${cur}　${esc(stageOf(cur).name)}</h3></div>` : ''}
  <div class="card tight">
    <p class="tiny" style="margin:0">這是地圖，不是流水線。人不是產品，聖靈的工作有祂的時間。
    里程可以停留、可以後退，App 只提供方向，絕不催逼。</p>
  </div>
  <div class="path">
    ${C.core.stages.map(s => {
      const on = s.id === cur;
      return `<div class="node ${on ? 'cur' : ''}" style="color:${s.color}">
        <span class="dot"></span>
        <details ${on ? 'open' : ''}>
          <summary><span class="code" style="color:${s.color}">${s.id}</span>
            <span class="nname" style="color:var(--ink)">${esc(s.name)}</span></summary>
          <div class="dbody">
            <p class="muted">${esc(s.state)}</p>
            <p style="font-weight:700">你的角色：${esc(s.role)}</p>
            <p>${esc(s.heart)}</p>
            <p style="font-weight:700;margin-top:10px">四個關鍵行動</p>
            ${s.actions.map(a => `<p style="margin-bottom:4px">・${esc(a)}</p>`).join('')}
            <div class="verse" style="font-size:calc(18px * var(--fs))">
              可以往前的記號：${esc(s.sign)}</div>
            ${p && !on ? `<button class="btn quiet sm" data-act="setStage" data-id="${p.id}" data-s="${s.id}"
              style="width:100%">把「${esc(p.name)}」移到這個里程</button>` : ''}
          </div>
        </details>
      </div>`;
    }).join('')}
  </div>
  <p class="tiny" style="text-align:center">先禱告，求聖靈引導；<br>不是你在說服他，是聖靈在感動他。</p>`;
};
ACTS.openMap = () => push('map', {}, '七里程地圖');
ACTS.openMapFor = d => push('map', { id: d.id }, '七里程地圖');
ACTS.setStage = async d => {
  const p = await DB.get('persons', d.id);
  const from = p.stage;
  modal(`<h3 class="sub">${esc(p.name)}：${from} → ${d.s}</h3>
    <p class="muted">${d.s > from ? '感謝主。' : '沒關係，退一步不是失敗，是誠實。'}要不要記下那一刻發生了什麼？</p>
    <textarea id="milStory" placeholder="（選填）他說了一句什麼、你看見什麼"></textarea>
    <div class="btn-row" style="margin-top:14px">
      <button class="btn quiet" data-act="closeModal">取消</button>
      <button class="btn green" data-act="doSetStage" data-id="${d.id}" data-s="${d.s}">確認</button>
    </div>`);
};
ACTS.doSetStage = async d => {
  const p = await DB.get('persons', d.id);
  const story = ($('#milStory') || {}).value || '';
  const from = p.stage;
  p.stage = d.s; p.updatedAt = new Date().toISOString();
  if ((d.s === 'L3' || d.s === 'L4') && !p.decidedAt) p.decidedAt = todayISO();
  if (d.s === 'L4' && !p.baptizedAt) p.baptizedAt = todayISO();
  await DB.put('persons', p);
  await DB.put('milestones', { id: uid(), personId: p.id, fromStage: from, toStage: d.s, date: todayISO(), story: story.trim() });
  closeModal(); refreshSheet(); render();
  if (d.s === 'L3' || d.s === 'L4') {
    setTimeout(() => modal(`<h3 class="sub">他親口承認耶穌是主</h3>
      <p>感謝主。接下來三十天是黃金期，也是最危險的時期。</p>
      <p class="muted">最重要的一件事：四十八小時之內，主動跟他聯絡一次。</p>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn quiet" data-act="closeModal">知道了</button>
        <button class="btn gold" data-act="openNewbeliever">看初信三十天腳本</button>
      </div>`), 300);
  } else toast('已更新里程');
};

G.persons = persons;
G.byPerson = byPerson;
G.personCard = personCard;
G.stageChip = stageChip;
G.calcStreak = calcStreak;
})();

/* =========== 321福音同行　第三部：工具．學習．我的 =========== */
