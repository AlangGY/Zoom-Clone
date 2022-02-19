import App from "./App.js";

document.componentRegistry = {};
document.nextId = 0;
const $app = document.querySelector("#app");

const $$app = new App({
  $target: $app,
  initialState: { nickname: null, room: null, rooms: [], chats: [] },
});

$$app.mount();
