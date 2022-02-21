import Component from "../../Component.template.js";
import Button from "../Button.js";
import Container from "../Container.js";
import Form from "../Form.js";
import Input from "../Input.js";
import FormCardTitle from "./FormCardTitle.js";

const defaultState = { title: "", placeholder: "", text: "submit", value: "" };

class FormCard extends Form {
  constructor({ $target, initialState, onSubmit, className }) {
    super({
      $target,
      initialState: { ...defaultState, ...initialState },
      onSubmit,
    });

    this.node.classList.add("formCard");
    className && this.node.classList.add(className);

    const { title, placeholder, text, value } = this.state;

    const $formCardTitle = new FormCardTitle({
      $target: this.node,
      initialState: { title },
    });

    const $inputContainer = new Container({
      $target: this.node,
      className: "inputContainer",
    });

    const $input = new Input({
      $target: $inputContainer.node,
      initialState: { placeholder, value, type: "text" },
      onInput: (value) => {
        this.state.value = value;
      },
    });
    const $button = new Button({
      $target: $inputContainer.node,
      initialState: { text, type: "submit" },
    });

    this.children = [$formCardTitle, $inputContainer, $input, $button];

    this.handleSubmit = (e) => {
      e.preventDefault();
      onSubmit?.(this.state.value);
      requestAnimationFrame(() => {
        $input.node?.focus();
      });
    };
  }
}

export default FormCard;
