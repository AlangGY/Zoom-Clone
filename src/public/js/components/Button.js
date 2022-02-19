import Component from "../Component.template.js";

const defaultState = { text: "", type: "button" };

class Button extends Component {
  constructor({ $target, initialState }) {
    super({
      $target,
      initialState: { ...defaultState, ...initialState },
    });
    this.node = document.createElement("button");
  }

  template() {
    const { text, type } = this.state;
    this.node.type = type;
    return text;
  }
}

export default Button;
