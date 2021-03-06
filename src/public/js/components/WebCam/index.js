import Component from "../../Component.template.js";
import VideoToggle from "./WebCamVideoToggle.js";
import AudioToggle from "./WebCamAudioToggle.js";
import Video from "./WebCamVideo.js";
import Select from "./WebCamSelect.js";
import isMobile from "../../util/validator/isMobile.js";
import Container from "../Container.js";

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
  #controlContainer;
  #videoToggle;
  #audioToggle;
  #select;
  #getMedia;
  #getCamera;
  #isMobile = isMobile();

  constructor({
    $target,
    initialState,
    onChangeStream,
    onAudioToggled,
    onVideoToggled,
  }) {
    super({
      $target,
      initialState: {
        ...defaultState,
        ...initialState,
      },
    });
    this.node = document.createElement("div");
    this.node.classList.add("webcam");

    const $component = this;

    this.#video = new WebCamComps.Video({
      $target: this.node,
      initialState: {
        width: this.state.width,
        height: this.state.height,
        srcObject: this.state.srcObject,
      },
    });

    this.#controlContainer = new Container({
      $target: this.node,
      className: "controlContainer",
    });

    this.#videoToggle = new WebCamComps.VideoToggle({
      $target: this.#controlContainer.node,
      initialState: {
        on: this.state.on,
      },
      onClick: () => {
        $component.state.on = !$component.state.on;
        onVideoToggled?.($component.state.on);
      },
    });

    this.#audioToggle = new WebCamComps.AudioToggle({
      $target: this.#controlContainer.node,
      initialState: {
        on: !this.state.muted,
      },
      onClick: () => {
        $component.state.muted = !$component.state.muted;
        onAudioToggled?.($component.state.muted);
      },
    });

    this.#select = new WebCamComps.Select({
      $target: this.#controlContainer.node,
      initialState: {},
      onChange: (value) => {
        $component.state.selectedVideoId = value;
        $component.#getCamera();
      },
    });

    this.children = [
      this.#video,
      this.#controlContainer,
      this.#videoToggle,
      this.#audioToggle,
      this.#select,
    ];

    this.#getMedia = async () => {
      try {
        // Mobile Device
        if (this.#isMobile) {
          const options = [
            { value: "user", text: "??????" },
            { value: "environment", text: "??????" },
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
        const stream = new MediaStream();

        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: this.#isMobile
            ? { facingMode: selectedVideoId }
            : { deviceId: selectedVideoId },
        });
        userMediaStream.getTracks().forEach((track) => {
          stream.addTrack(track);
        });
        this.state.srcObject = stream;
        onChangeStream?.({ stream, muted, on });
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
