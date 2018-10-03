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
    const container = parseHtml(message.html);
    if (container.length === 1) {
      console.log(`${chalk.whiteBright.bold(message.senderName)}: ${container[0]}`)
    } else {
      console.log(`${chalk.whiteBright.bold(message.senderName)}: |+`)
      for (let i = 0; i < container.length; i++) {
        const c = container[i];
        console.log(c);
      }
    }
    // console.log(message.html,container);
  }
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