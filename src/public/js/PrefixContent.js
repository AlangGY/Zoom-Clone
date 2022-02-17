import Component from "./Component.template.js";

class PrefixContent extends Component {
  constructor($target, initialState = { prefix: "", text: "", block: false }) {
    super($target, initialState);
    this.node = document.createElement(this.state.block ? "p" : "span");
    this.render();
  }

  template() {
    const { prefix, text } = this.state;
    return `${prefix ?? ""}${text ?? ""}`;
  }
}

export default PrefixContent;
