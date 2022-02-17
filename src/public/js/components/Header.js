import Component from "../Component.template.js";

class Header extends Component {
  constructor($target, { initialState }) {
    super($target, initialState);
    this.node = document.createElement("header");
    this.render();
  }
  template() {
    const { title = "title" } = this.state;
    return `
    <h1>${title}</h1>
    `;
  }
}

export default Header;
