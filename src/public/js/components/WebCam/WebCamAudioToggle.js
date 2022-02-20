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
    return on ? "오디오 끄기" : "오디오 켜기";
  }
}

export default WebCamAudioToggle;
