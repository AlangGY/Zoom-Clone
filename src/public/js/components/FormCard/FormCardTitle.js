import Component from "../../Component.template.js";

class FormCardTitle extends Component {
  constructor($target, { initialState = { title: "title" } }) {
    super($target, initialState);
    this.node = document.createElement("h3");

    this.render();
  }

  template() {
    return this.state.title;
  }
}

export default FormCardTitle;
