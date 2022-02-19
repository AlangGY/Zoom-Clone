import Component from "../Component.template.js";

class Form extends Component {
  constructor({ $target, initialState, onSubmit, children }) {
    super({ $target, initialState, children });
    this.node = document.createElement("form");

    this.handleSubmit = (e) => {
      e.preventDefault();
      onSubmit?.(this.state.value);
    };
  }

  setEvent() {
    this.node?.addEventListener("submit", this.handleSubmit);
  }

  clearEvent() {
    this.node?.addEventListener("submit", this.handleSubmit);
  }
}

export default Form;
