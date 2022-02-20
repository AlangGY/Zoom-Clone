import Component from "../Component.template.js";

const defaultState = { options: [], selectedValue: null };

class Select extends Component {
  #handleChange;

  constructor({ $target, initialState, onChange }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });

    this.node = document.createElement("select");

    this.#handleChange = (e) => {
      const selectedIndex = e.target.options.selectedIndex;
      onChange?.(e.target.options[selectedIndex].value);
    };
  }

  template() {
    const { options, selectedIndex } = this.state;
    return `
    ${options
      .map(
        ({ value, text }, index) =>
          `<option ${
            selectedIndex === index ? "selected" : ""
          } value="${value}">${text}</option>`
      )
      .join("")}
    `;
  }

  setEvent() {
    this.node.addEventListener("change", this.#handleChange);
  }

  clearEvent() {
    this.node.removeEventListener("change", this.#handleChange);
  }
}

export default Select;
