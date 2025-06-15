import httpClient from "@/utils/httpClient";
import {
    TAuthLoginRequest,
    TAuthLoginResponse,
    TAuthLogoutRequest,
    TAuthLogoutResponse,
    TAuthMeRequest,
    TAuthMeResponse,
    TAuthRegisterRequest,
    TAuthRegisterResponse,
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

    static register = async ({
        name,
        email,
        password,
    }: {
        name: string;
        email: string;
        password: string;
    }) => {
        try {
            const response: AxiosResponse<TAuthRegisterResponse> =
                await httpClient.post("/api/auth/register", {
                    name,
                    email,
                    password,
                } as TAuthRegisterRequest);

            return response;
        } catch (error) {
            console.error("Register error:", error);
            throw error;
        }
    };
}
