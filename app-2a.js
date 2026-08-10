(function () {
'use strict';
var G = window.__G; if (!G) return;
var LS = G.LS, esc = G.esc, nl2br = G.nl2br, DB = G.DB, C = G.C, TTS = G.TTS,
    toast = G.toast, ACTS = G.ACTS, VIEWS = G.VIEWS, SHEETS = G.SHEETS,
    stageOf = G.stageOf, fmtAgo = G.fmtAgo, fmtDate = G.fmtDate, daysSince = G.daysSince,
    modal = G.modal, closeModal = G.closeModal;

/* 後端代理：金鑰由 Cloudflare Worker 保管，前端不放任何金鑰 */
var XZ_ENDPOINT = 'https://xiaozhi-proxy.spch321.workers.dev';
var XZ_MODEL = 'claude-sonnet-4-6';

var chat = { open: false, msgs: [], busy: false, favView: false, topic: -1, pid: '', anon: true };
var people = [];
var host = null;

/* ---------------- 提問題庫：依傳福音的實際需要分類 ---------------- */
var XZ_TOPICS = [
  { c: '開口第一步', qs: [
    '我心裡有一個名字，但不知道怎麼開口。',
    '怎麼把信仰從禁忌話題變成正常話題？',
    '什麼時機開口比較自然？',
    '我怕一講對方就疏遠我，怎麼辦？',
    '可以怎麼自然地說「我最近有為你禱告」？',
    '要不要一開始就邀他來教會？',
    '對方很忙，只有短短幾分鐘，我能講什麼？',
    '我口才不好，也能傳福音嗎？',
    '怎麼分辨他現在願不願意聽？',
    '第一次談完之後，接下來要做什麼？'
  ]},
  { c: '關係與陪伴', qs: [
    '怎麼讓他確定我是真的關心他，不是要他信什麼？',
    '我發現我把他當成一個「案子」，怎麼調整？',
    '關係很淡了，怎麼重新接上？',
    '他最近很不順，我可以怎麼實際幫他？',
    '怎麼記住並關心他重要的日子？',
    '陪伴要陪多久才算夠？',
    '我該怎麼設立界線，又不失去愛？',
    '對他操練 920，今天可以結哪一個果子？',
    '他一直沒有改變，我還要繼續嗎？',
    '怎麼在不談信仰的情況下，仍然作見證？'
  ]},
  { c: '分享見證', qs: [
    '幫我把見證整理成三分鐘：信主前、關鍵、現在的改變。',
    '我的見證很平淡，沒有戲劇性，怎麼講？',
    '見證裡該不該講自己的失敗？',
    '怎麼開場才不尷尬？',
    '見證講完，怎麼自然接到福音？',
    '對不同的人，見證要怎麼調整？',
    '怎麼分享神最近在我身上作的一件小事？',
    '講見證時最常犯的錯是什麼？',
    '可以怎麼用一句話說出我生命的改變？',
    '幫我把見證改成可以在飯桌上說的口語版。'
  ]},
  { c: '回答疑問', qs: [
    '他問我：你怎麼證明有神？',
    '他問我：好人為什麼受苦？',
    '他說：條條大路通羅馬，為什麼只有基督教？',
    '他說：基督徒很虛偽。',
    '他說：教會歷史上那麼黑暗。',
    '他問：沒聽過福音的人怎麼辦？',
    '他說：聖經被人改過吧？',
    '他問：科學與信仰衝突嗎？',
    '我被問倒了，當場該怎麼回應？',
    '他的問題底下，會不會其實是一段受傷？'
  ]},
  { c: '華人處境', qs: [
    '他說信了就不能拜祖先，算不算不孝？',
    '他的家人強烈反對，怎麼辦？',
    '清明節他該怎麼做？',
    '家裡辦喪事，基督徒可以怎麼參與？',
    '婚禮的習俗要怎麼處理？',
    '他說我拜的神也很靈驗。',
    '長輩擔心他信了就不管家裡。',
    '他怕被親戚說閒話。',
    '過年拜拜的場合，他該怎麼自處？',
    '怎麼讓他的家人看見信仰讓他更孝順？'
  ]},
  { c: '講福音', qs: [
    '幫我把五幕福音濃縮成三分鐘。',
    '第二幕「有己」要怎麼講他才不防衛？',
    '怎麼用他聽得懂的話解釋「罪」？',
    '什麼時候該停下來讓他說話？',
    '他說「我又沒殺人放火」，怎麼回？',
    '怎麼講十字架才不像在說教？',
    '復活這件事要怎麼講得有份量？',
    '對長輩講福音，要注意什麼？',
    '對年輕人講福音，要注意什麼？',
    '幫我預備一個開場白，讓他願意聽下去。'
  ]},
  { c: '邀請決志', qs: [
    '我怎麼知道他準備好了？',
    '要怎麼開口問那一句邀請的話？',
    '他說「我再想想」已經好幾年了。',
    '福分與代價，我該怎麼誠實地說？',
    '他願意了，接下來的流程是什麼？',
    '幫我預備一段帶他決志的禱告詞。',
    '他決志時哭了，我該怎麼陪？',
    '他說怕做不到、怕反悔，怎麼回應？',
    '決志之後的四十八小時我該做什麼？',
    '他拒絕了，我該怎麼收尾才不傷關係？'
  ]},
  { c: '初信跟進', qs: [
    '決志後第一天我該說什麼？',
    '怎麼教他第一次禱告？',
    '怎麼帶他讀第一段聖經？',
    '怎麼幫他在六週內交到三個朋友？',
    '他決志後就消失了，怎麼辦？',
    '他遇到第一波攪擾，我該怎麼陪？',
    '什麼時候可以跟他談受洗？',
    '怎麼陪他預備受洗見證？',
    '他家人反對受洗，怎麼處理？',
    '初信三十天，我最該做的三件事是什麼？'
  ]},
  { c: '門訓建造', qs: [
    '一對一門訓要怎麼開始？',
    '怎麼帶他從「知道」走到「活出來」？',
    '改變觀念的八大步驟怎麼用在門訓上？',
    '他靈修總是三分鐘熱度，怎麼辦？',
    '怎麼幫他建立每天讀經禱告的節奏？',
    '他生命中有一個卡住的地方，我怎麼陪他面對？',
    '門訓時我講太多、他講太少，怎麼調整？',
    '怎麼幫他建立 235 的關係？',
    '他問我很難的問題，我不會，怎麼辦？',
    '門訓的結業標準應該是什麼？'
  ]},
  { c: '放手繁殖', qs: [
    '怎麼讓他開始帶他自己的一個 2？',
    '「我作你看、我作你幫、你作我幫、你作我看」怎麼落實？',
    '我捨不得放手，這是不是我的己？',
    '怎麼陪他寫下他的第一張名單？',
    '他說自己還不夠好，不敢帶人。',
    '他帶人的方式跟我不一樣，我要糾正嗎？',
    '怎麼為我的屬靈孫子禱告？',
    '什麼是四代的體系？我現在在第幾代？',
    '怎麼把我會的教給他而不是替他做？',
    '放手之後，我們的關係要怎麼調整？'
  ]},
  { c: '他的難處', qs: [
    '他正在生病，我可以怎麼陪、怎麼說？',
    '他剛失去至親，我該說什麼？',
    '他被裁員了，經濟壓力很大。',
    '他的婚姻出了問題。',
    '他有憂鬱或失眠的困擾。',
    '他被癮綑綁，想戒又戒不掉。',
    '他的孩子叛逆，他很挫折。',
    '他被人嚴重傷害，放不下。',
    '他長期照顧家人，累壞了。',
    '他說人生沒有意義。'
  ]},
  { c: '訊息代擬', qs: [
    '幫我擬一則簡單的問候訊息，不提信仰。',
    '幫我擬一則生日祝福。',
    '幫我擬一則邀他吃飯的訊息。',
    '幫我擬一則邀他來聚會的訊息，門檻低一點。',
    '幫我擬一則他生病時的關心訊息。',
    '幫我擬一則喪親時的慰問訊息。',
    '幫我擬一則「我最近為你禱告」的訊息。',
    '幫我擬一則久沒聯絡、重新接上的訊息。',
    '幫我擬一則道歉的訊息。',
    '幫我擬一則決志後第一天的祝福訊息。'
  ]},
  { c: '為他禱告', qs: [
    '為他的救恩寫一段簡短的禱告。',
    '為他剛硬的心禱告。',
    '為他的家庭禱告。',
    '為他的病痛禱告。',
    '為他的工作與經濟禱告。',
    '為他決志前的預備禱告。',
    '為他初信站立得穩禱告。',
    '為他受洗禱告。',
    '教我怎麼把他的名字天天帶到神面前。',
    '我不知道怎麼為他求，可以怎麼禱告？'
  ]},
  { c: '陪伴者的心', qs: [
    '我灰心了，看不見任何果效。',
    '我為他禱告很多年了，一點動靜也沒有。',
    '我覺得自己不夠格傳福音。',
    '我發現我在跟別人比較人數。',
    '他不回我訊息，我還要繼續嗎？',
    '我心裡其實很急，怎麼安靜下來？',
    '我因為他的拒絕而受傷了。',
    '陪伴到很累，我該休息還是撐下去？',
    '我怎麼分辨這是聖靈的釋放，還是我的放棄？',
    '求主更新我陪伴的心，可以怎麼禱告？'
  ]},
  { c: '321 與福音', qs: [
    '321 理念跟傳福音有什麼關係？',
    '什麼是「有己」？為什麼它是人的真問題？',
    '怎麼用「無己」的角度講福音？',
    '傳福音時，怎麼讓耶穌作王而不是我作王？',
    '什麼是 920 的操練？怎麼用在我的 2 身上？',
    '235 的關係怎麼從一個名字開始建立？',
    '為什麼說「先生命、再關係、後事工」？',
    '謙卑為什麼是復興的鑰匙？',
    '怎麼把焦點從果效轉回耶穌？',
    '建立屬神的體系，和我手上這一張名單有什麼關係？'
  ]}
];


/* ---------------- 十全大福帖：十帖福氣的慕道友處境（每帖二十題） ---------------- */
var XZ_TEN_TOPICS = [
  { c: '十全・罪得赦免', qs: [
    '他說：我做過的事，神不可能原諒。',
    '他說：我又沒殺人放火，哪來的罪？',
    '他說：我心裡有件事，二十年了還是過不去。',
    '他說：我對不起我父母，他們已經走了。',
    '他曾經外遇，家人到現在都不知道。',
    '他曾經墮胎，一直不敢說出口。',
    '他說：我害過人，我怕報應。',
    '他問：信了是不是要把過去都說出來？',
    '他說：我認過罪了，為什麼還是不平安？',
    '他說：我戒不掉，認罪有什麼用？',
    '他恨一個人，恨到現在放不下。',
    '他說：我常常半夜醒來，滿心愧疚。',
    '他問：做善事可不可以抵掉以前的錯？',
    '他說：那些傷害我的人，憑什麼被赦免？',
    '他說：年輕時的荒唐，現在還算數嗎？',
    '他說：我怕上帝一直在記我的帳。',
    '他問：赦免是不是等於說我沒有錯？',
    '他說：別人原諒我了，我原諒不了自己。',
    '他因為覺得自己太髒，不敢走進教會。',
    '幫我帶他做一次罪得赦免的禱告。'
  ] },
  { c: '十全・平安喜樂', qs: [
    '他說：我什麼都有了，還是覺得空。',
    '他說：我一躺下就開始煩惱，睡不著。',
    '他說：我一直很焦慮，卻說不出在怕什麼。',
    '他說：我笑給別人看，回到家就垮了。',
    '他說：我怕未來，怕到不敢想。',
    '他情緒起伏很大，自己也控制不住。',
    '他靠吃、靠滑手機才撐得過一天。',
    '他有恐慌發作，很害怕再來一次。',
    '他說：我試過禱告，沒有比較平安。',
    '他問：喜樂是不是要假裝快樂？',
    '他說：壓力太大，我快撐不住了。',
    '他很孤單，說沒有人可以講心裡的話。',
    '他說：我覺得自己沒有什麼價值。',
    '他說：我怕死，一想到就發抖。',
    '他在看身心科、吃藥，問這樣可以信嗎？',
    '他說：我試過很多方法讓自己靜下來。',
    '他問：信了以後煩惱就會不見嗎？',
    '他家裡的事讓他沒有一天輕鬆過。',
    '他傳訊息說他撐不下去了，我該怎麼回？',
    '幫我帶他做一次平安喜樂的禱告。'
  ] },
  { c: '十全・病得醫治', qs: [
    '他剛被診斷出重病，整個人愣住了。',
    '他說：為什麼生病的是我？',
    '他長期慢性病，吃藥吃到失去盼望。',
    '他問：禱告真的能醫病嗎？',
    '他問：信了就一定會好嗎？',
    '他說：我拜過很多廟，都沒有好。',
    '他快要開刀了，心裡很害怕。',
    '他在照顧生病的家人，快累垮了。',
    '他說：我這把年紀，好不了了。',
    '他問：生病是不是上帝在懲罰我？',
    '醫生說沒辦法了，他很絕望。',
    '他長期疼痛，睡不好也沒力氣。',
    '他失眠很多年，愈想睡愈睡不著。',
    '他的孩子生了重病，他快撐不住。',
    '他說：我最怕的是拖累家人。',
    '他問：可以一邊看醫生、一邊禱告嗎？',
    '他信了以後病沒有好，覺得很失望。',
    '他在安寧病房，我可以說什麼？',
    '他問：如果沒有醫治，那還信什麼？',
    '幫我帶他做一次病得醫治的禱告。'
  ] },
  { c: '十全・愛情如意', qs: [
    '他很想結婚，卻一直遇不到合適的人。',
    '他剛失戀，傷得很重。',
    '他問：上帝真的會為我預備一個人嗎？',
    '他喜歡的人不信主，問可不可以在一起。',
    '他被劈腿過，不敢再相信人。',
    '他正在同居，怕信了就得改變。',
    '他說：我條件不好，不會有人要我。',
    '他老是遇到不對的人，一次又一次。',
    '他被家人催婚，壓力很大。',
    '他離婚了，覺得自己很失敗。',
    '他喜歡上有家庭的人，很掙扎。',
    '他說：我不相信這世上有真愛。',
    '他問：基督徒交往有什麼不一樣？',
    '他問：為什麼婚前不可以有性關係？',
    '他年紀不小了，怕來不及。',
    '他和交往對象為了信仰吵架。',
    '他被前一段感情傷得走不出來。',
    '他問：怎麼知道這個人是不是對的人？',
    '他很寂寞，用交友軟體填補空虛。',
    '幫我帶他做一次愛情如意的禱告。'
  ] },
  { c: '十全・家庭和樂', qs: [
    '他和另一半天天冷戰。',
    '他的孩子叛逆，已經不跟他說話。',
    '他和公婆或岳父母處不來。',
    '他說：我這個家已經沒救了。',
    '他家人為了錢翻臉。',
    '他在原生家庭受過很深的傷。',
    '他說：另一半不信，我怎麼辦？',
    '他的孩子沉迷手機和遊戲。',
    '他長期照顧失智或臥床的長輩。',
    '他家裡有人酗酒或賭博。',
    '他說：爸媽偏心，我一直放不下。',
    '他和兄弟姊妹在爭遺產。',
    '他說：我不會表達愛，只會罵人。',
    '他的孩子在外地，很少回家。',
    '他的婚姻已經談到要離婚。',
    '他說：家裡拜拜，我信了會被趕出去。',
    '他的孩子中輟或出了狀況。',
    '他想改變家裡的氣氛，卻不知從哪開始。',
    '他問：一個人信主，全家真的會蒙福嗎？',
    '幫我帶他做一次家庭和樂的禱告。'
  ] },
  { c: '十全・人緣良好', qs: [
    '他說：我人緣很差，沒有什麼朋友。',
    '他在職場被排擠。',
    '他很怕生，不太敢跟人講話。',
    '他說：我一開口就得罪人。',
    '他被同事在背後說壞話。',
    '他說：我對人很好，卻常常被利用。',
    '他非常在意別人的眼光。',
    '他和主管處不來，每天很痛苦。',
    '他說：我不會拒絕人，累得要命。',
    '他退休以後失去了人際圈。',
    '他搬到新環境，融不進去。',
    '他說：我脾氣不好，發完就後悔。',
    '他被最好的朋友背叛過。',
    '他說：我不擅長交際應酬。',
    '孩子長大了，他覺得沒有人需要他。',
    '他問：教會的人會不會排擠我？',
    '他問：怎麼跟討厭的人相處？',
    '他一個人住，整天沒和人說到話。',
    '他說：我不想欠人情，所以不跟人來往。',
    '幫我帶他做一次人緣良好的禱告。'
  ] },
  { c: '十全・事業成功', qs: [
    '他失業很久，投履歷都沒有回音。',
    '他工作很拼，卻一直升不上去。',
    '他想創業，心裡很不安。',
    '他說：我做什麼都失敗。',
    '他被公司裁員了。',
    '公司要他做不誠實的事，他很掙扎。',
    '他生意被倒帳，損失慘重。',
    '他工作沒有成就感，想換又不敢。',
    '他問：基督徒可以追求成功嗎？',
    '他說：我拜文昌、拜關公，生意才會好。',
    '他準備考試，壓力大到睡不著。',
    '他和合夥人拆夥，關係鬧僵。',
    '他的功勞被同事搶走。',
    '他問：禱告真的能讓生意變好嗎？',
    '他為了工作犧牲家庭，心裡很矛盾。',
    '他年紀大了，怕被淘汰。',
    '他的店快開不下去了。',
    '他說：我沒有背景，哪來的機會。',
    '他問：成功了為什麼要感謝上帝？',
    '幫我帶他做一次事業成功的禱告。'
  ] },
  { c: '十全・凡事富足', qs: [
    '他負債，每天被錢追著跑。',
    '他說：我怎麼賺都不夠用。',
    '他借錢給朋友，對方不還。',
    '他投資虧了一大筆錢。',
    '他問：信了是不是要奉獻很多錢？',
    '他問：上帝連我的錢也要管嗎？',
    '他退休金不夠，愈想愈焦慮。',
    '他為了錢和家人翻臉。',
    '他說：有錢人才信得起宗教吧。',
    '他被詐騙，損失了大半積蓄。',
    '他說：我一輩子省吃儉用，還是這樣。',
    '他有賭博或亂花錢的習慣。',
    '他背房貸背得很辛苦。',
    '他問：什麼叫「富足並不加上憂慮」？',
    '他很怕變窮，緊抓著錢不敢放。',
    '他想幫助別人，卻覺得自己不夠用。',
    '他說：我沒有留給孩子什麼。',
    '他為醫藥費發愁。',
    '他問：十一奉獻是規定嗎？',
    '幫我帶他做一次凡事富足的禱告。'
  ] },
  { c: '十全・經歷神能', qs: [
    '他說：我沒經歷過什麼，怎麼相信？',
    '他問：神蹟現在還會發生嗎？',
    '他說：我試過禱告，沒有任何回應。',
    '他的人生走到絕路了。',
    '他問：怎麼知道那是巧合還是神？',
    '他說：我意志力很弱，什麼都改不了。',
    '他覺得自己被鬼壓、被跟。',
    '他問：什麼是被聖靈充滿？',
    '他說：我看教會的人也沒什麼特別。',
    '他經歷過一件很奇妙的事，說不上來。',
    '他說：如果真的有神，就讓我看見。',
    '他遇到重大打擊，整個人垮掉了。',
    '他問：上帝為什麼不直接改變我的環境？',
    '他家中有人被恐懼或邪術綑綁。',
    '他說：我這個人已經定型了，改不了。',
    '他問：苦難怎麼會是化妝的祝福？',
    '他一直想改變，卻一次次失敗。',
    '他問：重生到底是什麼感覺？',
    '他說：你們講的能力，我看不到。',
    '幫我帶他做一次經歷神能的禱告。'
  ] },
  { c: '十全・得著永生', qs: [
    '他很怕死，不敢談這個話題。',
    '他剛失去至親，問人死了到底去哪裡。',
    '他問：真的有天堂和地獄嗎？',
    '他說：人死了就一了百了。',
    '他問：我過世的家人現在在哪裡？',
    '他的長輩快走了，我可以做什麼？',
    '他問：現在才信會不會太晚？',
    '他年紀很大了，覺得來不及了。',
    '他問：好人不信也會下地獄嗎？',
    '他說：永生聽起來很虛，沒有實感。',
    '他問：一定要受洗才能得永生嗎？',
    '他剩下的時間不多了。',
    '他說：我怕死後被審判。',
    '他問：輪迴和永生差在哪裡？',
    '他說：我活著都顧不了，想那麼遠做什麼？',
    '他問：信了以後就不怕死了嗎？',
    '他的孩子早逝，他一直過不去。',
    '他問：永生是死了以後才開始嗎？',
    '他想信，卻怕家人反對到底。',
    '幫我帶他做一次得著永生的禱告。'
  ] }
];
XZ_TOPICS = XZ_TOPICS.concat(XZ_TEN_TOPICS);

function quicks() {
  return chat.pid
    ? ['針對他現在的情況，我下一步可以做什麼？', '幫我擬一則傳給他的問候訊息', '現在適合跟他講福音嗎？', '為他寫一段簡短的禱告']
    : ['我想開口，但不知道怎麼開始', '他問倒我了，我該怎麼回？', '幫我擬一則關心的訊息', '為我名單上的人禱告'];
}

/* ---------------- 系統提示：小智的身分、界線與根基 ---------------- */
function baseSystem() {
  const lg = (window.I18N && window.I18N.lang) || 'tc';
  const langLine = lg === 'en'
    ? 'IMPORTANT: The user is using the English interface. Reply entirely in natural English. Your name in English is "AI Sage" — always call yourself AI Sage, never Xiaozhi.'
    : lg === 'sc'
      ? '重要：使用者正在使用简体中文介面，请全程以简体中文回答。'
      : '重要：使用者正在使用繁體中文介面，請全程以繁體中文回答。';
  return [
    langLine,
    '你是「小智」，是「321福音同行」App 裡的 AI 傳福音屬靈同伴。使用者是一位願意陪伴人信主的基督徒，他手上有一張名單，上面是他掛念的人（我們稱為他的「2」）。你像一位走在前面一步的屬靈同伴，謙卑、溫暖、務實、滿有盼望。',
    '',
    '【你的界線（最重要）】',
    '一、你不是聖靈，不能代替神。使人重生的是聖靈，不是話術，也不是你。',
    '二、你不取代真實的牧者、屬靈父母與屬靈同伴，總是鼓勵他把難處帶到真實的群體裡。',
    '三、你絕不教人操弄、施壓、催逼或用愧疚感逼人信主。人有說不的自由，也有慢慢來的自由。',
    '四、你不論斷任何人，也不批評對方的家庭、信仰或過去。',
    '五、名單上的人是活生生的靈魂，不是待完成的項目。你要常常把使用者帶回這句話：人比事重要，關係比東西重要。',
    '',
    '【321 理念，是你一切回應的根基】',
    '三個基礎：耶穌是我的榜樣、聖經是我的準則、聖靈是我的引導。',
    '兩個核心：讓耶穌作王、讓耶穌得著一切的榮耀。一個目的：建立屬神的體系。',
    '福音的核心診斷：人的真問題不是行為做得好不好，是「有己」——凡事以自己為中心，自己要作主作王，想要代替神。這就是驕傲：離開人的本位，抓住神的權力。耶穌的死解決我們的罪性與罪行，耶穌的復活賜給我們新生命。信主就是讓耶穌進來作王。',
    '生命的次序：先生命、再關係、後事工。操練：920（對每一個跟我有關係的人，操練無己，結出聖靈的九個果子）、235（屬靈同伴、屬靈父母兒女、屬靈戰友的團隊）。',
    '',
    '【十全大福帖：先談福氣，再談福音】',
    'App 內建整本「十全大福帖」，是社區關懷與陪談佈道的工具。「十全」就是十項上帝全都能給的大福氣，「大福帖」就是得到這十項大福氣的好消息。傳福音的原則是：先談福氣，再談福音；先得福音，再得福氣。人心裡最先浮出來的常常不是罪的問題，是生活的難處；從他的難處進去，才走得到十字架。',
    '得到十全大福的五個要方（福氣就像自來水）：一、要認識上帝，上帝是福氣的源頭，就像水庫；二、要承認罪惡，罪惡是福氣的攔阻，就像土石流；三、要接受耶穌，耶穌是福氣的通路，就像自來水廠；四、要心裡相信，信心是福氣的入口，就像水塔；五、要開口禱告，禱告是福氣的出口，就像水龍頭。',
    '十帖福氣與對象：第一帖罪得赦免（想要心靈自由的人）、第二帖平安喜樂（想要心靈滿足的人）、第三帖病得醫治（想要身體健康的人）、第四帖愛情如意（想要感情美滿的人）、第五帖家庭和樂（想要家庭幸福的人）、第六帖人緣良好（想要得人喜愛的人）、第七帖事業成功（想要功成名就的人）、第八帖凡事富足（想要生活富足的人）、第九帖經歷神能（想要生命剛強的人）、第十帖得著永生（想要永恆生命的人）。',
    '每一帖都有一則禱告良方，架構是五步：稱呼（親愛的天父上帝）、謝謝（謝謝您已經應許賜給我這項福氣）、對不起（承認自己的不完全與罪，求赦免與洗淨）、請（具體求告這項福氣，並求信心與不灰心的持續禱告）、誠心（奉主耶穌的名禱告，阿們）。當使用者帶著某一帖的處境來問，或說對方選了某一帖，請照這五步寫出簡短、口語、可以讓對方自己開口念的禱告，每一步兩三句就好。',
    '指點迷津四篇，用在對方還不願意禱告的時候：覺得現在已經過得很好，用「三生有福」（出生歸入父母家是上半生的幸福、結婚歸入夫妻家是下半生的幸福、受洗歸入天父家是永生的幸福）；覺得要祭拜祖先才孝順，用「三敬才孝」（生命的源頭好像樹根，所以敬拜上帝；生命的管道好像樹幹，所以敬思祖先；生命的入口好像樹枝，所以孝敬父母）；覺得信什麼宗教都一樣，用「三點有別」（使人成為新造的良善、靠耶穌的犧牲得救、救主已從死裡復活）；覺得沒有需要相信耶穌，用「三思而信」。',
    '極重要的平衡，絕不可偏差：福氣是恩典的記號，不是交易的條件。絕不講成功神學，絕不承諾「信了就一定發財、一定病得醫治、一定順利」。要誠實說：上帝樂意賜福，但祂賜下最大的福氣是耶穌自己；有時祂改變環境，有時祂先改變我們；即使沒有醫治、沒有翻轉，祂仍與我們同在。十帖之中最根本的是第一帖罪得赦免與第十帖得著永生，其餘八帖都要指回這位賜福的主，而不是停在福氣本身。也絕不可暗示苦難是懲罰，或責怪對方信心不足。',
    '當使用者問到某一帖的處境（例如對方生病、失業、負債、婚姻困難、怕死、心裡有過不去的罪），請先接住對方的難處與情緒，再用那一帖的重點與一節你確實有把握的和合本經文陪他，然後給使用者一到兩個具體可做的下一步，需要時附上禱告良方五步的簡短禱告，並可以提醒他打開工具頁的十全大福帖，翻到那一帖和對方一起看。',
    '',
    '【這個 App 的架構，你可以隨時指路】',
    '七個里程：L0 相遇（作朋友）、L1 撒種（作見證）、L2 澆灌（作聆聽者）、L3 扎根（作接生者，帶決志）、L4 歸屬（作引路人，受洗進小組）、L5 長大（作父母，一對一門訓）、L6 生養（作教練，放手讓他帶人）。',
    'App 內建的工具：五幕福音敘事與圖解模式、三分鐘與十五分鐘講稿、決志禱告文、疑問解答四十題（含華人處境專區）、破冰問題二十則、見證工作坊、初信三十天陪伴腳本、禱告文範本、920 每日操練、陪伴者挫折十問、金句圖卡。若使用者需要，可以自然地提示他去哪一個工具，例如「工具頁裡有五幕福音敘事，可以先讀一遍」。',
    '',
    '【回答的方式】',
    '一律用繁體中文。引用聖經一律用《和合本》，只在你確實有把握時引用，絕不杜撰經文或出處；不確定就誠實說明。',
    '回應要精簡、務實、可以馬上做。通常兩三段之內，先接住他的心情，再給一到兩個具體可行的下一步，必要時加上一句經文或一段簡短的禱告。',
    '因為回答可能會被朗讀出來：請用自然口語，不要使用表格、不要用直線分隔、不要用井號標題、不要用星號粗體、不要用條列符號。經文出處請寫成可朗讀的形式，例如「約翰福音三章十六節」。',
    '若他要求代擬訊息（例如 LINE 或簡訊），請直接寫出可以複製貼上的短訊，語氣自然、不像傳單、不說教，長度以三到五句為宜。',
    '',
    '【安全與關懷】',
    '只在信仰、聖經、傳福音、陪伴、品格與生活應用的範圍內服事。',
    '若談到醫療、法律、心理危機或自我傷害，溫柔表達關心，鼓勵尋求專業協助與信任的人、牧者，不假裝專業、不下診斷。',
    '不捲入政治爭論。若被要求做違反信仰或有害的事，溫和婉拒，把焦點帶回耶穌。',
    '結尾常常把焦點帶回去：不要爭贏，要愛贏；我栽種了，亞波羅澆灌了，惟有神叫他生長。'
  ].join('\n');
}

/* ---------------- 把「他的情況」整理成給小智的背景 ---------------- */
function personCtx() {
  var p = chat._p;
  if (!p) return '';
  var st = null;
  try { st = stageOf(p.stage); } catch (e) {}
  var nm = chat.anon ? '這位朋友' : p.name;
  var L = [];
  L.push('\n\n【他的情況（使用者提供，請保密，只用於這一次的陪伴建議）】');
  L.push('稱呼：' + nm);
  if (p.relation) L.push('關係：' + p.relation);
  if (st) L.push('目前里程：' + st.id + ' ' + st.name + '（' + st.state + '），陪伴者的角色是「' + st.role + '」，下一個記號是「' + st.sign + '」');
  if (p.prayFrom) L.push('已為他代禱：' + ((daysSince(p.prayFrom) || 0) + 1) + ' 天');
  L.push('上次接觸：' + fmtAgo(p.lastContactAt));
  if (p.background) L.push('背景：' + p.background);
  if (p.prayerFocus) L.push('代禱焦點：' + p.prayerFocus);
  if (chat._inter && chat._inter.length) {
    L.push('最近的關心紀錄：');
    chat._inter.slice(0, 5).forEach(function (x) {
      L.push('・' + fmtDate(x.date) + '　' + (x.type || '') + (x.note ? '：' + x.note : ''));
    });
  }
  if (chat._signs && chat._signs.length) {
    L.push('主動工的記號：');
    chat._signs.slice(0, 4).forEach(function (s) { L.push('・' + s.text); });
  }
  L.push('請以上面的情況為背景，給出貼合他這個里程的具體建議。不要催促使用者往前推進，寧可慢，不可急。若情況顯示應該先停下來單純愛他，就誠實這樣說。');
  return L.join('\n');
}

function sysPrompt() { return baseSystem() + personCtx(); }

/* ---------------- 呼叫 ---------------- */
async function call() {
  chat.busy = true; draw(); toBottom();
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    chat.msgs.push({ role: 'assistant', text: '目前似乎沒有網路，小智暫時陪不了你 🙏\n別忘了——最好的同伴是聖靈與神的話。你隨時可以直接向主傾心吐意，也可以先翻開工具頁的內容。' });
    chat.busy = false; draw(); toBottom(); return;
  }
  var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  var timer = ctrl ? setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 40000) : null;
  try {
    var res = await fetch(XZ_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl ? ctrl.signal : undefined,
      body: JSON.stringify({
        model: XZ_MODEL, max_tokens: 1000,
        system: sysPrompt(),
        messages: chat.msgs.map(function (m) { return { role: m.role, content: m.text }; })
      })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    var text = (data.content || []).filter(function (b) { return b.type === 'text'; })
      .map(function (b) { return b.text; }).join('\n').trim();
    if (!text) text = '小智一時想不出合適的話，但神的話永不落空。要不要換個方式再問一次？';
    chat.msgs.push({ role: 'assistant', text: text });
  } catch (e) {
    var aborted = e && e.name === 'AbortError';
    chat.msgs.push({ role: 'assistant', text: (aborted ? '小智等候得有點久，先暫停一下 🙏 請稍後再試。' : '小智暫時連不上線，請稍後再試 🙏') + '\n別忘了——使人重生的是聖靈，不是我們。你現在就可以為他禱告一分鐘。' });
  } finally { if (timer) clearTimeout(timer); }
  chat.busy = false; draw(); toBottom();
}

/* ---------------- 收藏 ---------------- */
function favs() { return LS.get('xzFavs', []); }
function favSig(q, a) { return String(q || '').replace(/\s+/g, '').slice(0, 80) + '⟶' + String(a || '').replace(/\s+/g, '').slice(0, 120); }
function isFav(q, a) { var F = favs(), s = favSig(q, a); for (var i = 0; i < F.length; i++) if (favSig(F[i].q, F[i].a) === s) return true; return false; }

/* ---------------- 畫面 ---------------- */
function fmt(s) { return esc(s).split('\n').join('<br>'); }
function toBottom() { var m = document.getElementById('xz-msgs'); if (m) m.scrollTop = m.scrollHeight; }
window.__xzText = function (i) { var m = chat.msgs[i]; return m ? String(m.text || '') : ''; };
window.__xzFavText = function (i) { var f = favs()[i]; return f ? String(f.a || '') : ''; };

function whoBar() {
  var h = '<div class="xz-who"><span class="lb">陪伴對象</span>';
  h += '<button class="xz-wchip" aria-pressed="' + (chat.pid ? 'false' : 'true') + '" data-xz="who" data-id="">不指定</button>';
  people.forEach(function (p) {
    var st = null; try { st = stageOf(p.stage); } catch (e) {}
    h += '<button class="xz-wchip" aria-pressed="' + (chat.pid === p.id ? 'true' : 'false') + '" data-xz="who" data-id="' + p.id + '">'
      + esc(p.name) + (st ? '・' + st.id : '') + '</button>';
  });
  if (chat.pid) h += '<button class="xz-wchip" aria-pressed="' + (chat.anon ? 'true' : 'false') + '" data-xz="anon">🔒 用代號</button>';
  return h + '</div>';
}

function picker(label) {
  var h = '<div class="xz-lb">' + esc(label) + '</div><div class="xz-cats">';
  h += XZ_TOPICS.map(function (t, i) {
    return '<button class="xz-cat" aria-pressed="' + (chat.topic === i ? 'true' : 'false') + '" data-xz="cat" data-i="' + i + '">' + esc(t.c) + '</button>';
  }).join('');
  h += '</div>';
  if (chat.topic >= 0 && XZ_TOPICS[chat.topic]) {
    h += '<div class="xz-quicks" id="xz-topicqs" style="margin-top:10px">'
      + XZ_TOPICS[chat.topic].qs.map(function (q, j) {
        return '<button class="xz-quick" data-xz="ask" data-i="' + chat.topic + '" data-j="' + j + '">' + esc(q) + '</button>';
      }).join('') + '</div>';
  }
  return h;
}

function favsHTML() {
  var F = favs();
  var h = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">'
    + '<button class="xz-act" data-xz="favs">‹ 返回對話</button>'
    + '<div style="font-weight:700">⭐ 我的收藏（' + F.length + '）</div></div>';
  if (!F.length) return h + '<div class="xz-fav-card"><div class="xz-fav-a">還沒有收藏。<br>在喜歡的回答下方點「☆ 收藏」，日後就能在這裡翻閱 🙏</div></div>';
  F.forEach(function (f, i) {
    h += '<div class="xz-fav-card">'
      + (f.q ? '<div class="xz-fav-q">' + esc(f.q) + '</div>' : '')
      + '<div class="xz-fav-a">' + fmt(f.a) + '</div>'
      + '<div class="xz-acts">'
      + '<button class="xz-act" data-xz="speakfav" data-i="' + i + '">🔊 朗讀</button>'
      + '<button class="xz-act" data-xz="copyfav" data-i="' + i + '">📋 複製</button>'
      + '<button class="xz-act" data-xz="delfav" data-i="' + i + '">🗑 移除</button>'
      + '</div></div>';
  });
  return h;
}

function draw() {
  if (!host) return;
  var h = '<button class="xz-fab" data-xz="open"><span class="ic">✨</span>小智</button>';
  if (chat.open) {
    var body = '';
    if (chat.favView) body = favsHTML();
    else {
      var intro = chat._p
        ? ('平安！我是小智 ✨ 我們一起來想想' + (chat.anon ? '「這位朋友」' : '「' + chat._p.name + '」') + '的事。要開口、要回答疑問、要擬訊息、要禱告，都可以問我。')
        : '平安！我是小智 ✨ 我是你傳福音路上的屬靈同伴。開口、破冰、回答疑問、講福音、邀請決志、跟進初信、擬一則訊息、為他禱告——都可以問我。你也可以先在上面選一位陪伴對象。';
      body = '<div class="xz-msg"><div class="xz-bub">' + esc(intro) + '</div></div>';
      chat.msgs.forEach(function (m, i) {
        if (m.role === 'user') {
          body += '<div class="xz-msg me"><div class="xz-bub">' + fmt(m.text) + '</div></div>';
        } else {
          var q = (i > 0 && chat.msgs[i - 1] && chat.msgs[i - 1].role === 'user') ? chat.msgs[i - 1].text : '';
          var on = isFav(q, m.text);
          body += '<div class="xz-msg"><div class="xz-bub">' + fmt(m.text)
            + '<div class="xz-acts">'
            + '<button class="xz-act" data-xz="speak" data-i="' + i + '">🔊 朗讀</button>'
            + '<button class="xz-act" data-xz="copy" data-i="' + i + '">📋 複製</button>'
            + '<button class="xz-act' + (on ? ' on' : '') + '" data-xz="fav" data-i="' + i + '">' + (on ? '★ 已收藏' : '☆ 收藏') + '</button>'
            + '<button class="xz-act" data-xz="del" data-i="' + i + '">🗑 刪除</button>'
            + '</div></div></div>';
        }
      });
      if (chat.busy) body += '<div class="xz-msg"><div class="xz-bub xz-typing"><span></span><span></span><span></span></div></div>';
      if (!chat.msgs.length) {
        body += '<div class="xz-lb">先從這裡開始</div><div class="xz-quicks">'
          + quicks().map(function (q, i) { return '<button class="xz-quick" data-xz="quick" data-i="' + i + '">' + esc(q) + '</button>'; }).join('')
          + '</div>' + picker('或者，挑一個需要．點範疇看更多提問');
      } else if (!chat.busy) {
        body += '<div class="xz-sep">· 前面的問答都保留著 ·</div>' + picker('換個需要．回這裡繼續發問');
      }
    }
    h += '<div class="xz-overlay" data-xz="bg"><div class="xz-sheet">'
      + '<div class="xz-head"><span class="ava">✨</span><div class="grow"><div class="nm">小智</div>'
      + '<div class="rl">傳福音的屬靈同伴 · 陪你把人帶到耶穌面前</div></div>'
      + '<button class="xz-hbtn" data-xz="favs" aria-label="收藏">⭐</button>'
      + '<button class="xz-hbtn" data-xz="clear" aria-label="重新開始">🏠</button>'
      + '<button class="xz-hbtn" data-xz="close" aria-label="關閉">✕</button></div>'
      + whoBar()
      + '<div class="xz-msgs" id="xz-msgs">' + body + '</div>'
      + '<div class="xz-foot"><input id="xz-in" class="xz-input" type="text" placeholder="向小智提問…" '
      + 'onkeydown="if(event.key===\'Enter\')window.__xzSend()"><button class="xz-send" data-xz="send">送出</button></div>'
      + '<div class="xz-note">小智是 AI 幫手，不能代替聖靈、神的話與真實的屬靈同伴。使人重生的是聖靈 🙏'
      + (chat.pid ? '<br>選定對象時，上述背景摘要會送到 AI 服務端以便回應。' : '') + '</div>'
      + '</div></div>';
  }
  host.innerHTML = h;
  wireFab();
}

/* ---------------- 互動 ---------------- */
function send(t) {
  if (chat.busy) return;
  t = (t || '').trim(); if (!t) return;
  chat.favView = false; chat.topic = -1;
  chat.msgs.push({ role: 'user', text: t });
  draw(); toBottom(); call();
}
window.__xzSend = function () {
  var i = document.getElementById('xz-in'); if (!i) return;
  var t = i.value; i.value = ''; send(t);
};

async function loadPeople() {
  try { people = (await DB.all('persons')).sort(function (a, b) { return (a.order || 0) - (b.order || 0); }); }
  catch (e) { people = []; }
}
async function setPerson(id) {
  chat.pid = id || '';
  chat._p = null; chat._inter = null; chat._signs = null;
  if (!id) { draw(); return; }
  try {
    chat._p = await DB.get('persons', id);
    var all = await DB.all('interactions');
    chat._inter = all.filter(function (x) { return x.personId === id; }).sort(function (a, b) { return b.date.localeCompare(a.date); });
    var sg = await DB.all('signs');
    chat._signs = sg.filter(function (x) { return x.personId === id; });
  } catch (e) {}
  draw();
}

async function open(pid) {
  await loadPeople();
  chat.open = true;
  if (pid !== undefined) await setPerson(pid);
  else draw();
  toBottom();
  setTimeout(function () { var i = document.getElementById('xz-in'); if (i) i.focus(); }, 80);
}
function close() { chat.open = false; TTS.stop(); draw(); }

/* 供其他模組呼叫：直接打開小智並展開指定主題 */
window.__xzTopic = function (name) {
  for (var i = 0; i < XZ_TOPICS.length; i++) {
    if (XZ_TOPICS[i].c === name) { chat.topic = i; break; }
  }
  open();
};

function copyText(t) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t).then(function () { toast('已複製，可以貼到 LINE 傳給他'); },
      function () { toast('複製失敗，請長按選取文字'); });
  } else {
    try {
      var ta = document.createElement('textarea');
      ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      toast('已複製，可以貼到 LINE 傳給他');
    } catch (e) { toast('複製失敗，請長按選取文字'); }
  }
}

/* 事件：整包委派，重畫也不會失效 */
document.addEventListener('click', function (ev) {
  var el = ev.target.closest ? ev.target.closest('[data-xz]') : null;
  if (!el) return;
  var a = el.dataset.xz, i = +el.dataset.i, j = +el.dataset.j;
  if (a === 'bg') { if (ev.target === el) close(); return; }
  ev.preventDefault();
  if (a === 'open') { if (!window.__xzDragged) open(); }
  else if (a === 'close') close();
  else if (a === 'send') window.__xzSend();
  else if (a === 'who') setPerson(el.dataset.id);
  else if (a === 'anon') { chat.anon = !chat.anon; draw(); toast(chat.anon ? '將以「這位朋友」代稱' : '將使用名單上的稱呼'); }
  else if (a === 'cat') { chat.topic = (chat.topic === i ? -1 : i); draw(); var q = document.getElementById('xz-topicqs'); if (q && q.scrollIntoView) q.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  else if (a === 'ask') { var t = XZ_TOPICS[i] && XZ_TOPICS[i].qs[j]; if (t) send(t); }
  else if (a === 'quick') { send(quicks()[i]); }
  else if (a === 'speak') { TTS.speak(window.__xzText(i)); }
  else if (a === 'speakfav') { TTS.speak(window.__xzFavText(i)); }
  else if (a === 'copy') { copyText(window.__xzText(i)); }
  else if (a === 'copyfav') { copyText(window.__xzFavText(i)); }
  else if (a === 'fav') {
    var m = chat.msgs[i]; if (!m) return;
    var q0 = (i > 0 && chat.msgs[i - 1] && chat.msgs[i - 1].role === 'user') ? chat.msgs[i - 1].text : '';
    var F = favs(), sig = favSig(q0, m.text), idx = -1;
    for (var k = 0; k < F.length; k++) if (favSig(F[k].q, F[k].a) === sig) { idx = k; break; }
    if (idx >= 0) { F.splice(idx, 1); toast('已移除收藏'); }
    else { F.unshift({ q: q0, a: m.text, t: Date.now() }); toast('⭐ 已收藏'); }
    LS.set('xzFavs', F); draw();
  }
  else if (a === 'del') {
    if (!chat.msgs[i]) return;
    if (!window.confirm('刪除這則對話？')) return;
    var from = i, cnt = 1;
    if (i > 0 && chat.msgs[i - 1] && chat.msgs[i - 1].role === 'user') { from = i - 1; cnt = 2; }
    chat.msgs.splice(from, cnt); draw();
  }
  else if (a === 'delfav') {
    if (!window.confirm('從收藏移除這一則？')) return;
    var Fx = favs(); Fx.splice(i, 1); LS.set('xzFavs', Fx); draw();
  }
  else if (a === 'favs') { chat.favView = !chat.favView; draw(); var mm = document.getElementById('xz-msgs'); if (mm) mm.scrollTop = 0; }
  else if (a === 'clear') {
    if (chat.msgs.length && !window.confirm('要清空目前所有問答、重新開始嗎？（已收藏的不受影響）')) return;
    TTS.stop(); chat.msgs = []; chat.topic = -1; chat.favView = false; draw();
  }
}, true);

/* 浮動鈕可拖曳，位置記住 */
function wireFab() {
  var fab = host.querySelector('.xz-fab'); if (!fab) return;
  var pos = LS.get('xzPos', null);
  if (pos) {
    var w = fab.offsetWidth || 110, hh = fab.offsetHeight || 48;
    var x = Math.max(6, Math.min(pos.x, window.innerWidth - w - 6));
    var y = Math.max(6, Math.min(pos.y, window.innerHeight - hh - 6));
    fab.style.left = x + 'px'; fab.style.top = y + 'px'; fab.style.right = 'auto'; fab.style.bottom = 'auto';
  }
  if (fab.__wired) return; fab.__wired = true;
  var sx = 0, sy = 0, ox = 0, oy = 0, moved = false, dragging = false;
  fab.addEventListener('pointerdown', function (e) {
    var r = fab.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top; moved = false; dragging = true;
    try { fab.setPointerCapture(e.pointerId); } catch (x) {}
  });
  fab.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) moved = true;
    if (!moved) return;
    var w = fab.offsetWidth, hh = fab.offsetHeight;
    fab.style.left = Math.max(6, Math.min(ox + dx, window.innerWidth - w - 6)) + 'px';
    fab.style.top = Math.max(6, Math.min(oy + dy, window.innerHeight - hh - 6)) + 'px';
    fab.style.right = 'auto'; fab.style.bottom = 'auto';
  });
  function end(e) {
    if (!dragging) return; dragging = false;
    try { fab.releasePointerCapture(e.pointerId); } catch (x) {}
    if (moved) {
      var r = fab.getBoundingClientRect();
      LS.set('xzPos', { x: Math.round(r.left), y: Math.round(r.top) });
      window.__xzDragged = true; setTimeout(function () { window.__xzDragged = false; }, 350);
    }
  }
  fab.addEventListener('pointerup', end);
  fab.addEventListener('pointercancel', end);
}

/* ---------------- 接進工具頁與個人卡 ---------------- */
ACTS.openXiaozhi = function () { open(); };
ACTS.xzAskPerson = function (d) { open(d.id); };

var _tools = VIEWS.tools;
VIEWS.tools = async function () {
  var head = '<div class="card">'
    + '<div class="eyebrow">AI 屬靈同伴</div>'
    + '<h2 class="sec">小智 · 隨時可問</h2>'
    + '<p class="muted">不知道怎麼開口、被問倒了、想擬一則訊息、想為他禱告——'
    + '先問問小智，他會陪你把焦點對準耶穌。<br>'
    + '小智不能代替聖靈，也不能代替真實的屬靈同伴。</p>'
    + '<button class="btn" data-act="openXiaozhi" style="margin-top:12px">✨ 打開小智</button>'
    + '<p class="tiny" style="margin-top:10px">可以先在小智裡選一位陪伴對象，建議會更貼近他現在的里程。</p>'
    + '</div>';
  return head + (await _tools.apply(this, arguments));
};

var _person = SHEETS.person;
SHEETS.person = async function (arg) {
  var html = await _person.apply(this, arguments);
  if (!arg || !arg.id) return html;
  return html + '<div class="card">'
    + '<div class="eyebrow">AI 屬靈同伴</div>'
    + '<h2 class="sec">問小智：下一步怎麼走</h2>'
    + '<p class="muted">小智會依他目前的里程與你記下的情況，'
    + '陪你想一個具體、不催逼的下一步。</p>'
    + '<button class="btn" data-act="xzAskPerson" data-id="' + esc(arg.id) + '" style="margin-top:12px">✨ 帶著他的情況問小智</button>'
    + '</div>';
};

/* ---------------- 啟動 ---------------- */
host = document.createElement('div');
host.id = 'xiaozhi';
document.body.appendChild(host);
draw();

})();