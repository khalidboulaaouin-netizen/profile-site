import { promises as fs } from "fs";
import path from "path";
import { put, head, BlobPreconditionFailedError } from "@vercel/blob";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const STORE_BLOB_PATH = "data/store.json";
const ANALYTICS_PATH = path.join(DATA_DIR, "analytics.json");
const ANALYTICS_BLOB_PATH = "data/analytics.json";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isBlobConflictError(error: unknown): boolean {
  return error instanceof BlobPreconditionFailedError;
}

export async function uploadPublicBinary(
  filename: string,
  data: Buffer,
  contentType: string,
): Promise<string> {
  if (blobEnabled()) {
    const blob = await put(`uploads/${filename}`, data, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return blob.url;
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), data);
  return `/uploads/${filename}`;
}

export type PersistedJsonRead = {
  json: string | null;
  etag: string | null;
  /** True when Blob/disk could not be reached (not merely empty). */
  unavailable: boolean;
};

async function readJsonFile(
  blobPath: string,
  diskPath: string,
): Promise<PersistedJsonRead> {
  if (blobEnabled()) {
    try {
      const meta = await head(blobPath);
      const res = await fetch(meta.url, { cache: "no-store" });
      if (!res.ok) {
        return { json: null, etag: meta.etag || null, unavailable: true };
      }
      return {
        json: await res.text(),
        etag: meta.etag || null,
        unavailable: false,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Missing blob → treat as empty store, not unavailable.
      if (/not found|404|does not exist/i.test(message)) {
        return { json: null, etag: null, unavailable: false };
      }
      return { json: null, etag: null, unavailable: true };
    }
  }

  try {
    const json = await fs.readFile(diskPath, "utf8");
    return { json, etag: null, unavailable: false };
  } catch {
    return { json: null, etag: null, unavailable: false };
  }
}

async function writeJsonFile(
  blobPath: string,
  diskPath: string,
  json: string,
  ifMatch?: string | null,
): Promise<string | null> {
  if (blobEnabled()) {
    const blob = await put(blobPath, json, {
      access: "public",
      contentType: "application/json; charset=utf-8",
      addRandomSuffix: false,
      allowOverwrite: true,
      ...(ifMatch ? { ifMatch } : {}),
    });
    return blob.etag || null;
  }

  await fs.mkdir(path.dirname(diskPath), { recursive: true });
  await fs.writeFile(diskPath, json, "utf8");
  return null;
}

export async function readPersistedStoreJson(): Promise<string | null> {
  const result = await readJsonFile(STORE_BLOB_PATH, STORE_PATH);
  if (result.unavailable) return null;
  return result.json;
}

export async function readPersistedStoreSnapshot(): Promise<PersistedJsonRead> {
  return readJsonFile(STORE_BLOB_PATH, STORE_PATH);
}

export async function writePersistedStoreJson(
  json: string,
  ifMatch?: string | null,
): Promise<string | null> {
  return writeJsonFile(STORE_BLOB_PATH, STORE_PATH, json, ifMatch);
}

export async function readPersistedAnalyticsSnapshot(): Promise<PersistedJsonRead> {
  return readJsonFile(ANALYTICS_BLOB_PATH, ANALYTICS_PATH);
}

export async function writePersistedAnalyticsJson(
  json: string,
  ifMatch?: string | null,
): Promise<string | null> {
  return writeJsonFile(ANALYTICS_BLOB_PATH, ANALYTICS_PATH, json, ifMatch);
}
