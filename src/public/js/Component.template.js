class Component {
  node;
  childFragment;
  children;

  constructor($target, initialState = {}, ...children) {
    this._id = ++document.nextId;
    document.componentRegistry[this._id] = this;
    this.$target = $target;
    this.state = { ...initialState };
    if (children) {
      this.childFragment = document.createDocumentFragment();
      this.children = children.map(([ChildComponent, ...props]) =>
        new ChildComponent(this.childFragment, ...props).mount()
      );
    }
  }

  template() {
    return "";
  }

  render() {
    if (this.node instanceof DocumentFragment) {
      this.node.appendChild(this.template());
    } else if (this.node) {
      this.clearEvent();
      this.node.innerHTML = this.template();
      this.setEvent();
    }
    if (this.childFragment && this.children) {
      this.children.forEach((ChildComponentInstance) =>
        ChildComponentInstance.render()
      );
    }
    return this;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    if (this.childFragment && this.children) {
      this.children.forEach((ChildComponentInstance) =>
        ChildComponentInstance.setState(this.state)
      );
    }
    this.render();
    return this;
  }

  mount() {
    this.setEvent();
    this.node.appendChild(this.childFragment);
    this.$target.appendChild(this.node);
    return this;
  }

  unMount() {
    this.clearEvent();
    this.node.removeChild(this.childFragment);
    this.$target.removeChild(this.node);
    return this;
  }

  setEvent() {}

  clearEvent() {}
}

export default Component;
