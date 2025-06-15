import httpClient from "@/utils/httpClient";
import {
    TAuthLoginRequest,
    TAuthLoginResponse,
    TAuthLogoutRequest,
    TAuthLogoutResponse,
    TAuthMeRequest,
    TAuthMeResponse,
} from "@/types";
import { AxiosResponse } from "axios";

export class AuthApi {
    static login = async ({
        email,
        password,
    }: {
        email: string;
        password: string;
    }) => {
        try {
            const response: AxiosResponse<TAuthLoginResponse> =
                await httpClient.post("/api/auth/login", {
                    email,
                    password,
                } as TAuthLoginRequest);

            return response;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    static logout = async () => {
        try {
            const response: AxiosResponse<TAuthLogoutResponse> =
                await httpClient.post(
                    "/api/auth/logout",
                    {} as TAuthLogoutRequest
                );

            return response;
        } catch (error) {
            console.error("Logout error:", error);
            throw error;
        }
    };

    static me = async () => {
        try {
            const response: AxiosResponse<TAuthMeResponse> =
                await httpClient.get("/api/auth/me");

            return response;
        } catch (error) {
            console.error("Get user error:", error);
            throw error;
        }
    };
}
