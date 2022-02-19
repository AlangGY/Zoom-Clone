import Component from "../../Component.template.js";

const defaultState = { rooms: [], currentRoom: null };

class RoomList extends Component {
  constructor({ $target, initialState, onClickRoom }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });

    this.node = document.createElement("div");

    // Event Handler
    this.handleClick = (e) => {
      const { target } = e;
      const $li = target.closest("li");
      if (!$li) return;

      const { id } = $li.dataset;
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
