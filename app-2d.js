(function () {
'use strict';
var G = window.__G; if (!G) return;
var DB = G.DB, esc = G.esc, uid = G.uid, toast = G.toast, $ = G.$, nl2br = G.nl2br,
    ACTS = G.ACTS, VIEWS = G.VIEWS, SHEETS = G.SHEETS, push = G.push, popSheet = G.popSheet,
    refreshSheet = G.refreshSheet, closeSheet = G.closeSheet, render = G.render,
    todayISO = G.todayISO, fmtDate = G.fmtDate, confirmBox = G.confirmBox, modal = G.modal,
    closeModal = G.closeModal, S = G.S, saveS = G.saveS;

/* ---------------- 十項福氣 ---------------- */
var B10 = [
  { id:'b1', n:'罪得赦免', ten:'t1', ask:'心靈自由',
    v:{ t:'得赦免其過、遮蓋其罪的，這人是有福的。', r:'詩篇三十二篇1節' },
    p:'求您赦免{名}一切的過犯，洗淨他一切的不義，釋放他的心靈得著真自由。' },
  { id:'b2', n:'平安喜樂', ten:'t2', ask:'心靈滿足',
    v:{ t:'我留下平安給你們，我將我的平安賜給你們。', r:'約翰福音十四章27節' },
    p:'求您把在基督裡的平安、在聖靈裡的喜樂，充滿{名}的心，除去他一切的憂慮和恐懼。' },
  { id:'b3', n:'病得醫治', ten:'t3', ask:'身體健康',
    v:{ t:'因他受的刑罰，我們得平安；因他受的鞭傷，我們得醫治。', r:'以賽亞書五十三章5節' },
    p:'求您藉著主耶穌所受的鞭傷，醫治{名}的疾病，賜他身體康健、心靈剛強。' },
  { id:'b4', n:'愛情如意', ten:'t4', ask:'感情美滿',
    v:{ t:'愛情，眾水不能息滅，大水也不能淹沒。', r:'雅歌八章7節' },
    p:'求您帶領{名}的感情，賜他無私捨己的愛，也為他預備一生真心相愛的伴侶。' },
  { id:'b5', n:'家庭和樂', ten:'t5', ask:'家庭幸福',
    v:{ t:'看哪，弟兄和睦同居是何等地善，何等地美！', r:'詩篇一百三十三篇1節' },
    p:'求您賜福{名}的家庭，使他們夫妻恩愛、兒女孝順、彼此饒恕、和睦相愛。' },
  { id:'b6', n:'人緣良好', ten:'t6', ask:'得人喜愛',
    v:{ t:'若是能行，總要盡力與眾人和睦。', r:'羅馬書十二章18節' },
    p:'求您賜福{名}的人際關係，使他能與眾人和睦，得眾人的喜愛，也成為別人的祝福。' },
  { id:'b7', n:'事業成功', ten:'t7', ask:'功成名就',
    v:{ t:'他要像一棵樹栽在溪水旁，按時候結果子…凡他所做的盡都順利。', r:'詩篇一篇3節' },
    p:'求您賜福{名}的工作事業，道路亨通、凡事順利、居上不居下、作首不作尾。' },
  { id:'b8', n:'凡事富足', ten:'t8', ask:'生活富足',
    v:{ t:'耶和華所賜的福使人富足，並不加上憂慮。', r:'箴言十章22節' },
    p:'求您賜福{名}凡事富足、一無所缺，不背負債務，也能多多施捨幫助別人。' },
  { id:'b9', n:'經歷神能', ten:'t9', ask:'生命剛強',
    v:{ t:'但聖靈降臨在你們身上，你們就必得著能力。', r:'使徒行傳一章8節' },
    p:'求您讓{名}經歷您奇妙的大能，在苦難中看見您把壞事變好事，生命重生剛強。' },
  { id:'b10', n:'得到永生', ten:'t10', ask:'永恆生命',
    v:{ t:'神愛世人，甚至將他的獨生子賜給他們，叫一切信他的，不至滅亡，反得永生。', r:'約翰福音三章16節' },
    p:'求您開啟{名}的心，使他認識耶穌、接受耶穌、相信耶穌，得著永遠的生命。' }
];

var CATS = [['fam','家人'], ['rel','親戚'], ['fri','朋友'], ['nei','鄰居'], ['acq','認識的人']];

var PLAN = [
  ['act',  '祝福行動', '對他表達祝福的行動', '例：打電話問候、傳簡訊關懷、去他家探訪、幫他做一件事'],
  ['acti', '祝福活動', '和他一起享受祝福的活動', '例：一起吃飯、一起走走、一起運動、一起去玩'],
  ['shr',  '祝福分享', '向他分享祝福的事物', '例：分享好文章、詩歌、影片、你的心靈感受、你的見證'],
  ['inv',  '祝福邀請', '邀請他往前及成長', '例：邀請他來聚會、決志信主、接受陪讀、報名受洗']
];

var GROW = [
  ['g1', '十全大福帖陪讀', '用十全大福帖帶他接受耶穌並開始陪讀。一次陪讀兩項福氣及後面內容，五次陪讀完。'],
  ['g2', '心靈絮語陪讀', '鼓勵他每天讀一篇，每週和他見面陪讀十大理由的文章，幫他建立靈修會主的習慣。'],
  ['g3', '開始你的新生命', '和他每週一次陪讀「開始你的新生命」，七次陪讀完，目標鼓勵他受洗。'],
  ['g4', '參加受洗班', '當他決定受洗時，帶領他向教會報名受洗及參加受洗班課程。'],
  ['g5', '參加更新營', '陪他參加更新營，幫他脫去舊人穿上新人，得著醫治釋放，經歷被聖靈充滿。']
];

/* ---------------- 資料 ---------------- */
var NAMES_ID = 'bless-names';

async function getNames() {
  var r = null;
  try { r = await DB.get('logs', NAMES_ID); } catch (e) {}
  if (!r || r.kind !== 'blessNames') r = { id: NAMES_ID, kind: 'blessNames', cats: {} };
  CATS.forEach(function (c) { if (!Array.isArray(r.cats[c[0]])) r.cats[c[0]] = []; });
  return r;
}
async function putNames(r) { r.updatedAt = new Date().toISOString(); await DB.put('logs', r); }

async function sheets() {
  var all = [];
  try { all = await DB.all('logs'); } catch (e) {}
  return all.filter(function (x) { return x.kind === 'bless'; })
            .sort(function (a, b) { return String(a.createdAt).localeCompare(String(b.createdAt)); });
}
function blank(name, pid) {
  var r = { id: uid(), kind: 'bless', name: name || '', personId: pid || '',
    angel: S.blessAngel || '', date: todayISO(), b: {}, need: {}, prayN: 0,
    act: [], acti: [], shr: [], inv: [], grow: {},
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  B10.forEach(function (x) { r.b[x.id] = 0; r.need[x.id] = ''; });
  GROW.forEach(function (g) { r.grow[g[0]] = { s: '', e: '', m: '', o: '' }; });
  return r;
}
function fix(r) {
  if (!r.b) r.b = {}; if (!r.need) r.need = {}; if (!r.grow) r.grow = {};
  B10.forEach(function (x) { if (r.b[x.id] == null) r.b[x.id] = 0; if (r.need[x.id] == null) r.need[x.id] = ''; });
  GROW.forEach(function (g) { if (!r.grow[g[0]]) r.grow[g[0]] = { s: '', e: '', m: '', o: '' }; });
  PLAN.forEach(function (p) { if (!Array.isArray(r[p[0]])) r[p[0]] = []; });
  if (typeof r.prayN !== 'number') r.prayN = 0;
  return r;
}

var cur = null;   /* 正在編輯的祝福單 */

async function load(id) {
  var r = await DB.get('logs', id);
  cur = r ? fix(r) : null;
  return cur;
}
async function save(msg) {
  if (!cur) return;
  cur.updatedAt = new Date().toISOString();
  await DB.put('logs', cur);
  if (msg) toast(msg);
}
function val(id) { var el = document.getElementById(id); return el ? el.value : null; }

function picked(r) {
  return B10.filter(function (x) { return r.b[x.id] > 0; });
}
function doneCount(r) {
  var n = 0;
  PLAN.forEach(function (p) { (r[p[0]] || []).forEach(function (it) { if (it.ok) n++; }); });
  return n;
}
function zheng(n) {
  var f = Math.floor(n / 5), r = n % 5, s = '', i;
  for (i = 0; i < f; i++) s += '正';
  return { s: s, f: f, r: r };
}

/* =========================================================
   一、十全祝福單首頁
   ========================================================= */
SHEETS.blIndex = async function () {
  var rows = await sheets();
  var nm = await getNames();
  var total = 0, circled = 0;
  CATS.forEach(function (c) {
    nm.cats[c[0]].forEach(function (x) { total++; if (x.ok) circled++; });
  });

  return '<div class="card">'
    + '<div class="eyebrow">傳遞真愛．傳送祝福</div>'
    + '<h2 class="sec">十全祝福單</h2>'
    + '<p style="line-height:2">上帝是一位賜福的上帝。祂創造亞當之後，第一件事就是祝福亞當；'
    + '救贖挪亞之後，第一件事就是祝福挪亞；揀選亞伯拉罕之後，第一件事就是祝福亞伯拉罕。'
    + '上帝向我們所懷的意念，都是賜福賜平安的意念。</p>'
    + '<p style="line-height:2">所以我們要成為別人的祝福天使，將上帝所要賜的福傳給別人，使別人成為蒙福的人。'
    + '別人可能會拒絕耶穌、拒絕福音，但是沒有人拒絕真愛、拒絕祝福。</p>'
    + '<div class="verse" style="text-align:center;font-weight:700">'
    + '上帝是賜福的上帝<br>我們是祝福的天使<br>別人成為蒙福的人</div>'
    + '<p class="tiny" style="margin-top:8px">原則：先談福氣再談福音，先得福音再得福氣。</p>'
    + '</div>'

    + '<div class="card">'
    + '<button class="btn quiet" data-act="blHow" style="width:100%">📖 使用方法</button>'
    + '<button class="btn" data-act="blNames" style="width:100%;margin-top:10px">'
    + '📝 祝福名單' + (total ? '（' + total + ' 人，圈選 ' + circled + '）' : '') + '</button>'
    + '</div>'

    + '<div class="card">'
    + '<div class="eyebrow">我的祝福單　' + rows.length + ' 張</div>'
    + '<h3 class="sub">正在祝福的人</h3>'
    + (rows.length
        ? rows.map(function (r) {
            r = fix(r);
            var ps = picked(r);
            return '<button class="row" data-act="blOpen" data-id="' + esc(r.id) + '">'
              + '<span class="grow"><span class="t">' + esc(r.name || '未具名') + '</span>'
              + '<span class="s">福氣 ' + ps.length + ' 項　禱告 ' + r.prayN + ' 次　完成 ' + doneCount(r) + ' 件</span></span>'
              + '<span class="arrow">›</span></button>';
          }).join('')
        : '<div class="empty"><div class="big">還沒有祝福單</div>'
          + '<p class="muted">先寫祝福名單，再邀請一位願意接受祝福的人，為他開一張。</p></div>')
    + '<button class="btn gold" data-act="blNew" style="margin-top:12px">＋ 新增一位蒙福的人</button>'
    + '</div>'

    + '<div class="card tight"><p class="tiny" style="margin:0">'
    + '祝福不是我們有多好，是上帝有多好。無己才能祝福，無己讓耶穌在裡面活，'
    + '所以我們祝福人的時候，是耶穌在祝福他。</p></div>';
};
ACTS.openBless = function () { push('blIndex', {}, '十全祝福單'); };

/* =========================================================
   二、使用方法
   ========================================================= */
SHEETS.blHow = async function () {
  function box(t, b) {
    return '<div class="card"><h3 class="sub">「' + esc(t) + '」</h3>'
      + '<p style="line-height:2">' + esc(b) + '</p></div>';
  }
  return '<div class="card"><div class="eyebrow">使用方法</div>'
    + '<h2 class="sec">四張單子，一條祝福的路</h2>'
    + '<p class="muted">名單找人、清單問需要、計劃單去做、成長單陪他長大。</p></div>'

    + box('祝福名單', '從自己的人際關係網絡，包括家人、親戚、朋友、鄰居和認識的人中間，禱告尋求上帝的帶領，寫下心中浮現的人名。從這些名單中去邀請願意接受我們祝福的人，將他的名字圈起來。')
    + box('祝福清單', '詢問願意接受祝福的人，勾選他所需要的福氣。並且問他關於這項福氣，他目前的需要及所遇到的問題，將重點寫在表格裡。在祝福天使後面簽寫自己的名字，在蒙福的人後面簽寫他的名字，並寫下彼此委身祝福的日期。')

    + '<div class="card"><div class="eyebrow">祝福計劃單</div>'
    + '<h3 class="sub">祝福禱告</h3>'
    + '<p style="line-height:2">為他奉主的名憑著信心，按著上帝的應許，照著他的需要，為他祝福禱告。'
    + '使用天國的鑰匙關閉陰間的門，捆綁從罪惡及撒但來的一切不好的事情；打開天國的門，'
    + '釋放從福音及上帝來的一切美好的事情。倚靠聖靈的引導，用心靈的眼睛看見他蒙福的光景，'
    + '憑信心宣告，信是得著就必得著。每次禱告完，就在正字上劃一筆。</p></div>'

    + PLAN.slice(0).map(function (p) {
        return '<div class="card"><h3 class="sub">' + esc(p[1]) + '</h3>'
          + '<p style="line-height:2">' + esc(p[2]) + '。' + esc(p[3]) + '。'
          + '將計劃寫在空格並標註日期，完成後打勾。</p></div>';
      }).join('')

    + '<div class="card"><div class="eyebrow">祝福成長單</div>'
    + '<h3 class="sub">陪他一路長大</h3>'
    + GROW.map(function (g) {
        return '<p style="line-height:2"><b style="color:var(--gold-t)">【' + esc(g[1]) + '】</b>'
          + esc(g[2]) + '</p>';
      }).join('')
    + '</div>'

    + '<div class="card tight"><p class="tiny" style="margin:0">'
    + '先生命、再關係、後事工。祝福是關係的開始，不是事工的業績。</p></div>';
};
ACTS.blHow = function () { push('blHow', {}, '使用方法'); };

/* =========================================================
   三、祝福名單
   ========================================================= */
SHEETS.blNames = async function () {
  var nm = await getNames();
  return '<div class="card">'
    + '<div class="eyebrow">祝福名單</div>'
    + '<h2 class="sec">禱告寫下心中浮現的人</h2>'
    + '<p class="muted">從家人、親戚、朋友、鄰居和認識的人當中，禱告尋求上帝的帶領。'
    + '願意接受你祝福的人，把他「圈起來」。</p></div>'

    + CATS.map(function (c) {
        var arr = nm.cats[c[0]];
        return '<div class="card">'
          + '<div class="eyebrow">' + esc(c[1]) + '　' + arr.length + ' 人</div>'
          + (arr.length
              ? arr.map(function (x, i) {
                  return '<div class="row" style="margin-bottom:8px">'
                    + '<button class="btn sm ' + (x.ok ? 'gold' : 'quiet') + '" data-act="blCircle" data-c="'
                    + c[0] + '" data-i="' + i + '" style="min-width:76px">'
                    + (x.ok ? '◯已圈' : '圈選') + '</button>'
                    + '<span class="grow"><span class="t">' + esc(x.n) + '</span></span>'
                    + '<button class="btn sm quiet" data-act="blNameDel" data-c="' + c[0]
                    + '" data-i="' + i + '">刪</button></div>'
                    + (x.ok ? '<button class="btn sm" data-act="blFromName" data-n="' + esc(x.n)
                        + '" style="width:100%;margin:-4px 0 12px">為 ' + esc(x.n) + ' 開一張祝福單</button>' : '');
                }).join('')
              : '<p class="tiny">還沒有寫下名字。</p>')
          + '<div class="field" style="margin:10px 0 0"><label for="blN_' + c[0] + '" class="tiny">加一個' + esc(c[1]) + '</label>'
          + '<input type="text" id="blN_' + c[0] + '" placeholder="寫下他的名字" autocomplete="off"></div>'
          + '<button class="btn quiet sm" data-act="blNameAdd" data-c="' + c[0] + '" style="width:100%">＋ 加入名單</button>'
          + '</div>';
      }).join('')

    + '<div class="card">'
    + '<button class="btn quiet" data-act="blToList" style="width:100%">把圈選的人加入「同行」名單</button>'
    + '<p class="tiny" style="margin-top:10px">名單只存在這支手機裡，會隨「我的－備份與還原」一起匯出。</p>'
    + '</div>';
};
ACTS.blNames = function () { push('blNames', {}, '祝福名單'); };

ACTS.blNameAdd = async function (d) {
  var el = document.getElementById('blN_' + d.c);
  var n = el ? el.value.trim() : '';
  if (!n) { toast('請先寫下名字'); if (el) el.focus(); return; }
  var nm = await getNames();
  nm.cats[d.c].push({ n: n, ok: false });
  await putNames(nm); refreshSheet(); toast('已加入名單');
};
ACTS.blCircle = async function (d) {
  var nm = await getNames();
  var x = nm.cats[d.c][+d.i]; if (!x) return;
  x.ok = !x.ok;
  await putNames(nm); refreshSheet();
};
ACTS.blNameDel = async function (d) {
  var nm = await getNames();
  var x = nm.cats[d.c][+d.i]; if (!x) return;
  confirmBox('把「' + x.n + '」從名單移除？', '祝福單不會被刪除。', '確定移除', async function () {
    var n2 = await getNames();
    n2.cats[d.c].splice(+d.i, 1);
    await putNames(n2); refreshSheet(); toast('已移除');
  }, true);
};
ACTS.blToList = async function () {
  var nm = await getNames(), all = [];
  CATS.forEach(function (c) { nm.cats[c[0]].forEach(function (x) { if (x.ok) all.push(x.n); }); });
  if (!all.length) { toast('還沒有圈選任何人'); return; }
  var ps = await DB.all('persons'), have = {};
  ps.forEach(function (p) { have[p.name] = 1; });
  var add = [];
  all.forEach(function (n) { if (!have[n] && add.indexOf(n) < 0) add.push(n); });
  if (!add.length) { toast('名單裡都已經有了'); return; }
  confirmBox('加入同行名單？', '會把還沒在名單上的 ' + add.length + ' 個名字加進去：\n' + add.join('、'),
    '確定加入', async function () {
      var now = new Date().toISOString(), i;
      for (i = 0; i < add.length; i++) {
        await DB.put('persons', { id: uid(), name: add[i], relation: '', stage: 'L0',
          background: '', prayerFocus: '', createdAt: now, updatedAt: now,
          prayFrom: todayISO(), order: Date.now() + i });
      }
      render(); toast('已加入 ' + add.length + ' 位');
    });
};

/* =========================================================
   四、新增一張祝福單
   ========================================================= */
ACTS.blNew = async function () {
  var ps = await DB.all('persons');
  ps.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  modal('<h3 class="sub">為誰開一張祝福單</h3>'
    + '<div class="field"><label for="blNewName">蒙福的人</label>'
    + '<input type="text" id="blNewName" placeholder="寫下他的名字" autocomplete="off"></div>'
    + (ps.length ? '<div class="field"><label for="blNewPid">或從同行名單中選<span class="hint">選了會一起記進他的紀錄</span></label>'
        + '<select id="blNewPid"><option value="">不指定</option>'
        + ps.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>'; }).join('')
        + '</select></div>' : '')
    + '<div class="field"><label for="blNewAngel">祝福天使（你的名字）</label>'
    + '<input type="text" id="blNewAngel" value="' + esc(S.blessAngel || '') + '" autocomplete="off"></div>'
    + '<div class="btn-row"><button class="btn quiet" data-act="closeModal">取消</button>'
    + '<button class="btn gold" data-act="blNewOk">開始祝福他</button></div>');
};
ACTS.blNewOk = async function () {
  var name = (val('blNewName') || '').trim();
  var pid = val('blNewPid') || '';
  var angel = (val('blNewAngel') || '').trim();
  if (!name && pid) { var p = await DB.get('persons', pid); if (p) name = p.name; }
  if (!name) { toast('請先寫下他的名字'); return; }
  if (angel) saveS('blessAngel', angel);
  var r = blank(name, pid); r.angel = angel;
  await DB.put('logs', r);
  cur = r; closeModal(); refreshSheet();
  push('blSheet', { id: r.id }, name + '　祝福單');
};
ACTS.blFromName = async function (d) {
  var rows = await sheets(), i;
  for (i = 0; i < rows.length; i++) {
    if (rows[i].name === d.n) { cur = fix(rows[i]); push('blSheet', { id: rows[i].id }, d.n + '　祝福單'); return; }
  }
  var r = blank(d.n, '');
  await DB.put('logs', r); cur = r;
  push('blSheet', { id: r.id }, d.n + '　祝福單');
};
ACTS.blOpen = function (d) { push('blSheet', { id: d.id }, '祝福單'); };

/* =========================================================
   五、一張祝福單（總覽）
   ========================================================= */
SHEETS.blSheet = async function (arg) {
  var r = await load(arg.id);
  if (!r) return '<p class="muted">找不到這一張祝福單。</p>';
  var ps = picked(r), z = zheng(r.prayN);
  return '<div class="card">'
    + '<div class="eyebrow">蒙福的人</div>'
    + '<h2 class="sec">' + esc(r.name || '未具名') + '</h2>'
    + '<p class="muted">祝福天使：' + esc(r.angel || '—') + '　　委身日期：' + esc(fmtDate(r.date)) + '</p>'
    + '<p style="margin-top:8px">' + (ps.length
        ? '他要的福氣：<b>' + esc(ps.map(function (x) { return x.n; }).join('、')) + '</b>'
        : '<span class="muted">還沒有勾選福氣，先去問問他。</span>') + '</p>'
    + '</div>'

    + '<div class="card" style="text-align:center">'
    + '<div class="eyebrow">祝福禱告</div>'
    + '<div style="font-size:calc(34px * var(--fs));line-height:1.5;letter-spacing:4px;font-weight:700;'
    + 'color:var(--gold-t);word-break:break-all;min-height:1.5em">' + (z.s || '　') + '</div>'
    + '<p class="tiny">已經為他禱告 ' + r.prayN + ' 次'
    + (z.f ? '（' + z.f + ' 個正字' + (z.r ? '又 ' + z.r + ' 筆' : '') + '）' : '') + '</p>'
    + '<button class="btn gold" data-act="blPray" style="margin-top:8px">🙏 我為他禱告了，劃一筆</button>'
    + '</div>'

    + '<div class="card">'
    + '<button class="btn" data-act="blList" style="width:100%">① 祝福清單　他需要什麼福氣</button>'
    + '<button class="btn" data-act="blPlan" style="width:100%;margin-top:10px">② 祝福計劃單　行動．活動．分享．邀請</button>'
    + '<button class="btn" data-act="blGrow" style="width:100%;margin-top:10px">③ 祝福成長單　陪他一路長大</button>'
    + '</div>'

    + '<div class="card">'
    + '<div class="eyebrow">一起用</div>'
    + '<button class="btn quiet" data-act="blPrayView" style="width:100%">📿 為他讀一遍祝福禱告文</button>'
    + '<button class="btn quiet" data-act="blShare" style="width:100%;margin-top:10px">📤 把這張祝福單傳給他</button>'
    + '<button class="btn quiet" data-act="blHands" style="width:100%;margin-top:10px">🙌 用奇妙的雙手為他禱告</button>'
    + '</div>'

    + '<div class="card tight">'
    + '<button class="btn quiet sm" data-act="blDel" data-id="' + esc(r.id) + '" style="width:100%">刪除這張祝福單</button>'
    + '</div>';
};
ACTS.blPray = async function () {
  if (!cur) return;
  cur.prayN = (cur.prayN || 0) + 1;
  cur.lastPrayAt = todayISO();
  await save();
  refreshSheet();
  toast('第 ' + cur.prayN + ' 筆．信是得著就必得著');
};
ACTS.blDel = function (d) {
  confirmBox('刪除這張祝福單？', '上面的清單、計劃與成長紀錄都會一併清除，無法復原。', '確定刪除', async function () {
    await DB.del('logs', d.id); cur = null; popSheet(); toast('已刪除');
  }, true);
};
ACTS.blHands = function () {
  var n = cur ? cur.name : '';
  if (window.__G && ACTS.hForPerson) { ACTS.hForPerson({ n: n }); return; }
  if (ACTS.openHands) ACTS.openHands();
};

/* ---------------- 祝福禱告文 ---------------- */
function fill(t, n) { return String(t).replace(/\{名\}/g, n || '他'); }
function prayText(r) {
  var ps = picked(r);
  if (!ps.length) ps = B10.slice(0, 2);
  return '天父上帝，我奉主耶穌基督的名，為' + (r.name || '他') + '祝福禱告。\n\n'
    + ps.map(function (x) {
        return '【' + x.n + '】' + fill(x.p, r.name)
          + (r.need[x.id] ? '\n他目前的需要：' + r.need[x.id] : '');
      }).join('\n\n')
    + '\n\n我奉主耶穌的名捆綁一切從罪惡和撒但來攔阻他的事情，'
    + '也打開天國的門，釋放一切從福音和上帝來的美好事情臨到他。'
    + '願一切的榮耀都歸給主耶穌。奉主耶穌基督的名禱告，阿們！';
}
SHEETS.blPrayView = async function () {
  var r = cur; if (!r) return '<p class="muted">請先打開一張祝福單。</p>';
  var ps = picked(r);
  return '<div class="card"><div class="eyebrow">憑信心宣告</div>'
    + '<h2 class="sec">為' + esc(r.name || '他') + '的祝福禱告</h2>'
    + '<p class="muted">用心靈的眼睛看見他蒙福的光景，信是得著，就必得著。</p></div>'
    + (ps.length ? ps : B10.slice(0, 2)).map(function (x) {
        return '<div class="card"><div class="eyebrow">' + esc(x.n) + '</div>'
          + '<div class="verse">' + esc(x.v.t) + '<span class="ref">' + esc(x.v.r) + '</span></div>'
          + '<p style="font-size:calc(20px * var(--fs));line-height:2;margin-top:10px">'
          + esc(fill(x.p, r.name)) + '</p>'
          + (r.need[x.id] ? '<p class="tiny">他目前的需要：' + esc(r.need[x.id]) + '</p>' : '')
          + '</div>';
      }).join('')
    + '<div class="card"><p style="line-height:2">我奉主耶穌的名捆綁一切從罪惡和撒但來攔阻他的事情，'
    + '也打開天國的門，釋放一切從福音和上帝來的美好事情臨到他。願一切的榮耀都歸給主耶穌。阿們！</p>'
    + '<button class="btn gold" data-act="blPray" style="margin-top:12px">🙏 禱告完了，劃一筆</button>'
    + '<button class="btn quiet" data-act="blCopyPray" style="margin-top:10px">複製這篇禱告文</button></div>';
};
ACTS.blPrayView = function () { push('blPrayView', {}, '祝福禱告'); };
ACTS.blCopyPray = function () {
  if (!cur) return;
  var t = prayText(cur);
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast('已複製'); });
  else toast('請長按文字複製');
};
ACTS.blShare = function () {
  if (!cur) return;
  var ps = picked(cur);
  var t = '【十全祝福單】\n蒙福的人：' + (cur.name || '') + '\n祝福天使：' + (cur.angel || '')
    + '\n日期：' + cur.date + '\n\n'
    + (ps.length ? '願上帝把這些福氣賜給你：\n' + ps.map(function (x) { return '．' + x.n; }).join('\n') + '\n\n' : '')
    + '我願意常常為你祝福，願上帝賜福您。';
  if (navigator.share) navigator.share({ text: t }).catch(function () {});
  else if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast('已複製，可以貼到 LINE'); });
  else toast('請長按文字複製');
};

/* =========================================================
   六、祝福清單
   ========================================================= */
function readList() {
  if (!cur) return;
  var v;
  v = val('blName'); if (v != null) cur.name = v.trim();
  v = val('blAngel'); if (v != null) { cur.angel = v.trim(); if (cur.angel) saveS('blessAngel', cur.angel); }
  v = val('blDate'); if (v != null) cur.date = v;
  B10.forEach(function (x) {
    var t = val('blNeed_' + x.id);
    if (t != null) cur.need[x.id] = t.trim();
  });
}
SHEETS.blList = async function () {
  var r = cur; if (!r) return '<p class="muted">請先打開一張祝福單。</p>';
  return '<div class="card">'
    + '<div class="eyebrow">祝福清單</div>'
    + '<h2 class="sec">您需要什麼福氣，可以讓我為您祝福</h2>'
    + '<p class="muted">需要的福氣畫圈，成就的福氣畫十。<br>問他：關於這項，您現在最需要的是什麼？然後安靜地聽他說完。</p>'
    + '<div class="field" style="margin-top:14px"><label for="blName">蒙福的人</label>'
    + '<input type="text" id="blName" value="' + esc(r.name) + '" autocomplete="off"></div>'
    + '<div class="field"><label for="blAngel">祝福天使</label>'
    + '<input type="text" id="blAngel" value="' + esc(r.angel) + '" autocomplete="off"></div>'
    + '<div class="field"><label for="blDate">委身祝福的日期</label>'
    + '<input type="date" id="blDate" value="' + esc(r.date) + '"></div>'
    + '</div>'

    + B10.map(function (x) {
        var st = r.b[x.id] || 0;
        return '<div class="card">'
          + '<h3 class="sub">' + esc(x.n) + '<span class="tiny">　' + esc(x.ask) + '</span></h3>'
          + '<div class="seg" style="margin-bottom:10px">'
          + '<button data-act="blMark" data-id="' + x.id + '" data-v="1" aria-pressed="' + (st === 1) + '">◯ 他需要</button>'
          + '<button data-act="blMark" data-id="' + x.id + '" data-v="2" aria-pressed="' + (st === 2) + '">✝ 已成就</button>'
          + '</div>'
          + '<div class="field" style="margin:0"><label for="blNeed_' + x.id + '" class="tiny">目前的需要</label>'
          + '<textarea id="blNeed_' + x.id + '" style="min-height:80px" placeholder="他說了什麼，寫重點就好">'
          + esc(r.need[x.id]) + '</textarea></div>'
          + '</div>';
      }).join('')

    + '<div class="card">'
    + '<button class="btn gold" data-act="blSaveList" style="width:100%">儲存祝福清單</button>'
    + '<p class="tiny" style="margin-top:10px">先談福氣，再談福音；先得福音，再得福氣。</p></div>';
};
ACTS.blList = function () { push('blList', {}, '祝福清單'); };
ACTS.blMark = async function (d) {
  if (!cur) return;
  readList();
  var v = +d.v;
  cur.b[d.id] = (cur.b[d.id] === v) ? 0 : v;
  await save(); refreshSheet();
};
ACTS.blSaveList = async function () { readList(); await save('祝福清單已儲存'); refreshSheet(); };

/* =========================================================
   七、祝福計劃單
   ========================================================= */
SHEETS.blPlan = async function () {
  var r = cur; if (!r) return '<p class="muted">請先打開一張祝福單。</p>';
  var z = zheng(r.prayN);
  return '<div class="card">'
    + '<div class="eyebrow">祝福計劃單</div>'
    + '<h2 class="sec">為' + esc(r.name || '他') + '的祝福計劃</h2>'
    + '<p class="muted">前面空格寫下計劃，完成後打勾。</p></div>'

    + '<div class="card" style="text-align:center">'
    + '<div class="eyebrow">祝福禱告</div>'
    + '<div style="font-size:calc(34px * var(--fs));line-height:1.5;letter-spacing:4px;font-weight:700;'
    + 'color:var(--gold-t);word-break:break-all;min-height:1.5em">' + (z.s || '　') + '</div>'
    + '<p class="tiny">' + r.prayN + ' 次'
    + (z.r ? '（另有 ' + z.r + ' 筆）' : '') + '</p>'
    + '<div class="btn-row" style="margin-top:8px">'
    + '<button class="btn gold" data-act="blPray">🙏 劃一筆</button>'
    + '<button class="btn quiet" data-act="blPrayMinus">－ 劃錯了</button></div></div>'

    + PLAN.map(function (p) {
        var arr = r[p[0]] || [];
        return '<div class="card">'
          + '<div class="eyebrow">' + esc(p[2]) + '</div>'
          + '<h3 class="sub">' + esc(p[1]) + '</h3>'
          + (arr.length
              ? arr.map(function (it, i) {
                  return '<div class="row" style="margin-bottom:8px">'
                    + '<button class="btn sm ' + (it.ok ? 'green' : 'quiet') + '" data-act="blItemOk" data-k="'
                    + p[0] + '" data-i="' + i + '" style="min-width:60px">' + (it.ok ? '✓' : '　') + '</button>'
                    + '<span class="grow"><span class="t" style="' + (it.ok ? 'text-decoration:line-through;opacity:.65' : '') + '">'
                    + esc(it.t) + '</span>'
                    + (it.d ? '<span class="s">' + esc(fmtDate(it.d)) + '</span>' : '') + '</span>'
                    + '<button class="btn sm quiet" data-act="blItemDel" data-k="' + p[0]
                    + '" data-i="' + i + '">刪</button></div>';
                }).join('')
              : '<p class="tiny">還沒有計劃。' + esc(p[3]) + '</p>')
          + '<div class="field" style="margin:10px 0 8px"><label for="blAdd_' + p[0] + '" class="tiny">加一項計劃</label>'
          + '<input type="text" id="blAdd_' + p[0] + '" placeholder="' + esc(p[3]) + '" autocomplete="off"></div>'
          + '<div class="field" style="margin:0 0 8px"><label for="blAddD_' + p[0] + '" class="tiny">預定日期</label>'
          + '<input type="date" id="blAddD_' + p[0] + '" value="' + esc(todayISO()) + '"></div>'
          + '<button class="btn quiet sm" data-act="blItemAdd" data-k="' + p[0] + '" style="width:100%">＋ 加入計劃</button>'
          + '</div>';
      }).join('')

    + '<div class="card tight"><p class="tiny" style="margin:0">'
    + '人比事重要，關係比東西重要。計劃是為了愛他，不是為了完成表格。</p></div>';
};
ACTS.blPlan = function () { push('blPlan', {}, '祝福計劃單'); };
ACTS.blPrayMinus = async function () {
  if (!cur || !cur.prayN) return;
  cur.prayN--; await save(); refreshSheet();
};
ACTS.blItemAdd = async function (d) {
  if (!cur) return;
  var t = (val('blAdd_' + d.k) || '').trim();
  if (!t) { toast('請先寫下計劃'); return; }
  cur[d.k].push({ t: t, d: val('blAddD_' + d.k) || todayISO(), ok: false });
  await save(); refreshSheet(); toast('已加入計劃');
};
ACTS.blItemOk = async function (d) {
  if (!cur) return;
  var it = cur[d.k][+d.i]; if (!it) return;
  it.ok = !it.ok;
  if (it.ok) it.doneAt = todayISO();
  await save(); refreshSheet();
  if (it.ok) toast('做到了，感謝主');
};
ACTS.blItemDel = async function (d) {
  if (!cur) return;
  cur[d.k].splice(+d.i, 1);
  await save(); refreshSheet(); toast('已刪除');
};

/* =========================================================
   八、祝福成長單
   ========================================================= */
function readGrow() {
  if (!cur) return;
  GROW.forEach(function (g) {
    var k = g[0], o = cur.grow[k];
    var s = val('blG_s_' + k), e = val('blG_e_' + k), m = val('blG_m_' + k), n = val('blG_o_' + k);
    if (s != null) o.s = s; if (e != null) o.e = e;
    if (m != null) o.m = m.trim(); if (n != null) o.o = n.trim();
  });
}
SHEETS.blGrow = async function () {
  var r = cur; if (!r) return '<p class="muted">請先打開一張祝福單。</p>';
  return '<div class="card">'
    + '<div class="eyebrow">祝福成長單</div>'
    + '<h2 class="sec">陪' + esc(r.name || '他') + '一路長大</h2>'
    + '<p class="muted">從陪讀到受洗、從受洗到更新，一步一步陪他走成得勝者。</p></div>'
    + GROW.map(function (g) {
        var o = r.grow[g[0]];
        var done = o.e ? '　<span class="chip">已完成</span>' : (o.s ? '　<span class="chip">進行中</span>' : '');
        return '<div class="card">'
          + '<h3 class="sub">' + esc(g[1]) + done + '</h3>'
          + '<p class="tiny">' + esc(g[2]) + '</p>'
          + '<div class="field" style="margin:12px 0 10px"><label for="blG_s_' + g[0] + '" class="tiny">開始日期</label>'
          + '<input type="date" id="blG_s_' + g[0] + '" value="' + esc(o.s) + '"></div>'
          + '<div class="field" style="margin:0 0 10px"><label for="blG_e_' + g[0] + '" class="tiny">結束日期</label>'
          + '<input type="date" id="blG_e_' + g[0] + '" value="' + esc(o.e) + '"></div>'
          + '<div class="field" style="margin:0 0 10px"><label for="blG_m_' + g[0] + '" class="tiny">陪讀者</label>'
          + '<input type="text" id="blG_m_' + g[0] + '" value="' + esc(o.m) + '" autocomplete="off"></div>'
          + '<div class="field" style="margin:0"><label for="blG_o_' + g[0] + '" class="tiny">備註</label>'
          + '<input type="text" id="blG_o_' + g[0] + '" value="' + esc(o.o) + '" autocomplete="off"></div>'
          + '</div>';
      }).join('')
    + '<div class="card">'
    + '<button class="btn gold" data-act="blSaveGrow" style="width:100%">儲存祝福成長單</button>'
    + '<p class="tiny" style="margin-top:10px">陪伴每一個人成為得勝者，將來在神國與基督同坐寶座。</p></div>';
};
ACTS.blGrow = function () { push('blGrow', {}, '祝福成長單'); };
ACTS.blSaveGrow = async function () { readGrow(); await save('祝福成長單已儲存'); refreshSheet(); };

/* =========================================================
   九、掛進工具頁與個人卡
   ========================================================= */
var _toolsBless = VIEWS.tools;
VIEWS.tools = async function () {
  var head = '<div class="card">'
    + '<div class="eyebrow">傳遞真愛．傳送祝福</div>'
    + '<h2 class="sec">十全祝福單</h2>'
    + '<p class="muted">上帝是賜福的上帝，我們是祝福的天使，別人成為蒙福的人。<br>'
    + '祝福名單、祝福清單、祝福計劃單、祝福成長單，整本放進口袋裡。</p>'
    + '<button class="btn gold" data-act="openBless" style="margin-top:12px">🌿 打開十全祝福單</button>'
    + '<p class="tiny" style="margin-top:10px">沒有人拒絕真愛，沒有人拒絕祝福。</p>'
    + '</div>';
  return head + (await _toolsBless.apply(this, arguments));
};

var _personBless = SHEETS.person;
SHEETS.person = async function (arg) {
  var html = await _personBless.apply(this, arguments);
  if (!arg || !arg.id) return html;
  var p = null;
  try { p = await DB.get('persons', arg.id); } catch (e) {}
  if (!p) return html;
  var rows = await sheets(), mine = null, i;
  for (i = 0; i < rows.length; i++) {
    if (rows[i].personId === p.id || rows[i].name === p.name) mine = rows[i];
  }
  return html + '<div class="card">'
    + '<div class="eyebrow">十全祝福單</div>'
    + '<h2 class="sec">為他開一張祝福單</h2>'
    + (mine
        ? '<p class="muted">已經有一張了：福氣 ' + picked(fix(mine)).length + ' 項、禱告 ' + (mine.prayN || 0)
          + ' 次、完成 ' + doneCount(fix(mine)) + ' 件。</p>'
        : '<p class="muted">問他需要什麼福氣，為他禱告、行動、陪伴，一路陪他長大。</p>')
    + '<button class="btn gold" data-act="blForPerson" data-id="' + esc(p.id) + '" data-n="' + esc(p.name)
    + '" style="margin-top:12px">🌿 ' + (mine ? '打開' : '開一張') + esc(p.name) + '的祝福單</button>'
    + '</div>';
};
ACTS.blForPerson = async function (d) {
  var rows = await sheets(), mine = null, i;
  for (i = 0; i < rows.length; i++) {
    if (rows[i].personId === d.id || rows[i].name === d.n) mine = rows[i];
  }
  if (!mine) {
    mine = blank(d.n, d.id);
    mine.angel = S.blessAngel || '';
    await DB.put('logs', mine);
  }
  cur = fix(mine);
  closeSheet();
  push('blSheet', { id: mine.id }, d.n + '　祝福單');
};

})();