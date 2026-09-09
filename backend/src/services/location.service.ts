import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

export type LocationData = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

function validateLocation(data: LocationData): void {
  if (
    typeof data.latitude !== "number" ||
    !Number.isFinite(data.latitude) ||
    data.latitude < -90 ||
    data.latitude > 90
  ) {
    throw new Error("Invalid latitude.");
  }

  if (
    typeof data.longitude !== "number" ||
    !Number.isFinite(data.longitude) ||
    data.longitude < -180 ||
    data.longitude > 180
  ) {
    throw new Error("Invalid longitude.");
  }

  if (
    data.accuracy !== undefined &&
    data.accuracy !== null &&
    (
      typeof data.accuracy !== "number" ||
      !Number.isFinite(data.accuracy) ||
      data.accuracy < 0
    )
  ) {
    throw new Error("Invalid location accuracy.");
  }
}

export async function updatePatientLocation(
  patientId: string,
  data: LocationData
) {
  validateLocation(data);

  const patient = await prisma.user.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      role: true,
      gpsSharing: true,
    },
  });

  if (!patient) {
    throw new Error("Patient not found.");
  }

  if (patient.role !== UserRole.PATIENT) {
    throw new Error(
      "Only patient accounts can share a location."
    );
  }

  if (!patient.gpsSharing) {
    throw new Error(
      "GPS location sharing is disabled."
    );
  }

  return prisma.patientLocation.upsert({
    where: {
      patientId,
    },
    create: {
      patientId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy ?? null,
    },
    update: {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy ?? null,
    },
  });
}

export async function removePatientLocation(
  patientId: string
) {
  await prisma.patientLocation.deleteMany({
    where: {
      patientId,
    },
  });

  return {
    success: true,
  };
}

export async function getPatientLocationForCaregiver(
  caregiverId: string,
  patientId: string
) {
  const connection =
    await prisma.caregiverPatient.findFirst({
      where: {
        caregiverId,
        patientId,
      },
      select: {
        id: true,
      },
    });

  if (!connection) {
    throw new Error(
      "You are not connected to this patient."
    );
  }

  const patient = await prisma.user.findUnique({
    where: {
      id: patientId,
    },
    select: {
      id: true,
      fullName: true,
      gpsSharing: true,
    },
  });

  if (!patient) {
    throw new Error("Patient not found.");
  }

  if (!patient.gpsSharing) {
    return {
      available: false,
      message: "GPS location sharing is disabled.",
      patient: {
        id: patient.id,
        fullName: patient.fullName,
      },
      location: null,
    };
  }

  const location =
    await prisma.patientLocation.findUnique({
      where: {
        patientId,
      },
      select: {
        latitude: true,
        longitude: true,
        accuracy: true,
        updatedAt: true,
      },
    });

  if (!location) {
    return {
      available: false,
      message: "No location has been shared yet.",
      patient: {
        id: patient.id,
        fullName: patient.fullName,
      },
      location: null,
    };
  }

  return {
    available: true,
    message: "Latest patient location.",
    patient: {
      id: patient.id,
      fullName: patient.fullName,
    },
    location,
  };
} 