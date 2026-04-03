import axios from "axios";

interface BackendErrorResponse {
  status?: number;
  message?: string | string[];
  error?: string;
}

interface ApiErrorOptions {
  message: string;
  status?: number;
  rawMessage?: string;
}

export class ApiError extends Error {
  status?: number;
  rawMessage?: string;

  constructor({ message, status, rawMessage }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.rawMessage = rawMessage;
  }
}

function extractMessageFromPayload(payload: unknown): string | undefined {
  if (!payload) {
    return undefined;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload === "object") {
    const { message, error } = payload as BackendErrorResponse;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    if (typeof message === "string") {
      return message;
    }

    if (typeof error === "string") {
      return error;
    }
  }

  return undefined;
}

export function normalizeBackendErrorMessage(message: string): string {
  const normalizedWhitespace = message.trim().replace(/\s+/g, " ");

  const notFoundWithMongoId = normalizedWhitespace.match(
    /^(.+?)\s+with\s+id\s+'[a-f0-9]{24}'\s+not\s+found$/i
  );

  if (notFoundWithMongoId) {
    return `${notFoundWithMongoId[1]} not found`;
  }

  return normalizedWhitespace;
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const rawMessage =
      extractMessageFromPayload(error.response?.data) ?? error.message;

    return new ApiError({
      message: normalizeBackendErrorMessage(rawMessage || "Something went wrong"),
      status,
      rawMessage,
    });
  }

  if (error instanceof Error) {
    return new ApiError({
      message: normalizeBackendErrorMessage(error.message),
    });
  }

  return new ApiError({
    message: "Something went wrong",
  });
}

export function extractErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}
