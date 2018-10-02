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
    const tree = parseHtml(message.html);
    console.log(chalk.whiteBright.bold(message.senderName), `: ${message.html}`)
  }
}

function parseHtml(htmlWithNewLine) {
  const {
    parse
  } = require('node-html-parser');
  const removedNewLines = htmlWithNewLine.replace('\n', '');
  const root = parse(removedNewLines,{pre:true});
  recursiveRender(root)
  // console.log('>>>', root.childNodes);
  // console.log('structuredText',root.structuredText);
}

function recursiveRender(node, parentType = null) {
  const {
    nodeType,
    tagName,
  } = node;
  let type = ((nodeType, tagName) => {
    const TEXT_NODE = 3;
    if (nodeType === TEXT_NODE) {
      return 'TEXT';
    }

    if (tagName === 'pre') {
      return 'PRE'
    }

    if (tagName === 'code') {
      return 'CODE'
    }

    return 'etc'
  })(nodeType,tagName)
  switch (type) {
    case 'TEXT':
      {
        console.log('innerText', node.text);
        break;
      }
    case 'CODE':
      {
        if (parentType === 'PRE') {
          console.log('code block', node.text);
        } else {
          console.log('inline code block', node.text);
        }
        break;
      }
    case 'PRE':
    default:
      {
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          recursiveRender(child, type);
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