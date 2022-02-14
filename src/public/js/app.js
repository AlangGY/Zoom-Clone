const messageForm = document.querySelector("#chat");
const nicknameForm = document.querySelector("#nickname");
const nicknameH4 = document.querySelector("#nickname > h4");
const myIdH5 = document.querySelector("#my-id");
const messageList = document.querySelector("ul.chats");
const clientsList = document.querySelector("ul.clients");

const socket = new WebSocket(`ws://${window.location.host}`);

const stringifyMessage = (type, payload) => JSON.stringify({ type, payload });
const parseMessage = (json) => JSON.parse(json);

const printChat = ({ id, nickname, chat }) => {
  const li = document.createElement("li");
  li.dataset.id = id;
  li.textContent = `${nickname}: ${chat}`;
  messageList.appendChild(li);
};

const changeNickname = ({ id, nickname }) => {
  const messages = messageList.querySelectorAll(`li[data-id="${id}"]`);
  const clients = clientsList.querySelectorAll(`li[data-id="${id}"]`);
  messages.forEach((li) => {
    const chat = li.textContent.split(": ")[1];
    li.textContent = `${nickname}: ${chat}`;
  });
  clients.forEach((li) => {
    if (li.dataset.id === myIdH5.textContent) {
      li.textContent = `${nickname} (나)`;
      return;
    }
    li.textContent = nickname;
  });
};

const setClientsList = (clients) => {
  clientsList.innerHTML = `${clients
    .map(
      ({ id, nickname }) =>
        `<li data-id="${id}">${
          id === myIdH5.textContent ? `${nickname} (나)` : nickname
        }</li>`
    )
    .join("")}`;
};

socket.addEventListener("open", () => {
  console.log("서버에 연결되었습니다😃");
});

socket.addEventListener("message", (message) => {
  const { type, payload } = parseMessage(message.data);
  switch (type) {
    case "new-chat":
      printChat(payload);
      break;
    case "initialize-id":
      myIdH5.textContent = payload;
      break;
    case "initialize-nickname":
      nicknameH4.textContent = `닉네임: ${payload}`;
      break;
    case "change-nickname":
      changeNickname(payload);
      break;
    case "clients-list":
      setClientsList(payload);
      break;
    default:
      console.error("잘못된 값을 받았습니다.");
      console.error(message);
      break;
  }
});

socket.addEventListener("close", () => {
  console.log("서버와의 연결이 끊겼습니다");
});

const handleNicknameSubmit = (e) => {
  e.preventDefault();
  const input = nicknameForm.querySelector("input");
  socket.send(stringifyMessage("change-nickname", input.value));
  nicknameH4.textContent = `닉네임: ${input.value}`;
  input.value = "";
};

const handleChatSubmit = (e) => {
  e.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(stringifyMessage("send-chat", input.value));
  printChat({ id: "me", nickname: "나", chat: input.value });
  input.value = "";
};

messageForm.addEventListener("submit", handleChatSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit);
