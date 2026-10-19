import { prisma } from "../config/database";

type UserRole = "PATIENT" | "CAREGIVER";

export class CaregiverConnectionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaregiverConnectionValidationError";
  }
}

export class CaregiverConnectionAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaregiverConnectionAuthorizationError";
  }
}

export class CaregiverConnectionNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaregiverConnectionNotFoundError";
  }
}

function normalizeRequiredCode(value: unknown, message: string): string {
  if (typeof value !== "string") throw new CaregiverConnectionValidationError(message);
  const normalized = value.trim().toUpperCase();
  if (!normalized) throw new CaregiverConnectionValidationError(message);
  return normalized;
}

function generateInviteCode(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "SC-";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  return code;
}

function generatePatientCode(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "SC-PAT-";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  return code;
}

async function getUserRole(userId: string): Promise<UserRole> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    throw new CaregiverConnectionNotFoundError("User not found");
  }

  return user.role as UserRole;
}

function visiblePatientProfile<T extends { caregiverAccess: boolean; id: string; fullName: string; profileImageUrl: string | null; gpsSharing: boolean }>(patient: T) {
  if (patient.caregiverAccess) return patient;
  return {
    id: patient.id,
    fullName: patient.fullName,
    profileImageUrl: patient.profileImageUrl,
    caregiverAccess: false,
    gpsSharing: patient.gpsSharing,
  };
}

// ============================================================
// GET OR CREATE PATIENT CODE
// ============================================================

export async function getOrCreatePatientCode(
  patientId: string,
) {
  const role = await getUserRole(patientId);

  if (role !== "PATIENT") {
    throw new CaregiverConnectionAuthorizationError(
      "Only patients can have a patient code",
    );
  }

  const existingPatient = await prisma.user.findUnique({
    where: {
      id: patientId,
    },
    select: {
      id: true,
      patientCode: true,
    },
  });

  if (!existingPatient) {
    throw new CaregiverConnectionNotFoundError("Patient not found");
  }

  if (existingPatient.patientCode) {
    return {
      patientCode: existingPatient.patientCode,
    };
  }

  let patientCode = generatePatientCode();

  let existingCode = await prisma.user.findUnique({
    where: {
      patientCode,
    },
    select: {
      id: true,
    },
  });

  while (existingCode) {
    patientCode = generatePatientCode();

    existingCode = await prisma.user.findUnique({
      where: {
        patientCode,
      },
      select: {
        id: true,
      },
    });
  }

  const updatedPatient = await prisma.user.update({
    where: {
      id: patientId,
    },
    data: {
      patientCode,
    },
    select: {
      id: true,
      patientCode: true,
    },
  });

  return {
    patientCode: updatedPatient.patientCode,
  };
}

// ============================================================
// CREATE CAREGIVER INVITE
// POST /api/caregiver-connections/invite
//
// Kept for Phase 2.
// Caregiver → Patient connection will use this later.
// ============================================================

export async function createInvite(caregiverId: string) {
  const role = await getUserRole(caregiverId);

  if (role !== "CAREGIVER") {
    throw new CaregiverConnectionAuthorizationError(
      "Only caregivers can create patient invitations",
    );
  }

  let code = generateInviteCode();

  let existingInvite = await prisma.caregiverInvite.findUnique({
    where: {
      code,
    },
  });

  while (existingInvite) {
    code = generateInviteCode();

    existingInvite = await prisma.caregiverInvite.findUnique({
      where: {
        code,
      },
    });
  }

  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  );

  const invite = await prisma.caregiverInvite.create({
    data: {
      caregiverId,
      code,
      expiresAt,
    },
  });

  return {
    id: invite.id,
    code: invite.code,
    expiresAt: invite.expiresAt,
    used: invite.used,
    createdAt: invite.createdAt,
  };
}

// ============================================================
// CONNECT PATIENT TO CAREGIVER
//
// Existing Phase 2 direction:
// Patient enters caregiver invitation code.
//
// We keep this function so the existing API does not break.
// ============================================================

export async function connectPatient(
  patientId: string,
  code: unknown,
) {
  const role = await getUserRole(patientId);

  if (role !== "PATIENT") {
    throw new CaregiverConnectionAuthorizationError(
      "Only patients can use caregiver invitations",
    );
  }

  const normalizedCode = normalizeRequiredCode(code, "Caregiver invite code is required");

  const invite = await prisma.caregiverInvite.findUnique({
    where: {
      code: normalizedCode,
    },
    include: {
      caregiver: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
        },
      },
    },
  });

  if (!invite) {
    throw new CaregiverConnectionValidationError(
      "Invalid caregiver invite code",
    );
  }

  if (invite.used) {
    throw new CaregiverConnectionValidationError(
      "This caregiver invite code has already been used",
    );
  }

  if (
    invite.expiresAt &&
    invite.expiresAt.getTime() < Date.now()
  ) {
    throw new CaregiverConnectionValidationError(
      "This caregiver invite code has expired",
    );
  }

  if (invite.caregiver.role !== "CAREGIVER") {
    throw new CaregiverConnectionValidationError(
      "Invalid caregiver account",
    );
  }

  const existingConnection =
    await prisma.caregiverPatient.findUnique({
      where: {
        caregiverId_patientId: {
          caregiverId: invite.caregiverId,
          patientId,
        },
      },
    });

  if (existingConnection) {
    throw new CaregiverConnectionValidationError(
      "You are already connected to this caregiver",
    );
  }

  const connection = await prisma.$transaction(
    async (tx) => {
      const newConnection =
        await tx.caregiverPatient.create({
          data: {
            caregiverId: invite.caregiverId,
            patientId,
          },
          include: {
            caregiver: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
            patient: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });

      await tx.caregiverInvite.update({
        where: {
          id: invite.id,
        },
        data: {
          used: true,
        },
      });

      return newConnection;
    },
  );

  return connection;
}

// ============================================================
// CONNECT CAREGIVER TO PATIENT USING PATIENT CODE
//
// Phase 1:
// Caregiver enters the patient's permanent code.
// ============================================================

export async function connectCaregiverToPatient(
  caregiverId: string,
  patientCode: unknown,
) {
  const role = await getUserRole(caregiverId);

  if (role !== "CAREGIVER") {
    throw new CaregiverConnectionAuthorizationError(
      "Only caregivers can connect patients",
    );
  }

  const normalizedCode = normalizeRequiredCode(patientCode, "Patient code is required");

  const patient = await prisma.user.findUnique({
    where: {
      patientCode: normalizedCode,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      age: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      address: true,
      city: true,
      bloodGroup: true,
      medicalNotes: true,
      profileImageUrl: true,
      language: true,
      caregiverAccess: true,
      gpsSharing: true,
      textSize: true,
      role: true,
      patientCode: true,
    },
  });

  if (!patient) {
    throw new CaregiverConnectionValidationError(
      "Invalid patient code",
    );
  }

  if (patient.role !== "PATIENT") {
    throw new CaregiverConnectionValidationError(
      "This code does not belong to a patient",
    );
  }

  if (patient.id === caregiverId) {
    throw new CaregiverConnectionValidationError(
      "You cannot connect to yourself",
    );
  }

  const existingConnection =
    await prisma.caregiverPatient.findUnique({
      where: {
        caregiverId_patientId: {
          caregiverId,
          patientId: patient.id,
        },
      },
    });

  if (existingConnection) {
    throw new CaregiverConnectionValidationError(
      "This patient is already connected to you",
    );
  }

  const connection =
    await prisma.caregiverPatient.create({
      data: {
        caregiverId,
        patientId: patient.id,
      },
      include: {
        caregiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            profileImageUrl: true,
          },
        },
        patient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            age: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            address: true,
            city: true,
            bloodGroup: true,
            medicalNotes: true,
            profileImageUrl: true,
            language: true,
            caregiverAccess: true,
            gpsSharing: true,
            textSize: true,
            patientCode: true,
          },
        },
      },
    });

  return { ...connection, patient: visiblePatientProfile(connection.patient) };
}

// ============================================================
// GET CAREGIVER'S PATIENTS
// ============================================================

export async function getCaregiverPatients(
  caregiverId: string,
) {
  const role = await getUserRole(caregiverId);

  if (role !== "CAREGIVER") {
    throw new CaregiverConnectionAuthorizationError(
      "Only caregivers can view connected patients",
    );
  }

  const connections =
    await prisma.caregiverPatient.findMany({
      where: {
        caregiverId,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            age: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            address: true,
            city: true,
            bloodGroup: true,
            medicalNotes: true,
            profileImageUrl: true,
            language: true,
            caregiverAccess: true,
            gpsSharing: true,
            textSize: true,
            patientCode: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  // A connection remains visible even when access is revoked, but sensitive care
  // fields are omitted. Detailed care data has its own authorization boundary.
  return connections.map((connection) => ({
    ...connection,
    patient: visiblePatientProfile(connection.patient),
  }));
}

// ============================================================
// GET PATIENT'S CAREGIVER
// ============================================================

export async function getPatientCaregiver(
  patientId: string,
) {
  const role = await getUserRole(patientId);

  if (role !== "PATIENT") {
    throw new CaregiverConnectionAuthorizationError(
      "Only patients can view their caregiver",
    );
  }

  const connection =
    await prisma.caregiverPatient.findFirst({
      where: {
        patientId,
      },
      include: {
        caregiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return connection;
}

// ============================================================
// DISCONNECT CAREGIVER / PATIENT
// ============================================================

export async function removeConnection(
  userId: string,
  connectionId: string,
) {
  const connection =
    await prisma.caregiverPatient.findUnique({
      where: {
        id: connectionId,
      },
    });

  if (!connection) {
    throw new CaregiverConnectionNotFoundError(
      "Caregiver connection not found",
    );
  }

  if (
    connection.caregiverId !== userId &&
    connection.patientId !== userId
  ) {
    throw new CaregiverConnectionAuthorizationError(
      "You are not authorized to remove this connection",
    );
  }

  await prisma.caregiverPatient.delete({
    where: {
      id: connectionId,
    },
  });

  return {
    id: connectionId,
    removed: true,
  };
}
