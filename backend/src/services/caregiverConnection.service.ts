import { prisma } from "../config/database";

type UserRole = "PATIENT" | "CAREGIVER";

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
    throw new Error("User not found");
  }

  return user.role as UserRole;
}

// ============================================================
// GET OR CREATE PATIENT CODE
// ============================================================

export async function getOrCreatePatientCode(
  patientId: string,
) {
  const role = await getUserRole(patientId);

  if (role !== "PATIENT") {
    throw new Error(
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
    throw new Error("Patient not found");
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
    throw new Error(
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
  code: string,
) {
  const role = await getUserRole(patientId);

  if (role !== "PATIENT") {
    throw new Error(
      "Only patients can use caregiver invitations",
    );
  }

  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error(
      "Caregiver invite code is required",
    );
  }

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
    throw new Error(
      "Invalid caregiver invite code",
    );
  }

  if (invite.used) {
    throw new Error(
      "This caregiver invite code has already been used",
    );
  }

  if (
    invite.expiresAt &&
    invite.expiresAt.getTime() < Date.now()
  ) {
    throw new Error(
      "This caregiver invite code has expired",
    );
  }

  if (invite.caregiver.role !== "CAREGIVER") {
    throw new Error(
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
    throw new Error(
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
  patientCode: string,
) {
  const role = await getUserRole(caregiverId);

  if (role !== "CAREGIVER") {
    throw new Error(
      "Only caregivers can connect patients",
    );
  }

  const normalizedCode = patientCode
    .trim()
    .toUpperCase();

  if (!normalizedCode) {
    throw new Error(
      "Patient code is required",
    );
  }

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
    throw new Error(
      "Invalid patient code",
    );
  }

  if (patient.role !== "PATIENT") {
    throw new Error(
      "This code does not belong to a patient",
    );
  }

  if (patient.id === caregiverId) {
    throw new Error(
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
    throw new Error(
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

  return connection;
}

// ============================================================
// GET CAREGIVER'S PATIENTS
// ============================================================

export async function getCaregiverPatients(
  caregiverId: string,
) {
  const role = await getUserRole(caregiverId);

  if (role !== "CAREGIVER") {
    throw new Error(
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
    patient: connection.patient.caregiverAccess ? connection.patient : {
      id: connection.patient.id,
      fullName: connection.patient.fullName,
      profileImageUrl: connection.patient.profileImageUrl,
      caregiverAccess: false,
      gpsSharing: connection.patient.gpsSharing,
    },
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
    throw new Error(
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
    throw new Error(
      "Caregiver connection not found",
    );
  }

  if (
    connection.caregiverId !== userId &&
    connection.patientId !== userId
  ) {
    throw new Error(
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
