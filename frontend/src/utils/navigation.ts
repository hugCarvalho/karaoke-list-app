
export let navigate = (url: string, state?: { state: {redirectUrl: string}}) => {};

export const setNavigate = (fn: (url: string, state?: { state: {redirectUrl: string }}) => void) => {
  navigate = fn;
};
