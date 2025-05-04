# File Upload Hooks

A collection of React hooks for uploading files to S3-compatible storage services like AWS S3 or Cloudflare R2.

## Available Hooks

- **useFileUpload**: Generic hook for uploading any type of file
- **useImageUpload**: Specialized hook for uploading images with additional features
- **useGPSFileUpload**: Specialized hook for uploading GPS files (GPX, KML, etc.)

## Features

- 📤 Upload single or multiple files
- 📊 Track upload progress
- ✅ File validation (size, type)
- 🔒 Secure uploads with pre-signed URLs
- 🔄 Support for direct uploads
- 🧩 Customizable file keys and metadata
- 🚫 Comprehensive error handling
- 🖼️ Image-specific features (compression, thumbnails, dimension validation)
- 🗺️ GPS file parsing and metadata extraction

## Installation

This hook requires the following dependencies:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Usage

### Common Configuration

All hooks share the same base configuration for S3-compatible storage:

```tsx
const config = {
  endpoint: process.env.NEXT_PUBLIC_R2_ENDPOINT || '',
  accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY || '',
  bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME || '',
  publicUrl: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
};
```

### 1. useFileUpload - Generic File Upload

```tsx
import { useFileUpload } from '@/lib/hooks';

function GenericFileUploadComponent() {
  const { uploadFile, isUploading, progress, error } = useFileUpload(config);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        keyPrefix: 'uploads/',
        public: true,
      });

      console.log('File uploaded:', result.url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={isUploading} />

      {isUploading && progress && (
        <div>
          <p>Uploading: {progress.percentage}%</p>
          <progress value={progress.percentage} max="100" />
        </div>
      )}

      {error && (
        <div>
          <p>Error: {error.message}</p>
        </div>
      )}
    </div>
  );
}
```

### 2. useImageUpload - Image-Specific Upload

```tsx
import { useImageUpload } from '@/lib/hooks';

function ImageUploadComponent() {
  const {
    uploadImage,
    isUploading,
    progress,
    error,
    dimensions
  } = useImageUpload(config);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        keyPrefix: 'images/',
        public: true,
        compress: true,
        quality: 0.8,
        maxWidth: 1200,
        generateThumbnail: true,
        thumbnailSize: 200,
        maxDimensions: { width: 2000, height: 2000 },
        minDimensions: { width: 100, height: 100 },
      });

      console.log('Image uploaded:', result.url);
      console.log('Image dimensions:', result.dimensions);

      if (result.thumbnail) {
        console.log('Thumbnail:', result.thumbnail.url);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={isUploading}
      />

      {isUploading && progress && (
        <div>
          <p>Uploading: {progress.percentage}%</p>
          <progress value={progress.percentage} max="100" />
        </div>
      )}

      {error && (
        <div>
          <p>Error: {error.message}</p>
        </div>
      )}
    </div>
  );
}
```

### 3. useGPSFileUpload - GPS File Upload

```tsx
import { useGPSFileUpload } from '@/lib/hooks';

function GPSFileUploadComponent() {
  const {
    uploadGPSFile,
    isUploading,
    progress,
    error,
    gpsData
  } = useGPSFileUpload(config);

  const handleGPSFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadGPSFile(file, {
        maxSize: 50 * 1024 * 1024, // 50MB
        keyPrefix: 'gps/',
        public: true,
        extractData: true,
        simplifyTrack: true,
        simplifyTolerance: 0.0001,
      });

      console.log('GPS file uploaded:', result.url);
      console.log('GPS data:', result.gpsData);
      console.log('Distance:', result.gpsData.stats.distance);
      console.log('Elevation gain:', result.gpsData.stats.elevation.gain);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".gpx,.kml,.fit,.tcx"
        onChange={handleGPSFileChange}
        disabled={isUploading}
      />

      {isUploading && progress && (
        <div>
          <p>Uploading: {progress.percentage}%</p>
          <progress value={progress.percentage} max="100" />
        </div>
      )}

      {error && (
        <div>
          <p>Error: {error.message}</p>
        </div>
      )}
    </div>
  );
}
```

## Configuration Options

### Common Hook Configuration

| Parameter | Type | Description |
|-----------|------|-------------|
| `endpoint` | `string` | The S3-compatible endpoint URL |
| `region` | `string` | The region (default: "auto") |
| `accessKeyId` | `string` | The access key ID |
| `secretAccessKey` | `string` | The secret access key |
| `bucket` | `string` | The bucket name |
| `publicUrl` | `string` | (Optional) The public URL base for the bucket |

### 1. useFileUpload Options

| Option | Type | Description |
|--------|------|-------------|
| `maxSize` | `number` | Maximum file size in bytes (default: 5MB) |
| `acceptedFileTypes` | `string[]` | Allowed file types (e.g., ['image/*', '.pdf', '.gpx']) |
| `keyPrefix` | `string` | Custom key prefix for the uploaded file |
| `generateKey` | `(file: File) => string` | Custom key generator function |
| `usePresignedUrl` | `boolean` | Whether to use pre-signed URLs for upload (default: true) |
| `presignedUrlExpiration` | `number` | Expiration time for pre-signed URLs in seconds (default: 60) |
| `headers` | `Record<string, string>` | Custom headers to include in the upload request |
| `metadata` | `Record<string, string>` | Custom metadata to include with the file |
| `public` | `boolean` | Whether to make the file public (default: false) |

### 2. useImageUpload Options

Extends all options from `useFileUpload` plus:

| Option | Type | Description |
|--------|------|-------------|
| `maxDimensions` | `{ width: number; height: number }` | Maximum image dimensions |
| `minDimensions` | `{ width: number; height: number }` | Minimum image dimensions |
| `compress` | `boolean` | Whether to compress the image before upload |
| `quality` | `number` | Compression quality (0-1, default: 0.8) |
| `maxWidth` | `number` | Maximum width to resize to |
| `maxHeight` | `number` | Maximum height to resize to |
| `generateThumbnail` | `boolean` | Whether to generate a thumbnail |
| `thumbnailSize` | `number` | Thumbnail size (default: 200px) |

### 3. useGPSFileUpload Options

Extends all options from `useFileUpload` plus:

| Option | Type | Description |
|--------|------|-------------|
| `extractData` | `boolean` | Whether to extract and save GPS data |
| `simplifyTrack` | `boolean` | Whether to simplify the GPS track for better performance |
| `simplifyTolerance` | `number` | Tolerance for track simplification (higher = more simplification) |

## Return Values

### 1. useFileUpload Returns

| Value | Type | Description |
|-------|------|-------------|
| `uploadFile` | `(file: File, options?: FileUploadOptions) => Promise<UploadResult>` | Function to upload a single file |
| `uploadFiles` | `(files: File[], options?: FileUploadOptions) => Promise<UploadResult[]>` | Function to upload multiple files |
| `handleFileInputChange` | `(event: React.ChangeEvent<HTMLInputElement>, options?: FileUploadOptions) => Promise<UploadResult \| UploadResult[] \| null>` | Convenience function to handle file input change events |
| `isUploading` | `boolean` | Whether an upload is in progress |
| `progress` | `UploadProgress \| null` | Current upload progress information |
| `error` | `UploadError \| null` | Error information if an upload fails |
| `resetError` | `() => void` | Function to reset the error state |

### 2. useImageUpload Returns

| Value | Type | Description |
|-------|------|-------------|
| `uploadImage` | `(file: File, options?: ImageUploadOptions) => Promise<ImageUploadResult>` | Function to upload a single image |
| `uploadImages` | `(files: File[], options?: ImageUploadOptions) => Promise<ImageUploadResult[]>` | Function to upload multiple images |
| `handleImageInputChange` | `(event: React.ChangeEvent<HTMLInputElement>, options?: ImageUploadOptions) => Promise<ImageUploadResult \| ImageUploadResult[] \| null>` | Convenience function to handle image input change events |
| `isUploading` | `boolean` | Whether an upload is in progress |
| `progress` | `UploadProgress \| null` | Current upload progress information |
| `error` | `UploadError \| null` | Error information if an upload fails |
| `resetError` | `() => void` | Function to reset the error state |
| `dimensions` | `Record<string, ImageDimensions>` | Cached image dimensions |

### 3. useGPSFileUpload Returns

| Value | Type | Description |
|-------|------|-------------|
| `uploadGPSFile` | `(file: File, options?: GPSFileUploadOptions) => Promise<GPSUploadResult>` | Function to upload a single GPS file |
| `uploadGPSFiles` | `(files: File[], options?: GPSFileUploadOptions) => Promise<GPSUploadResult[]>` | Function to upload multiple GPS files |
| `handleGPSFileInputChange` | `(event: React.ChangeEvent<HTMLInputElement>, options?: GPSFileUploadOptions) => Promise<GPSUploadResult \| GPSUploadResult[] \| null>` | Convenience function to handle GPS file input change events |
| `isUploading` | `boolean` | Whether an upload is in progress |
| `progress` | `UploadProgress \| null` | Current upload progress information |
| `error` | `UploadError \| null` | Error information if an upload fails |
| `resetError` | `() => void` | Function to reset the error state |
| `gpsData` | `Record<string, ParsedGPSData>` | Cached GPS data |

## Types

### Common Types

```ts
type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

type UploadResult = {
  key: string;
  url: string;
  file: File;
};

type UploadError = {
  message: string;
  file?: File;
  code?: string;
};
```

### Image-Specific Types

```ts
type ImageDimensions = {
  width: number;
  height: number;
};

type ImageUploadResult = UploadResult & {
  dimensions: ImageDimensions;
  thumbnail?: {
    key: string;
    url: string;
    dimensions: ImageDimensions;
  };
};
```

### GPS-Specific Types

```ts
type GPSUploadResult = UploadResult & {
  gpsData: ParsedGPSData;
};

// ParsedGPSData is imported from @/lib/utils/gps-file-parser
interface ParsedGPSData {
  geoJSON: GeoJSON.FeatureCollection;
  stats: {
    distance: number; // in meters
    duration: number; // in seconds
    elevation: {
      gain: number; // in meters
      loss: number; // in meters
      max: number; // in meters
      min: number; // in meters
    };
    startTime: Date | null;
    endTime: Date | null;
    pace: number; // in seconds per kilometer
  };
  rawData?: unknown; // Original parsed data
}
```

## Environment Setup for Cloudflare R2

1. Create a Cloudflare R2 bucket in your Cloudflare dashboard
2. Create an R2 API token with appropriate permissions
3. Add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
NEXT_PUBLIC_R2_ACCESS_KEY_ID=your-access-key-id
NEXT_PUBLIC_R2_SECRET_ACCESS_KEY=your-secret-access-key
NEXT_PUBLIC_R2_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-public-url.com (optional)
```

## CORS Configuration

For browser uploads to work, you need to configure CORS on your bucket. Here's an example CORS configuration for Cloudflare R2:

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## Security Considerations

- Never expose your secret access key in client-side code
- Use pre-signed URLs for secure uploads
- Set appropriate CORS policies
- Validate files on both client and server
- Consider implementing server-side validation as well

## License

MIT
