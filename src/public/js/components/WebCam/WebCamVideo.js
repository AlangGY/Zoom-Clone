import Video from "../Video.js";

const defaultState = { width: 200, height: 200, srcObject: null };

class WebCamVideo extends Video {
  constructor({ $target, initialState }) {
    super({
      $target,
      initialState: {
        autoplay: true,
        playsInline: true,
        muted: false,
        ...defaultState,
        ...initialState,
      },
    });
  }
}

export default WebCamVideo;
