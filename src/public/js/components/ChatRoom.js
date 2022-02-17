import Component from "../Component.template.js";

class ChatRoom extends Component {
  constructor($target, { initialState = { chats: [] } }) {
    super($target, initialState);

    this.node = document.createElement("div");
    this.render();
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
