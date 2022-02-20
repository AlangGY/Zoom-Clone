import Button from "../Button.js";

const defaultState = { on: false };

class WebCamVideoToggle extends Button {
  constructor({ $target, initialState, onClick }) {
    super({
      $target,
      initialState: { type: "button", ...defaultState, ...initialState },
      onClick,
    });
  }

  template() {
    const { on } = this.state;
    return on ? "카메라 끄기" : "카메라 켜기";
  }
}

export default WebCamVideoToggle;
