import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

interface QueuedRequest {
    resolve: (value: AxiosResponse<any>) => void;
    reject: (error: any) => void;
    config: AxiosRequestConfig;
}

class HttpClient {
    private axiosInstance: AxiosInstance;
    private isRefreshing: boolean = false;
    private requestQueue: QueuedRequest[] = [];
    private refreshPromise: Promise<string> | null = null;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
            timeout: 30000, // 30 seconds
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const accessToken = window.localStorage.getItem("accessToken");
                // Add auth token to headers if available
                if (accessToken && config.headers) {
                    config.headers["Authorization"] = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If error is 401 (Unauthorized) and we haven't retried yet
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    // If we're already refreshing, queue this request
                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.requestQueue.push({
                                resolve,
                                reject,
                                config: originalRequest,
                            });
                        });
                    }

                    // Start the refresh process
                    this.isRefreshing = true;

                    try {
                        // Create or reuse the refresh promise
                        if (!this.refreshPromise) {
                            this.refreshPromise = this.refreshAccessToken();
                        }

                        const newAccessToken = await this.refreshPromise;

                        // Update stored token
                        window.localStorage.setItem(
                            "accessToken",
                            newAccessToken
                        );

                        // Update the original request header
                        originalRequest.headers[
                            "Authorization"
                        ] = `Bearer ${newAccessToken}`;

                        // Process all queued requests
                        this.processRequestQueue(newAccessToken);

                        // Reset refresh state
                        this.isRefreshing = false;
                        this.refreshPromise = null;

                        // Retry the original request
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        // If refreshing token fails, reject all queued requests
                        this.rejectRequestQueue(refreshError);

                        // Clear tokens and reset state
                        window.localStorage.removeItem("accessToken");
                        this.isRefreshing = false;
                        this.refreshPromise = null;

                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private async refreshAccessToken(): Promise<string> {
        try {
            // Create a new axios instance without interceptors for token refresh
            // to avoid infinite loops
            const refreshInstance = axios.create({
                baseURL: this.axiosInstance.defaults.baseURL,
                timeout: 30000,
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            const response = await refreshInstance.get(
                "/api/auth/access-token"
            );
            return response.data.accessToken;
        } catch (error) {
            throw new Error("Failed to refresh access token");
        }
    }

    private processRequestQueue(newAccessToken: string): void {
        // Process all queued requests with the new token
        this.requestQueue.forEach(({ resolve, reject, config }) => {
            // Update the config with new token
            if (config.headers) {
                config.headers["Authorization"] = `Bearer ${newAccessToken}`;
            }

            // Retry the request
            this.axiosInstance(config).then(resolve).catch(reject);
        });

        // Clear the queue
        this.requestQueue = [];
    }

    private rejectRequestQueue(error: any): void {
        // Reject all queued requests
        this.requestQueue.forEach(({ reject }) => {
            reject(error);
        });

        // Clear the queue
        this.requestQueue = [];
    }

    // Generic request method
    public async request<T>(
        config: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.axiosInstance.request<T>(config);
    }

    // Convenience methods for common HTTP verbs
    public async get<T>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get<T>(url, config);
    }

    public async post<T>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.axiosInstance.post<T>(url, data, config);
    }

    public async put<T>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.axiosInstance.put<T>(url, data, config);
    }

    public async delete<T>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.axiosInstance.delete<T>(url, config);
    }

    public async patch<T>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.axiosInstance.patch<T>(url, data, config);
    }

    // Method to manually clear tokens (for logout)
    public clearTokens(): void {
        window.localStorage.removeItem("accessToken");
        this.isRefreshing = false;
        this.refreshPromise = null;
        this.rejectRequestQueue(new Error("User logged out"));
    }

    // Method to check if currently refreshing (useful for UI states)
    public isTokenRefreshing(): boolean {
        return this.isRefreshing;
    }
}

// Export a singleton instance
const httpClient = new HttpClient(
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
);

export default httpClient;
