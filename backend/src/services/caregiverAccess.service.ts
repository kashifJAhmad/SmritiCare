import { UserRole } from "@prisma/client";
import { prisma } from "../config/database";

/** Server-side boundary for every caregiver-to-patient request. */
export async function requireCaregiverPatientAccess(caregiverId: string, patientId: string, requireCaregiverAccess = true) {
  const [caregiver, patient, connection] = await Promise.all([
    prisma.user.findUnique({ where: { id: caregiverId }, select: { role: true } }),
    prisma.user.findUnique({ where: { id: patientId }, select: { id: true, role: true, caregiverAccess: true, gpsSharing: true } }),
    prisma.caregiverPatient.findUnique({ where: { caregiverId_patientId: { caregiverId, patientId } } }),
  ]);
  if (!caregiver || caregiver.role !== UserRole.CAREGIVER) throw new Error("Only caregivers can access patient care information.");
  if (!patient || patient.role !== UserRole.PATIENT) throw new Error("The selected user is not a patient.");
  if (!connection) throw new Error("You are not connected to this patient.");
  if (requireCaregiverAccess && !patient.caregiverAccess) throw new Error("This patient has not enabled caregiver access.");
  return patient;
}

export async function requirePatient(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role !== UserRole.PATIENT) throw new Error("Only patients can perform this action.");
}
