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
const TurnDown = require('turndown')
const terminalLink = require('terminal-link');

const listHandler = async (argv) => {
  const config = await readConfig();
  const {
    current
  } = config;

  if (!current) {
    console.log('NO current channel FOUND.');
    return false;
  }

  const uri = current.links.messages;
  const {
    messages
  } = await apiCall(uri);

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const message = {
      id: m.id,
      senderName: m.sender_name,
      senderIconUrl: m.sender_icon_url,
      createdAt: m.created_at,
      html: m.body,
      senderId: m.sender_id,
    }
    let md = toMarkDown(message.html);
    md = compress(md);
    const container = coloring(md);

    if (container.length === 1) {
      console.log(`${chalk.bold(`${message.senderName}:`)} ${container[0]}`)
    } else {
      console.log(chalk.bold(`${message.senderName}:`))
      for (let i = 0; i < container.length; i++) {
        const c = container[i];
        console.log(`${((i + 1) === container.length) ? '`' : '|'} ${c}`);
      }
    }
  }
}

function coloring(markdown) {
  const lines = markdown.split('\n');
  const colored = [];
  let inCodeBlock = false;
  const attachments = [];
  let attachIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    /* code block check */
    if (line === '```') {
      inCodeBlock = !inCodeBlock;
      colored.push(inCodeBlock ? chalk.bgBlackBright(line) : '');
      continue;
    }
    /* code block */
    if (inCodeBlock) {
      colored.push(chalk.bgBlackBright(`   ${line}`));
      continue;
    }

    /* inline code */
    line = line.replace('\\`', '__BACK_QUOTE');
    if (line.indexOf('`') !== -1 && line.indexOf('`') !== line.lastIndexOf('`')) {
      const lines = line.split('`')
      const a = [];
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        a.push((i % 2 === 0) ? l : chalk.bgBlackBright(l))
      }
      line = a.join('`');
    }
    line = line.replace('__BACK_QUOTE', '\\`')

    /* blockquote */
    line = line.replace(/^(\s*)\>\s/g, (_, ...hit) => {
      return `${hit[0]}${chalk.bgBlackBright('>')} `
    })

    /* link */
    const linkPattern = /(?<!\!)\[([^\]]*)\]\(([a-zA-Z0-9\-\_\.\!\'\(\)\*\;\/\?\:\@\&\=\+\$\%\#\,]+)\)/g
    line = line.replace(linkPattern, (_, ...hit) => {
      attachIndex++;
      const href = terminalLink('LINK', hit[1]);
      const link = `[${attachIndex}] ${href} - ${hit[0]}`;
      attachments.push(link);
      return `[${chalk.magentaBright(hit[0])}](${chalk.magentaBright(`*${attachIndex}`)})`
    })

    /* image */
    const imagePattern = /\!\[([^\]]*)\]\(([a-zA-Z0-9\-\_\.\!\'\(\)\*\;\/\?\:\@\&\=\+\$\%\#\,]+)\)/g
    line = line.replace(imagePattern, (_, ...hit) => {
      attachIndex++;
      const src = terminalLink('IMAGE', hit[1]);
      const img = `[${attachIndex}] ${src}`;
      attachments.push(img);
      return `[${chalk.cyanBright(hit[0] || 'IMAGE')}](${chalk.cyanBright(`*${attachIndex}`)})`
    })

    /* mention */
    line = line.replace(/@([0-9a-zA-Z\-_]+)/g, (_, ...hit) => {
      return `${chalk.bold.yellowBright('@')}${chalk.yellowBright(hit[0])}`
    })

    /* bullet list */
    line = line.replace(/^(\s*)([\+\*])(\s+)/, (_, ...hit) => {
      return `${hit[0]}${chalk.bold.cyan(hit[1])}${hit[2]}`
    })
    /* order list */
    line = line.replace(/^(\s*)(\d+\.)(\s+)/, (_, ...hit) => {
      return `${hit[0]}${chalk.cyan(hit[1])}${hit[2]}`
    })
    /* header */
    line = line.replace(/^(#+)/, (_, ...hit) => {
      return `${chalk.magentaBright(hit[0])}`
    })
    colored.push(line);
  }
  return colored.concat(attachments);
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
  return compressed.join('\n')
}

function toMarkDown(html) {
  const td = new TurnDown({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '+'
  });
  td.keep(['pre', 'code']);
  const markdown = td.turndown(html);
  return markdown
}

exports.listHandler = listHandler;