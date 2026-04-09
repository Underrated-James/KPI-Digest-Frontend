"use client";

function buildSprintUrl(pathname: string, params: URLSearchParams) {
  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function replaceSprintsUrl(pathname: string, params: URLSearchParams) {
  window.history.replaceState(null, "", buildSprintUrl(pathname, params));
}

export function pushSprintsUrl(pathname: string, params: URLSearchParams) {
  window.history.pushState(null, "", buildSprintUrl(pathname, params));
}
