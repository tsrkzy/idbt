'use strict';
const { promisify: p } = require('util');
const { apiCall } = require('./apiCall');
const { readConfig, } = require('./config');
const chalk = require('chalk');
const TurnDown = require('turndown');
const terminalLink = require('terminal-link');
const { spin } = require('./spinner');

const listHandler = async (argv) => {
  const config = await readConfig();
  const { current } = config;

  if (!current) {
    console.log('NO current channel FOUND.');
    return false;
  }

  const { name, links } = current;
  const uri = links.messages;

  const messages = await fetchMessages.call(this, { channelName: name, uri });

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const message = {
      id: m.id,
      senderName: m.sender_name,
      senderIconUrl: m.sender_icon_url,
      createdAt: m.created_at,
      html: m.body,
      senderId: m.sender_id,
      file_urls: m.file_urls,
    };
    let md = toMarkDown(message.html);
    md = compress(md);
    const container = coloring(md, message);
    const timestamp = generateTimestampString(message.createdAt);
    printContainer.call(this, { timestamp, message, container });
  }
};

async function fetchMessages({ channelName, uri }) {
  const { messages } = await spin({ msg: ` LOADING: ${channelName}` }, apiCall.bind(this, uri));
  return messages;
}

function generateTimestampString(createdAt) {
  const date = new Date(createdAt)
  // const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
  const month = `00${date.getMonth() + 1}`.slice(-2);
  const day = `00${date.getDate()}`.slice(-2);
  const hours = `00${date.getHours()}`.slice(-2);
  const minutes = `00${date.getMinutes()}`.slice(-2);
  const timestamp = `[${month}/${day} ${hours}:${minutes}]`;

  return timestamp;
}

function printContainer({ timestamp, message, container }) {
  if (container.length === 1) {
    /* 1行の場合 */
    console.log(`${timestamp} ${chalk.bold(`${message.senderName}:`)} ${container[0]}`);
    return false;
  }

  /* 複数行の場合 */
  console.log(`${timestamp} ${chalk.bold(message.senderName)}:`);
  for (let i = 0; i < container.length; i++) {
    const c = container[i];
    console.log(`${((i + 1) === container.length) ? '`' : '|'} ${c}`);
  }
}

function coloring(markdown, message) {
  const lines = markdown.split('\n');
  const { file_urls: files = [] } = message;
  const colored = [];
  let inCodeBlock = false;
  const attachments = files.map((f) => `[-] ATTACHMENT: (${f})`);
  let attachIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    /* code blockの判定。トリプルバッククオートがヒットするたびにフラグを切り替え、フラグが立っている場合は他カラーリング処理を行わない */
    if (line === '```') {
      inCodeBlock = !inCodeBlock;
      colored.push(inCodeBlock ? chalk.bgBlackBright(line) : '');
      continue;
    }
    if (inCodeBlock) {
      colored.push(chalk.bgBlackBright(`   ${line}`));
      continue;
    }

    /* inline code */
    if (line.indexOf('`') !== -1 && line.indexOf('`') !== line.lastIndexOf('`')) {
      const lines = line.split('`');
      const a = [];
      for (let i = 0; i < lines.length; i++) {
        let l = lines[i];
        if (i % 2 !== 0) {
          a.push(chalk.bgBlackBright(l));
          continue;
        }
        l = replacer(l, 'backquote');
        l = replacer(l, 'link');
        l = replacer(l, 'image');
        l = replacer(l, 'mention');
        l = replacer(l, 'strong');
        l = replacer(l, 'strikethrough');
        l = replacer(l, 'bulletList');
        l = replacer(l, 'orderList');
        l = replacer(l, 'header');
        a.push(l);
      }
      line = a.join('`');
      colored.push(line);
      continue;
    }

    line = replacer(line, 'backquote');
    line = replacer(line, 'link');
    line = replacer(line, 'image');
    line = replacer(line, 'mention');
    line = replacer(line, 'strong');
    line = replacer(line, 'strikethrough');
    line = replacer(line, 'bulletList');
    line = replacer(line, 'orderList');
    line = replacer(line, 'header');

    colored.push(line);
  }

  return colored.concat(attachments);

  function replacer(line, mode) {
    const modes = {
      'backquote': {
        /* コードブロック */
        pattern: /^(\s*)\>\s/g,
        fn: (_, ...hit) => `${hit[0]}${chalk.bgBlackBright('>')} `
      },
      'link': {
        /* [title](href)形式のリンク */
        pattern: /(?<!\!)\[([^\]]*)\]\(([a-zA-Z0-9\-\_\.\!\'\(\)\*\;\/\?\:\@\&\=\+\$\%\#\,]+)\)/g,
        fn: (_, ...hit) => {
          attachIndex++;
          const href = terminalLink('LINK', hit[1]);
          const link = `[${attachIndex}] ${href} - ${hit[0]}`;
          attachments.push(link);
          return `[${chalk.magentaBright(hit[0])}](${chalk.magentaBright(`*${attachIndex}`)})`;
        }
      },
      'image': {
        /* ![title](src)形式の挿入画像 ※｢添付｣した画像は別処理でpickしている */
        pattern: /\!\[([^\]]*)\]\(([a-zA-Z0-9\-\_\.\!\'\(\)\*\;\/\?\:\@\&\=\+\$\%\#\,]+)\)/g,
        fn: (_, ...hit) => {
          attachIndex++;
          const src = terminalLink('IMAGE', hit[1]);
          const img = `[${attachIndex}] ${src}`;
          attachments.push(img);
          return `[${chalk.cyanBright(hit[0] || 'IMAGE')}](${chalk.cyanBright(`*${attachIndex}`)})`;
        }
      },
      'mention': {
        /* @ユーザ名 形式のメンション */
        pattern: /\*\*@([0-9a-zA-Z\-_\\]+)\*\*/g,
        fn: (_, ...hit) => {
          // 半角記号はエスケープされているのでもとに戻す
          const name = hit[0].replace(/\\(.)/g, (_, c) => c[0])
          return `${chalk.bold.yellowBright('@')}${chalk.yellowBright(name)}`
        }
      },
      'strong': {
        /* **ボールド** 形式のボールド体 */
        pattern: /\*\*([^\*]+)\*\*/g,
        fn: (_, ...hit) => `${chalk.bold.bgRedBright.white(hit[0])}`
      },
      'strikethrough': {
        /* ~~打ち消し~~ 形式の打ち消し */
        pattern: /~~([^\*]+)~~/g,
        fn: (_, ...hit) => `~~${hit[0]}~~`
      },
      'bulletList': {
        /* * リスト(順序なし箇条書き) */
        pattern: /^(\s*)([\+\*])(\s+)/,
        fn: (_, ...hit) => `${hit[0]}${chalk.bold.cyan(hit[1])}${hit[2]}`
      },
      'orderList': {
        /* 1. リスト(通し番号付き) */
        pattern: /^(\s*)(\d+\.)(\s+)/,
        fn: (_, ...hit) => `${hit[0]}${chalk.cyan(hit[1])}${hit[2]}`
      },
      'header': {
        /* ###見出し */
        pattern: /^(#+)/,
        fn: (_, ...hit) => `${chalk.magentaBright(hit[0])}`
      },
    };
    const { pattern, fn } = modes[mode];

    return line.replace(pattern, fn)
  }
}

function compress(markdown) {
  const lines = markdown.split('\n');
  const compressed = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      continue;
    }
    compressed.push(line);
  }
  return compressed.join('\n');
}

function toMarkDown(html) {
  const td = new TurnDown({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '+'
  });
  td.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: (content) => `~~${content}~~`,
  })
  td.keep(['pre', 'code']);
  const markdown = td.turndown(html);
  // console.log('html:');
  // console.log(html);
  // console.log('markdown:');
  // console.log(markdown);
  return markdown;
}

exports.listHandler = listHandler;