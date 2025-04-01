import { ApiError } from "@/types";
import axios from "axios";

export class APIService {
  private readonly baseUrl;
  private readonly accessToken;

  constructor(endpoint: string, session?: any) {
    this.baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`;
    this.accessToken = session?.accessToken;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }
    return response.json();
  }

  async get<T>(extraUrl: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const requestUrl = `${this.baseUrl}${extraUrl ? `/${extraUrl}` : ""}${
        Object.keys(params).length
          ? `?${new URLSearchParams(params).toString()}`
          : ""
      }`;
      const response = await fetch(requestUrl, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async post<T>(extraUrl: string, data: Record<string, any>): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${extraUrl ? `/${extraUrl}` : ""}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async update<T>(id: string, data: Record<string, any>): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async delete<T>(id: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  private formatError(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: "UNKNOWN_ERROR",
      };
    }
    return {
      message: "An unknown error occurred",
      code: "UNKNOWN_ERROR",
    };
  }

  async upload(file: File | Blob): Promise<{ file: string; url: string }> {
    const formData = new FormData();
    formData.append("file", file, file.name);
    const response = await axios.post(`${this.baseUrl}/upload`, formData, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data as { file: string; url: string };
  }
}
