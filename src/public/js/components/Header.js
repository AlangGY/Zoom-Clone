import Component from "../Component.template.js";

const defaultState = { title: "title" };

class Header extends Component {
  constructor({ $target, initialState }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });

    this.node = document.createElement("header");
    this.node.classList.add("header");
  }
  template() {
    const { title } = this.state;
    return `
    <h1>${title}</h1>
    `;
  }
}

export default Header;
