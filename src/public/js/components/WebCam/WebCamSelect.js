import Select from "../Select.js";

const defaultState = {
  options: [{ value: "", text: "No Camera" }],
  selectedIndex: 0,
};

class WebCamSelect extends Select {
  constructor({ $target, initialState, onChange }) {
    super({
      $target,
      initialState: { ...defaultState, initialState },
      onChange,
    });
  }
}

export default WebCamSelect;
