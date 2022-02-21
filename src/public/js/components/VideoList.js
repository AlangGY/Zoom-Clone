import Component from "../Component.template.js";

const defaultState = { videos: [] };

class VideoList extends Component {
  constructor({ $target, initialState }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });

    this.node = document.createElement("div");
    this.node.classList.add("videoList");
  }

  template() {
    const { videos } = this.state;
    return `
    <h3>Videos</h3>
    <ul>
      ${videos
        .map(
          ({ width, height }) => `
          <li>
            <video autoplay playsinline width="${width}" height="${height}" />
          </li>
          `
        )
        .join("")}
    </ul>
      `;
  }

  render() {
    const { videos } = this.state;
    this.node.innerHTML = this.template();
    const $videos = this.node.querySelectorAll("video");
    $videos.forEach(($video, index) => {
      $video.srcObject = videos[index].srcObject;
    });
  }
}

export default VideoList;
