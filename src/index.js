const functions = require('firebase-functions');
const dialogflow = require('actions-on-google').dialogflow;

const app = dialogflow();

app.intent('Default Welcome Intent', conv => {
  if (conv.user.last && conv.user.last.seen) {
    const list = conv.user.storage.list || [];
    const keepingMessage = (list.length > 1 && `${list.length}個のメモを覚えてますよ。`)
      || (list.length === 1 && `1個メモを記録しています。`)
      '';
    conv.ask(`おかえりなさい！${keepingMessage || ''}どうしましょう？メモを聞く場合は、メモ参照、メモする場合は、メモして、と言ってください。`);
  } else {
    conv.ask(`はじめまして！メモアプリへようこそ！どうしましょう？`);
  }
});

app.intent('create/content', conv => {
  const storage = conv.user.storage;
  const list = storage.list || [];
  const inputText = conv.query;
  conv.user.storage.list = [...list, inputText];
  conv.close(`${inputText}、ですね。覚えておきます。`);
});

app.intent('refer', conv => {
  const list = conv.user.storage.list;
  if (list && list.length > 0) {
    conv.ask(`${list[0]}、とのことです。消しますか？`);
  } else {
    conv.close('すいません、何もメモはないようです。');
  }
});
app.intent('refer/confirm to remove/yes', conv => {
  const list = conv.user.storage.list;
  conv.user.storage.list = list.slice(1);
  conv.close('メモを消去します！ではまた。');
});
app.intent('refer/confirm to remove/no', conv => {
  conv.close('まだ覚えておきますね。ではまた。');
});

exports.colorWithNumber = functions.https.onRequest(app);
