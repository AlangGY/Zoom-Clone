import Component from "./Component.template.js";

const defaultState = { prefix: "", text: "", block: false };

class PrefixContent extends Component {
  constructor({ $target, initialState }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });
    this.node = document.createElement(this.state.block ? "p" : "span");
  }

  template() {
    const { prefix, text } = this.state;
    return `${prefix ?? ""}${text ?? ""}`;
  }
}

export default PrefixContent;
