import Component from "./Component.template.js";
import Button from "./components/Button.js";
import ChatRoom from "./components/ChatRoom.js";
import Form from "./components/Form.js";
import FormCard from "./components/FormCard/index.js";
import Header from "./components/Header.js";
import Input from "./components/Input.js";
import RoomList from "./components/RoomList/index.js";
import PrefixContent from "./PrefixContent.js";

document.componentRegistry = {};
document.nextId = 0;

const socket = io();

const newChat = ({ prefix, chat }) => {
  const { chats } = globalStateProxy.state;
  globalStateProxy.state = { chats: [...chats, `${prefix || ""}${chat}`] };
};

// socket emit function

const leaveRoom = () => {
  const { room: prevRoom } = globalStateProxy.state;
  if (prevRoom) {
    socket.emit("leave_room", { room: prevRoom }, () => {
      console.log(`left Room: ${prevRoom}`);
      globalStateProxy.state = { room: null };
    });
  }
};

const joinRoom = (nextRoom) => {
  socket.emit("enter_room", { room: nextRoom }, () => {
    console.log(`entered Room: ${nextRoom}`);
    globalStateProxy.state = { room: nextRoom };
  });
};

// Event Handler
const handleNicknameSubmit = (nickname) => {
  socket.emit("change_nickname", { nickname }, () => {
    console.log("change nickname!");
    globalStateProxy.state = { nickname };
  });
};

const handleRoomSubmit = (nextRoom) => {
  leaveRoom();
  joinRoom(nextRoom);
};

const handleChatSubmit = (chat) => {
  socket.emit("new_chat", { chat, room: globalStateProxy.state.room }, () => {
    console.log(`chat sent successfully: ${chat}`);
  });
  newChat({ prefix: "나 : ", chat });
};

// Events

socket.on("announce", ({ type, nickname, prevNickname }) => {
  switch (type) {
    case "join":
      newChat({ chat: `'${nickname}'님이 입장하셨습니다.` });
      break;
    case "leave":
      newChat({ chat: `'${nickname}'님이 퇴장하셨습니다.` });
      break;
    case "change-nickname":
      newChat({
        chat: `'${prevNickname}'님이 '${nickname}'으로 닉네임을 변경하였습니다.`,
      });
      break;
    default:
      console.error("확인되지 않은 방식입니다.");
      break;
  }
});

socket.on("new_chat", ({ chat, nickname }) => {
  console.log(chat, nickname);
  newChat({ prefix: `${nickname} : `, chat });
});

socket.on("room_list", ({ roomList }) => {
  globalStateProxy.state = { rooms: roomList };
});

const $app = document.querySelector("#app");

const globalStateProxy = new Proxy(
  { state: { nickname: null, room: null, rooms: [], chats: [] } },
  {
    set(proxy, state, value) {
      if (state !== "state") return false;

      proxy.state = { ...proxy.state, ...value };
      setState(proxy.state);
      return true;
    },
  }
);

const setState = (state) => {
  const { nickname, room, rooms, chats } = state;
  $$nicknameSpan.setState({ text: nickname });
  $$roomSpan.setState({ text: room ?? "없음" });
  $$roomList.setState({ rooms, currentRoom: room });
  $$chatRoom.setState({ chats });
};

const header = new Header({
  $target: $app,
  initialState: { title: "알랑 채팅 방" },
}).mount();

const $$nicknameSpan = new PrefixContent({
  $target: $app,
  initialState: {
    prefix: "닉네임 : ",
    text: globalStateProxy.state.nickname ?? "닉네임을 지어주세요",
    block: true,
  },
}).mount();

const $$roomSpan = new PrefixContent({
  $target: $app,
  initialState: {
    prefix: "참가한 방 : ",
    text: globalStateProxy.state.room ?? "없음",
    block: true,
  },
}).mount();

const $$nicknameForm = new FormCard({
  $target: $app,
  initialState: {
    title: "닉네임을 입력하세요",
    placeholder: "닉네임을 입력하세요",
    text: "설정",
    value: "",
  },
  onSubmit: (value) => {
    handleNicknameSubmit(value);
    $$nicknameForm.setState({ value: "" });
  },
}).mount();

const $$roomForm = new FormCard({
  $target: $app,
  initialState: {
    title: "방 제목을 입력하세요",
    placeholder: "방 제목을 입력하세요",
    text: "설정",
    value: "",
  },
  onSubmit: (value) => {
    handleRoomSubmit(value);
    $$roomForm.setState({ value: "" });
  },
}).mount();

const $$roomList = new RoomList({
  $target: $app,
  initialState: {
    rooms: globalStateProxy.state.rooms,
    currentRoom: globalStateProxy.state.room,
  },
  onClickRoom(room) {
    console.log("clicked!");
    handleRoomSubmit(room);
  },
}).mount();

const $$chatRoom = new ChatRoom({
  $target: $app,
  initialState: {
    chats: globalStateProxy.state.chats,
  },
}).mount();

const $$chatForm = new FormCard({
  $target: $app,
  initialState: {
    title: "",
    placeholder: "채팅 메시지를 입력하세요",
    text: "전송",
    value: "",
  },
  onSubmit(value) {
    handleChatSubmit(value);
    $$chatForm.setState({ value: "" });
  },
}).mount();
