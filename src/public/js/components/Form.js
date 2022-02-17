import Component from "../Component.template.js";

class Form extends Component {
  #children;
  #onSubmit;
  #handleSubmit = (e) => {
    e.preventDefault();
    this.#onSubmit?.(e);
  };

  constructor($target, { initialState, onSubmit }, ...children) {
    super($target, initialState);
    this.node = document.createElement("form");

    this.#children = children;
    this.#onSubmit = onSubmit;
    this.render();
  }

  render() {
    let children = this.#children;
    this.clearEvent();
    this.node.innerHTML = "";
    children.forEach(([ChildComponent, ...props]) =>
      new ChildComponent(this.node, ...props).mount()
    );
    this.setEvent();
  }

  setEvent() {
    this.node?.addEventListener("submit", this.#handleSubmit);
  }

  clearEvent() {
    this.node?.addEventListener("submit", this.#handleSubmit);
  }
}

export default Form;
