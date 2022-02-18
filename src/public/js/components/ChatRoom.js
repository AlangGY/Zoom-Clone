import Component from "../Component.template.js";

const defaultState = { chats: [] };

class ChatRoom extends Component {
  constructor({ $target, initialState }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });

    this.node = document.createElement("div");
  }

  template() {
    const { chats } = this.state;
    return `
      <h4>채팅창</h4>
      <ul>
        ${chats
          .map((chat) => {
            return `<li>${chat}</li>`;
          })
          .join("")}
      </ul>
    `;
  }
}

export default ChatRoom;
