import { Request, Response } from "express";
import {
  createEmergencyContact,
  deleteEmergencyContact,
  getEmergencyContactById,
  getEmergencyContacts,
  updateEmergencyContact,
} from "../services/emergencyContact.service";

function getContactId(req: Request): string | null {
  const id = req.params.id;

  if (typeof id !== "string") {
    return null;
  }

  return id;
}

export async function createContact(req: Request, res: Response) {
  try {
    const userId = req.userId!;

    const contact = await createEmergencyContact(userId, {
      name: req.body.name,
      relationship: req.body.relationship,
      phone: req.body.phone,
    });

    res.status(201).json({
      success: true,
      message: "Emergency contact added successfully.",
      contact,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to add emergency contact.";

    res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function getContacts(req: Request, res: Response) {
  try {
    const userId = req.userId!;

    const contacts = await getEmergencyContacts(userId);

    res.json({
      success: true,
      contacts,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load emergency contacts.";

    res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function getContactById(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const contactId = getContactId(req);

    if (!contactId) {
      res.status(400).json({
        success: false,
        message: "Invalid contact ID.",
      });
      return;
    }

    const contact = await getEmergencyContactById(userId, contactId);

    if (!contact) {
      res.status(404).json({
        success: false,
        message: "Emergency contact not found.",
      });
      return;
    }

    res.json({
      success: true,
      contact,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load emergency contact.";

    res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function updateContact(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const contactId = getContactId(req);

    if (!contactId) {
      res.status(400).json({
        success: false,
        message: "Invalid contact ID.",
      });
      return;
    }

    const contact = await updateEmergencyContact(
      userId,
      contactId,
      {
        name: req.body.name,
        relationship: req.body.relationship,
        phone: req.body.phone,
      }
    );

    res.json({
      success: true,
      message: "Emergency contact updated successfully.",
      contact,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update emergency contact.";

    const status =
      message === "Emergency contact not found." ? 404 : 400;

    res.status(status).json({
      success: false,
      message,
    });
  }
}

export async function deleteContact(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const contactId = getContactId(req);

    if (!contactId) {
      res.status(400).json({
        success: false,
        message: "Invalid contact ID.",
      });
      return;
    }

    await deleteEmergencyContact(userId, contactId);

    res.json({
      success: true,
      message: "Emergency contact deleted successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete emergency contact.";

    const status =
      message === "Emergency contact not found." ? 404 : 400;

    res.status(status).json({
      success: false,
      message,
    });
  }
}