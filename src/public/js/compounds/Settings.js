import Component from "../Component.template.js";
import Button from "../components/Button.js";
import FormCard from "../components/FormCard/index.js";
import PrefixContent from "../components/PrefixContent.js";

const defaultState = { nickname: "", on: true };

class Settings extends Component {
  #toggleButton;
  #nicknameSpan;
  #nicknameForm;
  #roomForm;

  constructor({ $target, initialState, onNicknameSubmit, onRoomSubmit }) {
    super({ $target, initialState: { ...defaultState, ...initialState } });

    this.node = document.createElement("div");
    this.node.classList.add("settings");

    this.#toggleButton = new Button({
      $target: this.node,
      initialState: {
        text: this.state.on
          ? '<i class="fa-solid fa-caret-up"></i>'
          : '<i class="fa-solid fa-caret-down"></i>',
      },
      onClick: () => {
        this.state.on = !this.state.on;
      },
      className: "toggle",
    });
    this.#nicknameSpan = new PrefixContent({
      $target: this.node,
      initialState: {
        prefix: "닉네임 : ",
        text: this.state.nickname ?? "닉네임을 지어주세요",
        block: true,
      },
    });
    this.#nicknameForm = new FormCard({
      $target: this.node,
      initialState: {
        title: "닉네임 설정",
        placeholder: "닉네임을 입력하세요",
        text: "설정",
        value: "",
      },
      onSubmit: (value) => {
        onNicknameSubmit?.(value);
        this.#nicknameForm.state.value = "";
      },
    });

    this.#roomForm = new FormCard({
      $target: this.node,
      initialState: {
        title: "방 참가",
        placeholder: "방 제목을 입력하세요",
        text: "참가",
        value: "",
      },
      onSubmit: (value) => {
        onRoomSubmit?.(value);
        this.#roomForm.state.value = "";
      },
    });

    this.children = [
      this.#toggleButton,
      this.#nicknameSpan,
      this.#nicknameForm,
      this.#roomForm,
    ];
  }

  setChildrenState(state) {
    const { nickname, on } = state;
    this.#nicknameSpan.state.state = { text: nickname };
    this.#nicknameForm.state.hidden = !on;
    this.#roomForm.state.hidden = !on;
    this.#toggleButton.state.text = on
      ? '<i class="fa-solid fa-caret-up"></i>'
      : '<i class="fa-solid fa-caret-down"></i>';
  }
}

export default Settings;
