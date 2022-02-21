import Button from "../Button.js";

const defaultState = { on: false };

class WebCamAudioToggle extends Button {
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
      ? "<i class='fa-solid fa-microphone-lines'></i>"
      : "<i class='fa-solid fa-microphone-lines-slash'></i>";
  }
}

export default WebCamAudioToggle;
