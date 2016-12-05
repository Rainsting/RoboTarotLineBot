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
        'Authorization': 'Bearer [7j8kBJ2DU+ma2DsQ0cf5ryKYY3xNzZpnqEkdw8GzaYqejIP2gnY2TfOrywVMhVstAy3WRIWu2sFdxb+4fbSI5TwKMuSWzPeIOE7z1WTcATaUfuSCu/bHD1k+GL4eGwnyyBuNc/lkOokFQcadMCAgsgdB04t89/1O/w1cDnyilFU=]'

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
            rplyVal = randomYabasoReply();
        }
    }

    if (rplyVal) {
        replyMsgToLine(rplyToken, rplyVal);
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
        //yabaso指令開始於此
    if (inputStr.match('鴨霸獸') != null) {
        if (inputStr.match('說明') != null)
            return displayUsage(1);
        else
            return randomYabasoReply();
    }
    if (inputStr.match('車干哥') != null) return randomBirdReply();
    if (inputStr.match('軒哥') != null && mainMsg[1] == '決鬥') return randomDuelReply();

    //cc指令開始於此
    if (inputStr.split('=')[0] == 'cc<') {
        let cctext = null;
        if (mainMsg[1] != undefined) cctext = mainMsg[1];
        return coc7(parseInt(inputStr.split('=')[1]), cctext);
    }

    //獎懲骰設定於此
    if (inputStr.split('=')[0] == 'cc(1)<' || inputStr.split('=')[0] == 'cc(2)<' || inputStr.split('=')[0] == 'cc(-1)<' || inputStr.split('=')[0] == 'cc(-2)<') {
        let cctext = null;
        if (mainMsg[1] != undefined) cctext = mainMsg[1];
        return coc7bp(parseInt(inputStr.split('=')[1]), parseInt(inputStr.split('(')[1]), cctext);
    }

    //ccb指令開始於此
    if (inputStr.split('=')[0] == 'ccb<') {
        let cctext = null;
        if (mainMsg[1] != undefined) cctext = mainMsg[1];
        return coc6(parseInt(inputStr.split('=')[1]), cctext);
    }


    //roll 指令開始於此
    if (trigger == 'roll') {

        if (inputStr.split(msgSplitor).length == 1) return displayUsage(2);

        if (mainMsg[1] == '六版角卡') {
            return CreateCoC6Card(mainMsg[1], mainMsg[2]);
        }

        if (mainMsg[1] == '七版角卡') {
            return CreateCoC7Card(mainMsg[1], mainMsg[2]);
        }

        if (inputStr.split(msgSplitor).length >= 3) {

            if (mainMsg[2].split('*').length == 2) {
                let tempArr = mainMsg[2].split('*');
                let text = inputStr.split(msgSplitor)[3];
                //secCommand = parseInt(tempArr[1]);
                return MutiRollDice(mainMsg[1], parseInt(tempArr[1]), text);
            }
            return NomalRollDice(mainMsg[1], mainMsg[2]);
        }
        if (inputStr.split(msgSplitor).length == 2) {
            return NomalRollDice(mainMsg[1], mainMsg[2]);
        }
    }

    //tarot 指令
    else if (trigger == 'tarot') {

        if (inputStr.split(msgSplitor).length == 1) return displayUsage(3);

        // if (inputStr.split(msgSplitor).length == 2 || inputStr.split(msgSplitor).length == 3) {
        if (inputStr.split(msgSplitor).length >= 2) {
            if (mainMsg[1] == '說明')
                return displayUsage(3);

            if (mainMsg[1] == '每日' || mainMsg[1] == '運勢' || mainMsg[1] == 'daily' || mainMsg[1] == 'draw')
                return NomalDrawTarot(mainMsg[1], mainMsg[2]);

            if (mainMsg[1] == '時間' || mainMsg[1] == 'time')
                return MultiDrawTarot(mainMsg[1], mainMsg[2], 1);

            if (mainMsg[1] == '大十字' || mainMsg[1] == 'cross')
                return MultiDrawTarot(mainMsg[1], mainMsg[2], 2);

            if (mainMsg[1] == '法典' || mainMsg[1] == '章典')
                return '你們打算懷著惡意傷害我的姊妹們，\
						\n因此我遵守我們名譽的章典， \
						\n給與你們殺死我的機會， \
						\n在此向你們申請決鬥！';

            if (mainMsg[1] == '抽牌' || mainMsg[1] == '決鬥' || mainMsg[1] == 'duel')
                return randomDuelReply();

            return MultiDrawTarot(mainMsg[1], mainMsg[2], 3); //預設抽 79 張
        }

    } else
        return null;
    // if (trigger != 'roll') return null;


}

function coc6(chack, text) {
    let temp = Dice(100);

    if (text == null) {
        if (temp == 100) return temp + ' → 啊！大失敗！';
        if (temp <= chack) return temp + ' → 成功';
        else return temp + ' → 失敗';
    } else {
        if (temp == 100) return temp + ' → 啊！大失敗！；' + text;
        if (temp <= chack) return temp + ' → 成功；' + text;
        else return temp + ' → 失敗；' + text;
    }
}

function coc7(chack, text) {
    let temp = Dice(100);
    if (text == null) {
        if (temp == 1) return temp + ' → 恭喜！大成功！';
        if (temp == 100) return temp + ' → 啊！大失敗！';
        if (temp <= chack / 5) return temp + ' → 極限成功';
        if (temp <= chack / 2) return temp + ' → 困難成功';
        if (temp <= chack) return temp + ' → 通常成功';
        else return temp + ' → 失敗';
    } else {
        if (temp == 1) return temp + ' → 恭喜！大成功！；' + text;
        if (temp == 100) return temp + ' → 啊！大失敗！；' + text;
        if (temp <= chack / 5) return temp + ' → 極限成功；' + text;
        if (temp <= chack / 2) return temp + ' → 困難成功；' + text;
        if (temp <= chack) return temp + ' → 通常成功；' + text;
        else return temp + ' → 失敗；' + text;
    }
}

function coc7chack(temp, chack, text) {
    if (text == null) {
        if (temp == 1) return temp + ' → 恭喜！大成功！';
        if (temp == 100) return temp + ' → 啊！大失敗！';
        if (temp <= chack / 5) return temp + ' → 極限成功';
        if (temp <= chack / 2) return temp + ' → 困難成功';
        if (temp <= chack) return temp + ' → 通常成功';
        else return temp + ' → 失敗';
    } else {
        if (temp == 1) return temp + ' → 恭喜！大成功！；' + text;
        if (temp == 100) return temp + ' → 啊！大失敗！；' + text;
        if (temp <= chack / 5) return temp + ' → 極限成功；' + text;
        if (temp <= chack / 2) return temp + ' → 困難成功；' + text;
        if (temp <= chack) return temp + ' → 通常成功；' + text;
        else return temp + ' → 失敗；' + text;
    }
}


function coc7bp(chack, bpdiceNum, text) {
    let temp0 = Dice(10) - 1;
    let countStr = '';

    if (bpdiceNum > 0) {
        for (let i = 0; i <= bpdiceNum; i++) {
            let temp = Dice(10);
            let temp2 = temp.toString() + temp0.toString();
            if (temp2 > 100) temp2 = parseInt(temp2) - 100;
            countStr = countStr + temp2 + '、';
        }
        countStr = countStr.substring(0, countStr.length - 1)
        let countArr = countStr.split('、');

        countStr = countStr + ' → ' + coc7chack(Math.min(...countArr), chack, text);
        return countStr;
    }

    if (bpdiceNum < 0) {
        bpdiceNum = Math.abs(bpdiceNum);
        for (let i = 0; i <= bpdiceNum; i++) {
            let temp = Dice(10);
            let temp2 = temp.toString() + temp0.toString();
            if (temp2 > 100) temp2 = parseInt(temp2) - 100;
            countStr = countStr + temp2 + '、';
        }
        countStr = countStr.substring(0, countStr.length - 1)
        let countArr = countStr.split('、');

        countStr = countStr + ' → ' + coc7chack(Math.max(...countArr), chack, text);
        return countStr;
    }

}

function ArrMax(Arr) {
    var max = this[0];
    this.forEach(function(ele, index, arr) {
        if (ele > max) {
            max = ele;
        }
    })
    return max;
}

function MutiRollDice(DiceToCal, timesNum, text) {
    let cuntSplitor = '+';
    let comSplitor = 'd';
    let CuntArr = DiceToCal.split(cuntSplitor);
    let numMax = CuntArr.length - 1; //設定要做的加法的大次數

    var count = 0;
    let countStr = '';
    if (DiceToCal.match('D') != null) return randomYabasoReply() + '\n格式錯啦，d要小寫！';

    if (text == null) {
        for (let j = 1; j <= timesNum; j++) {
            count = 0;
            for (let i = 0; i <= numMax; i++) {

                let commandArr = CuntArr[i].split(comSplitor);
                let countOfNum = commandArr[0];
                let randomRange = commandArr[1];
                if (randomRange == null) {
                    let temp = parseInt(countOfNum);
                    //countStr = countStr + temp + '+';
                    count += temp;
                } else {

                    for (let idx = 1; idx <= countOfNum; idx++) {
                        let temp = Dice(randomRange);
                        //countStr = countStr + temp + '+';
                        count += temp;
                    }
                }
            }
            countStr = countStr + count + '；';
        }
        countStr = countStr.substring(0, countStr.length - 1);
        return countStr;
    }

    if (text != null) {
        for (let j = 1; j <= timesNum; j++) {
            count = 0;
            for (let i = 0; i <= numMax; i++) {

                let commandArr = CuntArr[i].split(comSplitor);
                let countOfNum = commandArr[0];
                let randomRange = commandArr[1];
                if (randomRange == null) {
                    let temp = parseInt(countOfNum);
                    //countStr = countStr + temp + '+';
                    count += temp;
                } else {

                    for (let idx = 1; idx <= countOfNum; idx++) {
                        let temp = Dice(randomRange);
                        //countStr = countStr + temp + '+';
                        count += temp;
                    }
                }
            }
            countStr = countStr + count + '；';
        }
        countStr = countStr.substring(0, countStr.length - 1) + '；' + text;
        return countStr;
    }

}


function NomalRollDice(DiceToCal, text) {
    let cuntSplitor = '+';
    let comSplitor = 'd';
    let CuntArr = DiceToCal.split(cuntSplitor);
    let numMax = CuntArr.length - 1; //設定要做的加法的大次數

    var count = 0;
    let countStr = '';
    if (DiceToCal.match('D') != null) return randomYabasoReply() + '\n格式錯啦，d要小寫！';
    for (let i = 0; i <= numMax; i++) {

        let commandArr = CuntArr[i].split(comSplitor);
        let countOfNum = commandArr[0];
        let randomRange = commandArr[1];
        if (randomRange == null) {
            let temp = parseInt(countOfNum);
            countStr = countStr + temp + '+';
            count += temp;
        } else {

            for (let idx = 1; idx <= countOfNum; idx++) {
                let temp = Dice(randomRange);
                countStr = countStr + temp + '+';
                count += temp;
            }
        }
    }

    if (countStr.split(cuntSplitor).length == 2) {
        if (text == null) countStr = count;
        else countStr = count + '；' + text;
    } else {
        if (text == null) countStr = countStr.substring(0, countStr.length - 1) + '=' + count;
        else countStr = countStr.substring(0, countStr.length - 1) + '=' + count + '；' + text;
    }
    return countStr;

}

function CreateCoC7Card(DiceToCal, text) {
    let returnStr = '';
    let dicecount = 0;

    if (text == null) {
        dicecount = (Dice(6) + Dice(6) + Dice(6)) * 5;
        returnStr = 'STR: ' + dicecount; //str
        dicecount = (Dice(6) + Dice(6) + Dice(6)) * 5;
        returnStr += '\nCON: ' + dicecount; //con
        dicecount = (Dice(6) + Dice(6) + Dice(6)) * 5;
        returnStr += '\nPOW: ' + dicecount; //pow
        dicecount = (Dice(6) + Dice(6) + Dice(6)) * 5;
        returnStr += '\nDEX: ' + dicecount; //pow
        dicecount = (Dice(6) + Dice(6) + Dice(6)) * 5;
        returnStr += '\nAPP: ' + dicecount; //app

        dicecount = (Dice(6) + Dice(6) + 6) * 5;
        returnStr += '\nSIZ: ' + dicecount; //siz
        dicecount = (Dice(6) + Dice(6) + 6) * 5;
        returnStr += '\nINT: ' + dicecount; //int
        dicecount = (Dice(6) + Dice(6) + 6) * 5;
        returnStr += '\nEDU: ' + dicecount; //edu

        dicecount = (Dice(6) + Dice(6) + Dice(6));
        returnStr += '\nLUK: ' + dicecount; //luk
    } else {
        returnStr = text + ':'
        dicecount = (Dice(6) + Dice(6) + Dice(6)) * 5;
        returnStr += '\nSTR: ' + dicecount; //str
        dicecount = (Dice(6) + Dice(6) + Dice(6)) * 5;
        returnStr += '\nCON: ' + dicecount; //con
        dicecount = (Dice(6) + Dice(6) + Dice(6)) * 5;
        returnStr += '\nPOW: ' + dicecount; //pow
        dicecount = (Dice(6) + Dice(6) + Dice(6)) * 5;
        returnStr += '\nDEX: ' + dicecount; //pow
        dicecount = (Dice(6) + Dice(6) + Dice(6)) * 5;
        returnStr += '\nAPP: ' + dicecount; //app

        dicecount = (Dice(6) + Dice(6) + 6) * 5;
        returnStr += '\nSIZ: ' + dicecount; //siz
        dicecount = (Dice(6) + Dice(6) + 6) * 5;
        returnStr += '\nINT: ' + dicecount; //int
        dicecount = (Dice(6) + Dice(6) + 6) * 5;
        returnStr += '\nEDU: ' + dicecount; //edu

        dicecount = (Dice(6) + Dice(6) + Dice(6));
        returnStr += '\nLUK: ' + dicecount; //luk
    }

    return returnStr;
}


function CreateCoC6Card(DiceToCal, text) {
    let returnStr = '';

    if (text == null) {
        returnStr = 'STR: ' + NomalRollDice('3d6', null); //str
        returnStr += '\nCON: ' + NomalRollDice('3d6', null); //con
        returnStr += '\nPOW: ' + NomalRollDice('3d6', null); //pow
        returnStr += '\nDEX: ' + NomalRollDice('3d6', null); //dex
        returnStr += '\nAPP: ' + NomalRollDice('3d6', null); //app
        returnStr += '\nSIZ: ' + NomalRollDice('2d6+6', null); //siz
        returnStr += '\nINT: ' + NomalRollDice('2d6+6', null); //int
        returnStr += '\nEDU: ' + NomalRollDice('2d6+3', null); //edu

    } else {
        returnStr = text + ':'
        returnStr += '\nSTR: ' + NomalRollDice('3d6', null); //str
        returnStr += '\nCON: ' + NomalRollDice('3d6', null); //con
        returnStr += '\nPOW: ' + NomalRollDice('3d6', null); //pow
        returnStr += '\nDEX: ' + NomalRollDice('3d6', null); //dex
        returnStr += '\nAPP: ' + NomalRollDice('3d6', null); //app
        returnStr += '\nSIZ: ' + NomalRollDice('2d6+6', null); //siz
        returnStr += '\nINT: ' + NomalRollDice('2d6+6', null); //int
        returnStr += '\nEDU: ' + NomalRollDice('2d6+3', null); //edu		
    }

    return returnStr;
}


function MultiDrawTarot(CardToCal, text, type) {
    let returnStr = '';
    var card1 = 0,
        card2 = 0,
        card3 = 0;
    var rev1 = 0,
        rev2 = 0,
        rev3 = 0;

    if (type == 1) //時間之流
    {
        card1 = Tarot(79);
        rev1 = Tarot(2);

        for (;;) {
            card2 = Tarot(79);
            if (card2 == card1)
                continue;
            else
                break;
        }
        rev2 = Tarot(2);


        for (;;) {
            card3 = Tarot(79);
            if (card3 == card1)
                continue;
            else if (card3 == card2)
                continue;
            else
                break;
        }
        rev3 = Tarot(2);

        if (text == null) {
            if (rev1 == 0)
                returnStr = '過去: ' + tarotCardReply(card1) + ' ' + '正位';
            else
                returnStr = '過去: ' + tarotCardReply(card1) + ' ' + '逆位';

            if (rev2 == 0)
                returnStr += '\n現在: ' + tarotCardReply(card2) + ' ' + '正位';
            else
                returnStr += '\n現在: ' + tarotCardReply(card2) + ' ' + '逆位';

            if (rev3 == 0)
                returnStr += '\n未來: ' + tarotCardReply(card3) + ' ' + '正位';
            else
                returnStr += '\n未來: ' + tarotCardReply(card3) + ' ' + '逆位';

        } else {
            returnStr = '問題: ' + text;
            if (rev1 == 0)
                returnStr += '\n過去: ' + tarotCardReply(card1) + ' ' + '正位';
            else
                returnStr += '\n過去: ' + tarotCardReply(card1) + ' ' + '逆位';

            if (rev2 == 0)
                returnStr += '\n現在: ' + tarotCardReply(card2) + ' ' + '正位';
            else
                returnStr += '\n現在: ' + tarotCardReply(card2) + ' ' + '逆位';

            if (rev3 == 0)
                returnStr += '\n未來: ' + tarotCardReply(card3) + ' ' + '正位';
            else
                returnStr += '\n未來: ' + tarotCardReply(card3) + ' ' + '逆位';

        }

    } else if (type == 2) //塞爾特大十字
    {
        var tmpcard = 0;
        var tmprev = 0;

        var cards = [];
        var revs = [];

        var i = 0;

        // cards[0] = Tarot(79);
        // revs[0] = Tarot(2);

        for (i = 0; i < 10; i++) {
            cards[i] = Tarot(79);
            revs[i] = Tarot(2);
        }

        if (text != null)
            returnStr += text + ': \n';

        for (i = 0; i < 10; i++) {
            if (i == 0) returnStr += '問題核心: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
            if (i == 1) returnStr += '阻/助力: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
            if (i == 2) returnStr += '目標: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
            if (i == 3) returnStr += '基礎: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
            if (i == 4) returnStr += '過去: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
            if (i == 5) returnStr += '未來: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
            if (i == 6) returnStr += '態度: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
            if (i == 7) returnStr += '環境: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
            if (i == 8) returnStr += '希望/恐懼: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]) + '\n';
            if (i == 9) returnStr += '結果: ' + tarotCardReply(cards[i]) + ' ' + tarotRevReply(revs[i]);

        }

        // var n=2;
        // var b=3,c=4; 
        // eval('a'+n+'=b*c');

        // eval("var i=0;while (i<10){document.write(i);i++;}");

    } else {
        card1 = Tarot(79);
        rev1 = Tarot(2);

        if (rev1 == 0)
            returnStr = tarotCardReply(card1) + ' ' + '正位';
        else
            returnStr = tarotCardReply(card1) + ' ' + '逆位';
    }


    return returnStr;
}

function NomalDrawTarot(CardToCal, text) {
    let returnStr = '';
    // let tarotRange = 22;	//22張牌
    // let tarotReverse = 2;	//正反面

    var count = Tarot(22);
    var reverse = Tarot(2);

    // returnStr = count + ' ' + reverse;
    // return returnStr;

    var tarotStr = tarotCardReply(count);

    if (text == null)
        if (reverse == 0) //正位
            returnStr = tarotStr + ' ' + '正位';
        else
            returnStr = tarotStr + ' ' + '逆位';
    else
    if (reverse == 0) //正位
        returnStr = tarotStr + ' ' + '正位' + '；' + text;
    else
        returnStr = tarotStr + ' ' + '逆位' + '；' + text;

    return returnStr;
}

function Dice(diceSided) {
    return Math.floor((Math.random() * diceSided) + 1)
}

function Tarot(diceSided) {
    return Math.floor((Math.random() * diceSided)) //塔羅，從0開始
}

function tarotRevReply(count) {
    let returnStr = '';

    if (count == 0) returnStr = '正';
    if (count == 1) returnStr = '逆';

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

    if (count == 22) returnStr = '權杖I';
    if (count == 23) returnStr = '權杖II';
    if (count == 24) returnStr = '權杖III';
    if (count == 25) returnStr = '權杖IV';
    if (count == 26) returnStr = '權杖V';
    if (count == 27) returnStr = '權杖VI';
    if (count == 28) returnStr = '權杖VII';
    if (count == 29) returnStr = '權杖VIII';
    if (count == 30) returnStr = '權杖IX';
    if (count == 31) returnStr = '權杖X';
    if (count == 32) returnStr = '權杖侍者';
    if (count == 33) returnStr = '權杖騎士';
    if (count == 34) returnStr = '權杖皇后';
    if (count == 35) returnStr = '權杖國王';

    if (count == 36) returnStr = '聖杯I';
    if (count == 37) returnStr = '聖杯II';
    if (count == 38) returnStr = '聖杯III';
    if (count == 39) returnStr = '聖杯IV';
    if (count == 40) returnStr = '聖杯V';
    if (count == 41) returnStr = '聖杯VI';
    if (count == 42) returnStr = '聖杯VII';
    if (count == 43) returnStr = '聖杯VIII';
    if (count == 44) returnStr = '聖杯IX';
    if (count == 45) returnStr = '聖杯X';
    if (count == 46) returnStr = '聖杯侍者';
    if (count == 47) returnStr = '聖杯騎士';
    if (count == 48) returnStr = '聖杯皇后';
    if (count == 49) returnStr = '聖杯國王';

    if (count == 50) returnStr = '寶劍I';
    if (count == 51) returnStr = '寶劍II';
    if (count == 52) returnStr = '寶劍III';
    if (count == 53) returnStr = '寶劍IV';
    if (count == 54) returnStr = '寶劍V';
    if (count == 55) returnStr = '寶劍VI';
    if (count == 56) returnStr = '寶劍VII';
    if (count == 57) returnStr = '寶劍VIII';
    if (count == 58) returnStr = '寶劍IX';
    if (count == 59) returnStr = '寶劍X';
    if (count == 60) returnStr = '寶劍侍者';
    if (count == 61) returnStr = '寶劍騎士';
    if (count == 62) returnStr = '寶劍皇后';
    if (count == 63) returnStr = '寶劍國王';

    if (count == 64) returnStr = '錢幣I';
    if (count == 65) returnStr = '錢幣II';
    if (count == 66) returnStr = '錢幣III';
    if (count == 67) returnStr = '錢幣IV';
    if (count == 68) returnStr = '錢幣V';
    if (count == 69) returnStr = '錢幣VI';
    if (count == 70) returnStr = '錢幣VII';
    if (count == 71) returnStr = '錢幣VIII';
    if (count == 72) returnStr = '錢幣IX';
    if (count == 73) returnStr = '錢幣X';
    if (count == 74) returnStr = '錢幣侍者';
    if (count == 75) returnStr = '錢幣騎士';
    if (count == 76) returnStr = '錢幣皇后';
    if (count == 77) returnStr = '錢幣國王';

    if (count == 78) returnStr = '空白牌';

    return returnStr;

}

function displayUsage(usage) {
    let returnStr = '';

    if (usage == 1)
        returnStr = \
        '原本這是塔羅機器人，但額外支援擲骰功能， \
\n擲骰範例 (都是小寫): \
\n → ccb   六版擲骰 \
\n → cc    七版擲骰 \
\n → cc(N) 獎勵骰 \
\n → roll  骰數 \
\n \
\n支援速產 CoC 角卡\
\n → roll 六版角卡/七版角卡 \
\n \
\n塔羅範例 (只支援大牌): \
\n → tarot daily/draw/每日/運勢 (問題) \
\n → tarot time/時間 (問題) \
\n → tarot cross/大十字 (問題) \
\n \
\n另外支援隱藏關鍵字，如: \
\n → 鴨霸獸/車干哥/軒哥 決鬥/tarot 抽牌 等等... \
\n \
\n我到底在寫尛';

    if (usage == 2)
        returnStr = \
        '總之你要擲骰前就先打roll，後面接像是2d6，1d6+3，2d6+1d3之類的就好。  \
\n要多筆輸出就是先空一格再打像是 *5 之類的。  \
\n請愛用小寫d，不支援大寫D';

    if (usage == 3)
        returnStr = \
        '每日運勢: 22 張，請用 tarot daily/每日 \
\n時間之流: 79 張，請用 tarot time/時間 (問題) \
\n大十字: 79 張，請用 tarot cross/大十字 (問題) \
\n儘管玩玩看';

    return returnStr;
}

function randomDuelReply() {
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

function randomBirdReply() { //軒哥
    let rplyArr = [
        '說你愛我 <3',
        '放下課本趕快來跑團！',
        '欸 (?',
        '邊緣人嗚嗚',
        '好啊都這樣',
        '你是不是覺得我很帥',
        '妥妥的',
        'ㄍㄌㄇㄉ',
        'ㄍㄋㄇㄉ',
        '鴨巴我愛妳',
        'WTF',
        '我到底看了什麼',
        '共三小',
        '這我一定吉',
        '貴圈真亂',
        '你看看你'
    ];
    return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}

function randomYabasoReply() {
    let rplyArr = [
        '你們死定了呃呃呃不要糾結這些……所以是在糾結哪些？',
        '在澳洲，每過一分鐘就有一隻鴨嘴獸被拔嘴。 \n我到底在共三小。',
        '嗚噁噁噁噁噁噁，不要隨便叫我。',
        '幹，你這學不會的豬！',
        '嘎嘎嘎。',
        'wwwwwwwwwwwwwwwww',
        '為什麼你們每天都可以一直玩；玩就算了還玩我。',
        '好棒，整點了！咦？不是嗎？',
        '不要打擾我挖坑！',
        '好棒，誤點了！',
        '在南半球，一隻鴨嘴獸拍打他的鰭，他的嘴就會掉下來。 \n我到底在共三小。',
        '什麼東西你共三小。',
        '哈哈哈哈哈哈哈哈！',
        '一直叫，你4不4想拔嘴人家？',
        '一直叫，你想被淨灘嗎？',
        '懶~洋~洋~',
        '幫主你也敢嘴？'
    ];
    return rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
}
