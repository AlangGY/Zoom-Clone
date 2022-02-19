import Component from "../../Component.template.js";

const defaultState = { title: "title" };

class FormCardTitle extends Component {
  constructor({ $target, initialState }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });
    this.node = document.createElement("h3");
  }

  template() {
    return this.state.title;
  }
}

export default FormCardTitle;
