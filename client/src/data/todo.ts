import httpClient from "@/utils/httpClient";
import {
    TTodosListRequest,
    TTodosListResponse,
    TTodosCreateRequest,
    TTodosCreateResponse,
    TTodosGetResponse,
    TTodosUpdateRequest,
    TTodosUpdateResponse,
    TTodosDeleteResponse,
} from "@/types";
import { AxiosResponse } from "axios";

export class TodoApi {
    // GET /todos - Fetch all todos with filters and pagination
    static fetchAll = async (params?: TTodosListRequest) => {
        try {
            const response: AxiosResponse<TTodosListResponse> =
                await httpClient.get("/api/todos", {
                    params,
                });

            return response;
        } catch (error) {
            console.error("Fetch todos error:", error);
            throw error;
        }
    };

    // POST /todos - Create a new todo
    static create = async (data: TTodosCreateRequest) => {
        try {
            const response: AxiosResponse<TTodosCreateResponse> =
                await httpClient.post("/api/todos", data);

            return response;
        } catch (error) {
            console.error("Create todo error:", error);
            throw error;
        }
    };

    // GET /todos/:id - Fetch single todo
    static fetchSingle = async (id: number) => {
        try {
            const response: AxiosResponse<TTodosGetResponse> =
                await httpClient.get(`/api/todos/${id}`);

            return response;
        } catch (error) {
            console.error("Fetch todo error:", error);
            throw error;
        }
    };

    // PUT /todos/:id - Update todo
    static update = async (id: number, data: TTodosUpdateRequest) => {
        try {
            const response: AxiosResponse<TTodosUpdateResponse> =
                await httpClient.put(`/api/todos/${id}`, data);

            return response;
        } catch (error) {
            console.error("Update todo error:", error);
            throw error;
        }
    };

    // DELETE /todos/:id - Delete todo
    static delete = async (id: number) => {
        try {
            const response: AxiosResponse<TTodosDeleteResponse> =
                await httpClient.delete(`/api/todos/${id}`);

            return response;
        } catch (error) {
            console.error("Delete todo error:", error);
            throw error;
        }
    };
}
