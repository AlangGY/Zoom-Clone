import Component from "../../Component.template.js";
import VideoToggle from "./WebCamVideoToggle.js";
import AudioToggle from "./WebCamAudioToggle.js";
import Video from "./WebCamVideo.js";
import Select from "./WebCamSelect.js";

const WebCamComps = { Video, VideoToggle, AudioToggle, Select };

const defaultState = {
  on: false,
  muted: false,
  srcObject: null,
  options: [],
  selectedVideoId: null,
  width: 200,
  height: 200,
};

class WebCam extends Component {
  #video;
  #videoToggle;
  #audioToggle;
  #select;
  #getMedia;
  #getCamera;

  constructor({ $target, initialState }) {
    super({
      $target,
      initialState: {
        ...defaultState,
        ...initialState,
      },
    });
    this.node = document.createElement("div");
    this.node.className = "webcam";

    const $component = this;

    this.#video = new WebCamComps.Video({
      $target: this.node,
      initialState: {
        width: this.state.width,
        height: this.state.height,
        srcObject: this.state.srcObject,
      },
    });

    this.#videoToggle = new WebCamComps.VideoToggle({
      $target: this.node,
      initialState: {
        on: this.state.on,
      },
      onClick: () => {
        $component.state.on = !$component.state.on;
        if ($component.state.on) {
          $component.#getCamera();
        } else {
          $component.state.srcObject = null;
        }
      },
    });

    this.#audioToggle = new WebCamComps.AudioToggle({
      $target: this.node,
      initialState: {
        on: !this.state.muted,
      },
      onClick: () => {
        $component.state.muted = !$component.state.muted;
      },
    });

    this.#select = new WebCamComps.Select({
      $target: this.node,
      initialState: {},
      onChange: (value) => {
        $component.state.selectedVideoId = value;
        $component.#getCamera();
      },
    });

    this.children = [
      this.#video,
      this.#videoToggle,
      this.#select,
      this.#audioToggle,
    ];

    this.#getMedia = async () => {
      try {
        const options = await navigator.mediaDevices
          .enumerateDevices()
          .then((tracks) =>
            tracks
              .filter(({ kind }) => kind === "videoinput")
              .map(({ deviceId, label }) => ({ value: deviceId, text: label }))
          );

        this.state.options = options;
        if (options.length) {
          this.state.selectedVideoId = options[0].value;
        }
      } catch (err) {
        console.error(err);
      }
    };

    this.#getCamera = async () => {
      try {
        const selectedVideoId = this.state.selectedVideoId;
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: selectedVideoId
            ? { deviceId: this.state.selectedVideoId }
            : true,
        });
        this.state.srcObject = stream;
      } catch (e) {
        alert(e);
      }
    };
  }

  setChildrenState(newState) {
    const { on, muted, srcObject, options, selectedVideoId, width, height } =
      newState;
    this.#video.state.state = { width, height, srcObject, muted };
    this.#videoToggle.state.on = on;
    this.#audioToggle.state.on = !muted;
    this.#select.state.state = {
      options,
      selectedIndex: options.findIndex(
        ({ value }) => selectedVideoId === value
      ),
    };

    return this;
  }

  setEvent() {
    this.#getMedia();
    this.#getCamera();
  }
}

export default WebCam;
