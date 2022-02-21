import Component from "../../Component.template.js";
import VideoToggle from "./WebCamVideoToggle.js";
import AudioToggle from "./WebCamAudioToggle.js";
import Video from "./WebCamVideo.js";
import Select from "./WebCamSelect.js";
import isMobile from "../../util/validator/isMobile.js";

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
  #isMobile = isMobile();

  constructor({ $target, initialState, onChangeStream }) {
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
        $component.#getCamera();
      },
    });

    this.#audioToggle = new WebCamComps.AudioToggle({
      $target: this.node,
      initialState: {
        on: !this.state.muted,
      },
      onClick: () => {
        $component.state.muted = !$component.state.muted;
        $component.#getCamera();
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
        // Mobile Device
        if (this.#isMobile) {
          const options = [
            { value: "user", text: "전면" },
            { value: "environment", text: "후면" },
          ];
          this.state.options = options;
          this.state.state = { options, selectedVideoId: options[0].value };
          return;
        }
        // DeskTop Device
        const options = await navigator.mediaDevices
          .enumerateDevices()
          .then((tracks) => {
            return tracks
              .filter(({ kind }) => kind === "videoinput")
              .map(({ deviceId, label }) => ({ value: deviceId, text: label }));
          });

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
        const { selectedVideoId, muted, on } = this.state;
        if (muted && !on) {
          const emptyStream = new MediaStream();
          this.state.srcObject = emptyStream;
          const tracks = emptyStream.getTracks();
          onChangeStream?.({ stream: emptyStream, tracks });
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: !muted,
          video: on
            ? this.#isMobile
              ? { facingMode: selectedVideoId }
              : { deviceId: selectedVideoId }
            : false,
        });
        this.state.srcObject = stream;
        const tracks = stream.getTracks();
        onChangeStream?.({ stream, tracks });
      } catch (e) {
        console.error(e);
      }
    };
  }

  setChildrenState(newState) {
    const { on, muted, srcObject, options, selectedVideoId, width, height } =
      newState;
    this.#video.state.state = { width, height, srcObject };
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
