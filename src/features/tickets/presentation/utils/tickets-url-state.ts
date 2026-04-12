export const pushTicketsUrl = (pathname: string, params: URLSearchParams) => {
  window.history.pushState(null, "", `${pathname}?${params.toString()}`);
};

export const replaceTicketsUrl = (pathname: string, params: URLSearchParams) => {
  window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
};
