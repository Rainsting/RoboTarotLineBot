var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var app = express();

var jsonParser = bodyParser.json();

var options = {
	host: 'api.line.me',
	port: 443,
	path: '/v2/bot/message/reply',
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer [LineAuthorization]'

	}
}
app.set('port', (process.env.PORT || 5000));

// views is directory for all template files

app.get('/', function(req, res) {
	//  res.send(parseInput(req.query.input));
	res.send('Hello');
});

app.post('/', jsonParser, function(req, res) {
	let event = req.body.events[0];
	let type = event.type;
	let msgType = event.message.type;
	let msg = event.message.text;
	let rplyToken = event.replyToken;

	let rplyVal = null;
	console.log(msg);
	if (type == 'message' && msgType == 'text') {
		try {
			rplyVal = parseInput(rplyToken, msg);
		} catch (e) {
			// rplyVal = randomYabasoReply();
			console.log('總之先隨便擺個跑到這邊的訊息，catch error');
		}
	}

	if (rplyVal) {
		replyMsgToLine(rplyToken, rplyVal);
		console.log('回應訊息: ' + rplyVal);
	} else {
		console.log('Do not trigger');
	}

	res.send('ok');
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});

function replyMsgToLine(rplyToken, rplyVal) {
	let rplyObj = {
		replyToken: rplyToken,
		messages: [{
			type: "text",
			text: rplyVal
		}]
	}

	let rplyJson = JSON.stringify(rplyObj);

	var request = https.request(options, function(response) {
		console.log('Status: ' + response.statusCode);
		console.log('Headers: ' + JSON.stringify(response.headers));
		response.setEncoding('utf8');
		response.on('data', function(body) {
			console.log(body);
		});
	});
	request.on('error', function(e) {
		console.log('Request error: ' + e.message);
	})
	request.end(rplyJson);
}

function parseInput(rplyToken, inputStr) {
	console.log('InputStr: ' + inputStr);
	let msgSplitor = ' ';

	let mainMsg = inputStr.split(msgSplitor); //定義輸入字串，以空格切開
	let trigger = mainMsg[0]; //指定啟動詞在第一個詞

	_isNaN = function(obj) {
		return isNaN(parseInt(obj));
	}

	////////////////////////////////////////
	//////////////// 啟動關鍵字
	////////////////////////////////////////	
	// 關鍵字指令開始於此
	if (inputStr.match('遠坂凜') != null || inputStr.match('凜') != null) {
		if (inputStr.match('說明') != null)
			return displayUsage(1);
		else
			return randomDuelReply(inputStr);
	} 
	else
	if (inputStr.match('鴨霸獸') != null || inputStr.match('甲鳥巴') != null)
		return randomYabasoReply(inputStr);
	else
	if (inputStr.match('車干哥') != null)
		return randomBirdReply(inputStr);
	// if (inputStr.match('軒哥') != null && mainMsg[1] == '決鬥') return randomDuelReply(inputStr);


	////////////////////////////////////////
	//////////////// 占卜關鍵字
	////////////////////////////////////////	
	// 丟杯 cup 指令開始於此
	else
	// if (inputStr.match('cup') != null) {
	if (inputStr.toLowerCase().match(/^cup/) || inputStr.match('杯杯')) {
		let cuptext = null;
		if (mainMsg[1] != undefined) {
			if (mainMsg[1] == '說明') return displayUsage(4);
			cuptext = mainMsg[1];
		}
		return NormalDrawCup(inputStr, cuptext);
	}

	// tarot 指令
	else
	// if (trigger == 'tarot' || trigger == 'Tarot') {
	if (trigger.toLowerCase().match(/^tarot/)) {

		if (inputStr.split(msgSplitor).length == 1) return displayUsage(3);

		// if (inputStr.split(msgSplitor).length == 2 || inputStr.split(msgSplitor).length == 3) {
		if (inputStr.split(msgSplitor).length >= 2) {
			if (mainMsg[1] == '說明')
				return displayUsage(3);

			if (mainMsg[1] == '每日' || mainMsg[1] == 'daily')
				return NomalDrawTarot(mainMsg[1], mainMsg[2]);

			if (mainMsg[1] == '時間' || mainMsg[1] == 'time')
				return MultiDrawTarot(mainMsg[1], mainMsg[2], 1);

			if (mainMsg[1] == '大十字' || mainMsg[1] == 'cross')
				return MultiDrawTarot(mainMsg[1], mainMsg[2], 2);

			// if (mainMsg[1] == '法典' || mainMsg[1] == '章典')
			// 	return '你們打算懷著惡意傷害我的姊妹們，\
			// 			\n因此我遵守我們名譽的章典， \
			// 			\n給與你們殺死我的機會， \
			// 			\n在此向你們申請決鬥！';

			// if (mainMsg[1] == '抽牌' || mainMsg[1] == '決鬥' || mainMsg[1] == 'duel')
			// 	return randomDuelReply(inputStr);

			return MultiDrawTarot(mainMsg[1], mainMsg[2], 3); //預設抽 79 張
		}

	} 
	////////////////////////////////////////
	//////////////// 其他關鍵字
	////////////////////////////////////////	
	else
	if (trigger == '猜拳') {
		if (inputStr.split(msgSplitor).length == 1) return displayUsage(6);

		if (inputStr.split(msgSplitor).length >= 2) {
			if (mainMsg[1] == '說明')
				return displayUsage(6);

			return RockPaperScissors(mainMsg[1], mainMsg[2]);
		}
	} 
	////////////////////////////////////////
	//////////////// 擲骰關鍵字
	////////////////////////////////////////
	// 擲骰指令 // Thanks for zeteticl & yuuko a lot!
	else
	if (inputStr.toLowerCase().match(/^cc/) != null)
		return CoC7th(inputStr.toLowerCase());
	else
	// 這裡的正規表達式，會把非英文判斷檔掉，所以要放這邊，前面的關鍵字才不會出問題 
	if (inputStr.match(/\w/) != null && inputStr.toLowerCase().match(/d/) != null)
		return nomalDiceRoller(inputStr);

	// nc指令開始於此 // - Fine tune and patch from "zeteticl", thanks a lot
	else
	if (trigger.match(/^([1-4]+)(NC|nc)/) != null || trigger.match(/^([1-4]+)(NA|na)/) != null) {
		let nctext = null;
		if (mainMsg[1] != undefined) {
			if (mainMsg[1] == '說明') return displayUsage(5);
			nctext = mainMsg[1];
		}
		return nechronica_dice(trigger, nctext);
	}
	
	// 判定 NC 依戀，指令使用此網頁的說明：http://ao-works.net/blog/dice-regret-table-both
	else
	if (inputStr.toLowerCase().match(/(nm)/) != null)	{
		let nctext = null;
		if (mainMsg[1] != undefined) {
			if (mainMsg[1] == '說明') return displayUsage(5);
			nctext = mainMsg[1];
		}
		return nechronica_mirenn(trigger, nctext);
	}
	else
		return undefined;
	// if (trigger != 'roll') return null;

}

////////////////////////////////////////
//////////////// nechronica (NC)
////////////////////////////////////////
function nechronica_dice(triggermsg, text) {
	let returnStr = '';
	var ncarray = [];
	var dicemax = 0,
		dicemin = 0,
		dicenew = 0;

	/* 首先判斷是否是誤啟動（檢查是否有符合骰子格式）*/
	if (triggermsg.match(/^(\d+)(NC|NA)((\+|-)(\d+)|)$/i) == null) return undefined;

	/* 判斷式 */
	var match = /^(\d+)(NC|NA)((\+|-)(\d+)|)$/i.exec(triggermsg);

	/* 其實我不太會用 for each */
	for (var i = 0; i < Number(match[1]); i++) 
	{
		dicenew = Dice(10) + Number(match[3]);
		ncarray.push(dicenew);
	}

	/* 判斷最大最小值 */
	dicemax = Math.max(...ncarray);
	dicemin = Math.min(...ncarray);

	/* 產生格式 */
	if (Number(match[1]) == 1)
		returnStr += dicemax + '[' + ncarray.pop() + ']';
	else {
		returnStr += dicemax + '[';
		for (i = 0; i < Number(match[1]); i++) {
			if (i != Number(match[1]) - 1)
				returnStr += ncarray.pop() + ',';
			else
				returnStr += ncarray.pop();
		}
		returnStr += ']';
	}

	/* 判斷成功 */
	if (dicemax > 5)
		if (dicemax > 10)
			returnStr += ' → 大成功';
		else
			returnStr += ' → 成功';
	else
	if (dicemin <= 1)
		returnStr += ' → 大失敗';
	else
		returnStr += ' → 失敗';

	/* 後綴文字 */
	if (text != null)
		returnStr += ' ; ' + text;

	return returnStr;
}

function nechronica_mirenn(triggermsg, text) {
	let returnStr = '';

	//首先判斷是否是誤啟動（檢查是否有符合骰子格式）
	if (triggermsg.match(/^(NM)$/i) == null) return undefined;

	//加上文字
	if (text != null)
		returnStr = text + ': \n' + nechronica_mirenn_table(1);
	else
		returnStr = nechronica_mirenn_table(1);

	return returnStr;
}

/* 這邊預留 mode 以便未來可以加入其他依戀 */
function nechronica_mirenn_table(mode) {
	let rplyArr = [
		'【01嫌惡】[發狂：敵對認識] 戰鬥中，沒有命中敵方的攻擊，全部都會擊中嫌惡的對象。(如果有在射程內的話)',
		'【02獨占】[發狂：獨占衝動] 戰鬥開始與戰鬥結束，各別選擇損傷1個對象的部件。',
		'【03依存】[發狂：幼兒退行] 妳的最大行動值減少2。',
		'【04執著】[發狂：跟蹤監視] 戰鬥開始與戰鬥結束時，對象對妳的依戀精神壓力點數各增加1點。(如果已經處在精神崩壞狀態，可以不用作此處理)',
		'【05戀心】[發狂：自傷行為] 戰鬥開始與戰鬥結束時，各別選擇損傷1個自己的部件。',
		'【06對抗】[發狂：過度競爭] 戰鬥開始與戰鬥結束時，各別選擇任意依戀，增加1點精神壓力點數。(如果已經處在精神崩壞狀態，可以不用作此處理)',
		'【07友情】[發狂：共鳴依存] 單元結束時，對象的損傷部件比妳還要多的時候，妳的部件損傷數，要增加到與對方相同。',
		'【08保護】[發狂：過度保護] 戰鬥當中，妳跟「依戀的對象」處於不同區域的時候，無法宣告「移動以外的戰鬥宣言」，此外妳沒有辦法把「自身」與「依戀對象」以外的單位當成移動對象。',
		'【09憧憬】[發狂：贗作妄想] 戰鬥當中，妳跟「依戀的對象」處於同樣區域的時候，無法宣告「移動以外的戰鬥宣言」，此外妳沒有辦法把「自身」與「依戀對象」以外的單位當成移動對象。',
		'【10信賴】[發狂：疑心暗鬼] 除了妳以外的所有姊妹，最大行動值減少1。',
	];
	return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}

////////////////////////////////////////
//////////////// COC
////////////////////////////////////////
function nomalDiceRoller(inputStr) {

	//首先判斷是否是誤啟動（檢查是否有符合骰子格式）
	if (inputStr.toLowerCase().match(/\d+d\d+/) == null) return undefined;

	//再來先把第一個分段拆出來，待會判斷是否是複數擲骰
	let mutiOrNot = inputStr.toLowerCase().match(/\S+/);

	//排除小數點
	if (mutiOrNot.toString().match(/\./) != null) return undefined;

	if (mutiOrNot.toString().match(/\D/) == null) {
		let finalStr = '複數擲骰：'
		if (mutiOrNot > 20) return '不支援20次以上的複數擲骰。';

		for (i = 1; i <= mutiOrNot; i++) {
			let DiceToRoll = inputStr.toLowerCase().split(' ', 2)[1];
			if (DiceToRoll.match('d') == null) return undefined;
			finalStr = finalStr + '\n' + i + '# ' + DiceCal(DiceToRoll);
		}
		if (finalStr.match('200D') != null) return '不支援200D以上擲骰';
		if (finalStr.match('D500') != null) return '不支援D1和超過D500的擲骰';
		return finalStr;
	} else return '基本擲骰：' + DiceCal(mutiOrNot.toString());
}


//作計算的函數
function DiceCal(inputStr) {

	//首先判斷是否是誤啟動（檢查是否有符合骰子格式）
	if (inputStr.toLowerCase().match(/\d+d\d+/) == null) return undefined;

	//排除小數點
	if (inputStr.toString().match(/\./) != null) return undefined;

	//先定義要輸出的Str
	let finalStr = '';

	//一般單次擲骰
	let DiceToRoll = inputStr.toString().toLowerCase();
	if (DiceToRoll.match('d') == null) return undefined;

	//寫出算式
	let equation = DiceToRoll;
	while (equation.match(/\d+d\d+/) != null) {
		let tempMatch = equation.match(/\d+d\d+/);
		if (tempMatch.toString().split('d')[0] > 200) return '不支援200D以上擲骰';
		if (tempMatch.toString().split('d')[1] == 1 || tempMatch.toString().split('d')[1] > 500) return '不支援D1和超過D500的擲骰';
		equation = equation.replace(/\d+d\d+/, RollDice(tempMatch));
	}

	//計算算式
	let answer = eval(equation.toString());
	finalStr = equation + ' = ' + answer;

	return finalStr;

}


//用來把d給展開成算式的函數
function RollDice(inputStr) {
	//先把inputStr變成字串（不知道為什麼非這樣不可）
	let comStr = inputStr.toString().toLowerCase();
	let finalStr = '(';

	for (let i = 1; i <= comStr.split('d')[0]; i++) {
		finalStr = finalStr + Dice(comStr.split('d')[1]) + '+';
	}

	finalStr = finalStr.substring(0, finalStr.length - 1) + ')';
	return finalStr;
}


function CoC7th(inputStr) {

	if (inputStr.toLowerCase().match('說明') != null)
		return displayUsage(2);

	//先判斷是不是要創角
	//這是悠子房規創角
	if (inputStr.toLowerCase().match('悠子創角') != null) {
		let finalStr = '骰七次3D6取五次，\n決定STR、CON、DEX、APP、POW。\n';

		for (i = 1; i <= 7; i++) {
			finalStr = finalStr + '\n' + i + '# ' + DiceCal('3d6*5');
		}

		finalStr = finalStr + '\n==';
		finalStr = finalStr + '\n骰四次2D6+6取三次，\n決定SIZ、INT、EDU。\n';

		for (i = 1; i <= 4; i++) {
			finalStr = finalStr + '\n' + i + '# ' + DiceCal('(2d6+6)*5');
		}

		finalStr = finalStr + '\n==';
		finalStr = finalStr + '\n骰兩次3D6取一次，\n決定LUK。\n';
		for (i = 1; i <= 2; i++) {
			finalStr = finalStr + '\n' + i + '# ' + DiceCal('3d6*5');
		}

		return finalStr;
	}

	//這是傳統創角
	if (inputStr.toLowerCase().match('核心創角') != null) {

		if (inputStr.split(' ').length != 3) return undefined;

		//讀取年齡
		let old = parseInt(inputStr.split(' ', 3)[2]);
		if (old == NaN) return undefined;
		let ReStr = '調查員年齡設為：' + old + '\n';
		//設定 因年齡減少的點數 和 EDU加骰次數
		let Debuff = 0;
		let AppDebuff = 0;
		let EDUinc = 0;

		let oldArr = [15, 20, 40, 50, 60, 70, 80]
		let DebuffArr = [5, 0, 5, 10, 20, 40, 80]
		let AppDebuffArr = [0, 0, 5, 10, 15, 20, 25]
		let EDUincArr = [0, 1, 2, 3, 4, 4, 4]

		if (old < 15) return ReStr + '等等，核心規則不允許小於15歲的人物哦。';
		if (old >= 90) return ReStr + '等等，核心規則不允許90歲以上的人物哦。';

		for (i = 0; old >= oldArr[i]; i++) {
			Debuff = DebuffArr[i];
			AppDebuff = AppDebuffArr[i];
			EDUinc = EDUincArr[i];
		}

		ReStr = ReStr + '==\n';
		if (old < 20) ReStr = ReStr + '年齡調整：從STR、SIZ中減去' + Debuff + '點\n（請自行手動選擇計算）。\n將EDU減去5點。LUK可擲兩次取高。';
		else
		if (old >= 40) ReStr = ReStr + '年齡調整：從STR、CON或DEX中「總共」減去' + Debuff + '點\n（請自行手動選擇計算）。\n將APP減去' + AppDebuff + '點。可做' + EDUinc + '次EDU的成長擲骰。';
		else ReStr = ReStr + '年齡調整：可做' + EDUinc + '次EDU的成長擲骰。';
		ReStr = ReStr + '\n==';

		// STR
		ReStr = ReStr + '\n\nＳＴＲ：' + DiceCal('3d6*5');
		if (old >= 40) ReStr = ReStr + ' ← 這三項自選共減' + Debuff + '點';
		if (old < 20) ReStr = ReStr + ' ← 這兩項擇一減' + Debuff + '點';

		// CON
		ReStr = ReStr + '\nＣＯＮ：' + DiceCal('3d6*5');
		if (old >= 40) ReStr = ReStr + ' ← 這三項自選共減' + Debuff + '點';

		// DEX
		ReStr = ReStr + '\nＤＥＸ：' + DiceCal('3d6*5');
		if (old >= 40) ReStr = ReStr + ' ← 這三項自選共減' + Debuff + '點';

		// APP
		if (old >= 40) ReStr = ReStr + '\nＡＰＰ：' + DiceCal('3d6*5-' + AppDebuff);
		else ReStr = ReStr + '\nＡＰＰ：' + DiceCal('3d6*5');

		// POW
		ReStr = ReStr + '\nＰＯＷ：' + DiceCal('3d6*5');

		// SIZ
		ReStr = ReStr + '\nＳＩＺ：' + DiceCal('(2d6+6)*5');
		if (old < 20) ReStr = ReStr + ' ← 這兩項擇一減' + Debuff + '點';

		// INT
		ReStr = ReStr + '\nＩＮＴ：' + DiceCal('(2d6+6)*5');

		// EDU
		if (old < 20) ReStr = ReStr + '\nＥＤＵ：' + DiceCal('3d6*5-5');
		else {
			let firstEDU = '(' + RollDice('2d6') + '+6)*5';
			ReStr = ReStr + '\n==';
			ReStr = ReStr + '\nＥＤＵ初始值：' + firstEDU + ' = ' + eval(firstEDU);

			let tempEDU = eval(firstEDU);

			for (i = 1; i <= EDUinc; i++) {
				let EDURoll = Dice(100);
				ReStr = ReStr + '\n第' + i + '次EDU成長 → ' + EDURoll;


				if (EDURoll > tempEDU) {
					let EDUplus = Dice(10);
					ReStr = ReStr + ' → 成功成長' + EDUplus + '點';
					tempEDU = tempEDU + EDUplus;
				} else {
					ReStr = ReStr + ' → 沒有成長';
				}
			}
			ReStr = ReStr + '\n';
			ReStr = ReStr + '\nＥＤＵ最終值：' + tempEDU;
		}
		ReStr = ReStr + '\n==';

		// LUK
		ReStr = ReStr + '\n\nLUK：' + DiceCal('3d6*5');
		if (old < 20) ReStr = ReStr + '\nLUK額外加骰：' + DiceCal('3D6*5');

		return ReStr;
	}

	//如果不是正確的格式，直接跳出
	if (inputStr.match('=') == null && inputStr.match('>') == null) return undefined;

	//記錄檢定要求值
	let chack = parseInt(inputStr.split('=', 2)[1]);
	//設定回傳訊息
	let ReStr = '(1D100<=' + chack + ') → ';

	//先骰兩次十面骰作為起始值
	let OneRoll = Dice(10) - 1;
	let TenRoll = Dice(10);
	let firstRoll = TenRoll * 10 + OneRoll;
	if (firstRoll > 100) firstRoll = firstRoll - 100;

	//先設定最終結果等於第一次擲骰
	let finalRoll = firstRoll;


	//判斷是否為成長骰
	if (inputStr.match(/^cc>\d+/) != null) {
		chack = parseInt(inputStr.split('>', 2)[1]);
		if (finalRoll > chack) {

			ReStr = '(1D100>' + chack + ') → ' + finalRoll + ' → 成功成長' + Dice(10) + '點';
			return ReStr;
		}
		if (finalRoll <= chack) {
			ReStr = '(1D100>' + chack + ') → ' + finalRoll + ' → 沒有成長';
			return ReStr;
		}
		return undefined;
	}


	//判斷是否為獎懲骰
	let BPDice = 0;
	if (inputStr.match(/^cc\(-?[12]\)/) != null) BPDice = parseInt(inputStr.split('(', 2)[1]);
	//如果是獎勵骰
	if (BPDice != 0) {
		let tempStr = firstRoll;
		for (let i = 1; i <= Math.abs(BPDice); i++) {
			let OtherTenRoll = Dice(10);
			let OtherRoll = OtherTenRoll.toString() + OneRoll.toString();
			if (OtherRoll > 100) OtherRoll = parseInt(OtherRoll) - 100;
			tempStr = tempStr + '、' + OtherRoll;
		}
		let countArr = tempStr.split('、');
		if (BPDice > 0) finalRoll = Math.min(...countArr);
		if (BPDice < 0) finalRoll = Math.max(...countArr);

		ReStr = ReStr + tempStr + ' → ';
	}

	//結果判定
	if (finalRoll == 1) ReStr = ReStr + finalRoll + ' → 恭喜！大成功！';
	else
	if (finalRoll == 100) ReStr = ReStr + finalRoll + ' → 啊！大失敗！';
	else
	if (finalRoll <= 99 && finalRoll >= 95 && chack < 50) ReStr = ReStr + finalRoll + ' → 啊！大失敗！';
	else
	if (finalRoll <= chack / 5) ReStr = ReStr + finalRoll + ' → 極限成功';
	else
	if (finalRoll <= chack / 2) ReStr = ReStr + finalRoll + ' → 困難成功';
	else
	if (finalRoll <= chack) ReStr = ReStr + finalRoll + ' → 通常成功';
	else ReStr = ReStr + finalRoll + ' → 失敗';

	//浮動大失敗運算
	if (finalRoll <= 99 && finalRoll >= 95 && chack >= 50) {
		if (chack / 2 < 50) ReStr = ReStr + '\n（若要求困難成功則為大失敗）';
		else
		if (chack / 5 < 50) ReStr = ReStr + '\n（若要求極限成功則為大失敗）';
	}
	return ReStr;
}


////////////////////////////////////////
//////////////// Funny
////////////////////////////////////////
/* 猜拳功能 */
function RockPaperScissors(HandToCal, text) {
	let returnStr = '';

	var hand = WhatsYourHand(3); // 0:石頭 1:布 2:剪刀

	switch (hand) {
		case 0: //石頭
			returnStr = '我出石頭！\n';

			if (HandToCal == '剪刀') returnStr += '哼哼你輸惹';
			else if (HandToCal == '石頭') returnStr += '看來我們不相上下阿';
			else if (HandToCal == '布') returnStr += '你好像有點強！';
			else returnStr += '欸不對喔你亂出！';

			break;

		case 1: //布
			returnStr = '我出布！\n';

			if (HandToCal == '剪刀') returnStr += '讓你一次而已啦！';
			else if (HandToCal == '布') returnStr += '原來平手...沒什麼嘛！';
			else if (HandToCal == '石頭') returnStr += '哈哈你看看你！';
			else returnStr += '別亂出阿會壞掉的';

			break;

		case 2: //剪刀
			returnStr = '我出剪刀！\n';

			if (HandToCal == '剪刀') returnStr += '平手 (  艸)';
			else if (HandToCal == '布') returnStr += '贏了 (｀・ω・´)b';
			else if (HandToCal == '石頭') returnStr += '輸惹 ゜。。゜(ノД‵)ノ・゜';
			else returnStr += '亂出打你喔 (｀・ω・´)凸';

			break;

		default:
			returnStr = '我出的是...欸不對你沒出喔！\n';
			break;
	}

	return returnStr;
}

////////////////////////////////////////
//////////////// Cup
////////////////////////////////////////
/* 擲杯功能 */
function NormalDrawCup(inputStr, text) {
	let returnStr = ''; //1為陽, 0為陰, 2定為中性

	var result_left = [];
	var result_right = [];
	var cup_yes = 0,
		cup_no = 0,
		cup_laugh = 0,
		cup_null = 0,
		cup_else = 0;
	// var max = 0;

	for (var i = 0; i < 3; i++) //丟三次
	{
		result_left[i] = Cup(3);
		result_right[i] = Cup(3);

		if (result_left[i] == 0 && result_right[i] == 0) cup_no++;
		if (result_left[i] == 0 && result_right[i] == 1) cup_yes++;
		if (result_left[i] == 1 && result_right[i] == 0) cup_yes++;
		if (result_left[i] == 1 && result_right[i] == 1) cup_laugh++;
		if (result_left[i] == 2 && result_right[i] == 2) cup_null++;
		// else cup_else ++;
	}

	if (text != null) {
		if (cup_no >= 2) {
			if (cup_no == 3)
				returnStr += '三蓋杯' + ' ; ' + text;
			else
				returnStr += '蓋杯' + ' ; ' + text;
		} else if (cup_yes >= 2) {
			if (cup_yes == 3)
				returnStr += '三聖杯' + ' ; ' + text;
			else
				returnStr += '聖杯' + ' ; ' + text;
		} else if (cup_laugh >= 2) {
			if (cup_laugh == 3)
				returnStr += '三笑杯' + ' ; ' + text;
			else
				returnStr += '笑杯' + ' ; ' + text;
		} else if (cup_null == 3) returnStr += '立杯' + ' ; ' + text;
		else returnStr += '沒杯' + ' ; ' + text;
	} else {
		if (cup_no >= 2) {
			if (cup_no == 3)
				returnStr += '三蓋杯';
			else
				returnStr += '蓋杯';
		} else if (cup_yes >= 2) {
			if (cup_yes == 3)
				returnStr += '三聖杯';
			else
				returnStr += '聖杯';
		} else if (cup_laugh >= 2) {
			if (cup_laugh == 3)
				returnStr += '三笑杯';
			else
				returnStr += '笑杯';
		} else if (cup_null == 3) returnStr += '立杯';
		else returnStr += '沒杯';
	}

	return returnStr;
}


////////////////////////////////////////
//////////////// Tarot
////////////////////////////////////////
function MultiDrawTarot(CardToCal, text, type) {
	let returnStr = '';
	var tmpcard = 0;
	var cards = [];
	var revs = [];
	var i = 0;

	if (type == 1) //時間之流
	{
		cards[0] = Tarot(79); //先抽第0張
		revs[0] = Tarot(2);

		for (i = 1; i < 3; i++) {
			for (;;) {
				tmpcard = Tarot(79);
				if (cards.indexOf(tmpcard) === -1) //沒有重複，就這張了
				{
					cards.push(tmpcard);
					revs[i] = Tarot(2);
					break;
				}
			}
		}

		if (text != null)
			returnStr += text + ': \n';

		for (i = 0; i < 3; i++) {
			if (i == 0) returnStr += '過去: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 1) returnStr += '現在: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 2) returnStr += '未來: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]);
		}

	} else if (type == 2) //塞爾特大十字
	{
		cards[0] = Tarot(79); //先抽第0張
		revs[0] = Tarot(2);

		for (i = 1; i < 10; i++) {
			for (;;) {
				tmpcard = Tarot(79);
				if (cards.indexOf(tmpcard) === -1) //沒有重複，就這張了
				{
					cards.push(tmpcard);
					revs[i] = Tarot(2);
					break;
				}
			}
		}

		if (text != null)
			returnStr += text + ': \n';

		for (i = 0; i < 10; i++) {
			if (i == 0) returnStr += '現況: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 1) {
				if (revs[i] == 0) //正位
					returnStr += '助力: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
				else
					returnStr += '阻力: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			}
			if (i == 2) returnStr += '目標: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 3) returnStr += '基礎: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 4) returnStr += '過去: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 5) returnStr += '未來: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 6) returnStr += '自我: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 7) returnStr += '環境: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			if (i == 8) {
				if (revs[i] == 0) //正位
					returnStr += '希望: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
				else
					returnStr += '恐懼: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
			}
			if (i == 9) returnStr += '結論: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]);

		}

	} else {

		if (text == null)
			returnStr = tarotCardReply(Tarot(79)) + ' ' + tarotRevReply(Tarot(2));
		else
			returnStr = tarotCardReply(Tarot(79)) + ' ' + tarotRevReply(Tarot(2)) + ' ; ' + text;
	}


	return returnStr;
}

function NomalDrawTarot(CardToCal, text) {
	let returnStr = '';

	if (text == null)
		returnStr = tarotCardReply(Tarot(22)) + ' ' + tarotRevReply(Tarot(2));
	else
		returnStr = tarotCardReply(Tarot(22)) + ' ' + tarotRevReply(Tarot(2)) + ' ; ' + text;

	return returnStr;
}

function tarotRevReply(count) {
	let returnStr = '';

	if (count == 0) returnStr = '＋';
	if (count == 1) returnStr = '－';

	return returnStr;
}

function tarotCardReply(count) {
	let returnStr = '';

	// returnStr = count + '愚者';
	if (count == 0) returnStr = '愚者';
	if (count == 1) returnStr = '魔術師';
	if (count == 2) returnStr = '女祭司';
	if (count == 3) returnStr = '女皇';
	if (count == 4) returnStr = '皇帝';
	if (count == 5) returnStr = '教皇';
	if (count == 6) returnStr = '戀人';
	if (count == 7) returnStr = '戰車';
	if (count == 8) returnStr = '力量';
	if (count == 9) returnStr = '隱者';
	if (count == 10) returnStr = '命運之輪';
	if (count == 11) returnStr = '正義';
	if (count == 12) returnStr = '吊人';
	if (count == 13) returnStr = '死神';
	if (count == 14) returnStr = '節制';
	if (count == 15) returnStr = '惡魔';
	if (count == 16) returnStr = '高塔';
	if (count == 17) returnStr = '星星';
	if (count == 18) returnStr = '月亮';
	if (count == 19) returnStr = '太陽';
	if (count == 20) returnStr = '審判';
	if (count == 21) returnStr = '世界';

	if (count == 22) returnStr = '權杖一';
	if (count == 23) returnStr = '權杖二';
	if (count == 24) returnStr = '權杖三';
	if (count == 25) returnStr = '權杖四';
	if (count == 26) returnStr = '權杖五';
	if (count == 27) returnStr = '權杖六';
	if (count == 28) returnStr = '權杖七';
	if (count == 29) returnStr = '權杖八';
	if (count == 30) returnStr = '權杖九';
	if (count == 31) returnStr = '權杖十';
	if (count == 32) returnStr = '權杖侍者';
	if (count == 33) returnStr = '權杖騎士';
	if (count == 34) returnStr = '權杖皇后';
	if (count == 35) returnStr = '權杖國王';

	if (count == 36) returnStr = '聖杯一';
	if (count == 37) returnStr = '聖杯二';
	if (count == 38) returnStr = '聖杯三';
	if (count == 39) returnStr = '聖杯四';
	if (count == 40) returnStr = '聖杯五';
	if (count == 41) returnStr = '聖杯六';
	if (count == 42) returnStr = '聖杯七';
	if (count == 43) returnStr = '聖杯八';
	if (count == 44) returnStr = '聖杯九';
	if (count == 45) returnStr = '聖杯十';
	if (count == 46) returnStr = '聖杯侍者';
	if (count == 47) returnStr = '聖杯騎士';
	if (count == 48) returnStr = '聖杯皇后';
	if (count == 49) returnStr = '聖杯國王';

	if (count == 50) returnStr = '寶劍一';
	if (count == 51) returnStr = '寶劍二';
	if (count == 52) returnStr = '寶劍三';
	if (count == 53) returnStr = '寶劍四';
	if (count == 54) returnStr = '寶劍五';
	if (count == 55) returnStr = '寶劍六';
	if (count == 56) returnStr = '寶劍七';
	if (count == 57) returnStr = '寶劍八';
	if (count == 58) returnStr = '寶劍九';
	if (count == 59) returnStr = '寶劍十';
	if (count == 60) returnStr = '寶劍侍者';
	if (count == 61) returnStr = '寶劍騎士';
	if (count == 62) returnStr = '寶劍皇后';
	if (count == 63) returnStr = '寶劍國王';

	if (count == 64) returnStr = '錢幣一';
	if (count == 65) returnStr = '錢幣二';
	if (count == 66) returnStr = '錢幣三';
	if (count == 67) returnStr = '錢幣四';
	if (count == 68) returnStr = '錢幣五';
	if (count == 69) returnStr = '錢幣六';
	if (count == 70) returnStr = '錢幣七';
	if (count == 71) returnStr = '錢幣八';
	if (count == 72) returnStr = '錢幣九';
	if (count == 73) returnStr = '錢幣十';
	if (count == 74) returnStr = '錢幣侍者';
	if (count == 75) returnStr = '錢幣騎士';
	if (count == 76) returnStr = '錢幣皇后';
	if (count == 77) returnStr = '錢幣國王';

	if (count == 78) returnStr = '空白牌';

	return returnStr;

}

/* 這邊的核心都分開，為了某種原因 */
function WhatsYourHand(diceSided) {
	return Math.floor((Math.random() * diceSided)) //猜拳，從0開始
}

function Cup(diceSided) {
	return Math.floor((Math.random() * diceSided)) //丟杯：聖杯、笑杯、蓋杯、立杯、沒杯
}

function Tarot(diceSided) {
	return Math.floor((Math.random() * diceSided)) //塔羅，從0開始
}

function Dice(diceSided) {
	return Math.floor((Math.random() * diceSided) + 1)
}

////////////////////////////////////////
//////////////// Usage
////////////////////////////////////////
function displayUsage(usage) {
	let returnStr = '';

	if (usage == 1)
		returnStr = '\
這是支援丟骰的塔羅機器人 ── \
\nCoC 擲骰範例: \
\n → ccb<=   六版擲骰 \
\n → cc<=    七版擲骰 \
\n → cc(N)<= 獎勵骰 [-2~2] \
\n → cc>     幕間成長 \
\n → 2d4+1 / 2D10+1d2  直接擲骰 \
\n → 7 3d6 / 5 2d6+6   多筆輸出 \
\n \
\nCoC 一鍵創角: \
\n → cc 核心創角 [年齡]  以核心規則創角（含年齡調整）\
\n → cc 悠子創角  主要屬性骰七取五，次要屬性骰四取三，LUK骰二取一\
\n \
\nNC 擲骰範例: \
\n → 1NA (問題) \
\n → 4NC+2 (問題) \
\n → NM (對象)  可判定依戀 \
\n \
\n塔羅範例: \
\n → tarot daily/每日 (問題) \
\n → tarot time/時間 (問題) \
\n → tarot cross/大十字 (問題) \
\n \
\n擲筊範例: \
\n → cup (問題) \
\n \
\n猜拳範例: \
\n → 猜拳 剪刀/石頭/布 \
\n \
\n另外支援隱藏關鍵字: \
\n → 凜/甲鳥巴/車干哥 等等 \
\n \
\n功能越來越多了呢...';

	if (usage == 2)
		returnStr = '\
CoC 擲骰範例: \
\n → ccb<=   六版擲骰 \
\n → cc<=    七版擲骰 \
\n → cc(N)<= 獎勵骰 [-2~2] \
\n → cc>     幕間成長 \
\n → 2d4+1 / 2D10+1d2  直接擲骰 \
\n → 7 3d6 / 5 2d6+6   多筆輸出 \
\n \
\nCoC 一鍵創角: \
\n → cc 核心創角 [年齡]  以核心規則創角（含年齡調整）\
\n → cc 悠子創角  主要屬性骰七取五，次要屬性骰四取三，LUK骰二取一';

	if (usage == 3)
		returnStr = '\
每日運勢: 22 張，請用 tarot daily/每日 \
\n時間之流: 79 張，請用 tarot time/時間 (問題) \
\n大十字: 79 張，請用 tarot cross/大十字 (問題) \
\n儘管玩玩看';

	if (usage == 4)
		returnStr = '\
常見的擲筊 \
\n請用 丟杯/擲筊/cup (問題) \
\n會出現聖杯、笑杯、蓋杯、沒杯與立杯等結果';

	if (usage == 5)
		returnStr = '\
支援 NC 擲骰囉 \
\n請用基本 1NA/4NC+2 (問題) 之類的來丟\
\n大小寫都可以';

	if (usage == 6)
		returnStr = '\
猜拳 \
\n請用 猜拳 剪刀/石頭/布 來出拳\
\n好孩子不可以亂出喔！';

	return returnStr;
}

function randomDuelReply(inputStr) {
	let rplyArr = [
		'我的回合！抽牌！',
		'DUEL！',
		'決鬥！ \n召喚一隻歌布林突擊部隊，結束這回合！',
		'斗漏! 蒙斯踏卡斗!!',
		'斗漏! 媽基茲咖抖!!',
		'斗漏! 土拉鋪咖抖!!',
		'想跟我決鬥！你還早的很呢！',
		'HA☆NA☆SE☆',
		'NA☆ZE☆DAAAAAAA☆',
		'爆☆殺☆',
		'我已經有五張黑暗大法師了！ \n就憑你還想跟我鬥？',
		'強韌！無敵！最強！',
		'粉碎！玉碎！大喝采！',
		'覆蓋一張牌，結束這回合',
		'全速前進DA',
		'星爆☆氣流斬☆',
	];
	return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}

function randomBirdReply(inputStr) { //軒哥
	let rplyArr = [
		'說你愛我 <3',
		'放下本本趕快來跑團！',
		'欸 (?',
		'邊緣人嗚嗚',
		'好啊都這樣',
		'你是不是覺得我很帥',
		'妥妥的',
		'ㄍㄋㄇㄉ',
		'鴨巴我愛妳',
		'WTF',
		'我到底看了殺小',
		'共三小',
		'這我一定吉',
		'貴圈真亂',
		'不跟你說☆',
		'你看看你',
		'愉悅',
		'怪我囉 (?',
		'矮額',
		'你是不是愛上我了',
		'你是不是想(ry',
		'(｀・ω・´)凸',
		'只是想廢廢的',
		'趁我不注意在偷聊什麼',
		'人生好累',
		'你看，出來了',
		'(咳血',
		'幹啊不就好棒棒',
		'Magic！',
		'哩金變態',
		'真是任性(?',
	];
	return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}

function randomYabasoReply(inputStr) {
	let rplyArr = [
		'你們死定了',
		'我到底在共三小',
		'什麼東西你共三小',
		'幹，你這學不會的豬！',
		'嘎嘎嘎',
		'wwwww',
		'為什麼你們每天都可以一直玩',
		'不要打擾我挖坑！',
		'好嘲諷',
		'哈哈哈哈哈',
		'你4不4想拔嘴人家？',
		'一直叫，你想被淨灘嗎？',
		'懶~洋~洋~',
		'巴魯斯',
		'骰都骰',
		'軒哥我愛你',
		'怎，怎麼可能',
		'欸欸(?',
		'噁噁噁噁',
		'我要讓你們血。染。沙。灘',
		'oao',
		'登愣',
		'耶欸～<3',
		'想廢廢的',
	];

	if (inputStr.match('家訪') != null) return 'ㄉㄅㄑ';

	return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}

