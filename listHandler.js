'use strict';
const {
  promisify: p
} = require('util');
const {
  apiCall
} = require('./apiCall');
const {
  readConfig,
} = require('./config');
const chalk = require('chalk');
const TurnDown = require('turndown');
const terminalLink = require('terminal-link');
const { spin } = require('./spinner');

const listHandler = async (argv) => {
  const config = await readConfig();
  const {
    current
  } = config;

  if (!current) {
    console.log('NO current channel FOUND.');
    return false;
  }

  const { name, links } = current;
  const uri = links.messages;

  const { messages } = await spin({ msg: ` LOADING: ${name}` }, apiCall.bind(this, uri));

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const message = {
      id: m.id,
      senderName: m.sender_name,
      senderIconUrl: m.sender_icon_url,
      createdAt: m.created_at,
      html: m.body,
      senderId: m.sender_id,
    };
    let md = toMarkDown(message.html);
    md = compress(md);
    const container = coloring(md);

    if (container.length === 1) {
      console.log(`${chalk.bold(`${message.senderName}:`)} ${container[0]}`);
    } else {
      console.log(chalk.bold(`${message.senderName}:`));
      for (let i = 0; i < container.length; i++) {
        const c = container[i];
        console.log(`${((i + 1) === container.length) ? '`' : '|'} ${c}`);
      }
    }
  }
};

function coloring(markdown) {
  const lines = markdown.split('\n');
  const colored = [];
  let inCodeBlock = false;
  const attachments = [];
  let attachIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    /* code block */
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
        /* blockquote */
        l = replacer(l, 'blockquote');
        /* link */
        l = replacer(l, 'link');
        /* image */
        l = replacer(l, 'image');
        /* mention */
        l = replacer(l, 'mention');
        /* strong */
        l = replacer(l, 'strong');
        /* strikethrough */
        l = replacer(l, 'strikethrough');
        /* bullet list */
        l = replacer(l, 'bulletList');
        /* order list */
        l = replacer(l, 'orderList');
        /* header */
        l = replacer(l, 'header');
        a.push(l);
      }
      line = a.join('`');
      colored.push(line);
      continue;
    }

    /* blockquote */
    line = replacer(line, 'blockquote');
    /* link */
    line = replacer(line, 'link');
    /* image */
    line = replacer(line, 'image');
    /* mention */
    line = replacer(line, 'mention');
    /* strong */
    line = replacer(line, 'strong');
    /* strikethrough */
    line = replacer(line, 'strikethrough');
    /* bullet list */
    line = replacer(line, 'bulletList');
    /* order list */
    line = replacer(line, 'orderList');
    /* header */
    line = replacer(line, 'header');

    colored.push(line);
  }

  return colored.concat(attachments);

  function replacer(line, mode) {
    const modes = {
      'blockquote': {
        pattern: /^(\s*)\>\s/g,
        fn: (_, ...hit) => `${hit[0]}${chalk.bgBlackBright('>')} `
      },
      'link': {
        pattern: /[^\!]?\[([^\]]*)\]\(([a-zA-Z0-9\-\_\.\!\'\(\)\*\;\/\?\:\@\&\=\+\$\%\#\,]+)\)/g,
        fn: (_, ...hit) => {
          attachIndex++;
          const href = terminalLink('LINK', hit[1]);
          const link = `[${attachIndex}] ${href} - ${hit[0]}`;
          attachments.push(link);
          return `[${chalk.magentaBright(hit[0])}](${chalk.magentaBright(`*${attachIndex}`)})`;
        }
      },
      'image': {
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
        pattern: /\*\*@([0-9a-zA-Z\-_]+)\*\*/g,
        fn: (_, ...hit) => `${chalk.bold.yellowBright('@')}${chalk.yellowBright(hit[0])}`
      },
      'strong': {
        pattern: /\*\*([^\*]+)\*\*/g,
        fn: (_, ...hit) => `${chalk.bold.bgRedBright.white(hit[0])}`
      },
      'strikethrough': {
        pattern: /~~([^\*]+)~~/g,
        fn: (_, ...hit) => `~~${hit[0]}~~`
      },
      'bulletList': {
        pattern: /^(\s*)([\+\*])(\s+)/,
        fn: (_, ...hit) => `${hit[0]}${chalk.bold.cyan(hit[1])}${hit[2]}`
      },
      'orderList': {
        pattern: /^(\s*)(\d+\.)(\s+)/,
        fn: (_, ...hit) => `${hit[0]}${chalk.cyan(hit[1])}${hit[2]}`
      },
      'header': {
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