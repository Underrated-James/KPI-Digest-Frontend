/**
 * Feature-based API Endpoints Mapping
 * Centralized definition of all API routes per feature
 * Enables easy changes and feature-level configuration
 */

export const API_ENDPOINTS = {
  USERS: {
    LIST: "/users",
    GET: (id: string) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  PROJECTS: {
    LIST: "/projects",
    GET: (id: string) => `/projects/${id}`,
    CREATE: "/projects",
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
  },

  SPRINTS: {
    LIST: "/sprints",
    GET: (id: string) => `/sprints/${id}`,
    CREATE: "/sprints",
    UPDATE: (id: string) => `/sprints/${id}`,
    DELETE: (id: string) => `/sprints/${id}`,
  },

  SPRINT_OVERVIEWS: {
    LIST: "/sprint-overviews",
    GET: (id: string) => `/sprint-overviews/${id}`,
    CREATE: "/sprint-overviews",
  },

  TICKETS: {
    LIST: "/tickets",
    GET: (id: string) => `/tickets/${id}`,
    CREATE: "/tickets",
    UPDATE: (id: string) => `/tickets/${id}`,
    DELETE: (id: string) => `/tickets/${id}`,
  },

  TEAMS: {
    LIST: "/teams",
    GET: (id: string) => `/teams/${id}`,
    CREATE: "/teams",
    UPDATE: (id: string) => `/teams/${id}`,
    DELETE: (id: string) => `/teams/${id}`,
  },

  // Sprint-specific endpoints (beyond CRUD)
  SPRINT_DETAILS: {
    AVAILABLE_TICKETS: (sprintId: string) =>
      `/sprints/${sprintId}/tickets/available`,
    PROJECT_TICKETS: (sprintId: string) => `/sprints/${sprintId}/tickets`,
    CAPACITY: (sprintId: string) => `/sprints/${sprintId}/capacity`,
    ASSIGN_TICKETS: (sprintId: string) => `/sprints/${sprintId}/tickets/assign`,
  },

  // Ticket-specific endpoints (beyond CRUD)
  TICKET_DETAILS: {
    LIST_PAGINATED: "/tickets", // With query params: page, size, projectId
    UPDATE_BATCH: "/tickets", // PATCH for multiple tickets
  },
} as const;

// Type-safe endpoint access
export type EndpointKey = keyof typeof API_ENDPOINTS;
export type FeatureEndpoints = (typeof API_ENDPOINTS)[EndpointKey];
