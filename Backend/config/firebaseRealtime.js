/**
 * Firebase Realtime Database (Backend)
 * Used for: active_orders, delivery_boys, route_cache, live tracking.
 *
 * Primary source of truth: environment variables stored in MongoDB.
 * Fallbacks: process.env -> local service account files.
 */

import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { getFirebaseCredentials } from "../shared/utils/envService.js";

const DEFAULT_DATABASE_URL =
  "https://tastizoo-default-rtdb.asia-southeast1.firebasedatabase.app";

let db = null;
let initialized = false;
let initPromise = null;

function waitForMongoConnection(timeoutMs = 15000) {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let resolved = false;

    const cleanup = () => {
      mongoose.connection.off("connected", handleConnected);
      mongoose.connection.off("error", handleDone);
      mongoose.connection.off("disconnected", handleDone);
    };

    const handleDone = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve();
    };

    const handleConnected = () => {
      handleDone();
    };

    mongoose.connection.once("connected", handleConnected);
    mongoose.connection.once("error", handleDone);
    mongoose.connection.once("disconnected", handleDone);

    setTimeout(handleDone, timeoutMs);
  });
}

function normalizePrivateKey(privateKey) {
  if (!privateKey || typeof privateKey !== "string") return "";
  return privateKey.includes("\\n")
    ? privateKey.replace(/\\n/g, "\n")
    : privateKey;
}

function getCredentialsFromFiles() {
  const cwd = process.cwd();
  const pathsToTry = [
    path.resolve(cwd, "config", "serviceAccountKey.json"),
    path.resolve(cwd, "config", "tastizoo-default-rtdb-firebase-adminsdk.json"),
    path.resolve(
      cwd,
      "config",
      "zomato-607fa-firebase-adminsdk-fbsvc-f5f782c2cc.json",
    ),
    path.resolve(cwd, "firebaseconfig.json"),
  ];

  for (const filePath of pathsToTry) {
    try {
      if (!fs.existsSync(filePath)) continue;

      const raw = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(raw);

      const projectId = json.project_id || "";
      const clientEmail = json.client_email || "";
      const privateKey = normalizePrivateKey(json.private_key || "");

      if (projectId && clientEmail && privateKey) {
        return { projectId, clientEmail, privateKey };
      }
    } catch {
      // skip invalid fallback file
    }
  }

  return null;
}

async function getCredentials() {
  try {
    await waitForMongoConnection();
    const dbCredentials = await getFirebaseCredentials();
    const projectId = dbCredentials.projectId || process.env.FIREBASE_PROJECT_ID;
    const clientEmail =
      dbCredentials.clientEmail || process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = normalizePrivateKey(
      dbCredentials.privateKey || process.env.FIREBASE_PRIVATE_KEY || "",
    );
    const databaseURL =
      dbCredentials.databaseURL ||
      process.env.FIREBASE_DATABASE_URL ||
      DEFAULT_DATABASE_URL;

    if (projectId && clientEmail && privateKey) {
      return { projectId, clientEmail, privateKey, databaseURL, source: "db" };
    }
  } catch (error) {
    console.warn(
      "Failed to read Firebase credentials from DB, trying file/env fallback:",
      error.message,
    );
  }

  const fileCredentials = getCredentialsFromFiles();
  if (fileCredentials) {
    return {
      ...fileCredentials,
      databaseURL:
        process.env.FIREBASE_DATABASE_URL || DEFAULT_DATABASE_URL,
      source: "file",
    };
  }

  const envProjectId = process.env.FIREBASE_PROJECT_ID || "";
  const envClientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
  const envPrivateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY || "");
  if (envProjectId && envClientEmail && envPrivateKey) {
    return {
      projectId: envProjectId,
      clientEmail: envClientEmail,
      privateKey: envPrivateKey,
      databaseURL:
        process.env.FIREBASE_DATABASE_URL || DEFAULT_DATABASE_URL,
      source: "env",
    };
  }

  return null;
}

export async function initializeFirebaseRealtime() {
  if (initialized && db) {
    return db;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const creds = await getCredentials();

    if (!creds) {
      if (mongoose.connection.readyState !== 1) {
        console.info(
          "Firebase Realtime Database initialization deferred until MongoDB-backed credentials are available.",
        );
        return null;
      }

      console.warn(
        "Firebase Realtime Database not initialized: missing credentials in DB/env/file.",
      );
      return null;
    }

    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: creds.projectId,
            clientEmail: creds.clientEmail,
            privateKey: creds.privateKey,
          }),
          databaseURL: creds.databaseURL,
        });
      }

      const app = admin.app();
      db = creds.databaseURL ? app.database(creds.databaseURL) : app.database();
      initialized = true;
      console.log(
        `Firebase Realtime Database initialized using ${creds.source} credentials.`,
      );
      return db;
    } catch (error) {
      if (error?.code === "app/duplicate-app") {
        const app = admin.app();
        db = creds.databaseURL ? app.database(creds.databaseURL) : app.database();
        initialized = true;
        return db;
      }

      console.error("Firebase Realtime Database init failed:", error.message);
      return null;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

export function getDb() {
  if (!db || !initialized) {
    throw new Error(
      "Firebase Realtime Database not available. Call initializeFirebaseRealtime() first.",
    );
  }
  return db;
}

export function isFirebaseRealtimeAvailable() {
  return initialized && db !== null;
}
