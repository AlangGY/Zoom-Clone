import Component from "../Component.template.js";

const defaultState = {
  placeholder: "",
  value: "",
  type: "text",
  required: false,
};

class Input extends Component {
  constructor({ $target, initialState, onInput }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });
    this.node = document.createElement("input");

    // event Handler
    this.handleInput = (e) => {
      const value = e.target.value;
      onInput?.(value);
    };
  }

  render() {
    const { placeholder, value, type, required } = this.state;
    this.node.type = type;
    this.node.placeholder = placeholder;
    this.node.value = value;
    this.node.required = required;
    return this;
  }

  setEvent() {
    this.node.addEventListener("input", this.handleInput);
  }

  clearEvent() {
    this.node?.removeEventListener("input", this.handleInput);
  }
}

export default Input;
