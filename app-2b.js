(function () {
'use strict';
var G = window.__G; if (!G) return;
var LS = G.LS, esc = G.esc, DB = G.DB, C = G.C, toast = G.toast, uid = G.uid,
    ACTS = G.ACTS, VIEWS = G.VIEWS, SHEETS = G.SHEETS, push = G.push, popSheet = G.popSheet,
    refreshSheet = G.refreshSheet, stageOf = G.stageOf, todayISO = G.todayISO, render = G.render,
    go = G.go, $ = G.$;

var XZ_ENDPOINT = 'https://xiaozhi-proxy.spch321.workers.dev';
var XZ_MODEL = 'claude-sonnet-4-6';

/* ---------------- 卡片內容庫：依場景分類 ---------------- */
/* v 經文　r 出處　w 問候內文（{稱呼} 會自動代換）　b 祝福語 */
var SCENES = [
  { id: 'greet', n: '日常問安', hint: '不談信仰也沒關係，先讓他知道你記得他。', cs: [
    { v: '願耶和華賜福給你，保護你。願耶和華使他的臉光照你，賜恩給你。', r: '民數記六章24至25節',
      w: '{稱呼}，今天忽然想起你，就停下來為你禱告了一分鐘。願你今天平平安安。', b: '願主保守你' },
    { v: '你出你入，耶和華要保護你，從今時直到永遠。', r: '詩篇一百二十一篇8節',
      w: '{稱呼}，最近好嗎？出入平安，是我對你最實在的祝福。', b: '出入蒙保守' },
    { v: '每早晨，這都是新的；你的誠實極其廣大！', r: '耶利米哀歌三章23節',
      w: '{稱呼}，昨天再難，今天早晨仍是新的。願你今天有一件小小的好事。', b: '每早晨都是新的' },
    { v: '這是耶和華所定的日子，我們在其中要高興歡喜！', r: '詩篇一百一十八篇24節',
      w: '{稱呼}，今天這一天是被賜下的，願你在其中有喜樂。', b: '願你今天喜樂' },
    { v: '要常常喜樂，不住地禱告，凡事謝恩。', r: '帖撒羅尼迦前書五章16至18節',
      w: '{稱呼}，日子忙，別忘了給自己留一點喘氣的空間。我常常記念你。', b: '願你心裡有平安' }
  ]},
  { id: 'comfort', n: '安慰陪伴', hint: '不用講道理，陪著就好。', cs: [
    { v: '耶和華靠近傷心的人，拯救靈性痛悔的人。', r: '詩篇三十四篇18節',
      w: '{稱呼}，這段日子辛苦你了。我不知道能說什麼，但我會一直在。', b: '你不是一個人' },
    { v: '我雖然行過死蔭的幽谷，也不怕遭害，因為你與我同在。', r: '詩篇二十三篇4節',
      w: '{稱呼}，幽谷會走完的。願你走的時候，知道有人陪。', b: '有主與你同行' },
    { v: '哀慟的人有福了！因為他們必得安慰。', r: '馬太福音五章4節',
      w: '{稱呼}，難過的時候不用勉強自己堅強。眼淚在神面前是可以流的。', b: '願主親自安慰你' },
    { v: '耶穌哭了。', r: '約翰福音十一章35節',
      w: '{稱呼}，神不是站在遠處看你痛，祂是陪你一起痛的那一位。', b: '祂懂你的痛' },
    { v: '神要擦去他們一切的眼淚；不再有死亡，也不再有悲哀、哭號、疼痛。', r: '啟示錄二十一章4節',
      w: '{稱呼}，現在的痛不是結局。有一天，會有一雙手親自擦去你的眼淚。', b: '盼望仍然在前面' }
  ]},
  { id: 'sick', n: '病中代禱', hint: '一句話，勝過一長串建議。', cs: [
    { v: '因為我耶和華是醫治你的。', r: '出埃及記十五章26節',
      w: '{稱呼}，聽說你身體不舒服，我今天特別為你禱告了。願你早日康復。', b: '願主醫治你' },
    { v: '他醫好傷心的人，裹好他們的傷處。', r: '詩篇一百四十七篇3節',
      w: '{稱呼}，願你今晚睡得安穩，明天起來有力氣一點。', b: '願你早日康復' },
    { v: '我的恩典夠你用的，因為我的能力是在人的軟弱上顯得完全。', r: '哥林多後書十二章9節',
      w: '{稱呼}，軟弱的時候不必逞強。恩典會夠用的，一天一天地夠用。', b: '恩典夠你用' },
    { v: '他病重在榻，耶和華必扶持他。', r: '詩篇四十一篇3節',
      w: '{稱呼}，這幾天我都會為你禱告。有什麼需要，隨時跟我說一聲。', b: '願主扶持你' },
    { v: '出於信心的祈禱要救那病人，主必叫他起來。', r: '雅各書五章15節',
      w: '{稱呼}，我們一起把這件事交給主。我為你守望，你安心養病。', b: '我為你守望' }
  ]},
  { id: 'weary', n: '壓力疲乏', hint: '他不缺道理，缺的是一口氣。', cs: [
    { v: '凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。', r: '馬太福音十一章28節',
      w: '{稱呼}，看你最近很累。這句話我自己撐不住的時候常常想起，送給你。', b: '願你得著安息' },
    { v: '你們要將一切的憂慮卸給神，因為他顧念你們。', r: '彼得前書五章7節',
      w: '{稱呼}，有些擔子不必自己扛。願你今天可以放下一點點。', b: '把重擔交給祂' },
    { v: '但那等候耶和華的必從新得力。他們必如鷹展翅上騰。', r: '以賽亞書四十章31節',
      w: '{稱呼}，力氣用完了不是失敗，是該歇一歇了。願你重新得力。', b: '願你從新得力' },
    { v: '應當一無掛慮，只要凡事藉著禱告、祈求和感謝，將你們所要的告訴神。', r: '腓立比書四章6節',
      w: '{稱呼}，煩到睡不著的時候，可以試著把它一句一句說給神聽。', b: '願平安保守你的心' },
    { v: '你要把你的重擔卸給耶和華，他必撫養你。', r: '詩篇五十五篇22節',
      w: '{稱呼}，今天不用做到滿分。慢一點，也是可以的。', b: '慢一點也沒關係' }
  ]},
  { id: 'family', n: '家庭親子', hint: '家裡的事，最需要有人一起守望。', cs: [
    { v: '至於我和我家，我們必定事奉耶和華。', r: '約書亞記二十四章15節',
      w: '{稱呼}，願你的家成為一個有平安、有笑聲的地方。', b: '願主賜福你的家' },
    { v: '當信主耶穌，你和你一家都必得救。', r: '使徒行傳十六章31節',
      w: '{稱呼}，我常為你和你的家人禱告。願祝福臨到你們全家。', b: '願全家蒙恩' },
    { v: '若不是耶和華建造房屋，建造的人就枉然勞力。', r: '詩篇一百二十七篇1節',
      w: '{稱呼}，你為這個家付出了很多。願有一位比你更大的，親自看顧這個家。', b: '願主建造你的家' },
    { v: '教養孩童，使他走當行的道，就是到老他也不偏離。', r: '箴言二十二章6節',
      w: '{稱呼}，帶孩子真的不容易。你已經做得很好了，別太苛責自己。', b: '願主賜你智慧' },
    { v: '要孝敬父母，使你得福，在世長壽。', r: '以弗所書六章2節',
      w: '{稱呼}，照顧長輩的日子很磨人。願你在其中也被照顧。', b: '願你也被眷顧' }
  ]},
  { id: 'birthday', n: '生日祝福', hint: '生日是一年裡最自然的一扇門。', cs: [
    { v: '我要稱謝你，因我受造，奇妙可畏。', r: '詩篇一百三十九篇14節',
      w: '{稱呼}，生日快樂！你被造得奇妙可畏，你的存在本身就是一份禮物。', b: '生日快樂' },
    { v: '我知道我向你們所懷的意念是賜平安的意念，不是降災禍的意念，要叫你們末後有指望。', r: '耶利米書二十九章11節',
      w: '{稱呼}，生日快樂！願你新的一歲，走在一條有指望的路上。', b: '願你末後有指望' },
    { v: '求你指教我們怎樣數算自己的日子，好叫我們得著智慧的心。', r: '詩篇九十篇12節',
      w: '{稱呼}，生日快樂！願你這一年的每一天，都活得踏實而有意義。', b: '願你歲歲平安' },
    { v: '他用美物使你所願的得以知足，以致你如鷹返老還童。', r: '詩篇一百零三篇5節',
      w: '{稱呼}，生日快樂！願你今年身體健壯、心裡年輕。', b: '願你日日更新' },
    { v: '將你心所願的賜給你，成就你的一切籌算。', r: '詩篇二十篇4節',
      w: '{稱呼}，生日快樂！你心裡那個沒說出口的願望，我也一起為你求。', b: '願你心願得成' }
  ]},
  { id: 'thanks', n: '感謝道謝', hint: '被記得的人，心會軟下來。', cs: [
    { v: '我每逢想念你們，就感謝我的神。', r: '腓立比書一章3節',
      w: '{稱呼}，這句話是我對你真實的心情。認識你，是我的福氣。', b: '謝謝有你' },
    { v: '你們要稱謝耶和華，因他本為善；他的慈愛永遠長存！', r: '詩篇一百零七篇1節',
      w: '{稱呼}，謝謝你那天的幫忙，我一直記在心裡。', b: '真心謝謝你' },
    { v: '朋友乃時常親愛。', r: '箴言十七章17節',
      w: '{稱呼}，日子過得快，但有些情誼不會被沖淡。謝謝你這些年。', b: '願我們的情誼長存' },
    { v: '感謝神，因他有說不盡的恩賜！', r: '哥林多後書九章15節',
      w: '{稱呼}，我把你算在我這一年的恩典裡面。謝謝你。', b: '恩典說不盡' },
    { v: '凡事謝恩，因為這是神在基督耶穌裡向你們所定的旨意。', r: '帖撒羅尼迦前書五章18節',
      w: '{稱呼}，這一路上有你同行，是值得感謝的一件事。', b: '心存感恩' }
  ]},
  { id: 'seek', n: '迷惘尋求', hint: '他問人生意義的時候，門開了一條縫。', cs: [
    { v: '你要專心仰賴耶和華，不可倚靠自己的聰明；在你一切所行的事上都要認定他，他必指引你的路。', r: '箴言三章5至6節',
      w: '{稱呼}，路不清楚的時候，不必急著走。願你有人指路。', b: '願主指引你的路' },
    { v: '你的話是我腳前的燈，是我路上的光。', r: '詩篇一百一十九篇105節',
      w: '{稱呼}，燈只照亮腳前一步，但一步一步走，也就走過來了。', b: '願光照亮你的路' },
    { v: '你們尋求我，若專心尋求我，就必尋見。', r: '耶利米書二十九章13節',
      w: '{稱呼}，你心裡那些沒有答案的問題，其實可以直接問祂。', b: '尋找的就尋見' },
    { v: '你們祈求，就給你們；尋找，就尋見；叩門，就給你們開門。', r: '馬太福音七章7節',
      w: '{稱呼}，如果有一天你想問問看，我很樂意陪你一起找答案。', b: '願你尋見所要的' },
    { v: '神造萬物，各按其時成為美好，又將永生安置在世人心裡。', r: '傳道書三章11節',
      w: '{稱呼}，心裡那個「總覺得少了什麼」的空，不是你有毛病，是有來歷的。', b: '你不是偶然被造的' }
  ]},
  { id: 'hope', n: '盼望復原', hint: '在最低的地方，遞一句盼望。', cs: [
    { v: '我們曉得萬事都互相效力，叫愛神的人得益處。', r: '羅馬書八章28節',
      w: '{稱呼}，現在看不出來的，將來會看得懂。願你撐住。', b: '願你看見出路' },
    { v: '一宿雖然有哭泣，早晨便必歡呼。', r: '詩篇三十篇5節',
      w: '{稱呼}，夜再長，也會有早晨。願你的早晨快點來。', b: '早晨必要歡呼' },
    { v: '看哪，我要做一件新事……我必在曠野開道路，在沙漠開江河。', r: '以賽亞書四十三章19節',
      w: '{稱呼}，看起來走不通的地方，仍然可以開出一條路來。', b: '願主為你開路' },
    { v: '若有人在基督裡，他就是新造的人，舊事已過，都變成新的了。', r: '哥林多後書五章17節',
      w: '{稱呼}，過去不能決定你的將來。你可以重新開始。', b: '你可以重新開始' },
    { v: '我靠著那加給我力量的，凡事都能做。', r: '腓立比書四章13節',
      w: '{稱呼}，不是靠自己咬牙，是有一位加力量給你。願你今天有力氣。', b: '願力量加給你' }
  ]},
  { id: 'gospel', n: '福音邀請', hint: '不催逼，只把門推開一點點。', cs: [
    { v: '神愛世人，甚至將他的獨生子賜給他們，叫一切信他的，不至滅亡，反得永生。', r: '約翰福音三章16節',
      w: '{稱呼}，這句話是我信仰裡最重要的一句。送給你，你當作一份心意收下就好。', b: '你是被愛的' },
    { v: '看哪，我站在門外叩門，若有聽見我聲音就開門的，我要進到他那裡去。', r: '啟示錄三章20節',
      w: '{稱呼}，祂不會硬闖，門把在你這一邊。你什麼時候願意，都不算晚。', b: '門把在你這一邊' },
    { v: '惟有基督在我們還作罪人的時候為我們死，神的愛就在此向我們顯明了。', r: '羅馬書五章8節',
      w: '{稱呼}，不是先變好祂才愛你，是祂先愛了，你才慢慢變好。', b: '你不必先變好' },
    { v: '凡接待他的，就是信他名的人，他就賜他們權柄作神的兒女。', r: '約翰福音一章12節',
      w: '{稱呼}，只要願意，就可以。這一步比你想像的簡單。', b: '願意就可以' },
    { v: '人子來，為要尋找、拯救失喪的人。', r: '路加福音十九章10節',
      w: '{稱呼}，有一位一直在找你。不是要追究什麼，是想把你帶回家。', b: '祂一直在找你' }
  ]},
  { id: 'new', n: '決志初信', hint: '決志後的三十天，是黃金期。', cs: [
    { v: '現在活著的不再是我，乃是基督在我裡面活著。', r: '加拉太書二章20節',
      w: '{稱呼}，恭喜你！你昨天做的那個決定，是一生最重要的一件事。', b: '恭喜你回家了' },
    { v: '我也要賜給你們一個新心，將新靈放在你們裡面。', r: '以西結書三十六章26節',
      w: '{稱呼}，不是你要更努力，是你有了一顆新的心。慢慢走，我陪你。', b: '你有一顆新心了' },
    { v: '那在你們心裡動了善工的，必成全這工，直到耶穌基督的日子。', r: '腓立比書一章6節',
      w: '{稱呼}，開始的那一位會負責到底。你不必怕自己做不好。', b: '祂必成全這工' },
    { v: '就要愛慕那純淨的靈奶，像才生的嬰孩愛慕奶一樣，叫你們因此漸長。', r: '彼得前書二章2節',
      w: '{稱呼}，一天讀一小段就好，讀不懂的先跳過。我們一起讀。', b: '一天一小步' },
    { v: '常在我裡面的，我也常在他裡面，這人就多結果子。', r: '約翰福音十五章5節',
      w: '{稱呼}，信仰不是一場考試，是一段每天的同在。', b: '常在祂裡面' }
  ]},
  { id: 'baptism', n: '受洗新生', hint: '那一天的紀念，會成為他日後的錨。', cs: [
    { v: '我們藉著洗禮歸入死，和他一同埋葬，原是叫我們一舉一動有新生的樣式。', r: '羅馬書六章4節',
      w: '{稱呼}，恭喜你受洗！今天是你公開歸屬主的日子，我為你高興。', b: '恭喜你受洗' },
    { v: '這是我的愛子，我所喜悅的。', r: '馬太福音三章17節',
      w: '{稱呼}，天父對你說的也是這一句。你是祂所愛、所喜悅的。', b: '你是神所愛的' },
    { v: '你們受洗歸入基督的都是披戴基督了。', r: '加拉太書三章27節',
      w: '{稱呼}，從今天起，你不再是一個人走這條路了。', b: '你已披戴基督' },
    { v: '你們不再作外人和客旅，是與聖徒同國，是神家裡的人了。', r: '以弗所書二章19節',
      w: '{稱呼}，歡迎你回家。這個家會一直為你留一個位子。', b: '歡迎你回家' },
    { v: '若有人在基督裡，他就是新造的人，舊事已過，都變成新的了。', r: '哥林多後書五章17節',
      w: '{稱呼}，今天是新的開始。願你一生記得這一天。', b: '新造的人' }
  ]},
  { id: 'season', n: '節期問候', hint: '節期是華人最容易接受祝福的時候。', cs: [
    { v: '你以恩典為年歲的冠冕；你的路徑都滴下脂油。', r: '詩篇六十五篇11節',
      w: '{稱呼}，新年蒙福！願新的一年，恩典作你的冠冕。', b: '新年蒙福' },
    { v: '因今天在大衛的城裡，為你們生了救主，就是主基督。', r: '路加福音二章11節',
      w: '{稱呼}，聖誕快樂！這一天的意義，是有一位為你而來。', b: '聖誕蒙恩平安' },
    { v: '他造月亮星宿管黑夜，因他的慈愛永遠長存。', r: '詩篇一百三十六篇9節',
      w: '{稱呼}，中秋佳節，願你與家人團圓，心裡也團圓。', b: '中秋平安團圓' },
    { v: '復活在我，生命也在我。信我的人雖然死了，也必復活。', r: '約翰福音十一章25節',
      w: '{稱呼}，思念的日子裡，願你有安慰，也有再相見的盼望。', b: '願你心得安慰' },
    { v: '因有一嬰孩為我們而生……名稱為奇妙策士、全能的神、永在的父、和平的君。', r: '以賽亞書九章6節',
      w: '{稱呼}，歲末感恩，謝謝你陪我走過這一年。', b: '願和平的君與你同在' }
  ]}
];

/* ---------------- 版型與邊框 ---------------- */
var TPL = {
  navy:  { n: '同行深藍', bg: ['#1B4B7A', '#153A61', '#0E2540'], glow: 'rgba(226,190,106,.26)',
    ink: '#F3F6FA', accent: '#E2BE6A', gold: '#E2BE6A', sub: '#B9C7D6', frame: 'rgba(226,190,106,.34)' },
  paper: { n: '素樸信箋', bg: ['#FBF8F1', '#F4EFE3', '#EDE6D6'], glow: 'rgba(232,201,122,.55)',
    ink: '#1F2937', accent: '#1B4B7A', gold: '#8C6608', sub: '#6B7E79', frame: 'rgba(27,75,122,.30)' },
  plain: { n: '純白簡潔', bg: ['#FFFFFF', '#FFFFFF', '#FFFFFF'], glow: 'rgba(0,0,0,0)',
    ink: '#1F2937', accent: '#1B4B7A', gold: '#8C6608', sub: '#6B7280', frame: 'rgba(27,75,122,.22)' },
  dawn:  { n: '晨曦盼望', bg: ['#FFF6EC', '#FBE9D2', '#F6D9B8'], glow: 'rgba(255,214,150,.65)',
    ink: '#3A2A1A', accent: '#B5651D', gold: '#C97A22', sub: '#8A6A4A', frame: 'rgba(181,101,29,.28)' },
  grace: { n: '青草安歇', bg: ['#F2F7F1', '#E4EFE6', '#D6E7DA'], glow: 'rgba(160,200,170,.5)',
    ink: '#1C2E26', accent: '#2E6A50', gold: '#3C8A64', sub: '#5C7A6A', frame: 'rgba(46,106,80,.25)' },
  rose:  { n: '溫柔玫瑰', bg: ['#FCF5F3', '#F6E7E3', '#EFD8D2'], glow: 'rgba(220,160,150,.45)',
    ink: '#33221E', accent: '#9A4A3A', gold: '#B36A54', sub: '#8A6A62', frame: 'rgba(154,74,58,.24)' },
  sky:   { n: '平安晴空', bg: ['#F1F7FB', '#DFEEF6', '#CFE4F0'], glow: 'rgba(150,200,230,.5)',
    ink: '#1B2A33', accent: '#256080', gold: '#2E7DA0', sub: '#5A7684', frame: 'rgba(37,96,128,.24)' },
  linen: { n: '素雅棉麻', bg: ['#F7F4EE', '#EFEAE0', '#E6DFD2'], glow: 'rgba(200,190,170,.4)',
    ink: '#2A2620', accent: '#5A5040', gold: '#8A7A5A', sub: '#7A7263', frame: 'rgba(90,80,64,.22)' },
  night: { n: '深夜星光', bg: ['#101E1B', '#16302A', '#0E2420'], glow: 'rgba(232,201,122,.28)',
    ink: '#EDEAE0', accent: '#E8C97A', gold: '#E8C97A', sub: '#9FB0AA', frame: 'rgba(232,201,122,.32)' }
};
var TPL_ORDER = ['navy', 'paper', 'plain', 'dawn', 'grace', 'rose', 'sky', 'linen', 'night'];
var BORDERS = [{ id: 'classic', n: '古典雙框' }, { id: 'corner', n: '雅緻角飾' }, { id: 'inline', n: '內斂細線' },
               { id: 'dots', n: '珠鏈點框' }, { id: 'ornate', n: '華麗花角' }, { id: 'none', n: '無邊框' }];
var RATIOS = [{ id: '4:5', n: '直式 4:5', W: 1080, H: 1350 }, { id: '9:16', n: '直式 9:16', W: 1080, H: 1920 },
              { id: '1:1', n: '方形 1:1', W: 1080, H: 1080 }, { id: '16:9', n: '橫式 16:9', W: 1200, H: 675 }];
var STK_POS = [{ id: 'br', n: '右下' }, { id: 'bl', n: '左下' }, { id: 'bc', n: '正下' },
               { id: 'tr', n: '右上' }, { id: 'tl', n: '左上' }];


/* ---------------- 十全大福帖：十帖福氣的卡片場景 ---------------- */
var SCENES_TEN = [
  { id: 'ten1', n: '十全・罪得赦免', hint: '有些事扛太久了。遞一句「你可以放下」給他。', cs: [
    { v: '得赦免其過、遮蓋其罪的，這人是有福的。', r: '詩篇三十二篇1節',
      w: '{稱呼}，有些事我們自己扛太久了。有一位願意替我們扛，而且不再提起。', b: '願你心裡得自由' },
    { v: '我們若認自己的罪，神是信實的，是公義的，必要赦免我們的罪。', r: '約翰壹書一章9節',
      w: '{稱呼}，不必先變好才能來。願意誠實說出口，就夠了。', b: '祂必赦免你' },
    { v: '我塗抹了你的過犯，像厚雲消散；我塗抹了你的罪惡，如薄雲滅沒。', r: '以賽亞書四十四章22節',
      w: '{稱呼}，厚雲看起來很沉，風一吹就散了。願你今天抬起頭來。', b: '厚雲必消散' },
    { v: '東離西有多遠，他叫我們的過犯離我們也有多遠！', r: '詩篇一百零三篇12節',
      w: '{稱呼}，神赦免的時候是真的放下，不是先記著再說。', b: '祂真的放下了' },
    { v: '如今，那些在基督耶穌裡的就不定罪了。', r: '羅馬書八章1節',
      w: '{稱呼}，你不必再替自己判刑了，有一位已經替你受了。', b: '你不再被定罪' }
  ]},
  { id: 'ten2', n: '十全・平安喜樂', hint: '他不缺道理，缺的是一口氣。', cs: [
    { v: '我留下平安給你們，我將我的平安賜給你們；你們心裡不要憂愁，也不要膽怯。', r: '約翰福音十四章27節',
      w: '{稱呼}，願你今晚睡得著，明天醒來有一口氣可以喘。', b: '願主的平安臨到你' },
    { v: '應當一無掛慮，只要凡事藉著禱告、祈求和感謝，將你們所要的告訴神。', r: '腓立比書四章6節',
      w: '{稱呼}，煩惱不用自己吞。說出來，有一位在聽。', b: '把重擔交出去' },
    { v: '你們要將一切的憂慮卸給神，因為他顧念你們。', r: '彼得前書五章7節',
      w: '{稱呼}，今天想到你，就替你禱告了一分鐘。願你肩膀鬆一點。', b: '祂顧念你' },
    { v: '凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。', r: '馬太福音十一章28節',
      w: '{稱呼}，累了就停一下，那不是偷懶，是需要。', b: '願你得安息' },
    { v: '喜樂的心乃是良藥。', r: '箴言十七章22節',
      w: '{稱呼}，願你今天有一件小小的事，讓你笑出來。', b: '願你心裡歡喜' }
  ]},
  { id: 'ten3', n: '十全・病得醫治', hint: '一句話，勝過一長串建議。', cs: [
    { v: '因他受的鞭傷，我們得醫治。', r: '以賽亞書五十三章5節',
      w: '{稱呼}，我把你的身體交給那位最懂身體的主。', b: '願主親自醫治你' },
    { v: '出於信心的祈禱要救那病人，主必叫他起來。', r: '雅各書五章15節',
      w: '{稱呼}，你不是一個人在對抗這場病。我天天為你祈求。', b: '我為你祈求' },
    { v: '耶和華啊，求你醫治我，我便痊癒。', r: '耶利米書十七章14節',
      w: '{稱呼}，願醫療順利，也願你的心先得安穩。', b: '願你早日康復' },
    { v: '你的日子如何，你的力量也必如何。', r: '申命記三十三章25節',
      w: '{稱呼}，今天的力氣夠今天用就好，明天神會再給。', b: '一天的力量夠一天用' },
    { v: '我的恩典夠你用的，因為我的能力是在人的軟弱上顯得完全。', r: '哥林多後書十二章9節',
      w: '{稱呼}，軟弱的時候不用逞強，恩典正是為這種時候預備的。', b: '祂的恩典夠你用' }
  ]},
  { id: 'ten4', n: '十全・愛情如意', hint: '在等對的人之前，先讓他知道自己被珍惜。', cs: [
    { v: '愛情，眾水不能息滅，大水也不能淹沒。', r: '雅歌八章7節',
      w: '{稱呼}，願你遇見一份不必委屈自己去換的愛。', b: '願你被好好地愛' },
    { v: '愛是恆久忍耐，又有恩慈；愛是永不止息。', r: '哥林多前書十三章4、8節',
      w: '{稱呼}，真正的愛不急也不催，值得等。', b: '愛是永不止息' },
    { v: '你要保守你心，勝過保守一切，因為一生的果效是由心發出。', r: '箴言四章23節',
      w: '{稱呼}，在等對的人之前，先把自己的心顧好。我為你禱告。', b: '願你的心被看顧' },
    { v: '耶和華神說：那人獨居不好，我要為他造一個配偶幫助他。', r: '創世記二章18節',
      w: '{稱呼}，你的孤單神看見了，祂比你更在意這件事。', b: '神必為你預備' },
    { v: '我們愛，因為神先愛我們。', r: '約翰壹書四章19節',
      w: '{稱呼}，願你先被好好地愛，再有力氣去愛人。', b: '你是先被愛的' }
  ]},
  { id: 'ten5', n: '十全・家庭和樂', hint: '家裡的事，最需要有人一起守望。', cs: [
    { v: '看哪，弟兄和睦同居是何等地善，何等地美！', r: '詩篇一百三十三篇1節',
      w: '{稱呼}，願你們家在飯桌上，能再一起笑一次。', b: '願你家和睦' },
    { v: '至於我和我家，我們必定事奉耶和華。', r: '約書亞記二十四章15節',
      w: '{稱呼}，一個人先站住，全家就有指望。我陪你一起守望。', b: '願神看顧你全家' },
    { v: '若不是耶和華建造房屋，建造的人就枉然勞力。', r: '詩篇一百二十七篇1節',
      w: '{稱呼}，你已經很努力了。剩下的，交給那位會建造的主。', b: '願主親自建造' },
    { v: '要孝敬父母，使你得福，在世長壽。', r: '以弗所書六章2至3節',
      w: '{稱呼}，你這樣照顧家人，神都看見了，一次也沒有漏掉。', b: '神都看見了' },
    { v: '並要以恩慈相待，存憐憫的心，彼此饒恕。', r: '以弗所書四章32節',
      w: '{稱呼}，家裡的結不會一天解開，但可以從一句軟話開始。', b: '願你們心得醫治' }
  ]},
  { id: 'ten6', n: '十全・人緣良好', hint: '被記得的人，心會軟下來。', cs: [
    { v: '你們願意人怎樣待你們，你們也要怎樣待人。', r: '路加福音六章31節',
      w: '{稱呼}，你待人的那份好，我一直看在眼裡。', b: '願你被人善待' },
    { v: '若是能行，總要盡力與眾人和睦。', r: '羅馬書十二章18節',
      w: '{稱呼}，有些關係急不得，慢慢來也是一種盡力。', b: '願你與人和睦' },
    { v: '朋友乃時常親愛，弟兄為患難而生。', r: '箴言十七章17節',
      w: '{稱呼}，我很珍惜認識你。有事記得找我。', b: '我在你這一邊' },
    { v: '你們的言語要常常帶著和氣，好像用鹽調和。', r: '歌羅西書四章6節',
      w: '{稱呼}，願你今天遇到願意好好說話的人。', b: '願你被溫柔對待' },
    { v: '耶穌的智慧和身量，並神和人喜愛他的心，都一齊增長。', r: '路加福音二章52節',
      w: '{稱呼}，願神使人喜愛你，也使你有力氣去愛人。', b: '願你得人喜愛' }
  ]},
  { id: 'ten7', n: '十全・事業成功', hint: '他的認真，值得有人說一句看見了。', cs: [
    { v: '凡他所做的盡都順利。', r: '詩篇一篇3節',
      w: '{稱呼}，願你手所做的，一件一件都順利。', b: '願你凡事順利' },
    { v: '你所做的，要交託耶和華，你所謀的，就必成立。', r: '箴言十六章3節',
      w: '{稱呼}，決定難下的時候，可以先交出去再說。', b: '交託必成立' },
    { v: '無論做甚麼，都要從心裡做，像是給主做的。', r: '歌羅西書三章23節',
      w: '{稱呼}，你的認真沒有白費，有一位一直在看。', b: '你的認真被看見' },
    { v: '耶和華必使你作首不作尾，但居上不居下。', r: '申命記二十八章13節',
      w: '{稱呼}，願你的路愈走愈寬，也願你走得平安。', b: '願神賜福你的工作' },
    { v: '我靠著那加給我力量的，凡事都能做。', r: '腓立比書四章13節',
      w: '{稱呼}，撐不下去的時候，不必只靠自己。', b: '願你得著力量' }
  ]},
  { id: 'ten8', n: '十全・凡事富足', hint: '願他有夠用的，也有睡得著的。', cs: [
    { v: '耶和華所賜的福使人富足，並不加上憂慮。', r: '箴言十章22節',
      w: '{稱呼}，願你有夠用的，也有睡得著的。', b: '願你一無所缺' },
    { v: '我的神必照他榮耀的豐富，在基督耶穌裡，使你們一切所需用的都充足。', r: '腓立比書四章19節',
      w: '{稱呼}，錢的事我幫不上太多，但我天天為你的需要祈求。', b: '祂必供應你' },
    { v: '耶和華是我的牧者，我必不致缺乏。', r: '詩篇二十三篇1節',
      w: '{稱呼}，緊的日子會過去的。願你今天有夠用的平安。', b: '必不致缺乏' },
    { v: '你們要先求他的國和他的義，這些東西都要加給你們了。', r: '馬太福音六章33節',
      w: '{稱呼}，先顧好自己的心，其餘的神會添上。', b: '神必加給你' },
    { v: '施比受更為有福。', r: '使徒行傳二十章35節',
      w: '{稱呼}，你幫過的那些人，神都記著。願你也被人幫。', b: '願你有餘可以給' }
  ]},
  { id: 'ten9', n: '十全・經歷神能', hint: '走到盡頭的時候，往往是神開始的地方。', cs: [
    { v: '在人這是不能的，在神凡事都能。', r: '馬太福音十九章26節',
      w: '{稱呼}，走到盡頭的時候，往往是神開始的地方。', b: '在神凡事都能' },
    { v: '若有人在基督裡，他就是新造的人，舊事已過，都變成新的了。', r: '哥林多後書五章17節',
      w: '{稱呼}，人是可以真的不一樣的，這件事我自己經歷過。', b: '都要變成新的' },
    { v: '但那等候耶和華的必從新得力。', r: '以賽亞書四十章31節',
      w: '{稱呼}，力氣用完了不是失敗，是可以重新得力的時候。', b: '必從新得力' },
    { v: '我也要賜給你們一個新心，將新靈放在你們裡面。', r: '以西結書三十六章26節',
      w: '{稱呼}，改變不必靠咬牙，可以從裡面開始。', b: '願你得著新心' },
    { v: '但聖靈降臨在你們身上，你們就必得著能力。', r: '使徒行傳一章8節',
      w: '{稱呼}，願你經歷那種不是靠自己撐出來的力量。', b: '願你得著能力' }
  ]},
  { id: 'ten10', n: '十全・得著永生', hint: '不催逼，只把那扇門推開一點點。', cs: [
    { v: '神愛世人，甚至將他的獨生子賜給他們，叫一切信他的，不至滅亡，反得永生。', r: '約翰福音三章16節',
      w: '{稱呼}，這句話我放在心裡很多年了，今天想分享給你。', b: '願你得著永生' },
    { v: '復活在我，生命也在我。信我的人雖然死了，也必復活。', r: '約翰福音十一章25節',
      w: '{稱呼}，想到那件事我心裡也不好受。願你在盼望裡得安慰。', b: '死亡不是句點' },
    { v: '神要擦去他們一切的眼淚；不再有死亡，也不再有悲哀、哭號、疼痛。', r: '啟示錄二十一章4節',
      w: '{稱呼}，有一天所有的眼淚都會被擦乾。這是我為你抓住的盼望。', b: '必有那一天' },
    { v: '在我父的家裡有許多住處；我去原是為你們預備地方去。', r: '約翰福音十四章2節',
      w: '{稱呼}，有一個地方是被預備好的，那裡也有你的名字。', b: '有地方為你預備' },
    { v: '凡接待他的，就是信他名的人，他就賜他們權柄作神的兒女。', r: '約翰福音一章12節',
      w: '{稱呼}，只要願意，那扇門隨時可以開。我陪你。', b: '你可以作神的兒女' }
  ]}
];
SCENES = SCENES.concat(SCENES_TEN);

/* ---------------- 狀態 ---------------- */
var gc = {
  sid: 'greet', i: 0, pid: '', people: [], custom: null,
  tpl: LS.get('gcTpl', 'paper'), border: LS.get('gcBorder', 'classic'),
  ratio: LS.get('gcRatio', '9:16'),
  callName: '',
  fs: LS.get('gcFs', 1), signer: LS.get('gcSigner', ''), group: LS.get('gcGroup', '國度321空中團契'),
  photo: null, photoMode: 'bg', stkPos: 'br', stkSize: 0.30, lastURL: null, aiBusy: false
};

function scene(id) { for (var i = 0; i < SCENES.length; i++) if (SCENES[i].id === id) return SCENES[i]; return SCENES[0]; }
function curCard() {
  if (gc.custom) return gc.custom;
  var s = scene(gc.sid);
  return s.cs[Math.max(0, Math.min(gc.i, s.cs.length - 1))];
}
function nameOf() {
  var n = String(gc.callName || '').trim();
  if (n) return n;
  if (gc.pid) {
    for (var i = 0; i < gc.people.length; i++) if (gc.people[i].id === gc.pid) return gc.people[i].name;
  }
  return '朋友';
}
function merged() {
  var c = curCard();
  return { v: c.v, r: c.r, b: c.b, w: String(c.w || '').split('{稱呼}').join(nameOf()) };
}

/* ---------------- 繪圖 ---------------- */
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function coverDraw(ctx, img, x, y, w, h) {
  var ir = img.width / img.height, r = w / h, sw, sh, sx, sy;
  if (ir > r) { sh = img.height; sw = sh * r; sx = (img.width - sw) / 2; sy = 0; }
  else { sw = img.width; sh = sw / r; sx = 0; sy = (img.height - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
function hx(c) { var h = String(c).replace('#', ''); return h.length === 3 ? [0, 1, 2].map(function (i) { return parseInt(h[i] + h[i], 16); }) : [0, 2, 4].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); }
function mixC(a, b, t) { var A = hx(a), B = hx(b); return '#' + [0, 1, 2].map(function (i) { return Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0'); }).join(''); }

function drawBorder(ctx, W, H, pad, F, T) {
  if (gc.border === 'none') return;
  var line = T.frame, line2 = T.frame.replace(/[\d.]+\)$/, '0.55)'), gold = T.gold;
  var m = pad * 0.5, x = m, y = m, w = W - m * 2, h = H - m * 2, R = Math.round(18 * F), B = gc.border;
  if (B === 'classic') {
    ctx.strokeStyle = line; ctx.lineWidth = Math.max(2, W * .0022); rr(ctx, x, y, w, h, R); ctx.stroke();
    ctx.strokeStyle = line2; ctx.lineWidth = Math.max(1, W * .0009);
    rr(ctx, x + Math.round(9 * F), y + Math.round(9 * F), w - Math.round(18 * F), h - Math.round(18 * F), Math.round(12 * F)); ctx.stroke();
    ctx.fillStyle = gold;
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(function (p) {
      ctx.beginPath(); ctx.arc(p[0], p[1], Math.round(5 * F), 0, 7); ctx.fill();
    });
  } else if (B === 'corner') {
    ctx.strokeStyle = gold; ctx.lineWidth = Math.max(2, W * .003); ctx.lineCap = 'round';
    var L = Math.round(56 * F);
    var seg = function (cx, cy, dx, dy) {
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * L, cy);
      ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + dy * L); ctx.stroke();
    };
    seg(x, y, 1, 1); seg(x + w, y, -1, 1); seg(x, y + h, 1, -1); seg(x + w, y + h, -1, -1);
    ctx.lineCap = 'butt';
  } else if (B === 'inline') {
    ctx.strokeStyle = line2; ctx.lineWidth = Math.max(1, W * .0013);
    rr(ctx, x + Math.round(6 * F), y + Math.round(6 * F), w - Math.round(12 * F), h - Math.round(12 * F), Math.round(14 * F)); ctx.stroke();
  } else if (B === 'dots') {
    ctx.fillStyle = line2;
    var r = Math.max(2, W * .0026), gap = Math.round(26 * F);
    var ex = x + Math.round(6 * F), ey = y + Math.round(6 * F), ew = w - Math.round(12 * F), eh = h - Math.round(12 * F);
    var dot = function (px, py) { ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill(); };
    for (var px = ex; px <= ex + ew; px += gap) { dot(px, ey); dot(px, ey + eh); }
    for (var py = ey; py <= ey + eh; py += gap) { dot(ex, py); dot(ex + ew, py); }
  } else if (B === 'ornate') {
    ctx.strokeStyle = line; ctx.lineWidth = Math.max(2, W * .0022); rr(ctx, x, y, w, h, R); ctx.stroke();
    ctx.strokeStyle = gold; ctx.lineWidth = Math.max(1.5, W * .0016); ctx.lineCap = 'round';
    var L2 = Math.round(34 * F), o = Math.round(16 * F);
    var flo = function (cx, cy, dx, dy) {
      ctx.beginPath(); ctx.moveTo(cx + dx * o, cy + dy * o); ctx.lineTo(cx + dx * (o + L2), cy + dy * o);
      ctx.moveTo(cx + dx * o, cy + dy * o); ctx.lineTo(cx + dx * o, cy + dy * (o + L2)); ctx.stroke();
      ctx.fillStyle = gold; ctx.beginPath(); ctx.arc(cx + dx * o, cy + dy * o, Math.round(4.5 * F), 0, 7); ctx.fill();
    };
    flo(x, y, 1, 1); flo(x + w, y, -1, 1); flo(x, y + h, 1, -1); flo(x + w, y + h, -1, -1);
    ctx.lineCap = 'butt';
  }
}

function wrapT(ctx, text, maxW) {
  var out = [], cur = '';
  var arr = String(text || '').split('');
  for (var i = 0; i < arr.length; i++) {
    var ch = arr[i];
    if (ch === '\n') { if (cur) out.push(cur); cur = ''; continue; }
    if (ctx.measureText(cur + ch).width > maxW && cur) { out.push(cur); cur = ''; }
    cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

function drawCard(cv) {
  var R = RATIOS.filter(function (x) { return x.id === gc.ratio; })[0] || RATIOS[0];
  var W = R.W, H = R.H;
  var ctx = cv.getContext('2d'); cv.width = W; cv.height = H;
  var T = TPL[gc.tpl] || TPL.paper;
  var F = W / 1080, pad = Math.round(W * .078), iw = W - pad * 2;
  var FT = F * Math.min(1.35, Math.max(0.85, +gc.fs || 1));
  if (H / W >= 1.5) FT *= 1.14;        /* 9:16 直式：字放大一點，版面才不會太空 */
  else if (H / W >= 1.2) FT *= 1.06;   /* 4:5 直式：略放大 */
  var sans = '"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif';
  var serif = '"Noto Serif TC","Songti TC","STSong","PMingLiU",serif';
  var ink = T.ink, accent = T.accent, gold = T.gold, sub = T.sub;
  var subDeep = mixC(T.sub, T.ink, .55);
  var c = merged();

  var g = ctx.createLinearGradient(0, 0, W * .3, H);
  g.addColorStop(0, T.bg[0]); g.addColorStop(.55, T.bg[1]); g.addColorStop(1, T.bg[2]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  if (gc.photo && gc.photoMode === 'bg') {
    coverDraw(ctx, gc.photo, 0, 0, W, H);
    var b = hx(T.bg[1]);
    var sc = ctx.createLinearGradient(0, 0, 0, H);
    sc.addColorStop(0, 'rgba(' + b[0] + ',' + b[1] + ',' + b[2] + ',0.48)');
    sc.addColorStop(.5, 'rgba(' + b[0] + ',' + b[1] + ',' + b[2] + ',0.68)');
    sc.addColorStop(1, 'rgba(' + b[0] + ',' + b[1] + ',' + b[2] + ',0.58)');
    ctx.fillStyle = sc; ctx.fillRect(0, 0, W, H);
  }
  var rg = ctx.createRadialGradient(W * .85, H * .10, 10, W * .85, H * .10, W * .7);
  rg.addColorStop(0, T.glow); rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

  drawBorder(ctx, W, H, pad, F, T);

  /* 團體名 */
  var grpSz = Math.round(27 * FT), refSz = Math.round(29 * FT), blSz = Math.round(33 * FT), sigSz = Math.round(26 * FT);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  var grp = String(gc.group || '').trim();
  var grpY = pad + Math.round(40 * F);
  if (grp) {
    ctx.fillStyle = subDeep; ctx.font = '600 ' + grpSz + 'px ' + sans;
    var gw = ctx.measureText(grp).width;
    ctx.fillText(grp, W / 2, grpY);
    ctx.strokeStyle = T.frame.replace(/[\d.]+\)$/, '0.6)'); ctx.lineWidth = Math.max(1, 1.5 * F);
    var lx = W / 2 - gw / 2 - Math.round(28 * F), rx = W / 2 + gw / 2 + Math.round(28 * F);
    ctx.beginPath(); ctx.moveTo(lx - Math.round(30 * F), grpY - Math.round(9 * F)); ctx.lineTo(lx, grpY - Math.round(9 * F)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rx, grpY - Math.round(9 * F)); ctx.lineTo(rx + Math.round(30 * F), grpY - Math.round(9 * F)); ctx.stroke();
  }

  /* 版位 */
  var stk = gc.photo && gc.photoMode === 'sticker';
  var stkBottom = stk && gc.stkPos !== 'tl' && gc.stkPos !== 'tr';
  var liftRoom = stkBottom ? Math.round(W * gc.stkSize * 1.12) + Math.round(30 * F) : 0;
  var topRoom = pad + Math.round(96 * F), botRoom = pad + Math.round(160 * F) + liftRoom;
  var room = H - topRoom - botRoom;

  var vs = Math.round(52 * FT), vl;
  for (;;) {
    ctx.font = '600 ' + vs + 'px ' + serif;
    vl = wrapT(ctx, '「' + c.v + '」', iw);
    if (vl.length <= 6 || vs <= Math.round(28 * F)) break;
    vs -= Math.round(3 * F);
  }
  var fixed = vs * .9 + vl.length * vs * 1.55 + Math.round(62 * F) + Math.round(80 * F);
  var bs = Math.round(40 * FT), bl;
  for (;;) {
    ctx.font = bs + 'px ' + sans;
    bl = wrapT(ctx, c.w, iw);
    if (fixed + bl.length * bs * 1.74 <= room || bs <= Math.round(22 * F)) break;
    bs -= Math.round(2 * F);
  }
  var total = fixed + bl.length * bs * 1.74;
  var y = topRoom + Math.max(0, (room - total) / 2);

  /* 經文 */
  ctx.fillStyle = accent; ctx.font = '600 ' + vs + 'px ' + serif;
  y += vs * .9; vl.forEach(function (l) { ctx.fillText(l, W / 2, y); y += vs * 1.55; });

  /* 出處 */
  ctx.font = refSz + 'px ' + sans; ctx.fillStyle = sub;
  ctx.fillText(c.r + '（和合本）', W / 2, y); y += Math.round(62 * F);

  /* 分隔飾 */
  ctx.fillStyle = gold;
  ctx.beginPath(); ctx.arc(W / 2, y, Math.round(5 * F), 0, 7); ctx.fill();
  ctx.strokeStyle = gold; ctx.lineWidth = 2.5 * F;
  ctx.beginPath(); ctx.moveTo(W / 2 - Math.round(52 * F), y); ctx.lineTo(W / 2 - Math.round(16 * F), y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 + Math.round(16 * F), y); ctx.lineTo(W / 2 + Math.round(52 * F), y); ctx.stroke();
  y += Math.round(80 * F);

  /* 內文 */
  ctx.textAlign = 'left'; ctx.fillStyle = ink; ctx.font = bs + 'px ' + sans;
  bl.forEach(function (l) { ctx.fillText(l, pad, y); y += bs * 1.74; });

  /* 祝福語與署名 */
  var stkW = Math.round(W * gc.stkSize);
  var sideR = stkBottom && gc.stkPos === 'br', sideL = stkBottom && gc.stkPos === 'bl';
  var lift = (stkBottom && gc.stkPos === 'bc') ? Math.round(W * gc.stkSize * 1.12) + Math.round(20 * F) : 0;
  var rightEdge = sideR ? (W - pad - stkW - Math.round(24 * F)) : W - pad;
  var leftStart = sideL ? (pad + stkW + Math.round(24 * F)) : pad;
  var sideMode = sideR || sideL;
  var cxT = sideMode ? (leftStart + rightEdge) / 2 : W / 2;
  var maxT = sideMode ? (rightEdge - leftStart) : iw;
  var fit = function (txt, size, weight, fam) {
    var z = size;
    while (z > Math.round(16 * F)) { ctx.font = weight + ' ' + z + 'px ' + fam; if (ctx.measureText(txt).width <= maxT) break; z -= Math.round(2 * F); }
    ctx.font = weight + ' ' + z + 'px ' + fam;
  };
  ctx.textAlign = 'center'; ctx.fillStyle = accent;
  fit(c.b, blSz, '600', serif);
  ctx.fillText(c.b, cxT, H - pad * .72 - Math.round(96 * F) - lift);
  var sig = String(gc.signer || '').trim();
  if (sig) {
    ctx.fillStyle = subDeep; fit(sig + '　敬上', sigSz, '600', sans);
    ctx.fillText(sig + '　敬上', cxT, H - pad * .72 - Math.round(30 * F) - lift);
  }

  /* 相片貼紙（拍立得） */
  if (stk) {
    var sw = stkW, sh = Math.round(sw * 1.12);
    var top = gc.stkPos === 'tl' || gc.stkPos === 'tr';
    var bx = (gc.stkPos === 'bl' || gc.stkPos === 'tl') ? pad - Math.round(4 * F)
      : (gc.stkPos === 'bc') ? Math.round((W - sw) / 2) : W - pad - sw + Math.round(4 * F);
    var by = top ? pad + Math.round(70 * F) : H - pad - sh + Math.round(4 * F);
    ctx.save();
    ctx.translate(bx + sw / 2, by + sh / 2); ctx.rotate(-3 * Math.PI / 180);
    ctx.shadowColor = 'rgba(0,0,0,.30)'; ctx.shadowBlur = Math.round(24 * F); ctx.shadowOffsetY = Math.round(9 * F);
    var fr = Math.round(10 * F), pb = Math.round(26 * F);
    rr(ctx, -sw / 2, -sh / 2, sw, sh, Math.round(10 * F)); ctx.fillStyle = '#FDFBF6'; ctx.fill();
    ctx.shadowColor = 'transparent';
    var iw2 = sw - fr * 2, ih2 = sh - fr - pb;
    ctx.save(); rr(ctx, -sw / 2 + fr, -sh / 2 + fr, iw2, ih2, Math.round(4 * F)); ctx.clip();
    coverDraw(ctx, gc.photo, -sw / 2 + fr, -sh / 2 + fr, iw2, ih2); ctx.restore();
    ctx.restore();
  }
}

/* ---------------- 預覽（畫成圖片，長按即可存到相簿） ---------------- */
function renderPreview() {
  var box = document.getElementById('gcBox'); if (!box) return;
  try {
    var cv = document.createElement('canvas');
    drawCard(cv);
    gc.lastURL = cv.toDataURL('image/png');
    box.innerHTML = '<img src="' + gc.lastURL + '" alt="福音卡片" '
      + 'style="width:100%;border-radius:12px;border:1px solid var(--line);display:block;'
      + 'box-shadow:0 6px 20px rgba(0,0,0,.12);-webkit-touch-callout:default;-webkit-user-select:auto;user-select:auto">';
  } catch (e) {
    box.innerHTML = '<p class="muted">這個裝置無法產生圖片，請改用「複製文字」。</p>';
  }
}

/* ---------------- 場景挑選頁 ---------------- */
async function cardsHTML() {
  try { gc.people = (await DB.all('persons')).sort(function (a, b) { return (a.order || 0) - (b.order || 0); }); }
  catch (e) { gc.people = []; }
  var s = scene(gc.sid);
  var nm = nameOf();
  return '<div class="card">'
    + '<div class="eyebrow">福音卡片</div>'
    + '<h2 class="sec">先給他一句話</h2>'
    + '<p class="muted">撒種階段最自然的一步：把一句適合他現在處境的話，做成一張圖傳給他。'
    + '不講道理，只送一句祝福。</p>'
    + (gc.people.length ? '<div class="field" style="margin-top:14px"><label>做給誰（稱呼會自動帶入）</label>'
        + '<div class="seg">'
        + '<button data-act="gcWho" data-id="" aria-pressed="' + (!gc.pid) + '">不指定</button>'
        + gc.people.map(function (p) {
            var st = null; try { st = stageOf(p.stage); } catch (e) {}
            return '<button data-act="gcWho" data-id="' + p.id + '" aria-pressed="' + (gc.pid === p.id) + '">'
              + esc(p.name) + (st ? '・' + st.id : '') + '</button>';
          }).join('')
        + '</div></div>' : '')
    + '<div class="field" style="margin-bottom:0"><label>場景</label><div class="seg">'
    + SCENES.map(function (x) {
        return '<button data-act="gcScene" data-id="' + x.id + '" aria-pressed="' + (gc.sid === x.id) + '">' + esc(x.n) + '</button>';
      }).join('')
    + '</div></div>'
    + '<p class="tiny" style="margin-top:10px">' + esc(s.hint) + '</p>'
    + '</div>'

    + '<div class="card">'
    + '<div class="eyebrow">AI 屬靈同伴</div>'
    + '<h3 class="sub">請小智為他寫一張</h3>'
    + '<p class="muted">說明他的情況，小智會寫出合適的經文與問候，可以直接做成卡片。</p>'
    + '<div class="field" style="margin-top:10px;margin-bottom:8px">'
    + '<input type="text" id="gcAi" placeholder="例：同事，母親剛開刀，他很累">'
    + '</div>'
    + '<button class="btn quiet" data-act="gcAiWrite">✨ 請小智寫一張</button>'
    + '<p class="tiny" style="margin-top:10px">小智寫的經文請對照聖經確認一次再送出。</p>'
    + '</div>'

    + s.cs.map(function (c, i) {
        return '<div class="card">'
          + '<div class="verse" style="margin-top:0">' + esc(c.v) + '<span class="ref">' + esc(c.r) + '</span></div>'
          + '<p class="muted">' + esc(String(c.w).split('{稱呼}').join(nm)) + '</p>'
          + '<div class="btn-row" style="margin-top:12px">'
          + '<button class="btn quiet sm" data-act="gcMake" data-i="' + i + '">做成圖卡</button>'
          + '<button class="btn quiet sm" data-act="gcCopy" data-i="' + i + '">複製文字</button>'
          + '</div></div>';
      }).join('')
    + '<p class="tiny" style="text-align:center">傳出去之前，先為他禱告一分鐘。<br>是聖靈感動人，不是圖片。</p>';
}
/* 同一份內容，既是底部導覽的「卡片」分頁，也保留原本的覆蓋層用法 */
SHEETS.cards = cardsHTML;
VIEWS.cards = cardsHTML;
/* 在分頁上要用 render()，在覆蓋層上要用 refreshSheet()，這裡自動分辨 */
function rePage() {
  var sh = document.getElementById('sheet');
  if (sh && !sh.classList.contains('hidden')) refreshSheet(); else render();
}
ACTS.openCards = function () { gc.custom = null; go('cards'); };
ACTS.gcScene = function (d) { gc.sid = d.id; gc.i = 0; rePage(); };

/* 供其他模組呼叫：直接打開卡片頁並切到指定場景 */
window.__gcScene = function (id) {
  gc.custom = null; gc.sid = id; gc.i = 0;
  if (G.closeSheet) G.closeSheet();
  go('cards');
};
ACTS.gcWho = function (d) {
  grab();
  var before = nameOf();
  gc.pid = d.id || ''; gc.callName = '';
  var after = nameOf();
  if (gc.custom && before && before !== after) {
    gc.custom.w = String(gc.custom.w || '').split(before).join(after);
  }
  rePage();
};
ACTS.gcCopy = function (d) {
  gc.i = +d.i; gc.custom = null;
  var c = merged();
  copyText(c.w + '\n\n「' + c.v + '」（' + c.r + '　和合本）\n\n' + c.b + (gc.signer ? '\n' + gc.signer + '　敬上' : ''));
};
ACTS.gcMake = function (d) { gc.i = +d.i; gc.custom = null; push('cardStudio', {}, '做成圖卡'); };


/* =========================================================
   有聲卡片：自拍．錄音．配樂
   參考「321愛的關懷」：一張卡片加上你的聲音，比一百句文字更近。
   錄音用 MediaRecorder，配樂用 Web Audio 現場合成（離線也能用），
   兩者以 OfflineAudioContext 混成一個音檔，可播放、可儲存、可分享。
   ========================================================= */
var TUNES = [
  { id: 'grace', n: '奇異恩典', bpm: 76, wave: 'triangle', notes: [
    ['G3',1],['C4',2],['E4',1],['E4',2],['D4',1],['C4',2],['A3',1],['G3',3],
    ['G3',1],['C4',2],['E4',1],['E4',2],['D4',1],['E4',3],[null,1],
    ['E4',1],['G4',2],['G4',1],['E4',2],['D4',1],['C4',2],['A3',1],['G3',3],
    ['G3',1],['C4',2],['E4',1],['E4',2],['D4',1],['C4',3],[null,2]
  ]},
  { id: 'joy', n: '歡欣頌讚', bpm: 92, wave: 'triangle', notes: [
    ['E4',1],['E4',1],['F4',1],['G4',1],['G4',1],['F4',1],['E4',1],['D4',1],
    ['C4',1],['C4',1],['D4',1],['E4',1],['E4',1.5],['D4',0.5],['D4',2],
    ['E4',1],['E4',1],['F4',1],['G4',1],['G4',1],['F4',1],['E4',1],['D4',1],
    ['C4',1],['C4',1],['D4',1],['E4',1],['D4',1.5],['C4',0.5],['C4',2],[null,1]
  ]},
  { id: 'silent', n: '平安夜', bpm: 60, wave: 'sine', notes: [
    ['G4',1.5],['A4',0.5],['G4',1],['E4',2],[null,1],
    ['G4',1.5],['A4',0.5],['G4',1],['E4',2],[null,1],
    ['D5',2],['D5',1],['B4',3],['C5',2],['C5',1],['G4',3],
    ['A4',2],['A4',1],['C5',1.5],['B4',0.5],['A4',1],
    ['G4',1.5],['A4',0.5],['G4',1],['E4',2],[null,2]
  ]},
  { id: 'morning', n: '晨光音樂盒', bpm: 96, wave: 'sine', notes: [
    ['C4',0.5],['E4',0.5],['G4',0.5],['C5',0.5],['G4',0.5],['E4',0.5],
    ['D4',0.5],['F4',0.5],['A4',0.5],['D5',0.5],['A4',0.5],['F4',0.5],
    ['E4',0.5],['G4',0.5],['B4',0.5],['E5',0.5],['B4',0.5],['G4',0.5],
    ['F4',0.5],['A4',0.5],['C5',0.5],['F5',0.5],['C5',0.5],['A4',0.5],
    ['G4',0.5],['B4',0.5],['D5',0.5],['G5',0.5],['D5',0.5],['B4',0.5],
    ['C4',0.5],['E4',0.5],['G4',0.5],['C5',0.5],['G4',0.5],['E4',0.5],[null,1]
  ]},
  { id: 'still', n: '安靜水邊', bpm: 56, wave: 'sine', notes: [
    ['C4',3],['G4',3],['A3',3],['E4',3],['F3',3],['C4',3],['G3',3],['D4',3],
    ['A3',3],['E4',3],['F3',3],['A3',3],['G3',3],['C4',3],[null,2]
  ]},
  { id: 'organ', n: '聖殿風琴', bpm: 54, wave: 'triangle', notes: [
    ['C4',4],['E4',4],['G4',4],['E4',4],
    ['F4',4],['A4',4],['G4',4],['C4',4],
    ['A3',4],['C4',4],['G3',4],['C4',4],[null,2]
  ]}
];
function tuneOf(id) { for (var i = 0; i < TUNES.length; i++) if (TUNES[i].id === id) return TUNES[i]; return TUNES[0]; }

/* 有聲卡片的狀態（與卡片文字狀態分開，換版型時不會被清掉） */
var va = {
  rec: null, stream: null, recording: false, sec: 0, timer: null,
  voice: null, voiceURL: '', voiceSec: 0,
  music: LS.get('gcMusic', 'none'), vol: LS.get('gcMusicVol', 0.35),
  musicSec: LS.get('gcMusicSec', 30),
  musicFile: null, musicName: '',
  mixBlob: null, mixURL: '', busy: false
};

function noteFreq(p) {
  if (!p) return 0;
  var m = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var st = String(p), i = 1, sh = 0;
  if (st.charAt(1) === '#') { sh = 1; i = 2; }
  var oct = parseInt(st.slice(i), 10);
  var n = m[st.charAt(0)] + sh + (oct + 1) * 12;
  return 440 * Math.pow(2, (n - 69) / 12);
}

/* 這首旋律完整走一遍要多久（秒） */
function tuneLen(tune) {
  var spb = 60 / tune.bpm, s = 0, i;
  for (i = 0; i < tune.notes.length; i++) s += tune.notes[i][1] * spb;
  return s;
}

/* 把旋律排進音訊時間軸；once 為真時只完整播一次，不重複 */
function scheduleTune(ac, dest, tune, dur, once) {
  var spb = 60 / tune.bpm, t = 0, guard = 0;
  while (t < dur && guard < 4000) {
    for (var i = 0; i < tune.notes.length && t < dur; i++) {
      var n = tune.notes[i], len = n[1] * spb;
      if (n[0]) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = tune.wave || 'triangle';
        o.frequency.value = noteFreq(n[0]);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.85, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.12, len * 0.95));
        o.connect(g); g.connect(dest);
        o.start(t); o.stop(t + len + 0.08);
      }
      t += len; guard++;
    }
    if (once) break;
  }
}

function blobBuf(b) {
  if (b.arrayBuffer) return b.arrayBuffer();
  return new Promise(function (res, rej) {
    var r = new FileReader();
    r.onload = function () { res(r.result); };
    r.onerror = function () { rej(new Error('read')); };
    r.readAsArrayBuffer(b);
  });
}
function decodeAudio(blob) {
  return blobBuf(blob).then(function (ab) {
    var AC = window.AudioContext || window.webkitAudioContext;
    var ac = new AC();
    return new Promise(function (res, rej) {
      ac.decodeAudioData(ab, function (buf) { res(buf); try { ac.close(); } catch (e) {} },
        function (e) { rej(e || new Error('decode')); });
    });
  });
}

/* 單聲道 16 位元 WAV，iPhone、Android、電腦都放得出來 */
function wavBlob(buf) {
  var ch = buf.getChannelData(0), rate = buf.sampleRate, len = ch.length;
  var ab = new ArrayBuffer(44 + len * 2), dv = new DataView(ab), o = 0;
  function str(x) { for (var i = 0; i < x.length; i++) dv.setUint8(o++, x.charCodeAt(i)); }
  function u32(x) { dv.setUint32(o, x, true); o += 4; }
  function u16(x) { dv.setUint16(o, x, true); o += 2; }
  str('RIFF'); u32(36 + len * 2); str('WAVE'); str('fmt '); u32(16); u16(1); u16(1);
  u32(rate); u32(rate * 2); u16(2); u16(16); str('data'); u32(len * 2);
  for (var i = 0; i < len; i++) {
    var v = Math.max(-1, Math.min(1, ch[i]));
    dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7FFF, true); o += 2;
  }
  return new Blob([ab], { type: 'audio/wav' });
}

function mmss(n) {
  n = Math.max(0, Math.round(n));
  return Math.floor(n / 60) + ':' + ('0' + (n % 60)).slice(-2);
}
function clearMix() {
  if (va.mixURL) { try { URL.revokeObjectURL(va.mixURL); } catch (e) {} }
  va.mixURL = ''; va.mixBlob = null;
}

/* ---------------- 錄音 ---------------- */
ACTS.gcRecStart = async function () {
  if (va.recording) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
    toast('這支裝置不支援錄音，可以改用手機的語音備忘錄'); return;
  }
  try {
    va.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) { toast('沒有取得麥克風權限，請到設定裡開啟'); return; }
  var types = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
  var mt = '';
  for (var i = 0; i < types.length; i++) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(types[i])) { mt = types[i]; break; }
  }
  var chunks = [];
  try { va.rec = mt ? new MediaRecorder(va.stream, { mimeType: mt }) : new MediaRecorder(va.stream); }
  catch (e) { toast('錄音啟動失敗，請稍後再試'); stopStream(); return; }
  va.rec.ondataavailable = function (ev) { if (ev.data && ev.data.size) chunks.push(ev.data); };
  va.rec.onstop = function () {
    var b = new Blob(chunks, { type: (va.rec && va.rec.mimeType) || 'audio/mp4' });
    if (va.voiceURL) { try { URL.revokeObjectURL(va.voiceURL); } catch (e) {} }
    va.voice = b; va.voiceURL = URL.createObjectURL(b); va.voiceSec = va.sec;
    va.recording = false; clearInterval(va.timer); va.timer = null;
    stopStream(); clearMix(); refreshSheet();
    toast('錄好了，可以先聽聽看');
  };
  va.sec = 0; va.recording = true; va.rec.start();
  refreshSheet();
  va.timer = setInterval(function () {
    va.sec++;
    var el = document.getElementById('gcRecT');
    if (!el) { ACTS.gcRecStop(); return; }   /* 使用者離開了工作室，立刻收工 */
    el.textContent = mmss(va.sec);
    if (va.sec >= 90) ACTS.gcRecStop();
  }, 1000);
};
function stopStream() {
  if (va.stream) { try { va.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} }
  va.stream = null;
}
ACTS.gcRecStop = function () {
  if (!va.recording || !va.rec) return;
  try { va.rec.stop(); } catch (e) { va.recording = false; stopStream(); refreshSheet(); }
};
ACTS.gcVoiceDel = function () {
  if (va.voiceURL) { try { URL.revokeObjectURL(va.voiceURL); } catch (e) {} }
  va.voice = null; va.voiceURL = ''; va.voiceSec = 0; clearMix(); refreshSheet();
};

/* ---------------- 配樂 ---------------- */
ACTS.gcMusic = function (d) {
  va.music = d.v; LS.set('gcMusic', d.v);
  if (d.v !== 'file') { va.musicFile = null; va.musicName = ''; }
  clearMix(); refreshSheet();
};
ACTS.gcMusicVol = function (d) { va.vol = +d.v; LS.set('gcMusicVol', va.vol); clearMix(); refreshSheet(); };
ACTS.gcMusicSec = function (d) { va.musicSec = +d.v; LS.set('gcMusicSec', va.musicSec); clearMix(); refreshSheet(); };
ACTS.gcMusicFile = function () {
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'audio/*';
  inp.onchange = function () {
    var f = inp.files && inp.files[0]; if (!f) return;
    va.musicFile = f; va.musicName = f.name || '自選音樂'; va.music = 'file';
    LS.set('gcMusic', 'file'); clearMix(); refreshSheet();
    toast('已選好配樂');
  };
  inp.click();
};
/* 試聽內建旋律（不必先混音） */
ACTS.gcMusicTry = function (d) {
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    var ac = new AC();
    var g = ac.createGain(); g.gain.value = 0.28; g.connect(ac.destination);
    scheduleTune(ac, g, tuneOf(d.v), 8);
    setTimeout(function () { try { ac.close(); } catch (e) {} }, 9000);
    toast('試聽八秒');
  } catch (e) { toast('這支裝置無法試聽'); }
};

/* ---------------- 混音：語音 ＋ 配樂 ---------------- */
ACTS.gcMix = async function () {
  if (va.busy) return;
  if (!va.voice && va.music === 'none') { toast('先錄一段語音，或選一首配樂'); return; }
  va.busy = true; toast('正在合成，請稍候…');
  try {
    var vb = va.voice ? await decodeAudio(va.voice) : null;
    var mb = va.musicFile ? await decodeAudio(va.musicFile) : null;
    var whole = (va.musicSec === 0);          /* 0 ＝ 全首 */
    var dur = vb ? vb.duration + 1.6 : 0;
    if (!dur) {                               /* 只有音樂：照選定的長度 */
      if (whole) dur = mb ? mb.duration : tuneLen(tuneOf(va.music)) + 1.2;
      else dur = mb ? Math.min(mb.duration, va.musicSec) : va.musicSec;
    }
    dur = Math.max(3, Math.min(dur, whole ? 600 : 180));
    var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    var off;
    /* 22050 單聲道足夠語音使用，檔案只有一半大；舊版 Safari 不接受就退回 44100 */
    try { off = new OAC(1, Math.ceil(dur * 22050), 22050); }
    catch (e1) { off = new OAC(1, Math.ceil(dur * 44100), 44100); }
    var master = off.createGain(); master.gain.value = 1; master.connect(off.destination);

    if (vb) {
      var vs = off.createBufferSource(); vs.buffer = vb;
      var vg = off.createGain(); vg.gain.value = 1;
      vs.connect(vg); vg.connect(master); vs.start(0.4);
    }
    var hasM = (va.music !== 'none');
    if (hasM) {
      var base = Math.max(0.05, va.vol * (vb ? 1 : 1.5));
      var mg = off.createGain();
      mg.gain.setValueAtTime(0.0001, 0);
      mg.gain.linearRampToValueAtTime(base, Math.min(1.5, dur * 0.2));
      mg.gain.setValueAtTime(base, Math.max(0.1, dur - 1.8));
      mg.gain.linearRampToValueAtTime(0.0001, dur - 0.05);
      mg.connect(master);
      if (va.musicFile && mb) {
        var ms = off.createBufferSource(); ms.buffer = mb; ms.loop = true;
        ms.connect(mg); ms.start(0);
      } else if (va.music !== 'file') {
        scheduleTune(off, mg, tuneOf(va.music), dur, whole && !vb);
      }
    }
    var out = await off.startRendering();
    clearMix();
    va.mixBlob = wavBlob(out);
    va.mixURL = URL.createObjectURL(va.mixBlob);
    va.busy = false; refreshSheet();
    toast('有聲卡片做好了');
  } catch (e) {
    va.busy = false; refreshSheet();
    toast('合成失敗了，換一首配樂或重錄一次試試');
  }
};
function audioName() { return va.voice ? '321有聲卡片.wav' : '321卡片背景音樂.wav'; }
ACTS.gcVoiceSave = function () {
  if (!va.mixURL) { toast('請先按下面的合成鈕'); return; }
  var a = document.createElement('a');
  a.href = va.mixURL; a.download = audioName();
  document.body.appendChild(a); a.click(); a.remove();
  toast('已儲存語音檔');
};
ACTS.gcShareAll = async function () {
  if (!va.mixURL) { toast('請先按「合成有聲卡片」'); return; }
  var c = merged();
  var files = [];
  try {
    if (gc.lastURL) files.push(new File([dataToBlob(gc.lastURL)], '321福音卡片.png', { type: 'image/png' }));
    files.push(new File([va.mixBlob], audioName(), { type: 'audio/wav' }));
    if (navigator.canShare && navigator.canShare({ files: files })) {
      await navigator.share({ files: files, title: '321福音同行', text: c.b });
      return;
    }
    if (navigator.canShare && navigator.canShare({ files: [files[files.length - 1]] })) {
      await navigator.share({ files: [files[files.length - 1]], title: audioName().replace('.wav', '') });
      toast('語音已分享，圖片請再分享一次');
      return;
    }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  ACTS.gcVoiceSave();
  toast('已下載語音檔，圖片請用上面的「分享」');
};

/* 切到背景或關掉頁面時，一律停止錄音並釋放麥克風 */
document.addEventListener('visibilitychange', function () {
  if (document.hidden && va.recording) ACTS.gcRecStop();
});
window.addEventListener('pagehide', function () {
  if (va.recording) ACTS.gcRecStop(); else stopStream();
});

/* ---------------- 自拍 ---------------- */
ACTS.gcSelfie = function () {
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.setAttribute('capture', 'user');
  inp.onchange = function () {
    var f = inp.files && inp.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      var im = new Image();
      im.onload = function () {
        grab(); gc.photo = im; gc.photoMode = 'sticker'; refreshSheet();
        toast('自拍好了，已貼在卡片上');
      };
      im.onerror = function () { toast('這張相片讀不進來，再拍一次試試'); };
      im.src = rd.result;
    };
    rd.readAsDataURL(f);
  };
  inp.click();
};

/* ---------------- 有聲卡片的版面 ---------------- */
function voiceCardHTML() {
  var h = '<div class="card"><div class="eyebrow">有聲卡片</div>'
    + '<h3 class="sub">加上你的聲音</h3>'
    + '<p class="muted">一段一分鐘的問候，比一百句文字更近。'
    + '長輩看不清楚字，卻聽得出是誰在說話。</p>';

  /* 錄音 */
  h += '<div class="eyebrow" style="margin-top:14px">錄一段語音</div>';
  if (va.recording) {
    h += '<p style="font-size:calc(22px * var(--fs));font-weight:700;color:var(--orange-t)">'
      + '● 錄音中　<span id="gcRecT">' + mmss(va.sec) + '</span></p>'
      + '<button class="btn gold" data-act="gcRecStop" style="width:100%">停止錄音</button>'
      + '<p class="tiny" style="margin-top:8px">最長九十秒，時間到會自動停止。</p>';
  } else if (va.voice) {
    h += '<p class="muted">已錄好　' + mmss(va.voiceSec) + '</p>'
      + '<audio controls preload="metadata" src="' + va.voiceURL + '" style="width:100%;margin:8px 0"></audio>'
      + '<div class="btn-row">'
      + '<button class="btn quiet sm" data-act="gcRecStart">重錄一次</button>'
      + '<button class="btn quiet sm" data-act="gcVoiceDel">刪除語音</button>'
      + '</div>';
  } else {
    h += '<button class="btn" data-act="gcRecStart" style="width:100%">🎙 開始錄音</button>'
      + '<p class="tiny" style="margin-top:8px">第一次會問麥克風權限，請按允許。'
      + '可以說：他的名字、一句祝福、一節經文，最後為他禱告一句。<br>'
      + '<b>不想錄音也沒關係</b>——下面選一首音樂，就能做成只有背景音樂的卡片。</p>';
  }

  /* 配樂 */
  h += '<div class="eyebrow" style="margin-top:16px">背景音樂</div>'
    + '<div class="seg">'
    + '<button data-act="gcMusic" data-v="none" aria-pressed="' + (va.music === 'none') + '">不加音樂</button>'
    + TUNES.map(function (t) {
        return '<button data-act="gcMusic" data-v="' + t.id + '" aria-pressed="' + (va.music === t.id) + '">' + esc(t.n) + '</button>';
      }).join('')
    + '<button data-act="gcMusicFile" aria-pressed="' + (va.music === 'file') + '">自選音樂…</button>'
    + '</div>';
  if (va.music === 'file' && va.musicName) {
    h += '<p class="tiny" style="margin-top:8px">已選：' + esc(va.musicName) + '</p>';
  } else if (va.music !== 'none') {
    h += '<div class="btn-row" style="margin-top:10px">'
      + '<button class="btn quiet sm" data-act="gcMusicTry" data-v="' + esc(va.music) + '">🔈 試聽八秒</button>'
      + '</div>';
  }
  if (va.music !== 'none') {
    h += '<div class="eyebrow" style="margin-top:14px">音樂音量</div><div class="seg">'
      + [['0.18', '很小'], ['0.35', '適中'], ['0.55', '明顯']].map(function (v) {
          return '<button data-act="gcMusicVol" data-v="' + v[0] + '" aria-pressed="'
            + (String(va.vol) === v[0]) + '">' + v[1] + '</button>';
        }).join('')
      + '</div>'
      + '<p class="tiny" style="margin-top:8px">內建旋律都是公共領域的古老曲調，只有音樂沒有歌詞，可以放心傳送。</p>';
    if (!va.voice) {
      h += '<div class="eyebrow" style="margin-top:14px">音樂長度<span class="hint" style="font-weight:400">（沒有錄音時）</span></div>'
        + '<div class="seg">'
        + [['20', '20 秒'], ['30', '30 秒'], ['60', '1 分鐘'], ['90', '1 分半'], ['0', '🎼 全首']].map(function (v) {
            return '<button data-act="gcMusicSec" data-v="' + v[0] + '" aria-pressed="'
              + (String(va.musicSec) === v[0]) + '">' + v[1] + '</button>';
          }).join('')
        + '</div>'
        + '<p class="tiny" style="margin-top:8px">'
        + (va.musicSec === 0
            ? (va.music === 'file'
                ? '全首：整首自選的音樂完整播完（最長十分鐘）。歌曲較長時，合成要多等一下，檔案也會比較大。'
                : '全首：「' + esc(tuneOf(va.music).n) + '」完整彈完一遍，約 '
                  + Math.round(tuneLen(tuneOf(va.music))) + ' 秒，不重複。')
            : '選「全首」就會完整播完一遍，不切掉尾巴。')
        + '</p>';
    }
  }

  /* 合成與分享 */
  var onlyMusic = (!va.voice && va.music !== 'none');
  h += '<div class="eyebrow" style="margin-top:16px">合成與傳送</div>'
    + '<button class="btn gold" data-act="gcMix" style="width:100%">'
    + (va.busy ? '合成中…' : (onlyMusic ? '🎵 只做背景音樂' : '🎧 合成有聲卡片')) + '</button>'
    + (onlyMusic ? '<p class="tiny" style="margin-top:8px">這張卡片只有音樂，沒有你的聲音。'
        + '想加一句話，隨時可以回上面錄一段。</p>' : '');
  if (va.mixURL) {
    h += '<audio controls preload="metadata" src="' + va.mixURL + '" style="width:100%;margin:10px 0"></audio>'
      + '<div class="btn-row">'
      + '<button class="btn" data-act="gcShareAll">' + (va.voice ? '分享圖片與語音' : '分享圖片與音樂') + '</button>'
      + '<button class="btn quiet" data-act="gcVoiceSave">' + (va.voice ? '儲存語音檔' : '儲存音樂檔') + '</button>'
      + '</div>';
  }
  h += '<p class="tiny" style="margin-top:12px">LINE 會分成兩則：先傳卡片圖，再傳聲音。'
    + '先傳圖片，他看見了；再傳聲音，他被記得了。</p>'
    + '</div>';
  return h;
}

/* ---------------- 工作室 ---------------- */
SHEETS.cardStudio = async function () {
  var c = merged();
  var sw = function (k) { var T = TPL[k]; return 'linear-gradient(135deg,' + T.bg[0] + ',' + T.bg[2] + ')'; };
  setTimeout(renderPreview, 0);
  return '<div id="gcBox" style="margin-bottom:14px"><p class="muted">產生中…</p></div>'

    + '<div class="card tight"><p class="tiny" style="margin:0">'
    + 'iPhone 請長按上面的圖片，選「加入照片」或「拷貝」，就能傳到 LINE。</p></div>'

    + '<div class="btn-row" style="margin-bottom:14px">'
    + '<button class="btn" data-act="gcSave">儲存圖片</button>'
    + '<button class="btn gold" data-act="gcShare">分享</button>'
    + '</div>'

    + '<div class="card"><div class="eyebrow">編輯文字</div>'
    + '<p class="tiny" style="margin:0 0 14px">改哪裡，上面的卡片就跟著變，不必按任何鈕。</p>'
    + '<div class="field"><label>稱呼<span class="hint">（內文裡對方的名字，改了內文會一起換）</span></label>'
    + '<input type="text" id="gcN" value="' + esc(nameOf()) + '" placeholder="朋友"></div>'
    + '<div class="field"><label>問候內文</label><textarea id="gcW" style="min-height:120px">' + esc(c.w) + '</textarea></div>'
    + '<div class="field"><label>經文</label><textarea id="gcV" style="min-height:90px">' + esc(c.v) + '</textarea></div>'
    + '<div class="field"><label>出處</label><input type="text" id="gcR" value="' + esc(c.r) + '"></div>'
    + '<div class="field"><label>祝福語<span class="hint">（卡片下方那一句）</span></label>'
    + '<input type="text" id="gcB" value="' + esc(c.b) + '"></div>'
    + '<div class="field"><label>團體名稱<span class="hint">（卡片頂端，例如教會或團契的名字）</span></label>'
    + '<input type="text" id="gcG" value="' + esc(gc.group) + '" placeholder="不填就不顯示"></div>'
    + '<div class="field" style="margin-bottom:0"><label>署名<span class="hint">（卡片底部，會自動加「敬上」）</span></label>'
    + '<input type="text" id="gcS" value="' + esc(gc.signer) + '" placeholder="不填就不顯示"></div>'
    + '<button class="btn quiet" data-act="gcApply" style="margin-top:14px">套用文字</button>'
    + '<p class="tiny" style="margin-top:10px">團體名稱與署名會記住，下一張卡片自動帶入。</p>'
    + '</div>'

    + '<div class="card"><div class="eyebrow">版型</div><div class="seg">'
    + TPL_ORDER.map(function (k) {
        return '<button data-act="gcTpl" data-v="' + k + '" aria-pressed="' + (gc.tpl === k) + '">'
          + '<span style="display:inline-block;width:16px;height:16px;border-radius:4px;margin-right:6px;'
          + 'vertical-align:-2px;border:1px solid rgba(0,0,0,.15);background:' + sw(k) + '"></span>'
          + esc(TPL[k].n) + '</button>';
      }).join('')
    + '</div>'
    + '<div class="eyebrow" style="margin-top:14px">邊框</div><div class="seg">'
    + BORDERS.map(function (b) {
        return '<button data-act="gcBorder" data-v="' + b.id + '" aria-pressed="' + (gc.border === b.id) + '">' + esc(b.n) + '</button>';
      }).join('')
    + '</div>'
    + '<div class="eyebrow" style="margin-top:14px">比例</div><div class="seg">'
    + RATIOS.map(function (r) {
        return '<button data-act="gcRatio" data-v="' + r.id + '" aria-pressed="' + (gc.ratio === r.id) + '">' + esc(r.n) + '</button>';
      }).join('')
    + '</div>'
    + '<div class="eyebrow" style="margin-top:14px">字級</div><div class="seg">'
    + [['0.9', '小'], ['1', '中'], ['1.15', '大'], ['1.3', '特大']].map(function (f) {
        return '<button data-act="gcFs" data-v="' + f[0] + '" aria-pressed="' + (String(gc.fs) === f[0]) + '">' + f[1] + '</button>';
      }).join('')
    + '</div></div>'

    + '<div class="card"><div class="eyebrow">相片</div>'
    + '<p class="muted">可以把相片當卡片背景，或像貼紙貼在卡片上。<br>自拍一張貼上去，他一眼就知道是你。</p>'
    + '<div class="btn-row" style="margin-top:10px">'
    + '<button class="btn quiet sm" data-act="gcPhoto">' + (gc.photo ? '換一張相片' : '選一張相片') + '</button>'
    + '<button class="btn quiet sm" data-act="gcSelfie">📷 自拍一張</button>'
    + (gc.photo ? '<button class="btn quiet sm" data-act="gcPhotoDel">移除相片</button>' : '')
    + '</div>'
    + (gc.photo ? '<div class="seg" style="margin-top:12px">'
        + '<button data-act="gcPhotoMode" data-v="bg" aria-pressed="' + (gc.photoMode === 'bg') + '">作背景</button>'
        + '<button data-act="gcPhotoMode" data-v="sticker" aria-pressed="' + (gc.photoMode === 'sticker') + '">貼在卡片上</button>'
        + '</div>'
        + (gc.photoMode === 'sticker'
            ? '<div class="eyebrow" style="margin-top:14px">貼紙位置</div><div class="seg">'
              + STK_POS.map(function (p) {
                  return '<button data-act="gcStkPos" data-v="' + p.id + '" aria-pressed="' + (gc.stkPos === p.id) + '">' + p.n + '</button>';
                }).join('')
              + '</div><div class="eyebrow" style="margin-top:14px">貼紙大小</div><div class="seg">'
              + [['0.22', '小'], ['0.3', '中'], ['0.38', '大']].map(function (s2) {
                  return '<button data-act="gcStkSize" data-v="' + s2[0] + '" aria-pressed="' + (String(gc.stkSize) === s2[0]) + '">' + s2[1] + '</button>';
                }).join('') + '</div>'
            : '')
        : '')
    + '</div>'

    + voiceCardHTML()

    + '<div class="card">'
    + '<button class="btn quiet" data-act="gcCopyCur">複製這張卡片的文字</button>'
    + (gc.pid ? '<button class="btn green" data-act="gcLog" style="margin-top:10px">記為一次關心</button>' : '')
    + '<p class="tiny" style="margin-top:12px">卡片是橋，不是終點。願我們寄出去的，最後都變成走過去的。</p>'
    + '</div>';
};

/* ---------------- 工作室的操作 ---------------- */
function reDraw() { renderPreview(); }

/* 邊打字邊更新預覽：長輩不必再找「套用」在哪裡 */
var _liveT = null;
var LIVE_IDS = ['gcN', 'gcW', 'gcV', 'gcR', 'gcB', 'gcG', 'gcS'];
document.addEventListener('input', function (ev) {
  var el = ev.target;
  if (!el || !el.id || LIVE_IDS.indexOf(el.id) < 0) return;
  if (el.id === 'gcN') {
    /* 換稱呼時，把內文裡的舊名字一起換掉 */
    var before = nameOf();
    gc.callName = el.value;
    var after = nameOf();
    var wEl = document.getElementById('gcW');
    if (wEl && before && before !== after && wEl.value.indexOf(before) >= 0) {
      wEl.value = wEl.value.split(before).join(after);
    }
  }
  clearTimeout(_liveT);
  _liveT = setTimeout(function () { grab(); reDraw(); }, 320);
});
/* 換版型、換比例之前，先把使用者已經改過的文字留住，免得白打一遍 */
function grab() {
  if (!document.getElementById('gcV')) return;
  gc.callName = (($('#gcN') || {}).value || '').trim();
  gc.group = (($('#gcG') || {}).value || '').trim(); LS.set('gcGroup', gc.group);
  gc.signer = (($('#gcS') || {}).value || '').trim(); LS.set('gcSigner', gc.signer);
  gc.custom = {
    v: (($('#gcV') || {}).value || '').trim(), r: (($('#gcR') || {}).value || '').trim(),
    w: (($('#gcW') || {}).value || '').trim(), b: (($('#gcB') || {}).value || '').trim()
  };
}
ACTS.gcTpl = function (d) { grab(); gc.tpl = d.v; LS.set('gcTpl', d.v); refreshSheet(); };
ACTS.gcBorder = function (d) { grab(); gc.border = d.v; LS.set('gcBorder', d.v); refreshSheet(); };
ACTS.gcRatio = function (d) { grab(); gc.ratio = d.v; LS.set('gcRatio', d.v); refreshSheet(); };
ACTS.gcFs = function (d) { grab(); gc.fs = +d.v; LS.set('gcFs', +d.v); refreshSheet(); };
ACTS.gcPhotoMode = function (d) { grab(); gc.photoMode = d.v; refreshSheet(); };
ACTS.gcStkPos = function (d) { grab(); gc.stkPos = d.v; refreshSheet(); };
ACTS.gcStkSize = function (d) { grab(); gc.stkSize = +d.v; refreshSheet(); };
ACTS.gcPhotoDel = function () { grab(); gc.photo = null; refreshSheet(); };
ACTS.gcPhoto = function () {
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = function () {
    var f = inp.files && inp.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      var im = new Image();
      im.onload = function () { grab(); gc.photo = im; refreshSheet(); };
      im.onerror = function () { toast('這張相片讀不進來，換一張試試'); };
      im.src = rd.result;
    };
    rd.readAsDataURL(f);
  };
  inp.click();
};
ACTS.gcApply = function () {
  var v = ($('#gcV') || {}).value, r = ($('#gcR') || {}).value,
      w = ($('#gcW') || {}).value, b = ($('#gcB') || {}).value;
  gc.callName = (($('#gcN') || {}).value || '').trim();
  gc.group = (($('#gcG') || {}).value || '').trim(); LS.set('gcGroup', gc.group);
  gc.signer = (($('#gcS') || {}).value || '').trim(); LS.set('gcSigner', gc.signer);
  gc.custom = { v: (v || '').trim(), r: (r || '').trim(), w: (w || '').trim(), b: (b || '').trim() };
  reDraw(); toast('已套用');
};

function dataToBlob(u) {
  var b = atob(u.split(',')[1]), a = new Uint8Array(b.length);
  for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
  return new Blob([a], { type: 'image/png' });
}
function fileName() {
  var c = merged();
  return '321福音卡片_' + String(c.r || '').replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '') + '.png';
}
ACTS.gcSave = function () {
  if (!gc.lastURL) { toast('圖片還沒產生好，請稍等一下'); return; }
  var a = document.createElement('a');
  a.href = gc.lastURL; a.download = fileName();
  document.body.appendChild(a); a.click(); a.remove();
  toast('已儲存。iPhone 請長按圖片選「加入照片」');
};
ACTS.gcShare = async function () {
  if (!gc.lastURL) { toast('圖片還沒產生好，請稍等一下'); return; }
  var c = merged();
  try {
    var f = new File([dataToBlob(gc.lastURL)], '321福音卡片.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      await navigator.share({ files: [f], title: '321福音同行' });
      return;
    }
    if (navigator.share) {
      await navigator.share({ text: c.w + '\n「' + c.v + '」（' + c.r + '）' });
      return;
    }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  ACTS.gcSave(); toast('已下載，請從相簿分享到 LINE');
};
ACTS.gcCopyCur = function () {
  var c = merged();
  copyText(c.w + '\n\n「' + c.v + '」（' + c.r + '　和合本）\n\n' + c.b + (gc.signer ? '\n' + gc.signer + '　敬上' : ''));
};
ACTS.gcLog = async function () {
  if (!gc.pid) return;
  try {
    await DB.put('interactions', {
      id: uid(), personId: gc.pid, date: todayISO(), type: '訊息',
      mood: '', note: '傳了一張福音卡片：' + merged().b, createdAt: new Date().toISOString()
    });
    var p = await DB.get('persons', gc.pid);
    if (p) { p.lastContactAt = todayISO(); p.updatedAt = new Date().toISOString(); await DB.put('persons', p); }
    toast('已記為今日的一次關心');
    render();
  } catch (e) { toast('記錄失敗，請稍後再試'); }
};

/* ---------------- 請小智寫一張 ---------------- */
ACTS.gcAiWrite = async function () {
  if (gc.aiBusy) return;
  var el = $('#gcAi');
  var desc = (el && el.value || '').trim();
  if (!desc) { toast('請先簡單說明他的情況'); if (el) el.focus(); return; }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) { toast('目前沒有網路，小智暫時寫不了'); return; }
  gc.aiBusy = true; toast('小智正在寫…');
  var sys = [
    ((window.I18N&&window.I18N.lang)==='en'?'You are Xiaozhi, writing a short gospel care card for a user of the 321 Gospel Companion app to send to a seeker or friend. Write entirely in English.':(window.I18N&&window.I18N.lang)==='sc'?'你是「小智」，正在为「321福音同行」的使用者写一张要传给慕道友或朋友的福音关怀卡片。请全程用简体中文。':'你是「小智」，正在為「321福音同行」的使用者寫一張要傳給慕道友或朋友的福音關懷卡片。'),
    '請依他描述的情況，選一節最合適的《和合本》經文，並寫一段溫暖、口語、不說教、不催逼的問候。',
    '嚴格要求：只使用你完全確定的《和合本》經文與出處，絕不杜撰。出處寫成可朗讀的形式，例如「詩篇二十三篇4節」。',
    '問候內文用第二人稱，開頭用 {稱呼} 這個代號代表收件人的名字（系統會自動代換），全長兩到三句、不超過六十字。',
    '祝福語是一句六到十字的短句，例如「願主醫治你」。',
    '只輸出 JSON，不要任何其他文字、不要程式碼框：{"v":"經文內容","r":"出處","w":"問候內文","b":"祝福語"}'
  ].join('\n');
  try {
    var res = await fetch(XZ_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: XZ_MODEL, max_tokens: 600, system: sys,
        messages: [{ role: 'user', content: '收卡片的人：' + desc }]
      })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    var t = (data.content || []).filter(function (b) { return b.type === 'text'; })
      .map(function (b) { return b.text; }).join('\n').trim().replace(/```json|```/g, '').trim();
    var j = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
    if (!j.v || !j.r) throw new Error('格式不符');
    gc.custom = { v: String(j.v), r: String(j.r), w: String(j.w || '{稱呼}，我今天為你禱告了。'), b: String(j.b || '願主與你同在') };
    gc.aiBusy = false;
    push('cardStudio', {}, '小智寫的卡片');
    toast('小智寫好了，經文請再確認一次');
  } catch (e) {
    gc.aiBusy = false;
    toast('小智暫時連不上線，請稍後再試');
  }
};

/* ---------------- 共用：複製 ---------------- */
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

/* ---------------- 工具頁的入口改名 ---------------- */
var _tools2 = VIEWS.tools;
VIEWS.tools = async function () {
  var h = await _tools2.apply(this, arguments);
  return h.replace('<span class="t">金句圖卡</span><span class="s">依處境挑一句，做成圖傳給他</span>',
    '<span class="t">福音卡片</span><span class="s">十三個場景、九種版型，做成圖傳給他</span>');
};

})();