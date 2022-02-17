class Component {
  node;

  constructor($target, initialState = {}) {
    this._id = ++document.nextId;
    document.componentRegistry[this._id] = this;
    this.$target = $target;
    this.state = { ...initialState };
  }

  template() {
    return "";
  }

  render() {
    console.log("render!");
    this.clearEvent();
    if (this.node) this.node.innerHTML = this.template();
    this.setEvent();
    return this;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
    return this;
  }

  mount() {
    this.$target.appendChild(this.node);
    return this;
  }

  unMount() {
    this.$target.removeChild(this.node);
    return this;
  }

  setEvent() {}

  clearEvent() {}
}

export default Component;
