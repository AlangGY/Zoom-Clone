import Component from "../Component.template.js";

class Input extends Component {
  #onInput;
  #handleInput = (e) => {
    const value = e.target.value;
    this.setState({ value });
    this.#onInput?.(value);
    this.clearEvent();
  };

  constructor(
    $target,
    { initialState = { placeholder: "", value: "", type: "text" }, onInput }
  ) {
    super($target, initialState);
    this.node = document.createDocumentFragment();
    this.#onInput = onInput;
    this.render();
  }

  template() {
    const { placeholder, value = "", type = "text" } = this.state;
    const $input = document.createElement("input");
    $input.type = type;
    $input.placeholder = placeholder;
    $input.value = value;
    return $input;
  }

  setEvent() {
    this.node
      .querySelector("input")
      .addEventListener("input", this.#handleInput);
  }

  clearEvent() {
    this.node
      .querySelector("input")
      ?.removeEventListener("input", this.#handleInput);
  }
}

export default Input;
