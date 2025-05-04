// File upload hooks
export { default as useFileUpload } from "./file-upload/use-file-upload";
export { default as useImageUpload } from "./file-upload/use-image-upload";
export { default as useGPSFileUpload } from "./file-upload/use-gps-file-upload";

// Other existing hooks
export { useIsMobile } from "./use-mobile";
export { useMounted } from "./use-mounted";
export { useCopyToClipboard } from "./use-copy-to-clipboard";
export { useMediaQuery } from "./use-media-query";

// Types
export type {
  FileUploadConfig,
  FileUploadOptions,
  UploadProgress,
  UploadResult,
  UploadError,
} from "./file-upload/use-file-upload";

export type {
  ImageDimensions,
  ImageUploadOptions,
  ImageUploadResult,
} from "./file-upload/use-image-upload";

export type {
  GPSFileUploadOptions,
  GPSUploadResult,
} from "./file-upload/use-gps-file-upload";
