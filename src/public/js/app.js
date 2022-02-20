import Component from "./Component.template.js";
import ChatRoom from "./components/ChatRoom.js";
import FormCard from "./components/FormCard/index.js";
import Header from "./components/Header.js";
import RoomList from "./components/RoomList/index.js";
import PrefixContent from "./PrefixContent.js";

// App

const defaultState = { nickname: null, room: null, rooms: [], chats: [] };

class App extends Component {
  socket = io();
  #header;
  #nicknameSpan;
  #roomSpan;
  #nicknameForm;
  #roomForm;
  #roomList;
  #chatRoom;
  #chatForm;

  constructor({ $target, initialState }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });

    this.#header = new Header({
      $target,
      initialState: { title: "알랑 채팅 방" },
    });

    this.#nicknameSpan = new PrefixContent({
      $target,
      initialState: {
        prefix: "닉네임 : ",
        text: this.state.nickname ?? "닉네임을 지어주세요",
        block: true,
      },
    });

    this.#roomSpan = new PrefixContent({
      $target,
      initialState: {
        prefix: "참가한 방 : ",
        text: this.state.room ?? "없음",
        block: true,
      },
    });

    this.#nicknameForm = new FormCard({
      $target,
      initialState: {
        title: "닉네임을 입력하세요",
        placeholder: "닉네임을 입력하세요",
        text: "설정",
        value: "",
      },
      onSubmit: (value) => {
        this.handleNicknameSubmit(value);
        this.#nicknameForm.state.value = "";
      },
    });

    this.#roomForm = new FormCard({
      $target,
      initialState: {
        title: "방 제목을 입력하세요",
        placeholder: "방 제목을 입력하세요",
        text: "설정",
        value: "",
      },
      onSubmit: (value) => {
        if (!this.state.nickname) {
          alert("닉네임을 먼저 설정해주세요!");
          return;
        }
        this.handleRoomSubmit(value);
        this.#roomForm.state.value = "";
      },
    });

    this.#roomList = new RoomList({
      $target,
      initialState: {
        rooms: this.state.rooms,
        currentRoom: this.state.room,
      },
      onClickRoom: (room) => {
        this.handleRoomSubmit(room);
      },
    });

    this.#chatRoom = new ChatRoom({
      $target,
      initialState: {
        chats: this.state.chats,
      },
    });

    this.#chatForm = new FormCard({
      $target,
      initialState: {
        title: "",
        placeholder: "채팅 메시지를 입력하세요",
        text: "전송",
        value: "",
      },
      onSubmit: (value) => {
        this.handleChatSubmit(value);
        this.#chatForm.state.value = "";
      },
    });
    this.children = [
      this.#header,
      this.#nicknameSpan,
      this.#roomSpan,
      this.#nicknameForm,
      this.#roomForm,
      this.#roomList,
      this.#chatRoom,
      this.#chatForm,
    ];
  }

  setChildrenState(state) {
    const { nickname, room, rooms, chats } = state;
    this.#nicknameSpan.state.text = nickname ?? "Unknown";
    this.#roomSpan.state.text = room ?? "없음";
    this.#roomList.state.state = { rooms, currentRoom: room };
    this.#chatRoom.state.chats = chats;
    this.render();
    return this;
  }

  setEvent() {
    this.socket.on("announce", ({ type, nickname, prevNickname }) => {
      switch (type) {
        case "join":
          this.appendChat({ chat: `'${nickname}'님이 입장하셨습니다.` });
          break;
        case "leave":
          this.appendChat({ chat: `'${nickname}'님이 퇴장하셨습니다.` });
          break;
        case "change-nickname":
          this.appendChat({
            chat: `'${prevNickname}'님이 '${nickname}'으로 닉네임을 변경하였습니다.`,
          });
          break;
        default:
          console.error("확인되지 않은 방식입니다.");
          break;
      }
    });

    this.socket.on("new_chat", ({ chat, nickname }) => {
      console.log(chat, nickname);
      this.appendChat({ prefix: `${nickname} : `, chat });
    });

    this.socket.on("room_list", ({ roomList }) => {
      this.state.rooms = roomList;
    });
  }

  appendChat({ prefix, chat }) {
    const { chats } = this.state;
    this.state.chats = [...chats, `${prefix || ""}${chat}`];
  }

  handleNicknameSubmit(nickname) {
    this.socket.emit("change_nickname", { nickname }, () => {
      console.log("change nickname!");
      this.state.nickname = nickname;
    });
  }

  handleRoomSubmit(nextRoom) {
    const { room: prevRoom } = this.state;
    if (prevRoom) {
      this.socket.emit("leave_room", { room: prevRoom }, () => {
        console.log(`left Room: ${prevRoom}`);
        this.state.room = null;
      });
    }

    this.socket.emit("enter_room", { room: nextRoom }, () => {
      console.log(`entered Room: ${nextRoom}`);
      this.state.room = nextRoom;
    });
  }

  handleChatSubmit(chat) {
    this.socket.emit("new_chat", { chat, room: this.state.room }, () => {
      console.log(`chat sent successfully: ${chat}`);
    });
    this.appendChat({ prefix: "나 : ", chat });
  }
}

export default App;
