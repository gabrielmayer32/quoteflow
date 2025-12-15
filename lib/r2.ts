import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * R2 is considered configured when these server-side env vars are set.
 * NOTE: R2_ENDPOINT is optional; do not require it for "configured".
 */
export function isR2Configured(): boolean {
  return !!(
    process.env.R2_BUCKET &&
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
  );
}

/**
 * Lazily create the client so runtime env is always used.
 * Avoids "configured at build-time but not at runtime" issues.
 */
function getR2Client(): S3Client {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured. Please set R2 environment variables.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * Upload a file and return only the KEY (not the URL).
 */
export async function uploadToR2AndReturnKey(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<string> {
  const r2 = getR2Client();
  const bucketName = process.env.R2_BUCKET!;

  await r2.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: contentType || "application/octet-stream",
      // CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return key;
}

/**
 * Public URL builder.
 * Prefer setting R2_PUBLIC_BASE_URL to your custom domain (recommended).
 */
export function getPublicR2Url(key: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (base) return `${base.replace(/\/$/, "")}/${key}`;

  // Default R2 public URL format (works only if bucket/public domain allows it)
  return `https://${process.env.R2_BUCKET}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}

/**
 * Signed URL (recommended for private buckets).
 */
export async function getSignedR2Url(
  key: string,
  expiresInSeconds: number = 60 * 10
): Promise<string> {
  const r2 = getR2Client();
  const bucketName = process.env.R2_BUCKET!;

  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: bucketName, Key: key }),
    { expiresIn: expiresInSeconds }
  );
}

/**
 * Delete object from R2.
 */
export async function deleteFromR2(key: string): Promise<void> {
  const r2 = getR2Client();
  const bucketName = process.env.R2_BUCKET!;

  await r2.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
}

export function generateFileKey(
  originalFilename: string,
  prefix: string = "uploads"
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split(".").pop() || "bin";
  const sanitizedName = originalFilename
    .split(".")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .substring(0, 50);

  return `${prefix}/${timestamp}-${randomString}-${sanitizedName}.${extension}`;
}
