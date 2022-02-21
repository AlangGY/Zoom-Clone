import Component from "../Component.template.js";

class Container extends Component {
  constructor({ $target, className }) {
    super({ $target });

    this.node = document.createElement("div");
    this.node.classList.add(className);
  }
}

export default Container;
