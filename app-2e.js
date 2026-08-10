(function () {
'use strict';
var G = window.__G; if (!G) return;
var LS = G.LS, DB = G.DB, esc = G.esc, uid = G.uid, toast = G.toast, $ = G.$,
    ACTS = G.ACTS, VIEWS = G.VIEWS, SHEETS = G.SHEETS, push = G.push, popSheet = G.popSheet,
    refreshSheet = G.refreshSheet, closeSheet = G.closeSheet, render = G.render,
    todayISO = G.todayISO, confirmBox = G.confirmBox, stageOf = G.stageOf;

var FING = ['拇指', '食指', '中指', '無名指', '小指'];

var HANDS = [
  { id: 'hells', side: '左手', act: '捆綁咒詛', en: 'HELLS', key: '陰仇情虛疾', mn: '因仇情緒急',
    kind: 'pray', hint: '先捆綁攔阻他的，祝福才進得去。',
    fs: [
      { en: 'Hades', n: '陰間', sub: '死亡、黑暗、祖先',
        v: { t: '只是上帝必救贖我的靈魂脫離陰間的權柄，因他必收納我。', r: '詩篇四十九篇15節' },
        p: '我奉主耶穌的名捆綁{名}身上陰間的權勢，脫離一切的死亡黑暗和祖先的咒詛。阿們！' },
      { en: 'Enemy', n: '仇敵', sub: '邪靈、污鬼、偶像',
        v: { t: '我已經給你們權柄可以踐踏蛇和蠍子，又勝過仇敵一切的能力，斷沒有甚麼能害你們。', r: '路加福音十章19節' },
        p: '我奉主耶穌的名捆綁{名}身上仇敵的權勢，脫離一切的邪靈污鬼和偶像的咒詛。阿們！' },
      { en: 'Lusts', n: '情慾', sub: '自私、貪心、驕傲',
        v: { t: '因為凡世界上的事，就像肉體的情慾、眼目的情慾，並今生的驕傲，都不是從父來的，乃是從世界來的。', r: '約翰壹書二章16節' },
        p: '我奉主耶穌的名捆綁{名}身上情慾的權勢，脫離一切的自私貪心和驕傲的咒詛。阿們！' },
      { en: 'Lying', n: '虛謊', sub: '虛假、謊言、邪術',
        v: { t: '求你使虛假和謊言遠離我；使我也不貧窮也不富足；賜給我需用的飲食。', r: '箴言三十章8節' },
        p: '我奉主耶穌的名捆綁{名}身上虛謊的權勢，脫離一切的虛假謊言和邪術的咒詛。阿們！' },
      { en: 'Sickness', n: '疾病', sub: '病痛、遺傳、災害',
        v: { t: '你們要事奉耶和華－你們的上帝，他必賜福與你的糧與你的水，也必從你們中間除去疾病。', r: '出埃及記二十三章25節' },
        p: '我奉主耶穌的名捆綁{名}身上疾病的權勢，脫離一切的病痛遺傳和災害的咒詛。阿們！' }
    ]},

  { id: 'bless', side: '右手', act: '釋放祝福', en: 'BLESS', key: '身工情關靈', mn: '伸弓請關鈴',
    kind: 'pray', hint: '從身體到靈命，一根一根地祝福他。',
    fs: [
      { en: 'Body', n: '身體', sub: '健康、強壯、活力',
        v: { t: '親愛的兄弟啊，我願你凡事興盛，身體健壯，正如你的靈魂興盛一樣。', r: '約翰參書1章2節' },
        p: '天父上帝，我奉主耶穌的名求你祝福{名}的身體，健康強壯充滿活力。阿們！' },
      { en: 'Labor', n: '工作', sub: '亨通、順利、成功',
        v: { t: '這律法書不可離開你的口，總要晝夜思想，好使你謹守遵行這書上所寫的一切話。如此，你的道路就可以亨通，凡事順利。', r: '約書亞記一章8節' },
        p: '天父上帝，我奉主耶穌的名求你祝福{名}的工作，亨通順利興盛成功。阿們！' },
      { en: 'Emotion', n: '情緒', sub: '平安、喜樂、積極',
        v: { t: '但願使人有盼望的上帝，因信將諸般的喜樂、平安充滿你們的心，使你們藉著聖靈的能力大有盼望。', r: '羅馬書十五章13節' },
        p: '天父上帝，我奉主耶穌的名求你祝福{名}的情緒，平安喜樂積極樂觀。阿們！' },
      { en: 'Social', n: '關係', sub: '和睦、溝通、建立',
        v: { t: '我們務要追求和睦的事與彼此建立德行的事。', r: '羅馬書十四章19節' },
        p: '天父上帝，我奉主耶穌的名求你祝福{名}的人際關係，能與人和睦溝通良好彼此建立品德。阿們！' },
      { en: 'Spiritual', n: '靈命', sub: '得救、重生、更新',
        v: { t: '他便救了我們；並不是因我們自己所行的義，乃是照他的憐憫，藉著重生的洗和聖靈的更新。', r: '提多書三章5節' },
        p: '天父上帝，我奉主耶穌的名求你祝福{名}的屬靈生命，能相信耶穌重生得救不斷更新成長。阿們！' }
    ]},

  { id: 'open', side: '左手', act: '開啟心靈', en: '', key: '打開攻捆聖', mn: '打開弓捆繩',
    kind: 'pray', hint: '心門開了，道理才進得去。',
    fs: [
      { en: '', n: '打開心眼', sub: '',
        v: { t: '此等不信之人被這世界的神弄瞎了心眼，不叫基督榮耀福音的光照著他們。', r: '哥林多後書四章4節' },
        p: '天父上帝，我奉主耶穌的名求你打開{名}的心眼，叫基督榮耀福音的光照著他。阿們！' },
      { en: '', n: '開啟心竅', sub: '',
        v: { t: '於是耶穌開他們的心竅，使他們能明白聖經。', r: '路加福音二十四章45節' },
        p: '天父上帝，我奉主耶穌的名求你開啟{名}的心竅，使他能明白福音真理。阿們！' },
      { en: '', n: '攻破營壘', sub: '',
        v: { t: '我們爭戰的兵器本不是屬血氣的，乃是在上帝面前有能力，可以攻破堅固的營壘。', r: '哥林多後書十章4節' },
        p: '天父上帝，我奉主耶穌的名求你攻破{名}心中堅固的營壘，攻破仇敵各樣的計謀，各樣攔阻他認識上帝的那些自高之事，將他所有的心意奪回，使他都順服基督。阿們！' },
      { en: '', n: '捆綁邪靈', sub: '',
        v: { t: '沒有人能進壯士家裡，搶奪他的家具；必先捆住那壯士，才可以搶奪他的家。', r: '馬可福音三章27節' },
        p: '天父上帝，我奉主耶穌的名求你進入{名}的心中，捆綁所有在他心中運行的邪靈，搶回他的靈魂。阿們！' },
      { en: '', n: '聖靈引導', sub: '',
        v: { t: '只等真理的聖靈來了，他要引導你們明白一切的真理。', r: '約翰福音十六章13節' },
        p: '天父上帝，我奉主耶穌的名求你差遣你的聖靈來引導{名}，明白一切的福音真理。阿們！' }
    ]},

  { id: 'save', side: '右手', act: '領受救恩', en: '', key: '責認信受作', mn: '責任新手做',
    kind: 'pray', hint: '從自己責備自己，到作主的門徒。',
    fs: [
      { en: '', n: '責備自己', sub: '',
        v: { t: '他既來了，就要叫世人為罪、為義、為審判，自己責備自己。', r: '約翰福音十六章8節' },
        p: '天父上帝，我奉主耶穌的名求你的聖靈光照{名}，叫他為罪、為義、為審判，自己責備自己。阿們！' },
      { en: '', n: '認罪悔改', sub: '',
        v: { t: '並且人要奉他的名傳悔改、赦罪的道，從耶路撒冷起直傳到萬邦。', r: '路加福音二十四章47節' },
        p: '天父上帝，我奉主耶穌的名求你差遣人向{名}傳悔改赦罪的道，並將悔改的心和赦罪的恩賜給他，使他真心的認罪悔改。阿們！' },
      { en: '', n: '信而受洗', sub: '',
        v: { t: '信而受洗的，必然得救；不信的，必被定罪。', r: '馬可福音十六章16節' },
        p: '天父上帝，我奉主耶穌的名求你引導{名}相信主耶穌受洗歸入主名，使他有得救的確據和重生的經歷。阿們！' },
      { en: '', n: '受聖靈洗', sub: '',
        v: { t: '約翰是用水施洗，但不多幾日，你們要受聖靈的洗。', r: '使徒行傳一章5節' },
        p: '天父上帝，我奉主耶穌的名懇求主耶穌用聖靈為{名}施洗，使他被聖靈澆灌及充滿，得到從上頭來的能力。阿們！' },
      { en: '', n: '作主門徒', sub: '',
        v: { t: '所以，你們要去，使萬民作我的門徒，奉父、子、聖靈的名給他們施洗。', r: '馬太福音二十八章19節' },
        p: '天父上帝，我奉主耶穌的名求你使{名}遵守主的吩咐成為主的門徒，能夠帶領人信耶穌。阿們！' }
    ]},

  { id: 'care', side: '左手', act: '關懷需要', en: '', key: '打傳去來作', mn: '搭船起來作',
    kind: 'act', hint: '禱告之後要伸手。愛要親自去給。',
    fs: [
      { n: '打電話', sub: '聊天談心問候關懷', do: '今天挑一個時段打給他，不談信仰，只問他好不好。' },
      { n: '傳訊息', sub: '用社群媒體傳訊息', do: '傳一則短短的問候，或一張適合他處境的福音卡片。' },
      { n: '去探訪', sub: '見面訪談深入認識', do: '約一次見面，帶一點小東西，聽他說的時間要比你多。' },
      { n: '來吃飯', sub: '吃喝玩樂建立關係', do: '請他吃一頓飯，或邀他來家裡坐坐，不設任何議程。' },
      { n: '作服務', sub: '實際行動滿足需要', do: '找一件他真正需要、你做得到的小事，實際幫他一次。' }
    ]},

  { id: 'tell', side: '右手', act: '傳講福音', en: '', key: '送作邀傳約', mn: '送桌邀船約',
    kind: 'act', hint: '關係到了，就勇敢地開口。',
    fs: [
      { n: '送禮物', sub: '生活用品福音禮品', do: '送一份他用得到的東西，附上一張卡片或一本十全大福帖。' },
      { n: '作見證', sub: '得救見證蒙恩見證', do: '分享你自己的一小段：信主前的我、關鍵的轉折、現在的改變。' },
      { n: '邀聚會', sub: '家組聚會教會聚會', do: '邀他來一個門檻最低的聚會，你去接他，並陪他坐。' },
      { n: '傳福音', sub: '個人談道帶領決志', do: '找一個能好好談的時間，把五幕福音講一次，然後發出邀請。' },
      { n: '約陪讀', sub: '約定時間進行陪讀', do: '約下一次陪讀的時間：半小時讀內容，半小時關懷代禱。' }
    ]}
];
function handOf(id) { for (var i = 0; i < HANDS.length; i++) if (HANDS[i].id === id) return HANDS[i]; return HANDS[0]; }

/* ---------------- 目前為誰禱告 ---------------- */
var hs = { name: '', pid: '' };
function who() { return String(hs.name || '').trim() || '○○○'; }
function fill(t) { return String(t || '').split('{名}').join(who()); }

/* ---------------- 認領圖的存檔 ---------------- */
var CLAIM_ID = 'handsClaim';
async function loadClaim() {
  var r = null;
  try { r = await DB.get('logs', CLAIM_ID); } catch (e) {}
  /* 查不到時底層會回傳請求物件，所以要認一下 kind 才算數 */
  if (!r || r.kind !== 'hands') r = { id: CLAIM_ID, kind: 'hands', L: ['', '', '', '', ''], R: ['', '', '', '', ''],
    PL: '', PR: '', savedL: [], savedR: [], savedPL: false, savedPR: false };
  if (!r.L) r.L = ['', '', '', '', ''];
  if (!r.R) r.R = ['', '', '', '', ''];
  if (!r.savedL) r.savedL = [];
  if (!r.savedR) r.savedR = [];
  return r;
}
var claim = null;

/* ---------------- 一隻手的插圖 ---------------- */
function handSVG(mirror, names, saved, palm, palmSaved) {
  var W = 300, H = 330;
  var m = function (x) { return mirror ? (W - x) : x; };
  var skin = '#F7D3C4', line = '#E0A992', ink = 'var(--ink)';
  var tips = [];   /* [x, y] 指尖標籤位置，順序：拇指、食指、中指、無名指、小指 */
  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:340px;display:block;margin:0 auto">';
  /* 手掌與手腕 */
  s += '<rect x="' + m(mirror ? 208 : 72) + '" y="150" width="136" height="130" rx="34" fill="' + skin + '" stroke="' + line + '"/>';
  s += '<rect x="' + m(mirror ? 190 : 96) + '" y="270" width="94" height="42" rx="16" fill="' + skin + '" stroke="' + line + '"/>';
  /* 四指 */
  var f = [[82, 78, 26, 86], [114, 62, 26, 102], [146, 74, 26, 90], [178, 100, 24, 64]];
  f.forEach(function (a, i) {
    var x = mirror ? (W - a[0] - a[2]) : a[0];
    s += '<rect x="' + x + '" y="' + a[1] + '" width="' + a[2] + '" height="' + (a[3] + 60) + '" rx="13" fill="' + skin + '" stroke="' + line + '"/>';
    tips[i + 1] = [x + a[2] / 2, a[1] - 8];
  });
  /* 拇指 */
  var tx = mirror ? 232 : 68;
  s += '<g transform="translate(' + tx + ',196) rotate(' + (mirror ? 42 : -42) + ')">'
    + '<rect x="-15" y="-58" width="30" height="96" rx="15" fill="' + skin + '" stroke="' + line + '"/></g>';
  tips[0] = [mirror ? 262 : 38, 150];
  /* 指尖名字 */
  for (var i = 0; i < 5; i++) {
    var nm = String(names[i] || '').trim();
    var on = saved.indexOf(i) >= 0;
    if (!nm) continue;
    if (on) s += '<circle cx="' + tips[i][0] + '" cy="' + (tips[i][1] - 5) + '" r="20" fill="none" stroke="#C8791F" stroke-width="2.5"/>';
    s += '<text x="' + tips[i][0] + '" y="' + tips[i][1] + '" text-anchor="middle" '
      + 'font-size="14" font-weight="700" fill="' + (on ? '#C8791F' : ink) + '">' + esc(nm.slice(0, 5)) + '</text>';
  }
  /* 手掌上的名字 */
  var pn = String(palm || '').trim();
  if (pn) {
    if (palmSaved) s += '<circle cx="140" cy="212" r="34" fill="none" stroke="#C8791F" stroke-width="2.5"/>';
    s += '<text x="140" y="218" text-anchor="middle" font-size="17" font-weight="700" fill="'
      + (palmSaved ? '#C8791F' : ink) + '">' + esc(pn.slice(0, 5)) + '</text>';
  } else {
    s += '<text x="140" y="218" text-anchor="middle" font-size="17" fill="#B9A99C">（　）</text>';
  }
  return s + '</svg>';
}

/* ---------------- 主目錄 ---------------- */
SHEETS.handsIndex = async function () {
  if (!claim) claim = await loadClaim();
  var n = 0;
  claim.L.concat(claim.R).forEach(function (x) { if (String(x || '').trim()) n++; });
  if (String(claim.PL || '').trim()) n++;
  if (String(claim.PR || '').trim()) n++;
  var sv = claim.savedL.length + claim.savedR.length + (claim.savedPL ? 1 : 0) + (claim.savedPR ? 1 : 0);

  return '<div class="card">'
    + '<div class="eyebrow">認領．代禱．行動</div>'
    + '<h2 class="sec">奇妙的雙手</h2>'
    + '<p class="muted">十指認十人——名字寫在手指上<br>'
    + '雙手抓雙人——名字寫在手掌上<br>'
    + '至少救一人——將得救者圈起來</p>'
    + '<p style="margin-top:10px">你的兩隻手，就是你的名單。左手認領「親友」，右手認領「鄰舍」；'
    + '一隻手捆綁咒詛，一隻手釋放祝福；一隻手關懷需要，一隻手傳講福音。</p>'
    + '</div>'

    + '<button class="row" data-act="hClaim"><span class="grow">'
    + '<span class="t">奇妙的雙手認領圖</span>'
    + '<span class="s">已認領 ' + n + ' 人．已得救 ' + sv + ' 人</span></span>'
    + '<span class="arrow">›</span></button>'

    + '<div class="card" style="margin-top:16px">'
    + '<div class="eyebrow">為他禱告</div>'
    + '<h3 class="sub">現在為誰禱告？</h3>'
    + '<div class="field" style="margin:10px 0 0"><input type="text" id="hName" '
    + 'value="' + esc(hs.name) + '" placeholder="輸入他的名字，禱告文會自動代入"></div>'
    + '<p class="tiny" style="margin-top:8px">不填也可以，禱告文會顯示○○○。</p>'
    + '</div>'

    + HANDS.map(function (h) {
        return '<button class="row" data-act="hHand" data-id="' + h.id + '"><span class="grow">'
          + '<span class="t">' + esc(h.side + '　' + h.act) + (h.en ? '　' + esc(h.en) : '') + '</span>'
          + '<span class="s">' + esc(h.fs.map(function (x) { return x.n; }).join('、')) + '</span></span>'
          + '<span class="arrow">›</span></button>';
      }).join('')

    + '<div class="card" style="margin-top:16px"><div class="eyebrow">口訣</div>'
    + HANDS.map(function (h) {
        return '<p style="line-height:2"><b>' + esc(h.side + h.act) + '</b>　要字：' + esc(h.key)
          + '<span class="tiny">　口訣：' + esc(h.mn) + '</span></p>';
      }).join('')
    + '<p class="tiny" style="margin-top:10px">背起來，禱告的時候低頭看自己的手就想得起來。</p></div>'

    + '<div class="card tight"><p class="tiny" style="margin:0">'
    + '雙手是工具，不是法術。捆綁與釋放的權柄在主耶穌，不在我們的手指。<br>'
    + '焦點在耶穌，不在自己，也不在方法。</p></div>';
};
ACTS.openHands = function () { push('handsIndex', {}, '奇妙的雙手'); };

/* ---------------- 認領圖 ---------------- */
SHEETS.handsClaim = async function () {
  if (!claim) claim = await loadClaim();
  function block(k, title, sub) {
    var L = k === 'L';
    var names = L ? claim.L : claim.R, saved = L ? claim.savedL : claim.savedR;
    var palm = L ? claim.PL : claim.PR, ps = L ? claim.savedPL : claim.savedPR;
    return '<div class="card">'
      + '<div class="eyebrow">' + esc(sub) + '</div>'
      + '<h3 class="sub">' + esc(title) + '</h3>'
      + handSVG(L, names, saved, palm, ps)
      + names.map(function (v, i) {
          return '<div class="field" style="margin-bottom:10px">'
            + '<label>' + (i + 1) + '　' + FING[i] + '</label>'
            + '<div style="display:flex;gap:8px;align-items:center">'
            + '<input type="text" id="hc' + k + i + '" value="' + esc(v) + '" placeholder="寫下他的名字" style="flex:1">'
            + '<button class="btn quiet sm" data-act="hSaved" data-k="' + k + '" data-i="' + i + '" '
            + 'style="white-space:nowrap">' + (saved.indexOf(i) >= 0 ? '✓ 得救' : '○ 未信') + '</button>'
            + '</div></div>';
        }).join('')
      + '<div class="field" style="margin-bottom:0">'
      + '<label>手掌　雙手抓雙人<span class="hint">（最重要、最優先的那一位）</span></label>'
      + '<div style="display:flex;gap:8px;align-items:center">'
      + '<input type="text" id="hcP' + k + '" value="' + esc(palm) + '" placeholder="寫下他的名字" style="flex:1">'
      + '<button class="btn quiet sm" data-act="hSaved" data-k="' + k + '" data-i="p" '
      + 'style="white-space:nowrap">' + (ps ? '✓ 得救' : '○ 未信') + '</button>'
      + '</div></div>'
      + '</div>';
  }
  return '<div class="card">'
    + '<div class="eyebrow">奇妙的雙手認領圖</div>'
    + '<h2 class="sec">十指認十人</h2>'
    + '<p class="muted">十個有需要的人、兩個有興趣的人、一個有感動的人。<br>'
    + '寫下來，就開始為他們禱告；得救了，就把他圈起來。</p>'
    + '</div>'
    + block('L', '左手認領「親友」', '家人、親戚、老朋友')
    + block('R', '右手認領「鄰舍」', '鄰居、同事、生活中遇見的人')
    + '<div class="card">'
    + '<button class="btn" data-act="hSaveClaim" style="width:100%">儲存認領圖</button>'
    + '<button class="btn quiet" data-act="hToList" style="width:100%;margin-top:10px">把名字加進同行名單</button>'
    + '<p class="tiny" style="margin-top:12px">至少救一人。一年之後回頭看，這張圖會是你最寶貝的一張紙。</p>'
    + '</div>';
};
ACTS.hClaim = function () { push('handsClaim', {}, '認領圖'); };
function readClaim() {
  if (!claim || !document.getElementById('hcL0')) return;
  for (var i = 0; i < 5; i++) {
    var a = document.getElementById('hcL' + i), b = document.getElementById('hcR' + i);
    if (a) claim.L[i] = a.value.trim();
    if (b) claim.R[i] = b.value.trim();
  }
  var pl = document.getElementById('hcPL'), pr = document.getElementById('hcPR');
  if (pl) claim.PL = pl.value.trim();
  if (pr) claim.PR = pr.value.trim();
}
ACTS.hSaved = function (d) {
  readClaim();
  if (d.i === 'p') {
    if (d.k === 'L') claim.savedPL = !claim.savedPL; else claim.savedPR = !claim.savedPR;
  } else {
    var arr = d.k === 'L' ? claim.savedL : claim.savedR, i = +d.i, j = arr.indexOf(i);
    if (j >= 0) arr.splice(j, 1); else arr.push(i);
  }
  refreshSheet();
};
ACTS.hSaveClaim = async function () {
  readClaim();
  claim.kind = 'hands'; claim.id = CLAIM_ID; claim.updatedAt = new Date().toISOString();
  await DB.put('logs', claim);
  refreshSheet(); toast('認領圖已儲存');
};
ACTS.hToList = async function () {
  readClaim();
  var all = claim.L.concat(claim.R); all.push(claim.PL); all.push(claim.PR);
  var ps = await DB.all('persons');
  var have = {}; ps.forEach(function (p) { have[p.name] = 1; });
  var add = [];
  all.forEach(function (n) { n = String(n || '').trim(); if (n && !have[n] && add.indexOf(n) < 0) add.push(n); });
  if (!add.length) { toast('名單裡都已經有了'); return; }
  confirmBox('加入同行名單？', '會把還沒在名單上的 ' + add.length + ' 個名字加進去：\n' + add.join('、'),
    '確定加入', async function () {
      var now = new Date().toISOString();
      for (var i = 0; i < add.length; i++) {
        await DB.put('persons', { id: uid(), name: add[i], relation: '', stage: 'L0',
          background: '', prayerFocus: '', createdAt: now, updatedAt: now,
          prayFrom: todayISO(), order: Date.now() + i });
      }
      await ACTS.hSaveClaim();
      render(); toast('已加入 ' + add.length + ' 位');
    });
};

/* ---------------- 一隻手 ---------------- */
SHEETS.handsHand = async function (arg) {
  var h = handOf(arg.id);
  var pray = h.kind === 'pray';
  return '<div class="card">'
    + '<div class="eyebrow">' + esc(h.side) + (h.en ? '　' + esc(h.en) : '') + '</div>'
    + '<h2 class="sec">' + esc(h.act) + '</h2>'
    + '<p class="muted">要字：' + esc(h.key) + '　　口訣：' + esc(h.mn) + '</p>'
    + '<p style="margin-top:8px">' + esc(h.hint) + '</p>'
    + (pray ? '<div class="field" style="margin:14px 0 0"><label>為誰禱告</label>'
        + '<input type="text" id="hName" value="' + esc(hs.name) + '" placeholder="輸入他的名字">'
        + '</div><p class="tiny" style="margin-top:8px">名字會自動代入下面每一段宣告禱告。</p>' : '')
    + '</div>'
    + h.fs.map(function (f, i) {
        return '<button class="row" data-act="hFinger" data-h="' + h.id + '" data-i="' + i + '">'
          + '<span class="grow"><span class="t">' + esc(FING[i] + '　' + f.n) + (f.en ? '　' + esc(f.en) : '') + '</span>'
          + '<span class="s">' + esc(f.sub || f.do || '') + '</span></span>'
          + '<span class="arrow">›</span></button>';
      }).join('')
    + (pray ? '<div class="card" style="margin-top:16px">'
        + '<button class="btn gold" data-act="hAll" data-id="' + h.id + '" style="width:100%">'
        + '一口氣做完五指的禱告</button>'
        + '<p class="tiny" style="margin-top:10px">按下去會把五段禱告排在一起，可以用上面的朗讀鍵一路念完。</p>'
        + '</div>' : '<div class="card tight"><p class="tiny" style="margin:0">'
        + '這一隻手不是用念的，是用做的。挑一根手指，這一週做一次。</p></div>');
};
ACTS.hHand = function (d) {
  var h = handOf(d.id);
  readName();
  push('handsHand', { id: d.id }, h.side + h.act);
};
function readName() {
  var el = document.getElementById('hName');
  if (el) hs.name = el.value.trim();
}

/* ---------------- 一根手指 ---------------- */
SHEETS.handsFinger = async function (arg) {
  var h = handOf(arg.h), f = h.fs[+arg.i];
  if (!f) return '<p class="muted">找不到這一根手指。</p>';
  var head = '<div class="card">'
    + '<div class="eyebrow">' + esc(h.act + '　' + h.side + FING[+arg.i]) + '</div>'
    + '<h2 class="sec">' + (f.en ? esc(f.en) + ' ' : '') + esc(f.n) + '</h2>'
    + (f.sub ? '<p class="muted">' + esc(f.sub) + '</p>' : '')
    + '</div>';
  if (h.kind === 'act') {
    return head
      + '<div class="card"><div class="eyebrow">這一根手指要做的事</div>'
      + '<p style="font-size:calc(20px * var(--fs));line-height:1.95">' + esc(f.do) + '</p></div>'
      + '<div class="card tight"><p class="tiny" style="margin:0">'
      + '做完之後，回到同行名單為他記一筆。記錄不是為了管理他，是為了更好地愛他。</p></div>';
  }
  return head
    + '<div class="card"><div class="verse">' + esc(f.v.t) + '<span class="ref">' + esc(f.v.r) + '</span></div></div>'
    + '<div class="card"><div class="eyebrow">宣告禱告</div>'
    + '<p style="font-size:calc(21px * var(--fs));line-height:2.05">' + esc(fill(f.p)) + '</p>'
    + '<button class="btn quiet" data-act="hCopy" data-h="' + h.id + '" data-i="' + arg.i + '" '
    + 'style="width:100%;margin-top:12px">複製這段禱告</button></div>'
    + '<div class="card tight"><p class="tiny" style="margin:0">'
    + '禱告的權柄不在字句，在主耶穌的名。慢慢念，一句一句相信。</p></div>';
};
ACTS.hFinger = function (d) {
  readName();
  var h = handOf(d.h);
  push('handsFinger', { h: d.h, i: d.i }, h.fs[+d.i].n);
};
ACTS.hCopy = function (d) {
  var h = handOf(d.h), f = h.fs[+d.i];
  var t = '【' + h.act + '　' + f.n + '】\n' + f.v.t + '（' + f.v.r + '）\n\n' + fill(f.p);
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast('已複製'); });
  else toast('請長按文字複製');
};

/* ---------------- 五指連禱 ---------------- */
SHEETS.handsAll = async function (arg) {
  var h = handOf(arg.id);
  return '<div class="card">'
    + '<div class="eyebrow">' + esc(h.side + '　' + h.act) + '</div>'
    + '<h2 class="sec">為' + esc(who()) + '禱告</h2>'
    + '<p class="muted">從拇指到小指，一根一根地為他求。可以按上面的朗讀鍵一路念完。</p></div>'
    + h.fs.map(function (f, i) {
        return '<div class="card"><div class="eyebrow">' + esc(FING[i] + '　' + f.n) + '</div>'
          + '<div class="verse">' + esc(f.v.t) + '<span class="ref">' + esc(f.v.r) + '</span></div>'
          + '<p style="font-size:calc(20px * var(--fs));line-height:2;margin-top:10px">' + esc(fill(f.p)) + '</p></div>';
      }).join('')
    + '<div class="card"><button class="btn quiet" data-act="hCopyAll" data-id="' + h.id + '" style="width:100%">'
    + '複製整隻手的禱告</button></div>';
};
ACTS.hAll = function (d) { readName(); push('handsAll', { id: d.id }, '五指連禱'); };
ACTS.hCopyAll = function (d) {
  var h = handOf(d.id);
  var t = '【' + h.side + h.act + '　為' + who() + '禱告】\n\n'
    + h.fs.map(function (f, i) { return FING[i] + '　' + f.n + '\n' + fill(f.p); }).join('\n\n');
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast('已複製'); });
  else toast('請長按文字複製');
};

/* ---------------- 掛進工具頁與個人卡 ---------------- */
var _toolsHands = VIEWS.tools;
VIEWS.tools = async function () {
  var head = '<div class="card">'
    + '<div class="eyebrow">認領．代禱．行動</div>'
    + '<h2 class="sec">奇妙的雙手</h2>'
    + '<p class="muted">十指認十人、雙手抓雙人、至少救一人。<br>'
    + '六隻手三十根手指：捆綁咒詛與釋放祝福、開啟心靈與領受救恩、關懷需要與傳講福音。</p>'
    + '<button class="btn gold" data-act="openHands" style="margin-top:12px">🙌 打開奇妙的雙手</button>'
    + '<p class="tiny" style="margin-top:10px">禱告文會自動代入他的名字。</p>'
    + '</div>';
  return head + (await _toolsHands.apply(this, arguments));
};

var _personHands = SHEETS.person;
SHEETS.person = async function (arg) {
  var html = await _personHands.apply(this, arguments);
  if (!arg || !arg.id) return html;
  var p = null;
  try { p = await DB.get('persons', arg.id); } catch (e) {}
  if (!p) return html;
  return html + '<div class="card">'
    + '<div class="eyebrow">奇妙的雙手</div>'
    + '<h2 class="sec">為他做十指的禱告</h2>'
    + '<p class="muted">一隻手捆綁攔阻他的，一隻手釋放祝福給他；'
    + '再用一隻手開啟他的心靈，一隻手領受救恩。</p>'
    + '<button class="btn gold" data-act="hForPerson" data-n="' + esc(p.name) + '" style="margin-top:12px">'
    + '🙌 為' + esc(p.name) + '禱告</button>'
    + '</div>';
};
ACTS.hForPerson = function (d) {
  hs.name = d.n || '';
  closeSheet();
  push('handsIndex', {}, '奇妙的雙手');
};

})();