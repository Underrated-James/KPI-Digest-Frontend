"use client";

function buildProjectsUrl(pathname: string, params: URLSearchParams) {
  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function replaceProjectsUrl(pathname: string, params: URLSearchParams) {
  window.history.replaceState(null, "", buildProjectsUrl(pathname, params));
}

export function pushProjectsUrl(pathname: string, params: URLSearchParams) {
  window.history.pushState(null, "", buildProjectsUrl(pathname, params));
}
