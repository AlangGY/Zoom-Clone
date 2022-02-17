import Component from "../Component.template.js";

class Form extends Component {
  constructor($target, { initialState, onSubmit }, ...children) {
    super($target, initialState, ...children);
    this.node = document.createElement("form");

    this.handleSubmit = (e) => {
      e.preventDefault();
      onSubmit?.(e);
    };
    this.render();
  }

  // render() {
  //   this.children.forEach((ChildComponentInstance) => {
  //     ChildComponentInstance.render();
  //   });
  //   return this;
  // }

  setEvent() {
    this.node?.addEventListener("submit", this.handleSubmit);
  }

  clearEvent() {
    this.node?.addEventListener("submit", this.handleSubmit);
  }
}

export default Form;
