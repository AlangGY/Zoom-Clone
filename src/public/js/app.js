import Button from "./components/Button.js";
import Header from "./components/Header.js";
import Input from "./components/Input.js";

document.componentRegistry = {};
document.nextId = 0;

const socket = io();

const $room = document.querySelector("#room");
const $nickname = document.querySelector("#nickname");
const $chat = document.querySelector("#chat");
const $nicknameForm = $nickname.querySelector("form");
const $roomForm = $room.querySelector("form");
const $chatForm = $chat.querySelector("form");
const $roomList = $room.querySelector(".roomList ul");
const $leaveButton = $roomForm.querySelector(".leaveButton");

const showLeaveButton = () => {
  $leaveButton.classList.remove("displayNone");
};

const hideLeaveButton = () => {
  $leaveButton.classList.add("displayNone");
};

const currentRoomProxy = new Proxy(
  { room: null },
  {
    set(target, key, value) {
      target[key] = value;
      if (value) {
        showLeaveButton();
      } else {
        hideLeaveButton();
      }
    },
  }
);
let roomList = [];

const changeNickname = (nickname) => {
  const nicknameSpan = $nicknameForm.querySelector("h3 span");
  nicknameSpan.textContent = nickname;
};

const showRoomTitle = (room) => {
  const roomSpan = $roomForm.querySelector("h3 span");
  roomSpan.textContent = room;
};

const newChat = ({ prefix, chat }) => {
  const ul = $chatForm.querySelector("ul");
  const li = document.createElement("li");
  li.textContent = `${prefix || ""}${chat}`;
  ul.appendChild(li);
};

// socket emit
const emitLeaveRoom = () => {
  const room = currentRoomProxy.room;
  if (room) {
    socket.emit("leave_room", { room }, () => {
      console.log(`left Room: ${room}`);
    });
  }
};

const emitChangeRoom = (room) => {
  emitLeaveRoom();
  socket.emit("enter_room", { room }, () => {
    console.log(`entered Room: ${room}`);
    showRoomTitle(room);
    currentRoomProxy.room = room;
  });
};

// Event Handler
const handleNicknameSubmit = (e) => {
  e.preventDefault();
  const input = $nicknameForm.querySelector("input");
  const nickname = input.value;
  socket.emit("change_nickname", { nickname }, () => {
    console.log("change nickname!");
    changeNickname(nickname);
  });

  input.value = "";
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = $roomForm.querySelector("input");
  const room = input.value;
  emitChangeRoom(room);

  input.value = "";
};

const handleChatSubmit = (e) => {
  e.preventDefault();
  const input = $chatForm.querySelector("input");
  const chat = input.value;
  socket.emit("new_chat", { chat, room: currentRoomProxy.room }, () => {
    console.log(`chat sent successfully: ${chat}`);
  });
  newChat({ prefix: "나 : ", chat });
  input.value = "";
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

socket.on("room_list", ({ roomList: newRoomList }) => {
  roomList = newRoomList;
  console.log(newRoomList);
  $roomList.innerHTML = `
    ${roomList
      .map(
        ({ room, participants }) =>
          `<li data-id="${room}">방 : ${room} | 참가자 수 : ${participants.length}</li>`
      )
      .join("")}
  `;
});

const handleChangeRoom = (e) => {
  const room = e.target?.dataset.id;
  if (room) {
    emitChangeRoom(room);
  }
};

const handleLeaveRoom = () => {
  emitLeaveRoom();
  currentRoomProxy.room = null;
  showRoomTitle("입장한 방 없음");
};

$roomList.addEventListener("click", handleChangeRoom);
$chatForm.addEventListener("submit", handleChatSubmit);
$nicknameForm.addEventListener("submit", handleNicknameSubmit);
$roomForm.addEventListener("submit", handleRoomSubmit);
$leaveButton.addEventListener("click", handleLeaveRoom);

const $app = document.querySelector("#app");

const header = new Header($app, { title: "알랑 채팅 방" }).mount();

const input = new Input($app, { placeholder: "닉네임을 입력하세요" }, (value) =>
  console.log(value)
).mount();

const button = new Button($app, { text: "버튼", type: "button" }).mount();
