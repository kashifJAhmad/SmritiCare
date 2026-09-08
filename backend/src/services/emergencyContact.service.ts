import { prisma } from "../config/database";

export type CreateEmergencyContactInput = {
  name: string;
  relationship: string;
  phone: string;
};

export type UpdateEmergencyContactInput = {
  name?: string;
  relationship?: string;
  phone?: string;
};

function validateContactInput(
  data: CreateEmergencyContactInput
): string | null {
  if (!data.name?.trim()) {
    return "Contact name is required.";
  }

  if (!data.relationship?.trim()) {
    return "Relationship is required.";
  }

  if (!data.phone?.trim()) {
    return "Phone number is required.";
  }

  return null;
}

export async function createEmergencyContact(
  userId: string,
  data: CreateEmergencyContactInput
) {
  const validationError = validateContactInput(data);

  if (validationError) {
    throw new Error(validationError);
  }

  return prisma.emergencyContact.create({
    data: {
      userId,
      name: data.name.trim(),
      relationship: data.relationship.trim(),
      phone: data.phone.trim(),
    },
  });
}

export async function getEmergencyContacts(userId: string) {
  return prisma.emergencyContact.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getEmergencyContactById(
  userId: string,
  contactId: string
) {
  return prisma.emergencyContact.findFirst({
    where: {
      id: contactId,
      userId,
    },
  });
}

export async function updateEmergencyContact(
  userId: string,
  contactId: string,
  data: UpdateEmergencyContactInput
) {
  const existing = await getEmergencyContactById(userId, contactId);

  if (!existing) {
    throw new Error("Emergency contact not found.");
  }

  const updateData: UpdateEmergencyContactInput = {};

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      throw new Error("Contact name cannot be empty.");
    }

    updateData.name = data.name.trim();
  }

  if (data.relationship !== undefined) {
    if (!data.relationship.trim()) {
      throw new Error("Relationship cannot be empty.");
    }

    updateData.relationship = data.relationship.trim();
  }

  if (data.phone !== undefined) {
    if (!data.phone.trim()) {
      throw new Error("Phone number cannot be empty.");
    }

    updateData.phone = data.phone.trim();
  }

  return prisma.emergencyContact.update({
    where: {
      id: contactId,
    },
    data: updateData,
  });
}

export async function deleteEmergencyContact(
  userId: string,
  contactId: string
) {
  const existing = await getEmergencyContactById(userId, contactId);

  if (!existing) {
    throw new Error("Emergency contact not found.");
  }

  await prisma.emergencyContact.delete({
    where: {
      id: contactId,
    },
  });

  return {
    id: contactId,
  };
}