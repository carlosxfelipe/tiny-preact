export type HttpResponse<T> = {
  data: T;
  status: number;
  statusText: string;
};

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<HttpResponse<T>> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as T;
  return {
    data,
    status: res.status,
    statusText: res.statusText,
  };
}

export const http = {
  get: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, body: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      body: JSON.stringify(body),
    }),
  put: <T>(url: string, body: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      body: JSON.stringify(body),
    }),
  delete: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: "DELETE" }),
};
