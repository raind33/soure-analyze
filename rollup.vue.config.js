import typescript from '@rollup/plugin-typescript';
export default {
  input: "./runtime-core/index.ts",
  plugins: [typescript({
    include: ['./runtime-core/**/*.ts', './shared/**/*.ts', './reactivity/**/*.ts'],
    tsconfig: './tsconfig-vue.json'
  })],
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