/**
 * API Interceptor for handling token refresh and authentication errors
 * Automatically attempts to refresh token on 401/403 responses
 */

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: Response) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (
  error: any,
  token: string = ""
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(new Response(JSON.stringify({ token })));
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

export function setupApiInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async (...args): Promise<Response> => {
    let response = await originalFetch(...args);

    // Check if response is 401 or 403 (unauthorized/forbidden)
    if ((response.status === 401 || response.status === 403)) {
      const request = args[0];
      const requestUrl =
        typeof request === "string"
          ? request
          : request instanceof Request
          ? request.url
          : "";

      const isRefreshTokenRequest = requestUrl.includes("/api/auth/refresh");
      const isAuthSubmitRequest =
        requestUrl.includes("/api/auth/login") ||
        requestUrl.includes("/api/auth/signup") ||
        requestUrl.includes("/api/auth/session");

      // Don't intercept auth endpoints that are handling login/signup/session directly
      if (isRefreshTokenRequest || isAuthSubmitRequest) {
        return response;
      }

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Try to refresh the token (server will read httpOnly cookie)
          const refreshResponse = await originalFetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();

            // Token refresh successful, retry the original request
            processQueue(null, data.accessToken);

            // Retry the original request with updated credentials
            response = await originalFetch(...args);
          } else {
            // Refresh failed, user needs to login again
            processQueue(new Error("Token refresh failed"), "");

            // Clear auth storage and redirect to login
            if (typeof window !== "undefined") {
              // Delete cookies
              document.cookie =
                "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie =
                "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

              // Redirect to login page and preserve attempted path
              window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
            }
          }
        } catch (error) {
          processQueue(error, "");

          // Network error during refresh, redirect to login
          if (typeof window !== "undefined") {
            window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
          }
        }
      } else {
        // Refresh is in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(
          () => originalFetch(...args),
          (error) => Promise.reject(error)
        );
      }
    }

    return response;
  };
}
