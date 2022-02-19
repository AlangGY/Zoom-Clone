export const validateComponent = ($target, initialState) => {
  return $target instanceof Node && initialState.constructor.name === "Object";
};
