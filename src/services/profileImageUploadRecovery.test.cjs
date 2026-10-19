const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const sourcePath = path.join(__dirname, "profileImageUploadRecovery.ts");
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const recoveryModule = new Module(sourcePath, module);
recoveryModule.filename = sourcePath;
recoveryModule.paths = Module._nodeModulePaths(__dirname);
recoveryModule._compile(compiled, sourcePath);
const { PROFILE_IMAGE_SAVED_SIGNING_FAILED, uploadProfileImageWithRecovery } = recoveryModule.exports;

function response(status, body) {
  return { ok: status >= 200 && status < 300, status, async json() { return body; } };
}

async function main() {
  let uploadCalls = 0;
  let refreshCalls = 0;
  const normalUrl = "https://signed.example/profile.jpg?signature=fresh";
  const normal = await uploadProfileImageWithRecovery(
    async () => { uploadCalls += 1; return response(200, { success: true, data: { profileImageUrl: normalUrl } }); },
    async () => { refreshCalls += 1; return response(200, {}); },
    "session-token",
    "patient-123",
  );
  assert.equal(normal, normalUrl);
  assert.equal(uploadCalls, 1);
  assert.equal(refreshCalls, 0);
  console.log("PASS normal image upload response is returned without a profile refresh");

  const savedButUnsignable = () => response(500, {
    success: false,
    code: PROFILE_IMAGE_SAVED_SIGNING_FAILED,
    message: "Profile image was saved but could not be prepared for display.",
  });
  let sessionToken;
  const recoveredUrl = "https://signed.example/profile.jpg?signature=refreshed";
  uploadCalls = 0;
  refreshCalls = 0;
  const recovered = await uploadProfileImageWithRecovery(
    async () => { uploadCalls += 1; return savedButUnsignable(); },
    async (token) => {
      refreshCalls += 1;
      sessionToken = token;
      return response(200, { success: true, user: { id: "patient-123", profileImageUrl: recoveredUrl } });
    },
    "session-token",
    "patient-123",
  );
  assert.equal(recovered, recoveredUrl);
  assert.equal(sessionToken, "session-token");
  assert.equal(uploadCalls, 1, "multipart upload must not be retried");
  assert.equal(refreshCalls, 1);
  console.log("PASS the specific saved-image signing failure recovers through one authenticated current-user refresh");

  for (const profileImageUrl of [null, "profiles/patient-123/private-key.jpg", "not a URL"]) {
    await assert.rejects(uploadProfileImageWithRecovery(
      async () => savedButUnsignable(),
      async () => response(200, { success: true, user: { id: "patient-123", profileImageUrl } }),
      "session-token",
      "patient-123",
    ), /display link could not be refreshed/);
  }
  await assert.rejects(uploadProfileImageWithRecovery(
    async () => savedButUnsignable(),
    async () => response(200, { success: true, user: { id: "another-user", profileImageUrl: recoveredUrl } }),
    "session-token",
    "patient-123",
  ), /display link could not be refreshed/);
  console.log("PASS recovery rejects missing, unusable, and different-user profile data");

  for (const refreshCurrentUser of [
    async () => response(503, { success: false }),
    async () => { throw new Error("timeout"); },
  ]) {
    await assert.rejects(uploadProfileImageWithRecovery(
      async () => savedButUnsignable(),
      refreshCurrentUser,
      "session-token",
      "patient-123",
    ), /display link could not be refreshed/);
  }
  console.log("PASS failed and timed-out refreshes return a safe UI error");

  let unrelatedRefreshCalls = 0;
  await assert.rejects(uploadProfileImageWithRecovery(
    async () => response(500, { success: false, message: "Unable to upload profile image." }),
    async () => { unrelatedRefreshCalls += 1; return response(200, {}); },
    "session-token",
    "patient-123",
  ), /Unable to upload profile image/);
  assert.equal(unrelatedRefreshCalls, 0);
  console.log("PASS unrelated upload failures do not initiate profile recovery");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
