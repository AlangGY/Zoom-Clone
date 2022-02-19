import Component from "../../Component.template.js";
import Button from "../Button.js";
import Form from "../Form.js";
import Input from "../Input.js";
import FormCardTitle from "./FormCardTitle.js";

class FormCard extends Form {
  constructor({
    $target,
    initialState = {
      title: "",
      placeholder: "placeholder",
      text: "button",
      value: "",
    },
    onSubmit,
  }) {
    const { title, placeholder, text, value } = initialState;

    super({ $target, initialState, onSubmit });

    const $formCardTitle = new FormCardTitle({
      $target: this.node,
      initialState: { title },
    });
    const $input = new Input({
      $target: this.node,
      initialState: { placeholder, value, type: "text" },
      onInput: (value) => {
        this.setState({ value });
      },
    });
    const $button = new Button({
      $target: this.node,
      initialState: { text },
    });

    this.children = [$formCardTitle, $input, $button];
  }
}

export default FormCard;
