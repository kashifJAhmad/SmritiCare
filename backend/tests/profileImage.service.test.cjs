const assert = require("node:assert/strict");
const {
  createProfileImageObjectKey,
  isOwnedProfileImageObjectKey,
  normalizeProfileImageReference,
  resolveProfileImage,
} = require("../dist/services/storage.service.js");
const storageService = require("../dist/services/storage.service.js");
const { ProfileImageSerializationError } = storageService;
const {
  createProfileImageUploadHandler,
} = require("../dist/controllers/profileImage.controller.js");
const {
  PROFILE_IMAGE_MAX_BYTES,
  validateProfileImageContent,
} = require("../dist/services/profileImage.validation.js");
const profileImageRouter = require("../dist/routes/profileImage.routes.js").default;
const caregiverConnectionRouter = require("../dist/routes/caregiverConnection.routes.js").default;
const authController = require("../dist/controllers/auth.controller.js");
const authService = require("../dist/services/auth.service.js");
const caregiverConnectionController = require("../dist/controllers/caregiverConnection.controller.js");
const caregiverConnectionService = require("../dist/services/caregiverConnection.service.js");
const syncService = require("../dist/services/sync.service.js");
const { prisma } = require("../dist/config/database.js");
const { Prisma } = require("@prisma/client");
const { connectCaregiverToPatient, getCaregiverPatients } = require("../dist/services/caregiverConnection.service.js");
const configuredBucket = process.env.S3_BUCKET_NAME || "smriticcare-private-files-kashif-2026-2";

function jpeg(size = 16) {
  const result = Buffer.alloc(size);
  result[0] = 0xff;
  result[1] = 0xd8;
  result[2] = 0xff;
  return result;
}

function makeResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function makeFile(mimetype = "image/jpeg", buffer = jpeg()) {
  return { mimetype, buffer, size: buffer.length, originalname: "untrusted.png" };
}

function makeHandler(overrides = {}) {
  const calls = { uploaded: [], removed: [], persisted: [], referenceChecks: [], resolved: [] };
  const dependencies = {
    createKey: createProfileImageObjectKey,
    async upload(...args) { calls.uploaded.push(args); },
    async remove(...args) { calls.removed.push(args); },
    async persist(...args) { calls.persisted.push(args); },
    async isReferenced(...args) { calls.referenceChecks.push(args); return false; },
    async resolve(...args) { calls.resolved.push(args); return "https://signed.example/profile"; },
    ...overrides,
  };
  return { handler: createProfileImageUploadHandler(dependencies), calls };
}

async function invoke(handler, { userId = "patient_123", file = makeFile() } = {}) {
  const req = { userId, file };
  const res = makeResponse();
  await handler(req, res);
  return res;
}

async function invokeController(handler, { userId = "patient_123", body = {}, params = {} } = {}) {
  const req = { userId, body, params };
  const res = makeResponse();
  await handler(req, res);
  return res;
}

async function testProfileImageSyncPush() {
  const originalUserUpdate = prisma.user.update;
  const updates = [];
  prisma.user.update = async (query) => {
    updates.push(query);
    return { id: query.where.id };
  };

  const ownKey = "profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg";
  const foreignKey = "profiles/patient_other/550e8400-e29b-41d4-a716-446655440000.jpg";
  const ownSignedUrl = `https://${configuredBucket}.s3.ap-south-1.amazonaws.com/${ownKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=test&X-Amz-Signature=test`;
  const foreignSignedUrl = `https://${configuredBucket}.s3.ap-south-1.amazonaws.com/${foreignKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=test`;
  const pushProfile = (payload, entityId = "patient_123") => syncService.processSyncPush("patient_123", [{
    id: "queue-item-1",
    entityType: "PROFILE",
    entityId,
    operation: "UPDATE",
    payload,
  }]);

  try {
    const ownedKeyResult = await pushProfile({ profileImageUrl: ownKey, fullName: "Updated Patient", age: 82, userId: "payload_owner" }, "patient_other");
    assert.deepEqual(ownedKeyResult, [{
      id: "queue-item-1",
      entityType: "PROFILE",
      entityId: "patient_other",
      status: "SUCCESS",
      serverId: "patient_123",
    }]);
    assert.equal(updates.at(-1).where.id, "patient_123");
    assert.equal(updates.at(-1).data.profileImageUrl, ownKey);
    assert.equal(updates.at(-1).data.fullName, "Updated Patient");
    assert.equal(updates.at(-1).data.age, 82);

    const ownedSignedUrlResult = await pushProfile({ profileImageUrl: ownSignedUrl });
    assert.equal(ownedSignedUrlResult[0].status, "SUCCESS");
    assert.equal(updates.at(-1).data.profileImageUrl, ownKey);
    assert.equal(updates.at(-1).data.profileImageUrl.includes("X-Amz-Signature"), false);

    const legacyUrl = "https://cdn.example.test/avatars/legacy.jpg";
    const legacyResult = await pushProfile({ profileImageUrl: legacyUrl });
    assert.equal(legacyResult[0].status, "SUCCESS");
    assert.equal(updates.at(-1).data.profileImageUrl, legacyUrl);
    const legacyPathResult = await pushProfile({ profileImageUrl: "/uploads/profiles/legacy.jpg" });
    assert.equal(legacyPathResult[0].status, "SUCCESS");
    assert.equal(updates.at(-1).data.profileImageUrl, "/uploads/profiles/legacy.jpg");

    const clearResult = await pushProfile({ profileImageUrl: null });
    assert.equal(clearResult[0].status, "SUCCESS");
    assert.equal(Object.hasOwn(updates.at(-1).data, "profileImageUrl"), true);
    assert.equal(updates.at(-1).data.profileImageUrl, null);

    const omittedResult = await pushProfile({ fullName: "Name only" });
    assert.equal(omittedResult[0].status, "SUCCESS");
    assert.equal(Object.hasOwn(updates.at(-1).data, "profileImageUrl"), false);
    assert.equal(updates.at(-1).data.fullName, "Name only");

    const beforeRejectedReferences = updates.length;
    for (const profileImageUrl of [foreignKey, foreignSignedUrl]) {
      const rejected = await pushProfile({ profileImageUrl, fullName: "Must not apply" });
      assert.equal(rejected[0].status, "ERROR");
      assert.equal(rejected[0].error, "Invalid profile image reference.");
      assert.equal(updates.length, beforeRejectedReferences);
    }
  } finally {
    prisma.user.update = originalUserUpdate;
  }
}

async function main() {
  const key = createProfileImageObjectKey("patient_123", "image/jpeg");
  assert.match(key, /^profiles\/patient_123\/[0-9a-f-]{36}\.jpg$/i);
  assert.equal(isOwnedProfileImageObjectKey(key, "patient_123"), true);
  assert.equal(isOwnedProfileImageObjectKey(key, "patient_other"), false);
  assert.equal(isOwnedProfileImageObjectKey("profiles/patient_123/../bad.jpg", "patient_123"), false);
  assert.equal(createProfileImageObjectKey("patient_123", "image/png").endsWith(".png"), true);
  console.log("PASS profile keys use owner-scoped UUIDs and MIME-derived extensions");

  assert.equal(validateProfileImageContent("image/jpeg", jpeg()), "image/jpeg");
  assert.equal(validateProfileImageContent("image/png", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4])), "image/png");
  assert.equal(validateProfileImageContent("image/webp", Buffer.from("RIFF0000WEBPdata")), "image/webp");
  assert.equal(validateProfileImageContent("image/png", jpeg()), null);
  assert.equal(validateProfileImageContent("application/octet-stream", jpeg()), null);
  console.log("PASS supported image signatures must match the declared MIME type");

  const noFile = await invoke(makeHandler().handler, { file: null });
  assert.equal(noFile.statusCode, 400);
  const badMime = await invoke(makeHandler().handler, { file: makeFile("image/gif") });
  assert.equal(badMime.statusCode, 400);
  const mismatch = await invoke(makeHandler().handler, { file: makeFile("image/png", jpeg()) });
  assert.equal(mismatch.statusCode, 400);
  const tooLargeBuffer = Buffer.alloc(PROFILE_IMAGE_MAX_BYTES + 1);
  const tooLarge = await invoke(makeHandler().handler, { file: makeFile("image/jpeg", tooLargeBuffer) });
  assert.equal(tooLarge.statusCode, 400);
  const unauthorized = await invoke(makeHandler().handler, { userId: null });
  assert.equal(unauthorized.statusCode, 401);
  console.log("PASS missing, unsupported, mismatched, oversized, and unauthenticated uploads are rejected");

  const profileUploadRoute = profileImageRouter.stack.find((layer) => layer.route?.methods?.post);
  assert.equal(profileUploadRoute.route.stack[0].name, "authenticate");
  assert.equal(caregiverConnectionRouter.stack[0].handle.name, "authenticate");
  console.log("PASS profile upload and caregiver profile routes require authentication before handlers");

  await testProfileImageSyncPush();
  console.log("PASS PROFILE sync applies owned keys, normalizes signed URLs, clears explicit null, preserves omitted fields, and rejects foreign references without partial updates");

  const originalFindUnique = prisma.user.findUnique;
  const originalFindMany = prisma.caregiverPatient.findMany;
  const originalConnectionFindUnique = prisma.caregiverPatient.findUnique;
  const originalConnectionCreate = prisma.caregiverPatient.create;
  prisma.user.findUnique = async () => ({ role: "CAREGIVER" });
  prisma.caregiverPatient.findMany = async (query) => {
    assert.equal(query.where.caregiverId, "caregiver_123");
    return [{ id: "connection_1", patient: {
      id: "patient_123",
      fullName: "Patient",
      email: "private@example.test",
      profileImageUrl: "profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg",
      caregiverAccess: false,
      gpsSharing: false,
    } }];
  };
  try {
    const patientList = await getCaregiverPatients("caregiver_123");
    assert.equal(patientList[0].patient.fullName, "Patient");
    assert.equal(patientList[0].patient.profileImageUrl, "profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg");
    assert.equal(patientList[0].patient.email, undefined);
    assert.equal(patientList[0].patient.caregiverAccess, false);
  } finally {
    prisma.user.findUnique = originalFindUnique;
    prisma.caregiverPatient.findMany = originalFindMany;
  }

  prisma.user.findUnique = async ({ where }) => where.patientCode
    ? { id: "patient_123", role: "PATIENT", fullName: "Patient", profileImageUrl: null, caregiverAccess: false, gpsSharing: false }
    : { role: "CAREGIVER" };
  prisma.caregiverPatient.findUnique = async () => null;
  prisma.caregiverPatient.create = async () => ({
    id: "connection_2",
    caregiver: { id: "caregiver_123", fullName: "Caregiver" },
    patient: {
      id: "patient_123", fullName: "Patient", email: "private@example.test", age: 80,
      profileImageUrl: null, caregiverAccess: false, gpsSharing: false,
    },
  });
  try {
    const connection = await connectCaregiverToPatient("caregiver_123", "sc-pat-123456");
    assert.equal(connection.patient.fullName, "Patient");
    assert.equal(connection.patient.email, undefined);
    assert.equal(connection.patient.age, undefined);
    assert.equal(connection.patient.caregiverAccess, false);
  } finally {
    prisma.user.findUnique = originalFindUnique;
    prisma.caregiverPatient.findUnique = originalConnectionFindUnique;
    prisma.caregiverPatient.create = originalConnectionCreate;
  }
  console.log("PASS connected caregiver responses retain only basic name/image when care access is disabled");

  const success = makeHandler();
  const successResponse = await invoke(success.handler);
  assert.equal(successResponse.statusCode, 200);
  assert.equal(successResponse.body.data.profileImageUrl, "https://signed.example/profile");
  assert.match(success.calls.persisted[0][1], /^profiles\/patient_123\//);
  assert.equal(success.calls.resolved[0][0], success.calls.persisted[0][1]);
  console.log("PASS upload persists a stable key and returns the resolved display URL");

  const uploadFailure = makeHandler({ async upload() { throw new Error("private S3 error"); } });
  const uploadFailureResponse = await invoke(uploadFailure.handler);
  assert.equal(uploadFailureResponse.statusCode, 500);
  assert.equal(JSON.stringify(uploadFailureResponse.body).includes("private S3 error"), false);
  assert.equal(uploadFailure.calls.persisted.length, 0);
  console.log("PASS S3 upload failures do not persist a key or expose raw errors");

  const persistenceFailure = makeHandler({ async persist() { throw new Error("private database error"); } });
  const persistenceResponse = await invoke(persistenceFailure.handler);
  assert.equal(persistenceResponse.statusCode, 500);
  assert.equal(persistenceFailure.calls.removed.length, 1);
  assert.equal(persistenceFailure.calls.removed[0][0], persistenceFailure.calls.uploaded[0][0]);
  assert.equal(persistenceFailure.calls.referenceChecks.length, 1);
  assert.equal(persistenceFailure.calls.removed[0][0].includes("untrusted.png"), false);
  console.log("PASS persistence failures trigger compensating S3 deletion");

  const cleanupFailure = makeHandler({
    async persist() { throw new Error("private database error"); },
    async remove() { throw new Error("private cleanup error"); },
  });
  const originalConsoleError = console.error;
  const cleanupLogs = [];
  console.error = (...args) => cleanupLogs.push(args);
  const cleanupFailureResponse = await invoke(cleanupFailure.handler);
  console.error = originalConsoleError;
  assert.equal(cleanupFailureResponse.statusCode, 500);
  assert.equal(cleanupFailureResponse.body.message, "Unable to save profile image.");
  assert.equal(cleanupLogs.length, 1);
  assert.equal(cleanupLogs[0][0], "Profile image compensating cleanup failed");
  assert.equal(JSON.stringify(cleanupLogs).includes(cleanupFailure.calls.uploaded[0][0]), false);
  assert.equal(JSON.stringify(cleanupLogs).includes("private cleanup error"), false);
  assert.equal(JSON.stringify(cleanupFailureResponse.body).includes("private database error"), false);
  console.log("PASS compensating cleanup failure is logged without masking or exposing the persistence error");

  const ambiguousPersistence = makeHandler({
    async persist() { throw new Error("lost database acknowledgment"); },
    async isReferenced() { return true; },
  });
  console.error = () => {};
  const ambiguousResponse = await invoke(ambiguousPersistence.handler);
  console.error = originalConsoleError;
  assert.equal(ambiguousResponse.statusCode, 500);
  assert.equal(ambiguousPersistence.calls.removed.length, 0);
  console.log("PASS a possibly committed profile key is retained instead of deleting an object the database may reference");

  const signingFailure = makeHandler({ async resolve() { throw new ProfileImageSerializationError(); } });
  const signingFailureResponse = await invoke(signingFailure.handler);
  assert.equal(signingFailureResponse.statusCode, 500);
  assert.equal(signingFailureResponse.body.code, "PROFILE_IMAGE_SAVED_SIGNING_FAILED");
  assert.equal(signingFailure.calls.persisted.length, 1);
  assert.equal(signingFailure.calls.removed.length, 0);
  assert.equal(JSON.stringify(signingFailureResponse.body).includes(signingFailure.calls.persisted[0][1]), false);
  console.log("PASS post-persistence signing failures have a specific recovery code and retain the saved key");

  const originalAuthLogin = authService.login;
  const originalAuthGetCurrentUser = authService.getCurrentUser;
  const originalAuthUpdateCurrentUser = authService.updateCurrentUser;
  const originalSerializeUser = storageService.serializeProfileImageUser;
  const originalUserFindUniqueForAuth = prisma.user.findUnique;
  const originalUserUpdateForAuth = prisma.user.update;
  const profileKey = "profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg";
  const safeUser = { id: "patient_123", fullName: "Patient", profileImageUrl: profileKey };
  try {
    authService.login = async () => ({ token: "test-token", user: safeUser });
    storageService.serializeProfileImageUser = async (user) => ({ ...user, profileImageUrl: "https://signed.example/profile" });
    const validLogin = await invokeController(authController.login, { body: { email: "patient@example.test", password: "valid" } });
    assert.equal(validLogin.statusCode, 200);
    assert.equal(validLogin.body.token, "test-token");
    assert.equal(validLogin.body.user.profileImageUrl, "https://signed.example/profile");

    storageService.serializeProfileImageUser = async () => { throw new ProfileImageSerializationError(); };
    const loginSigningFailure = await invokeController(authController.login);
    assert.equal(loginSigningFailure.statusCode, 500);
    assert.equal(loginSigningFailure.body.message, "Unable to prepare profile image.");
    assert.equal(JSON.stringify(loginSigningFailure.body).includes(profileKey), false);
    assert.equal(JSON.stringify(loginSigningFailure.body).includes("AWS"), false);

    const { AuthenticationError, AuthValidationError } = authService;
    authService.login = async () => { throw new AuthenticationError("Invalid email or password"); };
    const invalidLogin = await invokeController(authController.login);
    assert.equal(invalidLogin.statusCode, 401);
    assert.equal(invalidLogin.body.message, "Invalid email or password");

    authService.login = originalAuthLogin;
    const invalidLoginInput = await invokeController(authController.login, { body: {} });
    assert.equal(invalidLoginInput.statusCode, 400);
    prisma.user.findUnique = async () => null;
    const invalidCredentials = await invokeController(authController.login, { body: { email: "missing@example.test", password: "valid" } });
    assert.equal(invalidCredentials.statusCode, 401);

    authService.getCurrentUser = async () => safeUser;
    const meSigningFailure = await invokeController(authController.me);
    assert.equal(meSigningFailure.statusCode, 500);
    assert.equal(JSON.stringify(meSigningFailure.body).includes(profileKey), false);

    authService.getCurrentUser = originalAuthGetCurrentUser;
    prisma.user.findUnique = async () => null;
    const missingUser = await invokeController(authController.me);
    assert.equal(missingUser.statusCode, 404);

    authService.updateCurrentUser = async () => safeUser;
    const updateSigningFailure = await invokeController(authController.updateMe);
    assert.equal(updateSigningFailure.statusCode, 500);
    assert.equal(JSON.stringify(updateSigningFailure.body).includes(profileKey), false);

    authService.updateCurrentUser = originalAuthUpdateCurrentUser;
    const invalidUpdate = await invokeController(authController.updateMe, { body: { fullName: " " } });
    assert.equal(invalidUpdate.statusCode, 400);
    assert.equal(invalidUpdate.body.message, "Full name cannot be empty");

    prisma.user.update = async () => {
      throw new Prisma.PrismaClientKnownRequestError("record missing", { code: "P2025", clientVersion: "test" });
    };
    const missingUpdatedUser = await invokeController(authController.updateMe, { body: { fullName: "Patient" } });
    assert.equal(missingUpdatedUser.statusCode, 404);
  } finally {
    authService.login = originalAuthLogin;
    authService.getCurrentUser = originalAuthGetCurrentUser;
    authService.updateCurrentUser = originalAuthUpdateCurrentUser;
    storageService.serializeProfileImageUser = originalSerializeUser;
    prisma.user.findUnique = originalUserFindUniqueForAuth;
    prisma.user.update = originalUserUpdateForAuth;
  }
  console.log("PASS auth serialization failures remain internal while authentication, missing-user, and validation statuses stay distinct");

  const unauthenticatedProfile = await invokeController(authController.me, { userId: null });
  assert.equal(unauthenticatedProfile.statusCode, 401);
  const unauthenticatedCaregiverList = await invokeController(caregiverConnectionController.getPatients, { userId: null });
  assert.equal(unauthenticatedCaregiverList.statusCode, 401);

  const originalConnectPatient = caregiverConnectionService.connectPatient;
  const originalResolveProfileImage = storageService.resolveProfileImage;
  const originalGetCaregiverPatients = caregiverConnectionService.getCaregiverPatients;
  const originalCaregiverUserFindUnique = prisma.user.findUnique;
  const originalCaregiverConnectionFindUnique = prisma.caregiverPatient.findUnique;
  try {
    caregiverConnectionService.connectPatient = async () => ({
      id: "connection_1",
      patient: safeUser,
      caregiver: null,
    });
    storageService.resolveProfileImage = async () => { throw new ProfileImageSerializationError(); };
    const caregiverSigningFailure = await invokeController(caregiverConnectionController.connectToCaregiver, { body: { code: "invite-code" } });
    assert.equal(caregiverSigningFailure.statusCode, 500);
    assert.equal(caregiverSigningFailure.body.message, "Unable to prepare profile image.");
    assert.equal(JSON.stringify(caregiverSigningFailure.body).includes(profileKey), false);
    assert.equal(JSON.stringify(caregiverSigningFailure.body).includes("AWS"), false);

    caregiverConnectionService.connectPatient = originalConnectPatient;
    prisma.user.findUnique = async () => ({ id: "patient_123", role: "PATIENT" });
    const invalidCaregiverInput = await invokeController(caregiverConnectionController.connectToCaregiver, { body: null });
    assert.equal(invalidCaregiverInput.statusCode, 400);
    assert.equal(invalidCaregiverInput.body.message, "Caregiver invite code is required");

    const caregiverAuthorizationFailure = await invokeController(caregiverConnectionController.getPatients);
    assert.equal(caregiverAuthorizationFailure.statusCode, 403);
    assert.equal(caregiverAuthorizationFailure.body.message, "Only caregivers can view connected patients");

    prisma.user.findUnique = async () => null;
    const missingUser = await invokeController(caregiverConnectionController.getPatients);
    assert.equal(missingUser.statusCode, 404);
    assert.equal(missingUser.body.message, "User not found");

    prisma.user.findUnique = async () => ({ id: "patient_123", role: "PATIENT" });
    prisma.caregiverPatient.findUnique = async () => null;
    const missingConnection = await invokeController(caregiverConnectionController.deleteConnection, { params: { id: "missing-connection" } });
    assert.equal(missingConnection.statusCode, 404);
    assert.equal(missingConnection.body.message, "Caregiver connection not found");

    prisma.caregiverPatient.findUnique = async () => ({ id: "connection_1", caregiverId: "someone_else", patientId: "another_patient" });
    const unauthorizedDeletion = await invokeController(caregiverConnectionController.deleteConnection, { params: { id: "connection_1" } });
    assert.equal(unauthorizedDeletion.statusCode, 403);
    assert.equal(unauthorizedDeletion.body.message, "You are not authorized to remove this connection");

    prisma.user.findUnique = async () => { throw new Error("private database detail"); };
    const internalFailure = await invokeController(caregiverConnectionController.getPatients);
    assert.equal(internalFailure.statusCode, 500);
    assert.equal(internalFailure.body.success, false);
    assert.equal(internalFailure.body.message, "Unable to process caregiver request.");
    assert.equal(JSON.stringify(internalFailure.body).includes("private database detail"), false);
  } finally {
    caregiverConnectionService.connectPatient = originalConnectPatient;
    caregiverConnectionService.getCaregiverPatients = originalGetCaregiverPatients;
    storageService.resolveProfileImage = originalResolveProfileImage;
    prisma.user.findUnique = originalCaregiverUserFindUnique;
    prisma.caregiverPatient.findUnique = originalCaregiverConnectionFindUnique;
  }
  console.log("PASS caregiver controllers distinguish invalid input, role denial, missing resources, unauthorized deletion, signing errors, and safe internal failures");

  assert.equal(await resolveProfileImage(null, "patient_123"), null);
  assert.equal(await resolveProfileImage("/uploads/profiles/old.jpg", "patient_123"), "/uploads/profiles/old.jpg");
  assert.equal(await resolveProfileImage("https://cdn.example/old.jpg", "patient_123"), "https://cdn.example/old.jpg");
  assert.equal(await resolveProfileImage("profiles/someone_else/550e8400-e29b-41d4-a716-446655440000.jpg", "patient_123"), null);
  assert.equal(await resolveProfileImage("https://other-bucket.s3.ap-south-1.amazonaws.com/profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg?X-Amz-Signature=test", "patient_123"), null);
  let signedCommand;
  let signedOptions;
  const signedUrl = await resolveProfileImage(key, "patient_123", async (_client, command, options) => {
    signedCommand = command;
    signedOptions = options;
    return "https://signed.example/private-profile";
  }, {});
  assert.equal(signedUrl, "https://signed.example/private-profile");
  assert.equal(signedCommand.input.Key, key);
  assert.equal(signedOptions.expiresIn, 300);
  const normalizedAndResigned = await resolveProfileImage(
    `https://${configuredBucket}.s3.ap-south-1.amazonaws.com/profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg?X-Amz-Signature=old`,
    "patient_123",
    async (_client, command) => {
      assert.equal(command.input.Key, "profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg");
      return "https://signed.example/fresh-profile";
    },
    {},
  );
  assert.equal(normalizedAndResigned, "https://signed.example/fresh-profile");
  await assert.rejects(
    resolveProfileImage(key, "patient_123", async () => { throw new Error("private AWS error"); }, {}),
    (error) => error instanceof ProfileImageSerializationError && error.message === "Unable to prepare profile image.",
  );
  const ownKey = "profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg";
  const foreignKey = "profiles/patient_other/550e8400-e29b-41d4-a716-446655440000.jpg";
  const ownVirtualHostSignedUrl = `https://${configuredBucket}.s3.ap-south-1.amazonaws.com/profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=test&X-Amz-Signature=test`;
  const ownPathStyleSignedUrl = `https://s3.ap-south-1.amazonaws.com/${configuredBucket}/profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=test`;
  const foreignSignedUrl = `https://${configuredBucket}.s3.ap-south-1.amazonaws.com/profiles/patient_other/550e8400-e29b-41d4-a716-446655440000.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=test`;

  assert.equal(normalizeProfileImageReference(ownKey, "patient_123"), ownKey);
  assert.equal(normalizeProfileImageReference(null, "patient_123"), null);
  assert.equal(normalizeProfileImageReference(ownVirtualHostSignedUrl, "patient_123"), ownKey);
  assert.equal(normalizeProfileImageReference(ownPathStyleSignedUrl, "patient_123"), ownKey);
  assert.throws(() => normalizeProfileImageReference(foreignSignedUrl, "patient_123"), { message: "Invalid profile image reference." });
  assert.throws(() => normalizeProfileImageReference(foreignKey, "patient_123"), { message: "Invalid profile image reference." });
  assert.equal(normalizeProfileImageReference("https://cdn.example.test/avatars/old.jpg", "patient_123"), "https://cdn.example.test/avatars/old.jpg");
  assert.equal(normalizeProfileImageReference("https://cdn.example.test/avatars/old.jpg?expires=2099-01-01", "patient_123"), "https://cdn.example.test/avatars/old.jpg?expires=2099-01-01");
  assert.equal(normalizeProfileImageReference("http://legacy.example.test/avatars/old.jpg", "patient_123"), "http://legacy.example.test/avatars/old.jpg");
  assert.equal(normalizeProfileImageReference("/uploads/profiles/old.jpg", "patient_123"), "/uploads/profiles/old.jpg");
  assert.throws(() => normalizeProfileImageReference(`https://s3.ap-south-1.amazonaws.com/${configuredBucket}/unrecognized/object.jpg`, "patient_123"), { message: "Invalid profile image reference." });
  assert.throws(() => normalizeProfileImageReference(`https://other-bucket.s3.ap-south-1.amazonaws.com/profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg?X-Amz-Signature=test`, "patient_123"), { message: "Invalid profile image reference." });
  assert.throws(() => normalizeProfileImageReference(`https://s3.ap-south-1.amazonaws.com/wrong-bucket/profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg?X-Amz-Signature=test`, "patient_123"), { message: "Invalid profile image reference." });
  assert.throws(() => normalizeProfileImageReference(`https://${configuredBucket}.s3.ap-south-1.amazonaws.com/prefix/profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg?X-Amz-Signature=test`, "patient_123"), { message: "Invalid profile image reference." });
  assert.throws(() => normalizeProfileImageReference(`https://${configuredBucket}.s3.ap-south-1.amazonaws.com/profiles/patient_123%2F550e8400-e29b-41d4-a716-446655440000.jpg?X-Amz-Signature=test`, "patient_123"), { message: "Invalid profile image reference." });
  assert.throws(() => normalizeProfileImageReference(`https://${configuredBucket}.s3.ap-south-1.amazonaws.com/profiles/patient_123%5C550e8400-e29b-41d4-a716-446655440000.jpg?X-Amz-Signature=test`, "patient_123"), { message: "Invalid profile image reference." });
  assert.throws(() => normalizeProfileImageReference("https://custom-s3.example.test/unknown/key.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=test", "patient_123"), { message: "Invalid profile image reference." });
  assert.throws(() => normalizeProfileImageReference("https://custom-s3.example.test/profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg", "patient_123"), { message: "Invalid profile image reference." });
  assert.throws(() => normalizeProfileImageReference(`https://${configuredBucket}.s3.ap-south-1.amazonaws.com/profiles/patient_123/%ZZ.jpg?X-Amz-Signature=test`, "patient_123"), { message: "Invalid profile image reference." });
  assert.throws(() => normalizeProfileImageReference(`s3://${configuredBucket}/profiles/patient_123/550e8400-e29b-41d4-a716-446655440000.jpg`, "patient_123"), { message: "Invalid profile image reference." });
  assert.throws(() => normalizeProfileImageReference({ url: foreignSignedUrl }, "patient_123"), { message: "Invalid profile image reference." });
  console.log("PASS owner keys and signed S3 URLs normalize safely; foreign or malformed S3 references are rejected while legacy URLs remain compatible");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
