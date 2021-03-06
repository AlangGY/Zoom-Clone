import Component from "../Component.template.js";

const defaultState = { prefix: "", text: "", block: false };

class PrefixContent extends Component {
  constructor({ $target, initialState, className }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });

    this.node = document.createElement(this.state.block ? "p" : "span");
    this.node.classList.add("prefixContent");
    className && this.node.classList.add(className);
  }

  template() {
    const { prefix, text } = this.state;
    return `${prefix ?? ""}${text ?? ""}`;
  }
}

export default PrefixContent;
