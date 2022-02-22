import Component from "../../Component.template.js";
import Button from "../Button.js";
import Container from "../Container.js";
import Form from "../Form.js";
import Input from "../Input.js";
import FormCardTitle from "./FormCardTitle.js";

const defaultState = { title: "", placeholder: "", text: "submit", value: "" };

class FormCard extends Form {
  #formCardTitle;
  #inputContainer;
  #input;
  #button;
  constructor({ $target, initialState, onSubmit, className }) {
    super({
      $target,
      initialState: { ...defaultState, ...initialState },
      onSubmit,
    });

    this.node.classList.add("formCard");
    className && this.node.classList.add(className);

    const { title, placeholder, text, value } = this.state;

    this.#formCardTitle = new FormCardTitle({
      $target: this.node,
      initialState: { title },
    });

    this.#inputContainer = new Container({
      $target: this.node,
      className: "inputContainer",
    });

    this.#input = new Input({
      $target: this.#inputContainer.node,
      initialState: { placeholder, value, type: "text" },
      onInput: (value) => {
        this.state.value = value;
      },
    });
    this.#button = new Button({
      $target: this.#inputContainer.node,
      initialState: { text, type: "submit" },
    });

    this.children = [
      this.#formCardTitle,
      this.#inputContainer,
      this.#input,
      this.#button,
    ];

    this.handleSubmit = (e) => {
      e.preventDefault();
      onSubmit?.(this.state.value);
      this.state.value = "";
      requestAnimationFrame(() => {
        this.#input.node?.focus();
      });
    };
  }
}

export default FormCard;
