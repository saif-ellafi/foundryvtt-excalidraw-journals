import css from 'rollup-plugin-css-porter';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/excalidraw-journals.js',
    output: {
        file: 'dist/excalidraw-journals.js',
        format: 'cjs'
    },
    plugins: [
      css({
        raw: 'dist/styles.css',
        minified: false,
      }),
      nodeResolve(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify( 'development' )
      })
    ]
};