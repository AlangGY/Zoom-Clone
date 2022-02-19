import Component from "../../Component.template.js";
import Button from "../Button.js";
import Form from "../Form.js";
import Input from "../Input.js";
import FormCardTitle from "./FormCardTitle.js";

const defaultState = { title: "", placeholder: "", text: "submit", value: "" };

class FormCard extends Form {
  constructor({ $target, initialState, onSubmit }) {
    super({
      $target,
      initialState: { ...defaultState, ...initialState },
      onSubmit,
    });

    const { title, placeholder, text, value } = this.state;

    const $formCardTitle = new FormCardTitle({
      $target: this.node,
      initialState: { title },
    });
    const $input = new Input({
      $target: this.node,
      initialState: { placeholder, value, type: "text" },
      onInput: (value) => {
        this.state.value = value;
      },
    });
    const $button = new Button({
      $target: this.node,
      initialState: { text, type: "submit" },
    });

    this.children = [$formCardTitle, $input, $button];
  }
}

export default FormCard;
