import Component from "../../Component.template.js";

class RoomList extends Component {
  constructor($target, { initialState = { rooms, currentRoom }, onClickRoom }) {
    super($target, initialState);

    this.node = document.createElement("div");
    this.render();

    this.handleClick = (e) => {
      const { target } = e;
      const { id } = target.closest("li").dataset;
      console.log(id);
      if (!id || id === this.state.currentRoom) return;
      if (id) {
        onClickRoom?.(id);
      }
    };
  }

  template() {
    const { rooms, currentRoom } = this.state;
    return `
      <h4>방 목록</h4>
      <ul>
        ${rooms
          .map(({ roomId, participants }) => {
            const isMyRoom = roomId === currentRoom;
            const className = isMyRoom ? "currentRoom" : "";
            const inRoomText = isMyRoom ? "내가 참가중" : "";
            return `
            <li ${className && `class="${className}"`} data-id="${roomId}">
              ${roomId} [${participants.length}명] ${inRoomText}
            </li>`;
          })
          .join("")}
      </ul>
    `;
  }

  setEvent() {
    this.node?.addEventListener("click", this.handleClick);
  }

  clearEvent() {
    this.node?.addEventListener("click", this.handleClick);
  }
}

export default RoomList;
