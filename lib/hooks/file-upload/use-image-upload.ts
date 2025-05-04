import { useCallback, useState } from "react";
import useFileUpload, {
  type FileUploadConfig,
  type UploadResult,
  type FileUploadOptions,
} from "./use-file-upload";

export type ImageDimensions = {
  width: number;
  height: number;
};

export type ImageUploadOptions = FileUploadOptions & {
  /** Maximum image dimensions */
  maxDimensions?: ImageDimensions;
  /** Minimum image dimensions */
  minDimensions?: ImageDimensions;
  /** Whether to compress the image before upload */
  compress?: boolean;
  /** Compression quality (0-1, default: 0.8) */
  quality?: number;
  /** Maximum width to resize to */
  maxWidth?: number;
  /** Maximum height to resize to */
  maxHeight?: number;
  /** Whether to generate a thumbnail */
  generateThumbnail?: boolean;
  /** Thumbnail size */
  thumbnailSize?: number;
};

export type ImageUploadResult = UploadResult & {
  dimensions: ImageDimensions;
  thumbnail?: {
    key: string;
    url: string;
    dimensions: ImageDimensions;
  };
};

/**
 * Custom hook for uploading images to S3-compatible storage
 */
export function useImageUpload(config: FileUploadConfig) {
  const [dimensions, setDimensions] = useState<Record<string, ImageDimensions>>({});

  const { uploadFile, isUploading, progress, error, resetError } = useFileUpload(config);

  // Get image dimensions
  const getImageDimensions = useCallback((file: File): Promise<ImageDimensions> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Validate image dimensions
  const validateImageDimensions = useCallback(
    (dimensions: ImageDimensions, options?: ImageUploadOptions) => {
      if (options?.minDimensions) {
        if (
          dimensions.width < options.minDimensions.width ||
          dimensions.height < options.minDimensions.height
        ) {
          throw new Error(
            `Image dimensions too small. Minimum: ${options.minDimensions.width}x${options.minDimensions.height}px`
          );
        }
      }

      if (options?.maxDimensions) {
        if (
          dimensions.width > options.maxDimensions.width ||
          dimensions.height > options.maxDimensions.height
        ) {
          throw new Error(
            `Image dimensions too large. Maximum: ${options.maxDimensions.width}x${options.maxDimensions.height}px`
          );
        }
      }
    },
    []
  );

  // Compress image if needed
  const compressImage = useCallback(
    async (
      file: File,
      options?: ImageUploadOptions
    ): Promise<{ file: File; dimensions: ImageDimensions }> => {
      if (!options?.compress) {
        const dimensions = await getImageDimensions(file);
        return { file, dimensions };
      }

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          // Resize if needed
          if (options.maxWidth && width > options.maxWidth) {
            height = (height * options.maxWidth) / width;
            width = options.maxWidth;
          }

          if (options.maxHeight && height > options.maxHeight) {
            width = (width * options.maxHeight) / height;
            height = options.maxHeight;
          }

          // Create canvas for compression
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              // Create new file from blob
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: file.lastModified,
              });

              resolve({
                file: compressedFile,
                dimensions: { width, height },
              });
            },
            file.type,
            options.quality || 0.8
          );
        };

        img.onerror = () => {
          reject(new Error("Failed to load image for compression"));
        };

        img.src = URL.createObjectURL(file);
      });
    },
    [getImageDimensions]
  );

  // Generate thumbnail
  const generateThumbnail = useCallback(
    async (
      file: File,
      options?: ImageUploadOptions
    ): Promise<{ file: File; dimensions: ImageDimensions }> => {
      if (!options?.generateThumbnail) {
        throw new Error("Thumbnail generation not requested");
      }

      const thumbnailSize = options.thumbnailSize || 200;

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          // Calculate thumbnail dimensions
          if (width > height) {
            height = (height * thumbnailSize) / width;
            width = thumbnailSize;
          } else {
            width = (width * thumbnailSize) / height;
            height = thumbnailSize;
          }

          // Create canvas for thumbnail
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to generate thumbnail"));
                return;
              }

              // Create new file from blob
              const fileName = file.name;
              const fileNameParts = fileName.split(".");
              const extension = fileNameParts.pop() || "";
              const baseName = fileNameParts.join(".");
              const thumbnailName = `${baseName}-thumbnail.${extension}`;

              const thumbnailFile = new File([blob], thumbnailName, {
                type: file.type,
                lastModified: file.lastModified,
              });

              resolve({
                file: thumbnailFile,
                dimensions: { width, height },
              });
            },
            file.type,
            0.7
          );
        };

        img.onerror = () => {
          reject(new Error("Failed to load image for thumbnail generation"));
        };

        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  // Upload a single image
  const uploadImage = useCallback(
    async (file: File, options?: ImageUploadOptions): Promise<ImageUploadResult> => {
      try {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("File is not an image");
        }

        // Process image (compress if needed)
        const { file: processedFile, dimensions } = await compressImage(file, options);

        // Validate dimensions
        validateImageDimensions(dimensions, options);

        // Store dimensions for later use
        setDimensions((prev) => ({
          ...prev,
          [processedFile.name]: dimensions,
        }));

        // Upload the main image
        const uploadResult = await uploadFile(processedFile, {
          maxSize: options?.maxSize,
          keyPrefix: options?.keyPrefix || "images/",
          public: options?.public !== false,
          metadata: {
            "image-width": dimensions.width.toString(),
            "image-height": dimensions.height.toString(),
          },
        });

        // Generate and upload thumbnail if requested
        if (options?.generateThumbnail) {
          try {
            const thumbnail = await generateThumbnail(file, options);

            const thumbnailResult = await uploadFile(thumbnail.file, {
              keyPrefix: `${options?.keyPrefix || "images/"}thumbnails/`,
              public: options?.public !== false,
            });

            // Return combined result with thumbnail
            return {
              ...uploadResult,
              dimensions,
              thumbnail: {
                key: thumbnailResult.key,
                url: thumbnailResult.url,
                dimensions: thumbnail.dimensions,
              },
            };
          } catch (thumbnailError) {
            console.error("Thumbnail generation error:", thumbnailError);
            // Continue without thumbnail if there's an error
          }
        }

        // Return result without thumbnail
        return {
          ...uploadResult,
          dimensions,
        };
      } catch (err) {
        console.error("Image upload error:", err);
        throw err;
      }
    },
    [uploadFile, compressImage, validateImageDimensions, generateThumbnail]
  );

  // Upload multiple images
  const uploadImages = useCallback(
    async (files: File[], options?: ImageUploadOptions): Promise<ImageUploadResult[]> => {
      const results: ImageUploadResult[] = [];

      for (const file of files) {
        try {
          const result = await uploadImage(file, options);
          results.push(result);
        } catch (err) {
          console.error(`Error uploading image ${file.name}:`, err);
          // Continue with other files even if one fails
        }
      }

      return results;
    },
    [uploadImage]
  );

  // Handle file input change event
  const handleImageInputChange = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      options?: ImageUploadOptions
    ): Promise<ImageUploadResult | ImageUploadResult[] | null> => {
      const files = event.target.files;
      if (!files || files.length === 0) return null;

      try {
        if (files.length === 1 && files[0]) {
          return await uploadImage(files[0], options);
        }
        return await uploadImages(Array.from(files), options);
      } catch (error) {
        console.error("Image upload error:", error);
        return null;
      }
    },
    [uploadImage, uploadImages]
  );

  return {
    uploadImage,
    uploadImages,
    handleImageInputChange,
    isUploading,
    progress,
    error,
    resetError,
    dimensions,
  };
}

export default useImageUpload;
