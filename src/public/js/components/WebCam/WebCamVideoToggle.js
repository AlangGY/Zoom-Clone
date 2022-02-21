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
    return on
      ? "<i class='fa-solid fa-video'></i>"
      : "<i class='fa-solid fa-video-slash'></i>";
  }
}

export default WebCamVideoToggle;
