"use client";

function buildTeamsUrl(pathname: string, params: URLSearchParams) {
  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function replaceTeamsUrl(pathname: string, params: URLSearchParams) {
  window.history.replaceState(null, "", buildTeamsUrl(pathname, params));
}

export function pushTeamsUrl(pathname: string, params: URLSearchParams) {
  window.history.pushState(null, "", buildTeamsUrl(pathname, params));
}
