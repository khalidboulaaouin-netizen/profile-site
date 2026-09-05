import { promises as fs } from "fs";
import path from "path";
import { put, head } from "@vercel/blob";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const STORE_BLOB_PATH = "data/store.json";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
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

export async function readPersistedStoreJson(): Promise<string | null> {
  if (blobEnabled()) {
    try {
      const meta = await head(STORE_BLOB_PATH);
      const res = await fetch(meta.url, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      return await res.text();
    } catch {
      // Blob missing or temporarily unavailable — do NOT fall back to the
      // packaged seed file, or a later write would wipe production data.
      return null;
    }
  }

  try {
    return await fs.readFile(STORE_PATH, "utf8");
  } catch {
    return null;
  }
}

export async function writePersistedStoreJson(json: string): Promise<void> {
  if (blobEnabled()) {
    await put(STORE_BLOB_PATH, json, {
      access: "public",
      contentType: "application/json; charset=utf-8",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, json, "utf8");
}
