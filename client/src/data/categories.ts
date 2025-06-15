import httpClient from "@/utils/httpClient";
import {
    TCategoriesListRequest,
    TCategoriesListResponse,
    TCategoriesCreateRequest,
    TCategoriesCreateResponse,
    TCategoriesGetRequest,
    TCategoriesGetResponse,
    TCategoriesUpdateRequest,
    TCategoriesUpdateResponse,
    TCategoriesDeleteRequest,
    TCategoriesDeleteResponse,
} from "@/types";
import { AxiosResponse } from "axios";

export class CategoriesApi {
    // GET /categories - List user's categories with filters and pagination
    static fetchAll = async (params?: TCategoriesListRequest) => {
        try {
            const response: AxiosResponse<TCategoriesListResponse> =
                await httpClient.get("/api/categories", {
                    params,
                });

            return response;
        } catch (error) {
            console.error("Fetch categories error:", error);
            throw error;
        }
    };

    // POST /categories - Create a new category
    static create = async (data: TCategoriesCreateRequest) => {
        try {
            const response: AxiosResponse<TCategoriesCreateResponse> =
                await httpClient.post("/api/categories", data);

            return response;
        } catch (error) {
            console.error("Create category error:", error);
            throw error;
        }
    };

    // GET /categories/:id - Get specific category with details
    static fetchSingle = async (id: number, params?: TCategoriesGetRequest) => {
        try {
            const response: AxiosResponse<TCategoriesGetResponse> =
                await httpClient.get(`/api/categories/${id}`, {
                    params,
                });

            return response;
        } catch (error) {
            console.error("Fetch category error:", error);
            throw error;
        }
    };

    // PUT /categories/:id - Update category
    static update = async (id: number, data: TCategoriesUpdateRequest) => {
        try {
            const response: AxiosResponse<TCategoriesUpdateResponse> =
                await httpClient.put(`/api/categories/${id}`, data);

            return response;
        } catch (error) {
            console.error("Update category error:", error);
            throw error;
        }
    };

    // DELETE /categories/:id - Delete category
    static delete = async (id: number, params?: TCategoriesDeleteRequest) => {
        try {
            const response: AxiosResponse<TCategoriesDeleteResponse> =
                await httpClient.delete(`/api/categories/${id}`, {
                    params,
                });

            return response;
        } catch (error) {
            console.error("Delete category error:", error);
            throw error;
        }
    };
}
