// const messageForm = document.querySelector("#chat");
// const nicknameForm = document.querySelector("#nickname");
// const nicknameH4 = document.querySelector("#nickname > h4");
// const myIdH5 = document.querySelector("#my-id");
// const messageList = document.querySelector("ul.chats");
// const clientsList = document.querySelector("ul.clients");

// const socket = new WebSocket(`ws://${window.location.host}`);

// const stringifyMessage = (type, payload) => JSON.stringify({ type, payload });
// const parseMessage = (json) => JSON.parse(json);

// const printChat = ({ id, nickname, chat }) => {
//   const li = document.createElement("li");
//   li.dataset.id = id;
//   li.textContent = `${nickname}: ${chat}`;
//   messageList.appendChild(li);
// };

// const changeNickname = ({ id, nickname }) => {
//   const messages = messageList.querySelectorAll(`li[data-id="${id}"]`);
//   const clients = clientsList.querySelectorAll(`li[data-id="${id}"]`);
//   messages.forEach((li) => {
//     const chat = li.textContent.split(": ")[1];
//     li.textContent = `${nickname}: ${chat}`;
//   });
//   clients.forEach((li) => {
//     if (li.dataset.id === myIdH5.textContent) {
//       li.textContent = `${nickname} (나)`;
//       return;
//     }
//     li.textContent = nickname;
//   });
// };

// const setClientsList = (clients) => {
//   clientsList.innerHTML = `${clients
//     .map(
//       ({ id, nickname }) =>
//         `<li data-id="${id}">${
//           id === myIdH5.textContent ? `${nickname} (나)` : nickname
//         }</li>`
//     )
//     .join("")}`;
// };

// socket.addEventListener("open", () => {
//   console.log("서버에 연결되었습니다😃");
// });

// socket.addEventListener("message", (message) => {
//   const { type, payload } = parseMessage(message.data);
//   switch (type) {
//     case "new-chat":
//       printChat(payload);
//       break;
//     case "initialize-id":
//       myIdH5.textContent = payload;
//       break;
//     case "initialize-nickname":
//       nicknameH4.textContent = `닉네임: ${payload}`;
//       break;
//     case "change-nickname":
//       changeNickname(payload);
//       break;
//     case "clients-list":
//       setClientsList(payload);
//       break;
//     default:
//       console.error("잘못된 값을 받았습니다.");
//       console.error(message);
//       break;
//   }
// });

// socket.addEventListener("close", () => {
//   console.log("서버와의 연결이 끊겼습니다");
// });

// const handleNicknameSubmit = (e) => {
//   e.preventDefault();
//   const input = nicknameForm.querySelector("input");
//   socket.send(stringifyMessage("change-nickname", input.value));
//   nicknameH4.textContent = `닉네임: ${input.value}`;
//   input.value = "";
// };

// const handleChatSubmit = (e) => {
//   e.preventDefault();
//   const input = messageForm.querySelector("input");
//   socket.send(stringifyMessage("send-chat", input.value));
//   printChat({ id: "me", nickname: "나", chat: input.value });
//   input.value = "";
// };

// messageForm.addEventListener("submit", handleChatSubmit);
// nicknameForm.addEventListener("submit", handleNicknameSubmit);

const socket = io();

const room = document.querySelector("#room");
const nickname = document.querySelector("#nickname");
const chat = document.querySelector("#chat");
const nicknameForm = nickname.querySelector("form");
const roomForm = room.querySelector("form");
const chatForm = chat.querySelector("form");

let currentRoom;

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

chatForm.addEventListener("submit", handleChatSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit);
roomForm.addEventListener("submit", handleRoomSubmit);
