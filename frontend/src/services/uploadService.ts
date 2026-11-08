import { apiClient } from "./api.ts";

interface ImageKitUploadResponse {
  url: string;
  fileId: string;
}

export const uploadService = {
  async uploadImage(file: File): Promise<ImageKitUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<ImageKitUploadResponse>(
      "/uploads/progress-photo",
      formData
    );
    return response.data;
  },

  async deleteImage(fileId: string): Promise<void> {
    await apiClient.post("/uploads/delete", { fileId });
  },
};
