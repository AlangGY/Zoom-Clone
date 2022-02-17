import Component from "../../Component.template.js";
import Button from "../Button.js";
import Form from "../Form.js";
import Input from "../Input.js";
import FormCardTitle from "./FormCardTitle.js";

class FormCard extends Form {
  constructor(
    $target,
    {
      initialState = {
        title: "",
        placeholder: "placeholder",
        buttonText: "button",
        value: "",
      },
      onSubmit,
    }
  ) {
    const { title, placeholder, buttonText, value } = initialState;
    super(
      $target,
      { initialState, onSubmit },
      [FormCardTitle, { initialState: { title } }],
      [
        Input,
        {
          initialState: { placeholder, value, type: "text" },
          onInput: (value) => {
            this.setState({ value });
          },
        },
      ],
      [
        Button,
        {
          initialState: { text: buttonText },
        },
      ]
    );

    this.handleSubmit = (e) => {
      e.preventDefault();
      onSubmit?.(this.state.value);
    };
  }

  setState(nextState) {
    this.state = { ...this.state, ...nextState };
    const { title, placeholder, buttonText, value } = this.state;
    const [$formCardTitle, $input, $button] = this.children;
    $formCardTitle.setState({ title });
    $input.setState({ value, placeholder });
    $button.setState({ text: buttonText });
  }
}

export default FormCard;
