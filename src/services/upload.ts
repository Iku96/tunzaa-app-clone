import { useMutation } from "@tanstack/react-query";
import { Platform } from "react-native";
import { documentClient } from "./client";

interface UploadResponse {
  id: string;
  url: string;
  fileCDNUrl?: string;
  filename: string;
  size: number;
  mimetype: string;
  created_at: string;
}

export const uploadApi = {
  uploadDocument: async (file: FormData): Promise<UploadResponse> => {
    const response = await documentClient.post<UploadResponse>(
      "/upload",
      file,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        transformRequest: [
          (data, headers) => {
            delete headers["Authorization"];
            return data;
          },
        ],
      }
    );
    return response.data;
  },

  uploadFile: async (
    uri: string,
    filename: string,
    providedMimeType?: string
  ): Promise<UploadResponse> => {
    const formData = new FormData();

    const fileExtension = filename.split(".").pop()?.toLowerCase() || "jpg";

    // Determine mime type based on extension if not provided
    const mimeType =
      providedMimeType ||
      (() => {
        switch (fileExtension) {
          case "pdf":
            return "application/pdf";
          case "doc":
            return "application/msword";
          case "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          case "jpg":
          case "jpeg":
            return "image/jpeg";
          case "png":
            return "image/png";
          case "gif":
            return "image/gif";
          default:
            return "application/octet-stream";
        }
      })();

    // Create proper file object based on platform
    if (Platform.OS === "web") {
      // For web, fetch the blob from the URI and create a File object
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: mimeType });
        formData.append("file", file);
      } catch (error) {
        throw new Error("Failed to create file from URI: " + error);
      }
    } else {
      // For React Native, use the uri/name/type format
      const fileObject = {
        uri,
        name: filename,
        type: mimeType,
      } as any;
      formData.append("file", fileObject);
    }

    return uploadApi.uploadDocument(formData);
  },
};

// React Query Hooks
export const useUploadDocument = () => {
  return useMutation({
    mutationFn: uploadApi.uploadDocument,
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({
      uri,
      filename,
      mimeType,
    }: {
      uri: string;
      filename: string;
      mimeType?: string;
    }) => uploadApi.uploadFile(uri, filename, mimeType),
  });
};
