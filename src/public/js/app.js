const socket = io();

const room = document.querySelector("#room");
const nickname = document.querySelector("#nickname");
const chat = document.querySelector("#chat");
const nicknameForm = nickname.querySelector("form");
const roomForm = room.querySelector("form");
const chatForm = chat.querySelector("form");

let currentRoom;
let roomList = [];

const changeNickname = (nickname) => {
  const nicknameSpan = nicknameForm.querySelector("h3 span");
  nicknameSpan.textContent = nickname;
};

const enterRoom = (room) => {
  const roomSpan = roomForm.querySelector("h3 span");
  roomSpan.textContent = room;
};

const newChat = ({ prefix, chat }) => {
  const ul = chatForm.querySelector("ul");
  const li = document.createElement("li");
  li.textContent = `${prefix || ""}${chat}`;
  ul.appendChild(li);
};

// Event Handler
const handleNicknameSubmit = (e) => {
  e.preventDefault();
  const input = nicknameForm.querySelector("input");
  const nickname = input.value;
  socket.emit("change_nickname", { nickname }, () => {
    console.log("change nickname!");
    changeNickname(nickname);
  });

  input.value = "";
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const input = roomForm.querySelector("input");
  const prevRoom = currentRoom;
  const room = input.value;
  if (prevRoom) {
    socket.emit("leave_room", { room: prevRoom }, () => {
      console.log(`left Room: ${prevRoom}`);
    });
  }

  socket.emit("enter_room", { room }, () => {
    console.log(`entered Room: ${room}`);
    enterRoom(room);
    currentRoom = room;
  });
  input.value = "";
};

const handleChatSubmit = (e) => {
  e.preventDefault();
  const input = chatForm.querySelector("input");
  const chat = input.value;
  socket.emit("new_chat", { chat, room: currentRoom }, () => {
    console.log(`chat sent successfully: ${chat}`);
  });
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
  const $roomList = room.querySelector(".roomList");
  $roomList.innerHTML = `
    ${roomList
      .map(
        ({ room, participants }) =>
          `<li data-id="${room}">방 : ${room} | 참가자 수 : ${participants.length}</li>`
      )
      .join("")}
  `;
});

chatForm.addEventListener("submit", handleChatSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit);
roomForm.addEventListener("submit", handleRoomSubmit);
