import typescript from '@rollup/plugin-typescript';
export default {
  input: "./runtime-core/index.ts",
  plugins: [typescript()],
  output: [
    {
      format: 'es',
      file: 'lib/mini-vue.esm.js'
    },
    {
      format: 'cjs',
      file: 'lib/mini-vue.cjs.js'
    },
  ]
}