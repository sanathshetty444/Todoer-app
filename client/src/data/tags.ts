import httpClient from "@/utils/httpClient";
import {
    TTagsListRequest,
    TTagsListResponse,
    TTagsAutocompleteResponse,
    TTagsCreateRequest,
    TTagsCreateResponse,
    TTagsGetRequest,
    TTagsGetResponse,
    TTagsUpdateRequest,
    TTagsUpdateResponse,
    TTagsDeleteRequest,
    TTagsDeleteResponse,
} from "@/types";
import { AxiosResponse } from "axios";

export class TagsApi {
    // GET /tags - List user's tags with filters, pagination & autocomplete support
    static fetchAll = async (params?: TTagsListRequest) => {
        try {
            const response: AxiosResponse<
                TTagsListResponse | TTagsAutocompleteResponse
            > = await httpClient.get("/api/tags", {
                params,
            });

            return response;
        } catch (error) {
            console.error("Fetch tags error:", error);
            throw error;
        }
    };

    // GET /tags - Autocomplete specific method for better type safety
    static fetchAutocomplete = async (search?: string, limit?: number) => {
        try {
            const response: AxiosResponse<TTagsAutocompleteResponse> =
                await httpClient.get("/api/tags", {
                    params: {
                        autocomplete: true,
                        search,
                        limit: limit || 10,
                    },
                });

            return response;
        } catch (error) {
            console.error("Fetch tags autocomplete error:", error);
            throw error;
        }
    };

    // POST /tags - Create a new tag
    static create = async (data: TTagsCreateRequest) => {
        try {
            const response: AxiosResponse<TTagsCreateResponse> =
                await httpClient.post("/api/tags", data);

            return response;
        } catch (error) {
            console.error("Create tag error:", error);
            throw error;
        }
    };

    // GET /tags/:id - Get specific tag with details
    static fetchSingle = async (id: number, params?: TTagsGetRequest) => {
        try {
            const response: AxiosResponse<TTagsGetResponse> =
                await httpClient.get(`/api/tags/${id}`, {
                    params,
                });

            return response;
        } catch (error) {
            console.error("Fetch tag error:", error);
            throw error;
        }
    };

    // PUT /tags/:id - Update tag
    static update = async (id: number, data: TTagsUpdateRequest) => {
        try {
            const response: AxiosResponse<TTagsUpdateResponse> =
                await httpClient.put(`/api/tags/${id}`, data);

            return response;
        } catch (error) {
            console.error("Update tag error:", error);
            throw error;
        }
    };

    // DELETE /tags/:id - Delete tag
    static delete = async (id: number, params?: TTagsDeleteRequest) => {
        try {
            const response: AxiosResponse<TTagsDeleteResponse> =
                await httpClient.delete(`/api/tags/${id}`, {
                    params,
                });

            return response;
        } catch (error) {
            console.error("Delete tag error:", error);
            throw error;
        }
    };
}
