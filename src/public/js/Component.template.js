class Component {
  _id;
  _$target;
  state;
  node;
  children;

  constructor({ $target, initialState = {} }) {
    this._id = ++document.nextId;
    document.componentRegistry[this._id] = this;
    this.$target = $target;
    this.state = { ...initialState };
  }

  template() {
    return "";
  }

  render() {
    const template = this.template();
    if (this.node && template) {
      this.clearEvent();
      this.node.innerHTML = template;
      this.setEvent();
    }
    this.children?.forEach((ChildComponent) => ChildComponent.render());
    return this;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    // this.state 를 순회하며, 각 children이 사용하는 상태만 골라서 setState한다.
    this.children?.forEach((ChildComponent) => {
      const newChildState = Object.entries(this.state)
        .filter(([key]) => ChildComponent.state.hasOwnProperty(key))
        .reduce((newObject, [key, value]) => (newObject[key] = value), {});
      ChildComponent.setState(newChildState);
    });
    this.render();
    return this;
  }

  mount() {
    this.setEvent();
    this.children?.forEach((ChildComponent) => ChildComponent.mount());
    this.render();
    this.$target.appendChild(this.node);
    return this;
  }

  unMount() {
    this.clearEvent();
    this.$target.removeChild(this.node);
    return this;
  }

  setEvent() {}

  clearEvent() {}
}

export default Component;
