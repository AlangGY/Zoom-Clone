import Component from "../Component.template.js";
import FormCard from "./FormCard/index.js";

const defaultState = { chats: [] };

class ChatRoom extends Component {
  #form;

  constructor({ $target, initialState, onSubmit }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });
    this.node = document.createElement("div");
    this.node.classList.add("chatRoom");

    this.#form = new FormCard({
      $target: this.node,
      initialState: {
        title: "",
        placeholder: "채팅 메시지를 입력하세요",
        text: "전송",
      },
      onSubmit,
      className: "chat",
    });

    this.children = [this.#form];
  }

  template() {
    const { chats } = this.state;
    const scrollTop = this.node.querySelector("ul")?.scrollTop ?? 0;
    requestAnimationFrame(() => {
      const $ul = this.node.querySelector("ul");
      if (!$ul) return;
      const { scrollHeight, clientHeight } = $ul;

      const isAllScrolled =
        Math.abs(scrollHeight - clientHeight - scrollTop) < 40; // li 한개 높이 정도
      const isLastChatMe = chats[chats.length - 1]?.startsWith("나 :");

      // rerender 되기 이전 position으로 스크롤 한다.
      $ul?.scrollBy({
        top: scrollTop,
        left: 0,
        behavior: "auto",
      });
      // 전부 스크롤했거나, 마지막 갱신 된 채팅이 나의 채팅이라면 scroll을 끝까지 내린다.
      if (isAllScrolled || isLastChatMe) {
        $ul?.scrollBy({
          top: scrollHeight,
          left: 0,
          behavior: "smooth",
        });
      }
    });

    return `
      <h4>채팅창</h4>
      <ul>
        ${chats
          ?.map((chat) => {
            return `<li>${chat}</li>`;
          })
          .join("")}
      </ul>
    `;
  }
}

export default ChatRoom;
