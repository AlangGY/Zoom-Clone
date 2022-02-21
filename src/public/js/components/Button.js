import Component from "../Component.template.js";

const defaultState = { text: "", type: "button" };

class Button extends Component {
  constructor({ $target, initialState, onClick, className }) {
    super({
      $target,
      initialState: { ...defaultState, ...initialState },
    });
    this.node = document.createElement("button");
    this.node.classList.add("button");
    className && this.node.classList.add(className);

    this.handleClick = (e) => {
      onClick?.(e);
    };
  }

  template() {
    const { text, type } = this.state;
    this.node.type = type;
    return text;
  }

  setEvent() {
    this.node.addEventListener("click", this.handleClick);
  }
  clearEvent() {
    this.node.removeEventListener("click", this.handleClick);
  }
}

export default Button;
