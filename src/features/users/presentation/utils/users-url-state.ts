"use client";

function buildUsersUrl(pathname: string, params: URLSearchParams) {
  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function replaceUsersUrl(pathname: string, params: URLSearchParams) {
  window.history.replaceState(null, "", buildUsersUrl(pathname, params));
}

export function pushUsersUrl(pathname: string, params: URLSearchParams) {
  window.history.pushState(null, "", buildUsersUrl(pathname, params));
}
