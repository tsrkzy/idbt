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


  const list = [];
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
        console.log(`| ${c}`);
      }
    }
  }
}

function coloring(markdown) {
  const lines = markdown.split('\n');
  const colored = [];
  let inCodeBlock = false;
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

    /* bullet */
    line = line.replace(/^(\s*)([\+\*])(\s+)/, (_, ...hit) => {
      return `${hit[0]}${chalk.cyan(hit[1])}${hit[2]}`
    })
    /* bullet */
    line = line.replace(/^(\s*)(\d+\.)(\s+)/, (_, ...hit) => {
      return `${hit[0]}${chalk.cyan(hit[1])}${hit[2]}`
    })
    /* header */
    line = line.replace(/^(#+)(\s+.*)$/, (_, ...hit) => {
      return `${chalk.magentaBright(hit[0])}${hit[1]}`
    })
    colored.push(line);
  }
  return colored;
}
// ![](https://idobata.s3.amazonaws.com/uploads/attachment/image/1020192/023ed8fa-6f01-45af-876d-4c20e71e8887/8D6A7FE7-DB3E-4BD3-A600-12EAD592AC8E.jpeg)
// [MtGArenaのオープンβ](https://magic.wizards.com/en/mtgarena)

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
  // html = html.replace(/\n/g, '');
  const td = new TurnDown({
    codeBlockStyle: 'fenced',
    bulletListMarker: '+'
  });
  td.keep(['pre', 'code']);
  const markdown = td.turndown(html);
  return markdown
}


function parseHtml(htmlWithNewLine) {
  const {
    parse
  } = require('node-html-parser');
  const root = parse(htmlWithNewLine, {
    pre: true
  });
  // console.log(root.structure);
  const container = [];
  recursiveRender(root, container, 0)
  return container
}

function recursiveRender(node, container, index, parentType = null) {
  const {
    nodeType,
    tagName,
    text,
    childNodes,
  } = node;
  // console.log(nodeType, tagName, text);

  let type = ((nodeType, tagName) => {
    const TEXT_NODE = 3;
    if (nodeType === TEXT_NODE && parentType === 'CODE') {
      return 'INLINE_CODE';
    }

    if (nodeType === TEXT_NODE) {
      return 'TEXT';
    }

    if (tagName === 'pre') {
      return 'CODE_BLOCK'
    }

    if (tagName === 'ul') {
      return 'LIST_WRAPPER'
    }

    if (tagName === 'li') {
      return 'BULLET'
    }

    if (tagName === 'code') {
      return 'CODE'
    }

    return 'etc'
  })(nodeType, tagName);

  switch (type) {
    case 'TEXT':
      {
        if (parentType === 'LIST_WRAPPER' || parentType === 'BULLET') {
          break;
        }
        // console.log(`innerText:${text}`);
        const t = text.replace('\n', '')
        if (t === '') {
          break;
        }
        container.push(t);
        break;
      }
    case 'INLINE_CODE':
      {
        // console.log(chalk.bgBlackBright(text));
        const t = text.replace('\n', '')
        container.push(chalk.bgBlackBright(t))
        break;
      }
    case 'CODE_BLOCK':
      {
        let t = text.replace(/^\<code\>/, '')
        t = t.replace(/\n*\<\/code\>$/, '')
        // console.log(chalk.bgBlackBright(t));
        container.push(chalk.bgBlackBright(t));
        break;
      }
    case 'BULLET':
      {

        let t = text
        if (index <= 1) {
          t = t.replace(/^\n/, '');
        }
        t = t.replace(/\n/g, '\n   ');
        t = `${chalk.cyan(' +')} ${t}`
        container.push(t)
        break;
      }
    case 'LIST_WRAPPER':
    default:
      {
        const children = childNodes;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          recursiveRender(child, container, i, type);
        }
      }
  }
}

// k_tashiro : <p><code>this is test</code></p>
// k_tashiro : <pre><code>this is test
// aaa
// </code></pre>

// let a = {
//   id: 28221086,
//   senderName: 'r-shiroeda-ohyoi',
//   senderIconUrl: 'https://idobata.s3.amazonaws.com/uploads/user/icon/6865/asdasd.png',
//   createdAt: '2018-10-02T12:18:04.156Z',
//   html: '<h2>今日の赤坂見附</h2>\n<ul>\n<li>二日目にしてこの時間に退勤</li>\n</ul>\n<p>もりもりさんと赤坂見附で普通に遭遇</p>',
//   senderId: 6865
// }


exports.listHandler = listHandler;