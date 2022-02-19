import { validateComponent } from "./util/validator/validateComponent.js";

class Component {
  _id;
  _$target;
  state;
  node;
  children;
  isInit;

  constructor({ $target, initialState = {}, children }) {
    if (!validateComponent($target, initialState)) {
      throw new Error("Component validate Failed!");
    }
    // 컴포넌트 트리 생성
    this._id = ++document.nextId;
    if ($target === document.querySelector("#app")) {
      document.componentRegistry[this._id] = this;
    }
    const $component = this;
    this.$target = $target;
    this.state = new Proxy(
      // 추적할 대상 객체가 된다. state 프로퍼티의 value로 initialState를 할당한다.
      { state: { ...initialState } },
      {
        // state 가 아닌 다른 키값을 조회할경우, proxy.state 프로퍼티 객체의 key:value를 반환한다.
        // 이를 통해 this.state.state.id 조회를 this.state.id 와 같은 직관적인 형태로 참조가 가능하다.
        get(proxy, key) {
          if (key !== "state") return proxy.state[key];
          return proxy.state;
        },
        // 대상 객체의 프로퍼티를 변경시, 이를 인터셉트하여 state 프로퍼티에 값을 담은 후, render() 메소드와 child 가 있다면 setChildrenState를 호출한다.
        // getter와 마찬가지로 직간적인 형태로 상태값을 변경하기위해, key !== state 인경우, stateProxy.state[key] 에 값을 할당한다.
        // 이를 통해, this.state.state.id = "id"와 같은 값 할당을, this.state.id = "id"와 같은 직관적인 형태로 할당이 가능하다.
        // 복수의 상태값을 변경하려면, this.state.state 에 객체를 할당한다.
        set(proxy, key, value) {
          if (key === "state") {
            // state 프로퍼티에는 반드시 객체를 할당한다.
            if (value.constructor.name !== "Object") {
              throw new Error("상태값이 객체가 아닙니다! 객체를 할당해주세요.");
            }
            proxy.state = { ...proxy.state, ...value };
          } else {
            // proxy[key] 대신 proxy.state[key] 에 값을 할당한다.
            proxy.state[key] = value;
          }
          // child가 있으면 setChildrenState를 호출한다.
          $component.children && $component.setChildrenState(proxy.state);
          // 할당이 끝난후 render 메소드를 호출한다.
          $component.render();
          return true;
        },
      }
    );
    this.children = children;
  }

  template() {
    return "";
  }

  render() {
    const template = this.template();
    const hasChild = !!this.children;
    // 만약 template이 존재하지 않으면, render 할 필요가 없다. (child의 경우는 proxy의 setter로 인해 각자의 render 메서드가 호출된다.)
    if (!template) return;

    // innerHTML이 수정되므로, 그 이전에 부착되어있던 children 들을 unMount 시킨다.
    hasChild && this.children.map((ChildComponent) => ChildComponent.unMount());
    if (this.node) {
      this.clearEvent();
      this.node.innerHTML = template;
      this.setEvent();
    }
    // innerHTML 갱신이 완료된후, children 들을 mount 시킨다.
    hasChild && this.children.map((ChildComponent) => ChildComponent.mount());
  }

  setChildrenState(newState) {
    // newState 를 순회하며, 각 children이 사용하는 상태만 골라서 setState한다.
    // 상태값을 custom 하게 변경하려면, 상속받은 컴포넌트 클래스에서 setChildrenState overRide 하여 작성해야한다.
    this.children?.forEach((ChildComponent) => {
      const newChildState = Object.entries(newState)
        .filter(([key]) => ChildComponent.state.state.hasOwnProperty(key))
        .reduce((newObject, [key, value]) => {
          newObject[key] = value;
          return newObject;
        }, {});
      ChildComponent.state.state = newChildState;
    });
    return this;
  }

  mount() {
    this.children?.forEach((ChildComponent) => ChildComponent.mount());
    this.setEvent();
    this.render();
    if (this.node) {
      this.$target.appendChild(this.node);
    } else {
      this.node = this.$target;
    }
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
