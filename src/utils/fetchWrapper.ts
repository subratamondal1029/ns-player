type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T;
};

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, options);
  } catch (err) {
    throw new ApiError(`Network error :: ${(err as Error).message}`, 0);
  }

  if (response.status === 304) {
    return null as unknown as T;
  }

  let body: string;

  try {
    body = await response.text();
  } catch {
    throw new ApiError("Failed to read response", response.status);
  }

  let result: ApiResponse<T>;

  try {
    result = JSON.parse(body) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      response.ok
        ? "Invalid server response"
        : `Request failed: ${response.statusText || "Server error"}`,
      response.status,
    );
  }

  if (!response.ok || !result.success) {
    throw new ApiError(
      result.message || "Request failed",
      result.status || response.status,
    );
  }

  return result.data;
}

export { ApiError, apiFetch, ApiResponse };
