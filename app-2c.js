(function () {
'use strict';
var G = window.__G; if (!G) return;
var LS = G.LS, DB = G.DB, esc = G.esc, uid = G.uid, toast = G.toast, $ = G.$,
    ACTS = G.ACTS, VIEWS = G.VIEWS, SHEETS = G.SHEETS, push = G.push, popSheet = G.popSheet,
    refreshSheet = G.refreshSheet, closeSheet = G.closeSheet, render = G.render,
    todayISO = G.todayISO, fmtDate = G.fmtDate, confirmBox = G.confirmBox, TTS = G.TTS;

/* ---------------- 十帖福氣 ---------------- */
var TEN = [
  { id:'t1', no:'第一帖', name:'罪得赦免', who:'想要心靈自由的人',
    body:'罪就是達不到上帝完全的標準。無論我們在思想、言語、行為上不完全的部分，得罪神和人的事情，只要我們向上帝認罪，並接受耶穌的救贖恩典，上帝必要赦免我們一切的過犯，洗淨我們一切的不義。因為耶穌已擔當我們的罪為我們釘死在十字架上，使我們的罪得赦免。',
    verses:[
      {t:'得赦免其過、遮蓋其罪的，這人是有福的。', r:'詩篇三十二篇1節'},
      {t:'我們藉這愛子的血得蒙救贖，過犯得以赦免，乃是照他豐富的恩典。', r:'以弗所書一章7節'},
      {t:'我們若認自己的罪，神是信實的，是公義的，必要赦免我們的罪，洗淨我們一切的不義。', r:'約翰壹書一章9節'}],
    pray:{
      thanks:'謝謝您已經應許賜給我罪得赦免的福氣。',
      sorry:'對不起我沒有遵行您的旨意，犯罪得罪了您，以致於心靈被罪綑綁不自由，求您赦免我的罪並且洗淨我的心靈。我迫切渴慕您賜給我罪得赦免的福氣。',
      ask:'請您赦免我一切的過犯，我知道我的思想、言語、行為常常得罪您也傷害到別人，我願意向您承認我的罪，並請您釋放我因為犯罪而有的心靈不平安、不自由、疾病、失眠等各樣的痛苦。請您賜我信心和能力不再犯罪，並讓我不灰心的持續禱告，直到您釋放我能勝過罪。'} },

  { id:'t2', no:'第二帖', name:'平安喜樂', who:'想要心靈滿足的人',
    body:'耶穌是平安的主，喜樂的神。耶穌能除去我們心中一切的憂慮和恐懼，擔當我們生活上的壓力，並能賜給你的心靈，超越外在環境苦難的真平安、大喜樂。',
    verses:[
      {t:'我留下平安給你們，我將我的平安賜給你們。我所賜的，不像世人所賜的，你們心裡不要憂愁，也不要膽怯。', r:'約翰福音十四章27節'},
      {t:'應當一無掛慮，只要凡事藉著禱告、祈求，和感謝，將你們所要的告訴神。神所賜出人意外的平安，必在基督耶穌裡保守你們的心懷意念。', r:'腓立比書四章6至7節'},
      {t:'你們雖然沒有見過他，卻是愛他；如今雖不得看見，卻因信他就有說不出來、滿有榮光的大喜樂。', r:'彼得前書一章8節'}],
    pray:{
      thanks:'謝謝您願意賜給我心靈的平安和喜樂。',
      sorry:'對不起我沒有遵行您的旨意，得罪了您，以致於失去了平安和喜樂。現在我向您承認我的不完全和我一切的罪，求您赦免我的罪並且洗淨我的心靈。我迫切渴慕您賜給我平安喜樂的福氣。',
      ask:'請您將在基督裡的平安和在聖靈裡的喜樂充滿我。現在我把心中的沮喪、憂慮、恐懼都交給您，因為您是賜平安喜樂的上帝。求您幫助我遇到任何困難時，不要害怕、不要憂慮和埋怨，不致於影響到我心靈、身體的健康和睡眠的品質。請幫助我不住的禱告，直到您的平安喜樂充滿我的心中。'} },

  { id:'t3', no:'第三帖', name:'病得醫治', who:'想要身體健康的人',
    body:'上帝是創造我們身體的主宰，也是醫治我們身體疾病的醫生。全能的救主耶穌能醫治一切的疾病。因為耶穌已在十字架上，為我們擔當了一切的疾病和痛苦，為我們受鞭傷使我們能得醫治。耶穌十字架救贖的恩典，可以使相信他的人都能經歷病得醫治的祝福。',
    verses:[
      {t:'他為我們的過犯受害，為我們的罪孽壓傷。因他受的刑罰，我們得平安；因他受的鞭傷，我們得醫治。', r:'以賽亞書五十三章5節'},
      {t:'這是要應驗先知以賽亞的話，說：他代替我們的軟弱，擔當我們的疾病。', r:'馬太福音八章17節'},
      {t:'出於信心的祈禱要救那病人，主必叫他起來；他若犯了罪，也必蒙赦免。所以你們要彼此認罪，互相代求，使你們可以得醫治。', r:'雅各書五章15至16節'}],
    pray:{
      thanks:'謝謝您賜給我身體和心靈並且願意醫治我的疾病。',
      sorry:'對不起我沒有遵行您的旨意，以致於生病不健康。現在我向您承認我的不完全和我一切的罪，求您赦免我的罪並且洗淨我的心靈。我迫切渴慕您賜給我病得醫治的福氣。',
      ask:'請您藉著主耶穌為我受的鞭傷醫治我的疾病，並且賜給我信心能禱告接受耶穌的醫治，也請您賜給我的身體有自己復原的力量，並給醫生智慧和能力，為我做最好的診斷和醫療。並讓我不灰心的持續禱告，直到您的醫治臨到我。'} },

  { id:'t4', no:'第四帖', name:'愛情如意', who:'想要感情美滿的人',
    body:'上帝就是愛，我們愛因為上帝先愛我們，因為愛從上帝而來。上帝賜下愛情，使男女互相吸引，彼此相愛，享受愛情的歡愉，進而願意結為夫妻二人成為一體，合而為一。',
    verses:[
      {t:'愛情，眾水不能息滅，大水也不能淹沒。若有人拿家中所有的財寶要換愛情，就全被藐視。', r:'雅歌八章7節'},
      {t:'凡事包容，凡事相信，凡事盼望，凡事忍耐。愛是永不止息。', r:'哥林多前書十三章7至8節'},
      {t:'我們相愛，不要只在言語和舌頭上，總要在行為和誠實上。', r:'約翰壹書三章18節'}],
    pray:{
      thanks:'謝謝您賜給我愛與被愛的能力，並且願意幫助我愛情如意。',
      sorry:'對不起我沒有遵行您的旨意，以致於我不能無私地愛人。現在我向您承認我的不完全和我一切的罪，求您赦免我的罪，並且洗淨我的心靈。我迫切渴慕您賜給我愛情如意的福氣。',
      ask:'請您帶領我的愛情，為我預備一生真心相愛的伴侶。幫助我預備自己成為對方最合適的另一半。請您賜給我無私捨己的愛，願意無怨無悔地接納對方的缺點，欣賞他的優點，饒恕他的過錯，並且尊重他的選擇，愛他如同愛自己一樣。'} },

  { id:'t5', no:'第五帖', name:'家庭和樂', who:'想要家庭幸福的人',
    body:'上帝設立了家庭，他願意幫助我們家庭和樂而且興盛。耶穌也是我們家庭的救主和一家之主，耶穌能使我們家庭夫妻恩愛，兒女孝敬父母，兄弟姐妹彼此相親相愛，彼此有良好的溝通與互動，家庭幸福又美滿。',
    verses:[
      {t:'你們作兒女的，要在主裡聽從父母，這是理所當然的。要孝敬父母，使你得福。你們作父親的，不要惹兒女的氣，只要照著主的教訓和警戒養育他們。', r:'以弗所書六章1至4節'},
      {t:'你們作妻子的，當順服自己的丈夫，如同順服主。你們作丈夫的，要愛你們的妻子，正如基督愛教會，為教會捨己。', r:'以弗所書五章22、25節'},
      {t:'看哪，弟兄和睦同居是何等地善，何等地美！', r:'詩篇一百三十三篇1節'}],
    pray:{
      thanks:'謝謝您賜給我家庭並且願意幫助我家庭和樂。',
      sorry:'對不起我沒有遵行您的旨意，以致於我的家庭不夠和樂。現在我向您承認我的不完全和我一切的罪，求您赦免我的罪並且洗淨我的心靈。我迫切渴慕您賜給我家庭和樂的福氣。',
      ask:'請您幫助我們家人，給我們信心、盼望和真愛，使我們家中的衝突能得到好的解決，溝通能得到改善，也請您讓我們能夠彼此付出真誠的關心、真實的彼此相愛。我願意接納家人的缺點和不同的生活習慣，並且饒恕家人的過錯和對我的任何傷害。請您幫助我們家人能夠遵行聖經的原則，扮演好個人在家中的角色及善盡個人的本分，增進家庭的和樂。'} },

  { id:'t6', no:'第六帖', name:'人緣良好', who:'想要得人喜愛的人',
    body:'上帝要我們作光作鹽，犧牲自己成全別人。與眾人和睦相處，得眾人的喜愛。朋友不是去尋找的，乃是去交往的。主動地和人作朋友，看到人就微笑，熱情地問候關懷，善待別人，自然能成為受歡迎的人。',
    verses:[
      {t:'耶穌的智慧和身量，並神和人喜愛他的心，都一齊增長。', r:'路加福音二章52節'},
      {t:'讚美神，得眾民的喜愛。', r:'使徒行傳二章47節'},
      {t:'若是能行，總要盡力與眾人和睦。', r:'羅馬書十二章18節'},
      {t:'你們願意人怎樣待你們，你們也要怎樣待人。', r:'路加福音六章31節'}],
    pray:{
      thanks:'謝謝您賜給我朋友並且願意幫助我有良好的人際關係。',
      sorry:'對不起我沒有遵行您的旨意，以致於我的人際關係不夠好。現在我向您承認我的不完全和我一切的罪，求您赦免我的罪並且洗淨我的心靈。我迫切渴慕您賜給我人緣良好的福氣。',
      ask:'請您幫助我能主動地去結交朋友，去愛別人，欣賞別人的優點，尊重別人的想法，鼓勵別人的表現，關懷別人的需要，成全別人的事情，作別人的好朋友。請您讓我也願意包容別人的個性，接納別人的缺點，饒恕別人的過犯，忍耐別人的脾氣，使我能盡力與眾人和睦，得眾人的喜愛。'} },

  { id:'t7', no:'第七帖', name:'事業成功', who:'想要功成名就的人',
    body:'上帝是賜福的上帝。只要我們謹守遵行上帝的命令，上帝就要賜福我們的工作事業居上不居下，作首不作尾。只要我們跟隨上帝的道路，上帝的恩惠慈愛必定追隨我們，賜福我們的工作事業順利亨通、興盛成功，使自己得祝福，別人得幫助，上帝得榮耀。',
    verses:[
      {t:'惟喜愛耶和華的律法，晝夜思想，這人便為有福。他要像一棵樹栽在溪水旁，按時候結果子，葉子也不枯乾。凡他所做的盡都順利。', r:'詩篇一篇2至3節'},
      {t:'你若聽從耶和華你神的誡命，就是我今日所吩咐你的，謹守遵行，不偏左右，也不隨從事奉別神，耶和華就必使你作首不作尾，但居上不居下。', r:'申命記二十八章13至14節'},
      {t:'但忍耐也當成功，使你們成全、完備，毫無缺欠。', r:'雅各書一章4節'}],
    pray:{
      thanks:'謝謝您賜給我工作事業並且願意幫助我事業成功。',
      sorry:'對不起我沒有遵行您的旨意，以致於我的工作事業不順利不成功。現在我向您承認我的不完全和我一切的罪，求您赦免我的罪並且洗淨我的心靈。我迫切渴慕您賜給我事業成功的福氣。',
      ask:'請您幫助我喜愛思想您的話語，並且遵行您的命令不偏左右。請您照著您的應許賜福我的道路亨通，凡事順利，讓我做事遇到困難時，能夠不灰心、不放棄、忍耐到底，直到最後成功。'} },

  { id:'t8', no:'第八帖', name:'凡事富足', who:'想要生活富足的人',
    body:'上帝是富足的上帝，他何等希望他的兒女們可以凡事富足，一無所缺，享受他的愛與恩福。以至於我們能去與別人分享上帝的恩福，祝福別人，使別人也能夠認識上帝，信靠上帝成為富足。',
    verses:[
      {t:'你們知道我們主耶穌基督的恩典：他本來富足，卻為你們成了貧窮，叫你們因他的貧窮，可以成為富足。', r:'哥林多後書八章9節'},
      {t:'那賜種給撒種的，賜糧給人吃的，必多多加給你們種地的種子，又增添你們仁義的果子；叫你們凡事富足，可以多多施捨，就藉著我們使感謝歸於神。', r:'哥林多後書九章10至11節'},
      {t:'耶和華所賜的福使人富足，並不加上憂慮。', r:'箴言十章22節'}],
    pray:{
      thanks:'謝謝您賜給我所需用的一切恩典並且願意幫助我凡事富足。',
      sorry:'對不起我沒有遵行您的旨意，以致於我得不到您所賜的富足。現在我向您承認我的不完全和我一切的罪，求您赦免我的罪並且洗淨我的心靈。我迫切渴慕您賜給我凡事富足的福氣。',
      ask:'請您幫助我努力殷勤地工作，善於理財。請您賜福我凡事富足，一無所缺，不背負債務，也不加上任何憂慮，並且可以多多施捨，幫助別人。'} },

  { id:'t9', no:'第九帖', name:'經歷神能', who:'想要生命剛強的人',
    body:'上帝是無所不能的上帝。在人不能的，在上帝凡事都能。人的盡頭就是上帝的起頭。苦難是化妝的祝福，只要信靠上帝，上帝有本事把壞事變好事。上帝最奇妙的能力就是改變人的生命使我們重生，得著新生命，並且讓我們被聖靈充滿，得著能力，生命愈來愈美好。',
    verses:[
      {t:'信的人必有神蹟隨著他們。門徒出去，到處宣傳福音。主和他們同工，用神蹟隨著，證實所傳的道。', r:'馬可福音十六章17、20節'},
      {t:'他曾照自己的大憐憫，藉耶穌基督從死裡復活，重生了我們，叫我們有活潑的盼望。', r:'彼得前書一章3節'},
      {t:'但聖靈降臨在你們身上，你們就必得著能力。', r:'使徒行傳一章8節'}],
    pray:{
      thanks:'謝謝您賜給我應許使我可以經歷神能，得著重生並被聖靈充滿，人生愈來愈美好。',
      sorry:'對不起我沒有遵行您的旨意得罪了您，以致於失去了經歷神能的恩典。現在我向您承認我的不完全和我一切的罪，求您赦免我的罪並且洗淨我的心靈。我迫切渴慕您賜給我經歷神能的福氣。',
      ask:'請您藉著主耶穌使我重生得著豐盛的新生命，也請您藉著聖靈充滿我，使我得著能力，能夠堅心信靠您，使我在苦難中，能得著祝福，經歷上帝把壞事變好事的神奇大能。'} },

  { id:'t10', no:'第十帖', name:'得著永生', who:'想要永恆生命的人',
    body:'今生是短暫的生命，永生是永遠的生命。今生是不完美的生命，永生是完美的生命。耶穌是賜我們永生的救主，永生就是像上帝的生命，是豐盛的生命，也是可以進入天國屬靈的生命。永生是人生最重要的福氣，只要我們接受、信靠耶穌就能得著永生。',
    verses:[
      {t:'神愛世人，甚至將他的獨生子賜給他們，叫一切信他的，不至滅亡，反得永生。', r:'約翰福音三章16節'},
      {t:'信子的人有永生；不信子的人得不著永生。', r:'約翰福音三章36節'},
      {t:'人為神的國撇下…沒有在今世不得百倍，在來世不得永生的。', r:'路加福音十八章29至30節'}],
    pray:{
      thanks:'謝謝您賜給我今生也應許賜給我得著永生。',
      sorry:'對不起我沒有遵行您的旨意得罪了您，以致於失去了永生。現在我向您承認我的不完全和我一切的罪，求您赦免我的罪並且洗淨我的心靈。我迫切渴慕您賜給我得著永生的福氣。',
      ask:'請您將永生賜給我，使我可以進入天國，不再害怕死亡。也請您幫助我天天能得著像上帝一樣的新生命，我把自己舊生命中的自私、驕傲和貪心以及各樣的軟弱和缺點都交給您。求您用您的生命，來改變我的生命。'} }
];

/* ---------------- 五個要方 ---------------- */
var FIVE = [
  { n:'一', t:'要認識上帝', k:'上帝是福氣的源頭', fig:'就像水庫',
    b:'上帝是天地萬物的創造主宰，是萬神之神，萬福的根源。上帝是創造我們愛我們的天父，他樂意賞賜我們各樣的福氣。' },
  { n:'二', t:'要承認罪惡', k:'罪惡是福氣的攔阻', fig:'就像土石流',
    b:'罪惡就是不照上帝的意思，不聽從上帝的話語，達不到上帝完全的標準。罪惡使我們與上帝隔絕，攔阻了上帝所要賜給我們的福氣。' },
  { n:'三', t:'要接受耶穌', k:'耶穌是福氣的通路', fig:'就像自來水廠',
    b:'耶穌是上帝所愛的獨生子，為了愛我們，想要賜福我們，降生為人。耶穌擔當我們一切所有罪惡，為我們被釘死在十字架上，並且從死裡復活，為我們開了一條又新又活的蒙福之路。使我們可以除掉罪惡，勝過死亡，得著永生。' },
  { n:'四', t:'要心裡相信', k:'信心是福氣的入口', fig:'就像水塔',
    b:'信心是心裡看見那看不見之事的確據，是接受上帝所賜之福的容器。當我們聽到上帝所告訴我們的福音而選擇相信時就必領受福氣。' },
  { n:'五', t:'要開口禱告', k:'禱告是福氣的出口', fig:'就像水龍頭',
    b:'禱告就是開口把心裡所相信的事向上帝說出來，求告他的名，並且告訴他我們心裡想要得到的福氣，照著上帝的應許禱告時只要相信是會得到的就必定得到。' }
];

var BIGPRAY = {
  thanks:'謝謝您如此地愛我，甚至將您的獨生子耶穌基督賜給我，為我的罪被釘死在十字架上，並且為我的義從死裡復活。',
  sorry:'對不起我過去不認識您不相信您，沒有遵行您的旨意，得罪了您。現在我向您承認我的不完全和我一切的罪。',
  ask:'請您赦免我，用主耶穌的寶血除去我的罪並且洗淨我一切的不義。我願意打開心門接受主耶穌，進入我的心中，作我的救主和生命的主。請您以主耶穌的聖靈充滿我，賜給我新生命，使我成為您的兒女。請您賜給我得救的信心以及您所應許的福氣。'
};

/* ---------------- 指點迷津四篇 ---------------- */
var TURN = [
  { id:'a1', name:'三生有福', when:'覺得現在已經過得很好的人', sub:'人有三生的幸福，要抓住機會，把握幸福',
    rows:[['上半生的幸福','出生歸入父母家，父母的愛帶給我上半生的幸福。'],
          ['下半生的幸福','結婚歸入夫妻家，夫妻的愛帶給我下半生的幸福。'],
          ['永生的幸福','受洗歸入天父家，天父的愛帶給我永生的幸福。']],
    tail:'現在過得好，是上帝的恩典；但今生的福氣有期限，永生的福氣沒有期限。您已經有兩生的幸福，還差一生，就十全十美了。' },
  { id:'a2', name:'三敬才孝', when:'覺得要祭拜祖先才孝順的人', sub:'吃果子要拜樹頭。生命好像果子，我們生命的產生有三個對象要敬愛，才算真正的孝。',
    rows:[['生命的源頭　好像樹根','上帝創造我們的生命，所以我們要敬拜上帝。'],
          ['生命的管道　好像樹幹','祖先傳承我們的生命，所以我們要敬思祖先。'],
          ['生命的入口　好像樹枝','父母生養我們的生命，所以我們要孝敬父母。']],
    tail:'基督徒不是不孝，是把敬拜歸給創造生命的上帝，把敬思歸給祖先，把孝敬歸給還在世的父母——趁父母還在，這才是最實在的孝。' },
  { id:'a3', name:'三點有別', when:'覺得信什麼宗教都一樣的人', sub:'基督教和其他宗教的最大差別',
    rows:[['使人成為良善的人　就像聖誕樹掛果子和蘋果樹結果子的差別','其他宗教都是勸人為善，基督教卻是使人作新造的人成為善良。'],
          ['靠耶穌的犧牲得救　就像自己抱不動自己和別人抱得動我們的差別','其他宗教都是靠自己的努力得救，基督教卻是靠耶穌的犧牲得救。'],
          ['耶穌已從死裡復活　就像溺水時需要教練或救生員的差別','其他宗教的教主都死了，基督教的救主耶穌卻已經從死裡復活。']],
    tail:'差別不在誰的道理比較高，而在誰有本事救我們。掛上去的果子會掉，長出來的果子才會結不停。' },
  { id:'a4', name:'三思而信', when:'覺得沒有需要相信耶穌的人', sub:'信不信有關係，作決定前好好想一想',
    rows:[['如果沒有上帝我卻相信他，那也沒關係；','但是如果真的有上帝而我卻不相信他，那就糟了！'],
          ['如果耶穌不是救主，而我卻接受他，那也沒影響；','但是如果耶穌真的是救主而我卻拒絕他，那就慘了！'],
          ['如果沒有天堂地獄而我卻選擇天堂的路，那也沒損失；','但是如果真的有天堂地獄而我卻邁向地獄之門，那就完了！']],
    tail:'這不是恐嚇，是算一筆帳。信了沒損失，不信卻有可能全盤皆輸——這樣的選擇題，值得認真想一想。' }
];

/* ---------------- 初信造就 ---------------- */
var PROMISE = [
  { t:'我只要敬畏上帝，就一無所缺。', r:'詩篇三十四篇9節' },
  { t:'我只要尋求上帝，什麼好處都不缺。', r:'詩篇三十四篇10節' },
  { t:'我只要先求上帝的國，我所需用的東西必加給我。', r:'馬太福音六章33節' },
  { t:'我只要跟隨上帝我的牧者，上帝的恩惠就追隨我腳步。', r:'詩篇二十三篇1、6節' },
  { t:'我只要追求上帝的命令，上帝所命定的福氣必追隨我。', r:'申命記二十八章2節' }
];
var SOW = [
  ['留意聽從','領受福氣的種子','申命記二十八章1節'],
  ['心裡相信','栽種在心田','希伯來書四章2節'],
  ['口裡承認','讓它發芽成長','羅馬書十章8至10節'],
  ['晝夜思想','不斷吸收水分','詩篇一篇2至3節'],
  ['謹守遵行','使它開花','約書亞記一章8節'],
  ['等候時機','結出福氣的果子','以賽亞書三十章18節'],
  ['榮耀上帝','使果子結得更多','約翰福音十五章8節']
];

/* ---------------- 陪談流程 ---------------- */
var FLOW = [
  { n:'一', t:'問候與自我介紹', s:'您好，我們是這附近教會的社區服務義工，在這裡做社區關懷服務。' },
  { n:'二', t:'寒暄關懷', s:'例：您每天都來公園運動嗎？\n哇！您很棒，很懂得照顧自己的身體，難怪您看起來精神氣色不錯。' },
  { n:'三', t:'介紹十全大福帖', s:'請問您有聽過十全大福帖嗎？\n很高興今天我有這個榮幸向您介紹十全大福帖，也就是十項上帝全都能給的大福氣。' },
  { n:'四', t:'破冰活動', s:'在介紹之前，先和您做個小小的心理測驗——這兩個封面的圖案，您比較喜歡哪一個？' },
  { n:'五', t:'分享五個要方與十帖福氣', s:'翻到第一頁介紹十全大福帖，再翻到第二頁看十帖蒙福良方，逐一簡介十帖福氣。\n最後問他：這十項大福氣，你最需要哪一項呢？' },
  { n:'六', t:'分享所選的福氣', s:'翻到他所選擇的福氣，問他在這方面有什麼需要、煩惱、困擾或擔憂的事，藉此關心了解他。\n看右頁的禱告良方，請他自己誠心開口一句一句禱告領受上帝應許的福氣。之後為他禱告服事他的需要，使他經歷神。' },
  { n:'七', t:'指點迷津', s:'如果他還不願意禱告接受主耶穌，請問他是什麼原因使他還不想現在就得到最大的福氣？\n覺得現在已經過得很好　→　三生有福\n覺得要祭拜祖先才孝順　→　三敬才孝\n覺得信什麼宗教都一樣　→　三點有別\n覺得沒有需要相信耶穌　→　三思而信\n再回到五個要方，邀請他接受主耶穌。' },
  { n:'八', t:'初信造就', s:'如果他已經接受耶穌，帶他讀「蒙福的應許與條件」、「栽種福氣的方法」，直到「得勝信心的宣言」。' },
  { n:'九', t:'填寫回應單', s:'談到結束後填寫贈送人資料，再請他填寫回應單，撕下回應單，將十全大福帖送給他。' },
  { n:'十', t:'預約陪讀', s:'和他預約下一次陪讀的時間。半小時陪讀十全大福帖的內容，半小時關懷代禱。\n並在本 App 的「陪談記錄」留下一份，把他加進你的同行名單。' }
];

var ICEA = ['封面Ａ　女孩抱十架',
  '恭喜您，根據研究分析，您喜歡這個圖案，表示您是一個年輕有活力、有創意的人，做事情有抱負、有夢想，您想要追求的美夢，一定可以美夢成真。',
  '這個女孩抱著乳酪做的十字架，一副心滿意足的樣子。乳酪是牛奶做成的，是最營養的食物；我們的心靈最需要的營養就是愛，而十字架就是上帝犧牲的愛，是我們心靈最營養的食物。',
  '狗是最忠心的同伴，表示有好同伴陪伴我們追求理想。地上都是愛心，天上都是星星，表示帶著別人愛心的祝福去摘星，追求天父上帝應許的祝福；您的祝福就會像這棵蔓藤一樣從地上蔓延到天上，一直到永遠。',
  '背面的彩虹代表上帝的應許之約，上帝要使我們成為新造的人，舊事已過，都要變成新的了，讓您的生命像這些花一樣燦爛又美麗。',
  '您知道蜻蜓代表什麼嗎？蜻蜓就是輕輕鬆鬆停在上帝的祝福中。耶穌說：凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。'];
var ICEB = ['封面Ｂ　喜鵲報喜',
  '恭喜您，根據研究分析，您喜歡這個圖案，表示您是一個成熟又實際的人，做事情實實在在，有原則、有計畫，您心裡想要達到的目標一定可以達成，使您心想事成。',
  '請問在這幅圖案中您可以找到哪些福氣？金魚代表年年有餘，橘子代表大吉大利，牡丹代表花開富貴，葡萄代表多子多孫，桃子代表壽桃長壽，喜鵲代表喜鵲報喜。',
  '報告大喜的信息，就是上帝賜給人最大的福氣——十字架的恩典。有了十字架的恩典，就能得到十項上帝全都能給的大福氣。',
  '您知道蝴蝶代表什麼福氣嗎？蝴蝶就是福氣多到疊起來。上帝所賜的十全大福，一個一個堆疊起來，上帝要傾福於我們甚至無處可容，成為最有福氣的人。'];

/* ---------------- 版面小工具 ---------------- */
function vs(list) {
  return list.map(function (v) {
    return '<div class="verse">' + esc(v.t) + '<span class="ref">' + esc(v.r) + '</span></div>';
  }).join('');
}
function prayBlock(title, p) {
  return '<div class="card">'
    + '<h3 class="sub">' + esc(title) + '</h3>'
    + '<p style="line-height:2"><b style="color:var(--gold-t)">稱呼　</b>親愛的天父上帝</p>'
    + '<p style="line-height:2"><b style="color:var(--gold-t)">謝謝　</b>' + esc(p.thanks) + '</p>'
    + '<p style="line-height:2"><b style="color:var(--gold-t)">對不起　</b>' + esc(p.sorry) + '</p>'
    + '<p style="line-height:2"><b style="color:var(--gold-t)">請　</b>' + esc(p.ask) + '</p>'
    + '<p style="line-height:2"><b style="color:var(--gold-t)">誠心　</b>奉主耶穌的名禱告，阿們。'
    + '<span class="tiny">（阿們就是誠心所願的意思）</span></p>'
    + '<p class="tiny" style="margin-top:10px">請他自己開口，一句一句跟著念。開口的那一刻，福氣的水龍頭就打開了。</p>'
    + '</div>';
}

/* ---------------- 主目錄 ---------------- */
SHEETS.tenIndex = async function () {
  return '<div class="card">'
    + '<div class="eyebrow">社區關懷．陪談佈道</div>'
    + '<h2 class="sec">十全大福帖</h2>'
    + '<p class="muted">「十全」就是十項上帝全都能給的大福氣；<br>「大福帖」就是得到十項大福氣的好消息。</p>'
    + '<p style="margin-top:10px">天父上帝愛我們，甚至將他的獨生子耶穌基督賜給我們，叫一切相信耶穌的人，可以成為他的兒女，享受天父上帝的愛，並且得到人生中最重要的十項大福氣。</p>'
    + '</div>'
    + '<div class="card tight"><p class="tiny" style="margin:0">'
    + '傳福音的原則：<b>先談福氣，再談福音；先得福音，再得福氣。</b><br>'
    + '焦點在耶穌，不在自己、不在對方、不在環境。你負責忠心把福氣說清楚，'
    + '使人重生的是聖靈。</p></div>'

    + '<button class="row" data-act="tenFlow"><span class="grow">'
    + '<span class="t">陪談使用流程</span><span class="s">十個步驟．從問候到預約陪讀</span></span>'
    + '<span class="arrow">›</span></button>'
    + '<button class="row" data-act="tenIce"><span class="grow">'
    + '<span class="t">破冰：封面心理測驗</span><span class="s">兩張封面．整段口語稿</span></span>'
    + '<span class="arrow">›</span></button>'
    + '<button class="row" data-act="tenFive"><span class="grow">'
    + '<span class="t">得到十全大福的五個要方</span><span class="s">福氣就像自來水．附最大福氣的禱告良方</span></span>'
    + '<span class="arrow">›</span></button>'

    + '<div class="card" style="margin-top:16px">'
    + '<div class="eyebrow">十帖蒙福良方</div>'
    + '<h3 class="sub">這十項大福氣，他最需要哪一項？</h3>'
    + '<p class="tiny">讓他自己選。他選的那一項，就是聖靈為你開的那扇門。<br>'
    + '每一帖裡面都可以直接問小智，他收錄了那一帖二十個常見的處境。</p>'
    + '</div>'
    + TEN.map(function (x) {
        return '<button class="row" data-act="tenOne" data-id="' + x.id + '"><span class="grow">'
          + '<span class="t">' + esc(x.no + '　' + x.name) + '</span>'
          + '<span class="s">' + esc(x.who) + '</span></span><span class="arrow">›</span></button>';
      }).join('')

    + '<div class="card" style="margin-top:16px">'
    + '<div class="eyebrow">七、指點迷津</div>'
    + '<h3 class="sub">他還不願意禱告的時候</h3>'
    + '<p class="tiny">先問他：是什麼原因，使您還不想現在就得到最大的福氣？</p>'
    + '</div>'
    + TURN.map(function (x) {
        return '<button class="row" data-act="tenTurn" data-id="' + x.id + '"><span class="grow">'
          + '<span class="t">' + esc(x.name) + '</span>'
          + '<span class="s">' + esc(x.when) + '</span></span><span class="arrow">›</span></button>';
      }).join('')

    + '<button class="row" style="margin-top:16px" data-act="tenGrow"><span class="grow">'
    + '<span class="t">初信造就</span><span class="s">蒙福的應許．栽種福氣．兩則宣言</span></span>'
    + '<span class="arrow">›</span></button>'
    + '<button class="row" data-act="tenLog"><span class="grow">'
    + '<span class="t">陪談記錄</span><span class="s">記下他選的福氣與屬靈反應，並約下一次</span></span>'
    + '<span class="arrow">›</span></button>';
};
ACTS.openTen = function () { push('tenIndex', {}, '十全大福帖'); };

/* ---------------- 陪談流程 ---------------- */
SHEETS.tenFlow = async function () {
  return '<div class="card tight"><p class="tiny" style="margin:0">'
    + '出門之前先禱告。你不是去推銷一本小冊，是去把天父的愛送到一個人手上。</p></div>'
    + FLOW.map(function (f) {
        return '<div class="card"><div class="act">'
          + '<div class="no">' + esc(f.n) + '</div>'
          + '<div class="tt">' + esc(f.t) + '</div>'
          + '<div class="bd">' + esc(f.s) + '</div></div></div>';
      }).join('')
    + '<div class="card"><div class="eyebrow">三本</div>'
    + '<p>・傳福音是我的本分</p><p>・信耶穌是人的本能</p><p>・救靈魂是神的本事</p></div>'
    + '<div class="card"><div class="eyebrow">三傳</div>'
    + '<p>・傳遞真愛</p><p>・傳送祝福</p><p>・傳講見證</p></div>'
    + '<div class="card"><div class="eyebrow">三要</div>'
    + '<p>・有人要</p><p>・有人不要</p><p>・有人等著要</p>'
    + '<p class="tiny" style="margin-top:10px">被拒絕不是失敗，是還沒輪到那個等著要的人。</p></div>';
};
ACTS.tenFlow = function () { push('tenFlow', {}, '陪談使用流程'); };

/* ---------------- 破冰 ---------------- */
SHEETS.tenIce = async function () {
  function blk(a) {
    return '<div class="card"><div class="eyebrow">' + esc(a[0]) + '</div>'
      + a.slice(1).map(function (s) {
          return '<p style="font-size:calc(19px * var(--fs));line-height:1.95">' + esc(s) + '</p>';
        }).join('') + '</div>';
  }
  return '<div class="card tight"><p class="tiny" style="margin:0">'
    + '把封面轉向他，問一句：這兩個圖案，您比較喜歡哪一個？<br>'
    + '心理測驗只是敲門，真正要送的是十字架。</p></div>'
    + blk(ICEA) + blk(ICEB);
};
ACTS.tenIce = function () { push('tenIce', {}, '破冰活動'); };

/* ---------------- 五個要方 ---------------- */
SHEETS.tenFive = async function () {
  return '<div class="card">'
    + '<div class="eyebrow">福氣就像自來水</div>'
    + '<h2 class="sec">得到十全大福的五個要方</h2>'
    + '<p class="muted">水一直都在，只是中間少了幾段管線。<br>把五段接起來，福氣就流到他家裡了。</p>'
    + '</div>'
    + FIVE.map(function (f) {
        return '<div class="card"><div class="act">'
          + '<div class="no">' + esc(f.n) + '</div>'
          + '<div class="tt">' + esc(f.t) + '</div>'
          + '<div class="key">' + esc(f.k) + '　' + esc(f.fig) + '</div>'
          + '<div class="bd">' + esc(f.b) + '</div></div></div>';
      }).join('')
    + '<div class="card tight"><p style="margin:0;font-weight:700">您願意接受上帝所要賜給你的最大福氣嗎？</p></div>'
    + prayBlock('得到最大福氣的禱告良方', BIGPRAY)
    + '<div class="card"><div class="eyebrow">禱告之後</div>'
    + '<p class="muted">請他把日期寫在小冊上，然後為他祝福禱告，'
    + '並在陪談記錄裡登錄，接著約下一次陪讀。</p>'
    + '<div class="btn-row" style="margin-top:12px">'
    + '<button class="btn gold" data-act="tenLog">寫下陪談記錄</button>'
    + '<button class="btn quiet" data-act="openDecision">本 App 的決志禱告文</button>'
    + '</div></div>';
};
ACTS.tenFive = function () { push('tenFive', {}, '五個要方'); };

/* ---------------- 單帖福氣 ---------------- */
SHEETS.tenOne = async function (arg) {
  var x = null, i;
  for (i = 0; i < TEN.length; i++) if (TEN[i].id === arg.id) x = TEN[i];
  if (!x) return '<p class="muted">找不到這一帖。</p>';
  return '<div class="card">'
    + '<div class="eyebrow">' + esc(x.no) + '福氣</div>'
    + '<h2 class="sec">' + esc(x.name) + '</h2>'
    + '<p class="muted">' + esc(x.who) + '</p>'
    + '<p style="margin-top:10px;font-size:calc(19px * var(--fs));line-height:1.95">' + esc(x.body) + '</p>'
    + vs(x.verses)
    + '</div>'
    + '<div class="card tight"><p class="tiny" style="margin:0">'
    + '先關心，再禱告。問他一句：這方面，您現在最煩惱的是什麼？<br>'
    + '安靜聽他講完，他講的時間要比你多。</p></div>'
    + prayBlock(x.name + '的禱告良方', x.pray)
    + '<div class="card">'
    + '<button class="btn quiet" data-act="tenShare" data-id="' + x.id + '" style="width:100%">'
    + '複製這一帖傳給他</button>'
    + '<button class="btn" data-act="tenLog" data-b="' + x.id + '" style="width:100%;margin-top:10px">'
    + '記下：他選了這一項</button>'
    + '</div>'
    + '<div class="card">'
    + '<div class="eyebrow">AI 屬靈同伴</div>'
    + '<h3 class="sub">問小智：他這方面的難處</h3>'
    + '<p class="muted">小智收錄了這一帖底下二十個慕道友最常有的處境，'
    + '點一下就能問，也可以直接打字說他的情況。</p>'
    + '<button class="btn gold" data-act="tenAsk" data-n="' + esc(x.name) + '" style="margin-top:12px">'
    + '✨ 打開小智．' + esc(x.name) + '</button>'
    + '</div>'
    + '<div class="card">'
    + '<div class="eyebrow">福音卡片</div>'
    + '<h3 class="sub">做一張「' + esc(x.name) + '」的卡片</h3>'
    + '<p class="muted">五張現成的經文與問候，做成圖傳給他。'
    + '陪談之後傳一張，這份福氣就跟著他回家。</p>'
    + '<button class="btn" data-act="tenCard" data-id="' + x.id + '" style="margin-top:12px">'
    + '💌 做一張卡片傳給他</button>'
    + '</div>';
};
ACTS.tenOne = function (d) {
  var x = null, i;
  for (i = 0; i < TEN.length; i++) if (TEN[i].id === d.id) x = TEN[i];
  push('tenOne', { id: d.id }, x ? x.name : '福氣');
};
ACTS.tenCard = function (d) {
  var id = 'ten' + String(d.id).slice(1);
  if (window.__gcScene) window.__gcScene(id);
  else { closeSheet(); G.go('cards'); }
};
ACTS.tenAsk = function (d) {
  if (window.__xzTopic) window.__xzTopic('十全・' + d.n);
  else if (ACTS.openXiaozhi) ACTS.openXiaozhi();
};
ACTS.tenShare = function (d) {
  var x = null, i;
  for (i = 0; i < TEN.length; i++) if (TEN[i].id === d.id) x = TEN[i];
  if (!x) return;
  var t = '【十全大福帖　' + x.no + '　' + x.name + '】\n' + x.who + '\n\n' + x.body + '\n\n'
    + x.verses.map(function (v) { return v.t + '（' + v.r + '）'; }).join('\n')
    + '\n\n願天父上帝把這項福氣賜給你。';
  if (navigator.share) navigator.share({ text: t }).catch(function () {});
  else if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast('已複製，可以貼到 LINE'); });
  else toast('請長按上面的文字複製');
};

/* ---------------- 指點迷津 ---------------- */
SHEETS.tenTurn = async function (arg) {
  var x = null, i;
  for (i = 0; i < TURN.length; i++) if (TURN[i].id === arg.id) x = TURN[i];
  if (!x) return '<p class="muted">找不到這一篇。</p>';
  return '<div class="card">'
    + '<div class="eyebrow">' + esc(x.when) + '</div>'
    + '<h2 class="sec">' + esc(x.name) + '</h2>'
    + '<p class="muted">' + esc(x.sub) + '</p></div>'
    + x.rows.map(function (r) {
        return '<div class="card"><h3 class="sub">' + esc(r[0]) + '</h3>'
          + '<p style="font-size:calc(19px * var(--fs));line-height:1.95">' + esc(r[1]) + '</p></div>';
      }).join('')
    + '<div class="card"><p class="muted">' + esc(x.tail) + '</p>'
    + '<button class="btn gold" data-act="tenFive" style="margin-top:12px">回到五個要方，再邀請他一次</button></div>';
};
ACTS.tenTurn = function (d) {
  var x = null, i;
  for (i = 0; i < TURN.length; i++) if (TURN[i].id === d.id) x = TURN[i];
  push('tenTurn', { id: d.id }, x ? x.name : '指點迷津');
};

/* ---------------- 初信造就 ---------------- */
SHEETS.tenGrow = async function () {
  return '<div class="card"><div class="eyebrow">知道如何蒙神賜福</div>'
    + '<h2 class="sec">蒙福的應許與條件</h2>'
    + PROMISE.map(function (p, i) {
        return '<div class="verse">' + esc(['一','二','三','四','五'][i] + '、' + p.t)
          + '<span class="ref">' + esc(p.r) + '</span></div>';
      }).join('') + '</div>'

    + '<div class="card"><div class="eyebrow">明白如何得到真福氣</div>'
    + '<h2 class="sec">栽種福氣的方法</h2>'
    + '<p class="muted">福從天降，福乃第一大的神所賜的一口田。<br>'
    + '福氣的田地就是我們的心田，福氣的種子就是上帝的話語。</p>'
    + SOW.map(function (s) {
        return '<p style="line-height:2"><b style="color:var(--gold-t)">' + esc(s[0]) + '</b>　'
          + esc(s[1]) + '<span class="tiny">（' + esc(s[2]) + '）</span></p>';
      }).join('')
    + '<p class="tiny" style="margin-top:10px">種什麼就收什麼；多種的多收，少種的少收，這話是真的。</p></div>'

    + '<div class="card"><div class="eyebrow">天天宣告美好的人生</div>'
    + '<h2 class="sec">美好人生的宣言</h2>'
    + '<p style="line-height:2.1;font-size:calc(20px * var(--fs))">'
    + '我以前不好，信主就變好。<br>我昨天很好、今天非常好、<br>明天會更好、將來一定最好。<br><br>'
    + '感謝主我很好、他更好、你最好。<br>他太太（先生／爸媽／孩子）很好、<br>'
    + '你太太（先生／爸媽／孩子）更好、<br>我太太（先生／爸媽／孩子）最好。</p>'
    + '<p style="font-weight:700;margin-top:10px">上帝給我的，對我就是最好的。</p></div>'

    + '<div class="card"><div class="eyebrow">時時宣告美好的事情</div>'
    + '<h2 class="sec">得勝信心的宣言</h2>'
    + '<p style="line-height:2.1;font-size:calc(20px * var(--fs))">'
    + '我相信在耶穌裡必有美好的事發生。<br><br>'
    + '我不怕萬一，只相信一萬；<br>萬一不會發生，一定萬事OK。<br><br>'
    + '因為不管發生什麼事，<br>我只要信靠獨一真神萬王之王，<br>'
    + '上帝有本事把壞事變好事，好事變成更美好的事。<br><br>'
    + '無論好事壞事，<br>我都要效法基督的樣式，使萬事都互相效力；<br>'
    + '叫愛上帝的我得到最好的事；<br>就是生命更像基督，人生更加美好。</p></div>'

    + '<div class="card tight"><p class="tiny" style="margin:0">'
    + '宣告不是自我催眠，是把心思從自己轉向耶穌。<br>'
    + '用心靠聖靈，不要用腦靠自己；用心就開心，用腦就煩惱。</p></div>';
};
ACTS.tenGrow = function () { push('tenGrow', {}, '初信造就'); };

/* ---------------- 陪談記錄 ---------------- */
var REACT = [['5','決志'], ['4','真感興趣'], ['3','客觀興趣'], ['2','中立'], ['1','敵對']];
var _pick = { b: [], r: '', pid: '' };

async function logs() {
  var all = await DB.all('logs');
  return all.filter(function (x) { return x.kind === 'ten'; })
            .sort(function (a, b) { return String(a.createdAt).localeCompare(String(b.createdAt)); });
}

SHEETS.tenLog = async function (arg) {
  if (arg && arg.b && _pick.b.indexOf(arg.b) < 0) _pick.b.push(arg.b);
  var ps = await DB.all('persons');
  ps.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  var rows = await logs();
  return '<div class="card">'
    + '<div class="eyebrow">陪談記錄</div>'
    + '<h2 class="sec">今天談了誰</h2>'
    + '<p class="muted">記下來，才走得下去。<br>先生命、再關係、後事工——這一張記錄，是關係的起點。</p>'
    + '</div>'
    + '<div class="card">'
    + '<div class="field"><label for="tgName">被陪談者姓名或代號</label>'
    + '<input type="text" id="tgName" placeholder="例：公園運動的陳伯伯" autocomplete="off"></div>'
    + (ps.length ? '<div class="field"><label for="tgPid">或選擇名單中的人<span class="hint">選了就會同時寫進他的接觸紀錄</span></label>'
        + '<select id="tgPid"><option value="">不指定</option>'
        + ps.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>'; }).join('')
        + '</select></div>' : '')
    + '<div class="field"><label>他選擇所需要的福氣<span class="hint">可複選</span></label>'
    + '<div class="seg" id="tgB" style="flex-wrap:wrap">'
    + TEN.map(function (x) {
        return '<button data-act="tgB" data-v="' + x.id + '" aria-pressed="'
          + (_pick.b.indexOf(x.id) >= 0) + '">' + esc(x.name) + '</button>';
      }).join('') + '</div></div>'
    + '<div class="field"><label>屬靈反應</label><div class="seg" id="tgR">'
    + REACT.map(function (r) {
        return '<button data-act="tgR" data-v="' + r[0] + '" aria-pressed="' + (_pick.r === r[0]) + '">'
          + r[0] + '　' + esc(r[1]) + '</button>';
      }).join('') + '</div></div>'
    + '<div class="field"><label for="tgBar">信主障礙或困難</label>'
    + '<textarea id="tgBar" placeholder="例：怕家裡祖先沒人拜；覺得自己過得很好"></textarea></div>'
    + '<div class="field"><label for="tgNote">簡況與備註</label>'
    + '<textarea id="tgNote" placeholder="例：獨居，膝蓋不好，兒子在外地。已送小冊，約下週三同時間再談"></textarea></div>'
    + '<div class="btn-row"><button class="btn" data-act="tgSave">儲存記錄</button>'
    + '<button class="btn quiet" data-act="tgReset">清空</button></div>'
    + '<p class="tiny" style="margin-top:10px">記錄存在這支手機裡，會隨「我的－備份與還原」一起匯出。</p>'
    + '</div>'
    + (rows.length ? '<div class="card"><div class="eyebrow">過去的記錄　' + rows.length + ' 筆</div>'
        + rows.slice().reverse().map(function (r) {
            var names = r.b.map(function (id) {
              var i, n = ''; for (i = 0; i < TEN.length; i++) if (TEN[i].id === id) n = TEN[i].name;
              return n;
            }).filter(Boolean).join('、');
            var rn = ''; REACT.forEach(function (x) { if (x[0] === r.r) rn = x[1]; });
            return '<details><summary>' + esc(r.name || '未具名') + '　'
              + esc(fmtDate(r.date)) + (rn ? '　' + esc(rn) : '') + '</summary><div class="dbody">'
              + (names ? '<p>他要的福氣：' + esc(names) + '</p>' : '')
              + (r.bar ? '<p>障礙：' + esc(r.bar) + '</p>' : '')
              + (r.note ? '<p>' + G.nl2br(r.note) + '</p>' : '')
              + '<button class="btn quiet sm" data-act="tgDel" data-id="' + esc(r.id)
              + '" style="width:100%;margin-top:8px">刪除這筆</button>'
              + '</div></details>';
          }).join('') + '</div>'
      : '<div class="card tight"><p class="tiny" style="margin:0">還沒有記錄。談完一位，就記一位。</p></div>');
};
ACTS.tenLog = function (d) { push('tenLog', { b: d && d.b }, '陪談記錄'); };
ACTS.tgB = function (d, el) {
  var i = _pick.b.indexOf(d.v);
  if (i >= 0) _pick.b.splice(i, 1); else _pick.b.push(d.v);
  el.setAttribute('aria-pressed', _pick.b.indexOf(d.v) >= 0);
};
ACTS.tgR = function (d, el) {
  _pick.r = d.v;
  el.parentElement.querySelectorAll('button').forEach(function (b) {
    b.setAttribute('aria-pressed', b.dataset.v === _pick.r);
  });
};
ACTS.tgReset = function () { _pick = { b: [], r: '', pid: '' }; refreshSheet(); };
ACTS.tgSave = async function () {
  var name = ($('#tgName').value || '').trim();
  var sel = $('#tgPid');
  var pid = sel ? sel.value : '';
  if (!name && !pid) { toast('請至少填一個姓名或代號'); $('#tgName').focus(); return; }
  if (!name && pid) {
    var p0 = await DB.get('persons', pid);
    if (p0) name = p0.name;
  }
  var rec = {
    id: uid(), kind: 'ten', date: todayISO(), name: name, personId: pid,
    b: _pick.b.slice(), r: _pick.r,
    bar: ($('#tgBar').value || '').trim(), note: ($('#tgNote').value || '').trim(),
    createdAt: new Date().toISOString()
  };
  await DB.put('logs', rec);

  if (pid) {
    var names = rec.b.map(function (id) {
      var i, n = ''; for (i = 0; i < TEN.length; i++) if (TEN[i].id === id) n = TEN[i].name;
      return n;
    }).filter(Boolean).join('、');
    var rn = ''; REACT.forEach(function (x) { if (x[0] === rec.r) rn = x[1]; });
    var note = '十全大福帖陪談' + (names ? '。他要的福氣：' + names : '')
      + (rn ? '。屬靈反應：' + rn : '') + (rec.bar ? '。障礙：' + rec.bar : '')
      + (rec.note ? '。' + rec.note : '');
    await DB.put('interactions', {
      id: uid(), personId: pid, date: rec.date, type: '見面',
      mood: '', note: note.slice(0, 400), createdAt: new Date().toISOString()
    });
    var p = await DB.get('persons', pid);
    if (p) { p.lastContactAt = rec.date; p.updatedAt = new Date().toISOString(); await DB.put('persons', p); }
  }
  _pick = { b: [], r: '', pid: '' };
  refreshSheet(); render();
  toast(pid ? '記下了，也寫進他的紀錄' : '記下了');
};
ACTS.tgDel = function (d) {
  confirmBox('刪除這筆記錄？', '刪除後無法復原。', '確定刪除', function () {
    DB.del('logs', d.id).then(function () { refreshSheet(); toast('已刪除'); });
  }, true);
};

/* ---------------- 掛進工具頁 ---------------- */
var _toolsTen = VIEWS.tools;
VIEWS.tools = async function () {
  var head = '<div class="card">'
    + '<div class="eyebrow">社區關懷．陪談佈道</div>'
    + '<h2 class="sec">十全大福帖</h2>'
    + '<p class="muted">十項上帝全都能給的大福氣，一整本都在裡面：<br>'
    + '五個要方、十帖福氣與禱告良方、指點迷津四篇、陪談流程與記錄表。</p>'
    + '<button class="btn gold" data-act="openTen" style="margin-top:12px">🎁 打開十全大福帖</button>'
    + '<p class="tiny" style="margin-top:10px">先談福氣，再談福音；先得福音，再得福氣。</p>'
    + '</div>';
  return head + (await _toolsTen.apply(this, arguments));
};

})();