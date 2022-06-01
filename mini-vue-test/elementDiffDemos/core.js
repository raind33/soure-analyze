import { h, ref } from "../../lib/mini-vue.esm.js";
// 新节点 a b  c d e f g  老节点 a b  e c l  f g
const prevChildren = [
  h("div", { key: "A" }, "A"),
  h("div", { key: "B" }, "B"),
  h("div", { key: "E" }, "E"),
  h("div", { key: "C" }, "C"),
  h("div", { key: "D" }, "D"),
  h("div", { key: "L" }, "L"),
  h("div", { key: "F" }, "F"),
  h("div", { key: "G" }, "G"),
];

const nextChildren = [
  h("div", { key: "A" }, "A"),
  h("div", { class: "b", key: "B" }, "B"),
  h("div", { key: "C", class:'c' }, "C"),
  h("div", { key: "D", class:'d' }, "D"),
  h("div", { key: "E" }, "E"),
  h("div", { key: "F" }, "F"),
  h("div", { key: "G" }, "G"),
];
export default {
  name: "Son",
  setup(props, { emit }) {
    const change = ref(false);
    window.change = change;
    return {
      change,
    };
  },
  render() {
    return this.change
      ? h("div", null, nextChildren)
      : h("div", null, prevChildren);
  },
};
