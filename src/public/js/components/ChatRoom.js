import Component from "../Component.template.js";
import FormCard from "./FormCard/index.js";

const defaultState = { chats: [] };

class ChatRoom extends Component {
  #form;
  constructor({ $target, initialState, onSubmit }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });
    this.node = document.createElement("div");
    this.node.classList.add("chatRoom");

    this.#form = new FormCard({
      $target: this.node,
      initialState: {
        title: "",
        placeholder: "채팅 메시지를 입력하세요",
        text: "전송",
      },
      onSubmit,
      className: "chat",
    });

    this.children = [this.#form];
  }

  template() {
    const { chats } = this.state;
    return `
      <h4>채팅창</h4>
      <ul>
        ${chats
          ?.map((chat) => {
            return `<li>${chat}</li>`;
          })
          .join("")}
      </ul>
    `;
  }
}

export default ChatRoom;
