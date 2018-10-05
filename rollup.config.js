import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

const entryPoint = './src/bin.js';
const destination = './bin.bundle.js';
const shebang = '#!/usr/bin/env node\n'
const text = '/* leprachaun tashiro */\n'
const banner = shebang+text;
module.exports = {
  input: entryPoint,
  output: {
    file: destination,
    format: 'cjs',
    banner,
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      main:true
    }),
    commonjs({
      include: /node_modules/,
      sourceMap: false,
      
    })
  ]
}