import Component from "../Component.template.js";

const defaultState = {
  autoplay: false,
  playsInline: false,
  muted: false,
  width: 100,
  height: 100,
  src: null,
  srcObject: null,
};

class Video extends Component {
  constructor({ $target, initialState }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });

    this.node = document.createElement("video");
  }

  render() {
    const { autoplay, playsInline, muted, width, height, src, srcObject } =
      this.state;
    this.node.autoplay = autoplay;
    this.node.playsInline = playsInline;
    this.node.muted = muted;
    this.node.width = width;
    this.node.height = height;
    this.node.src = src;
    this.node.srcObject = srcObject;

    this.node.style.visibility = this.state.hidden ? "hidden" : "visible";
  }
}

export default Video;
