import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class HttpClient {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
            timeout: 30000, // 30 seconds
            headers: {
                "Content-Type": "application/json",
            },
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

                    try {
                        // Try to refresh the token
                        const newAccessToken = await this.refreshAccessToken();

                        // Update auth header with new token
                        window.localStorage.setItem(
                            "accessToken",
                            newAccessToken
                        );

                        originalRequest.headers[
                            "Authorization"
                        ] = `Bearer ${newAccessToken}`;

                        // Retry the original request
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        // If refreshing token fails, clear tokens and reject
                        window.localStorage.removeItem("accessToken");
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private async refreshAccessToken(): Promise<string> {
        try {
            const response = await axios.get("/api/auth/access-token");
            return response.data.accessToken;
        } catch (error) {
            throw new Error("Failed to refresh access token");
        }
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
}

// Export a singleton instance
const httpClient = new HttpClient(
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
);

export default httpClient;
