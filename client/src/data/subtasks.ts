import httpClient from "@/utils/httpClient";
import {
    TSubtasksListRequest,
    TSubtasksListResponse,
    TSubtasksCreateRequest,
    TSubtasksCreateResponse,
    TSubtasksReorderRequest,
    TSubtasksReorderResponse,
    TSubtasksGetRequest,
    TSubtasksGetResponse,
    TSubtasksUpdateRequest,
    TSubtasksUpdateResponse,
    TSubtasksDeleteResponse,
    TSubtasksStatusUpdateRequest,
    TSubtasksStatusUpdateResponse,
} from "@/types";
import { AxiosResponse } from "axios";

export class SubtasksApi {
    // GET /subtasks - List user's subtasks filtered by todo_id (required)
    static fetchAll = async (params: TSubtasksListRequest) => {
        try {
            const response: AxiosResponse<TSubtasksListResponse> =
                await httpClient.get("/api/subtasks", {
                    params,
                });

            return response;
        } catch (error) {
            console.error("Fetch subtasks error:", error);
            throw error;
        }
    };

    // POST /subtasks - Create a new subtask
    static create = async (data: TSubtasksCreateRequest) => {
        try {
            const response: AxiosResponse<TSubtasksCreateResponse> =
                await httpClient.post("/api/subtasks", data);

            return response;
        } catch (error) {
            console.error("Create subtask error:", error);
            throw error;
        }
    };

    // PUT /subtasks/reorder - Reorder subtasks for a todo
    static reorder = async (data: TSubtasksReorderRequest) => {
        try {
            const response: AxiosResponse<TSubtasksReorderResponse> =
                await httpClient.put("/api/subtasks/reorder", data);

            return response;
        } catch (error) {
            console.error("Reorder subtasks error:", error);
            throw error;
        }
    };

    // GET /subtasks/:id - Get specific subtask with details
    static fetchSingle = async (id: number, params?: TSubtasksGetRequest) => {
        try {
            const response: AxiosResponse<TSubtasksGetResponse> =
                await httpClient.get(`/api/subtasks/${id}`, {
                    params,
                });

            return response;
        } catch (error) {
            console.error("Fetch subtask error:", error);
            throw error;
        }
    };

    // PUT /subtasks/:id - Update subtask
    static update = async (id: number, data: TSubtasksUpdateRequest) => {
        try {
            const response: AxiosResponse<TSubtasksUpdateResponse> =
                await httpClient.put(`/api/subtasks/${id}`, data);

            return response;
        } catch (error) {
            console.error("Update subtask error:", error);
            throw error;
        }
    };

    // DELETE /subtasks/:id - Delete subtask
    static delete = async (id: number) => {
        try {
            const response: AxiosResponse<TSubtasksDeleteResponse> =
                await httpClient.delete(`/api/subtasks/${id}`);

            return response;
        } catch (error) {
            console.error("Delete subtask error:", error);
            throw error;
        }
    };

    // PUT /subtasks/:id/status - Update subtask status
    static updateStatus = async (id: number, data: TSubtasksStatusUpdateRequest) => {
        try {
            const response: AxiosResponse<TSubtasksStatusUpdateResponse> =
                await httpClient.put(`/api/subtasks/${id}/status`, data);

            return response;
        } catch (error) {
            console.error("Update subtask status error:", error);
            throw error;
        }
    };
}
