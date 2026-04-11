// Shared helpers for bridging camera access from Flutter InAppWebView to the web app
// Safely handles environments where the bridge is not available.

/**
 * Convert a base64 string (without data URL prefix) to a File.
 * @param {string} base64 - Base64 encoded string (may or may not include data: prefix).
 * @param {string} filename - Desired file name.
 * @param {string} mimeType - MIME type, e.g. 'image/jpeg'.
 * @returns {File}
 */
export function base64ToFile(base64, filename = "image.jpg", mimeType = "image/jpeg") {
  let raw = base64 || "";
  // Strip data URL prefix if present
  if (raw.includes(",")) {
    raw = raw.split(",")[1];
  }

  const byteCharacters = atob(raw);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType || "image/jpeg" });
  return new File([blob], filename || "image.jpg", { type: blob.type });
}

/**
 * Check if Flutter InAppWebView bridge is available.
 */
export function hasFlutterCameraBridge() {
  return (
    typeof window !== "undefined" &&
    window.flutter_inappwebview &&
    typeof window.flutter_inappwebview.callHandler === "function"
  );
}

function parseFlutterCameraResult(result) {
  if (!result) return { success: false, raw: result };

  let data = result;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (_) {
      data = { base64: data };
    }
  }

  if (data.file instanceof File) {
    return { success: true, file: data.file, raw: result };
  }

  const base64 =
    data.base64 ||
    data.imageBase64 ||
    data.base64Image ||
    data.dataUrl ||
    data.imageData ||
    data.image;

  if (base64 && typeof base64 === "string") {
    const file = base64ToFile(
      base64,
      data.fileName || data.filename || data.name || `image-${Date.now()}.jpg`,
      data.mimeType || data.contentType || data.type || "image/jpeg",
    );
    return { success: true, file, raw: result };
  }

  return { success: Boolean(data.success), raw: result };
}

function createFlutterCameraCallback(timeoutMs = 30000) {
  if (typeof window === "undefined") {
    return {
      promise: Promise.resolve({ success: false, reason: "no_window" }),
      cleanup: () => {},
    };
  }

  const previousBridge = window.TruorderCameraBridge;
  const previousCallback = window.onFlutterCameraResult;
  let settled = false;
  let timer;

  const cleanup = () => {
    clearTimeout(timer);
    window.TruorderCameraBridge = previousBridge;
    window.onFlutterCameraResult = previousCallback;
  };

  const promise = new Promise((resolve) => {
    const finish = (result) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(parseFlutterCameraResult(result));
    };

    timer = setTimeout(() => {
      finish({ success: false, reason: "callback_timeout" });
    }, timeoutMs);

    window.TruorderCameraBridge = {
      ...(previousBridge || {}),
      onCameraResult: finish,
      onImageCaptured: finish,
    };
    window.onFlutterCameraResult = finish;
  });

  return { promise, cleanup };
}

/**
 * Open camera via Flutter InAppWebView bridge.
 * Calls handler with no args to match Flutter: openCamera() -> { success, base64, mimeType, fileName }
 * Returns a File object when successful.
 *
 * @param {Object} options - Optional (Flutter may ignore). source, accept, multiple, quality.
 * @returns {Promise<{ success: boolean, file?: File, raw?: any, error?: any }>}
 */
export async function openCameraViaFlutter(options = {}) {
  if (!hasFlutterCameraBridge()) {
    return { success: false, reason: "no_flutter_bridge" };
  }

  let callbackBridge;
  try {
    callbackBridge = createFlutterCameraCallback(options.timeoutMs);
    const result = await window.flutter_inappwebview.callHandler("openCamera", options);
    const parsed = parseFlutterCameraResult(result);

    if (parsed.success && parsed.file) {
      callbackBridge.cleanup();
      return parsed;
    }

    const callbackResult = await callbackBridge.promise;
    if (callbackResult.success && callbackResult.file) {
      return callbackResult;
    }

    return parsed.success ? parsed : callbackResult;
  } catch (error) {
    callbackBridge?.cleanup();
    console.error("[CameraBridge] Failed to open camera via Flutter:", error);
    return { success: false, error };
  }
}

/**
 * Pick image for upload: uses Flutter camera bridge when in WebView, else triggers file input.
 * Use when you need a single flow that works in both Flutter and browser.
 *
 * @param {HTMLInputElement|null} fileInputRef - Ref to hidden file input (for browser fallback)
 * @param {boolean} useCamera - If true, prefer camera. In Flutter always uses camera.
 * @returns {Promise<File|null>} - The selected file, or null if cancelled/failed
 */
export async function pickImageForUpload(fileInputRef, useCamera = true) {
  if (hasFlutterCameraBridge()) {
    const { success, file } = await openCameraViaFlutter({ source: "camera" });
    return success && file ? file : null;
  }
  if (fileInputRef?.current) {
    return new Promise((resolve) => {
      const input = fileInputRef.current;
      const handler = (e) => {
        const file = e.target?.files?.[0];
        input.removeEventListener("change", handler);
        input.value = "";
        resolve(file || null);
      };
      input.addEventListener("change", handler);
      if (useCamera) input.setAttribute("capture", "environment");
      else input.removeAttribute("capture");
      input.click();
    });
  }
  return null;
}
