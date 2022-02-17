import Component from "../Component.template.js";

class Button extends Component {
  constructor($target, initialState = { text: "", type: "button" }) {
    super($target, initialState);
    this.node = document.createElement("button");
    this.render();
  }

  template() {
    const { text, type = "submit" } = this.state;
    this.node.type = type;
    return text;
  }
}

export default Button;
