export function hasFlutterGoogleSignInBridge() {
  return (
    typeof window !== "undefined" &&
    window.flutter_inappwebview &&
    typeof window.flutter_inappwebview.callHandler === "function"
  );
}

export async function signInWithGoogleBridge({ firebaseAuth, googleProvider }) {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth is not initialized.");
  }

  if (!googleProvider) {
    throw new Error("Google provider is not initialized.");
  }

  const { GoogleAuthProvider, signInWithCredential, signInWithPopup } = await import("firebase/auth");

  if (hasFlutterGoogleSignInBridge()) {
    const bridgeResult = await window.flutter_inappwebview.callHandler("nativeGoogleSignIn");

    if (!bridgeResult?.success) {
      const bridgeError =
        bridgeResult?.error ||
        bridgeResult?.message ||
        "Google sign-in was cancelled or failed in the Flutter app.";
      const error = new Error(bridgeError);
      error.code = bridgeResult?.code || "auth/flutter-google-sign-in-failed";
      error.bridgeResult = bridgeResult;
      throw error;
    }

    if (!bridgeResult?.idToken && !bridgeResult?.accessToken) {
      throw new Error("Flutter Google sign-in did not return a Firebase token.");
    }

    const credential = GoogleAuthProvider.credential(
      bridgeResult?.idToken || null,
      bridgeResult?.accessToken || null,
    );
    return signInWithCredential(firebaseAuth, credential);
  }

  return signInWithPopup(firebaseAuth, googleProvider);
}
