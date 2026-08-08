"use server";
import 'server-only';

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/auth";

export const getAvailableServices = async () => {
  return await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
};

export const getAvailableBarbers = async () => {
  return await prisma.barberProfile.findMany({
    where: { isActive: true },
    include: {
      user: { select: { name: true, image: true } },
      specialties: true,
    },
  });
};

export const getAvailableSlots = async (
  barberId: string,
  date: Date
) => {
  const dayOfWeek = date.getDay();
  
  const availability = await prisma.availability.findFirst({
    where: { barberId, dayOfWeek, isActive: true },
  });

  if (!availability) return [];

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      barberId,
      startTime: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(24, 0, 0, 0)),
      },
      status: { not: "CANCELLED" },
    },
  });

  // Simple slot generation for testing:
  // In a real scenario, we would break availability into intervals
  // and filter out those that overlap with bookedAppointments.
  return { availability, bookedAppointments };
};

const appointmentSchema = z.object({
  serviceId: z.string(),
  barberId: z.string(),
  startTime: z.date(),
  notes: z.string().optional(),
});

export const createAppointment = async (
  data: z.infer<typeof appointmentSchema>
) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = appointmentSchema.parse(data);

  if (validated.startTime < new Date()) {
    throw new Error("Cannot book in the past");
  }

  const service = await prisma.service.findUniqueOrThrow({
    where: { id: validated.serviceId },
  });

  const startTime = validated.startTime;
  const endTime = new Date(startTime.getTime() + service.duration * 60000);

  // Check for overlaps
  const overlapping = await prisma.appointment.findFirst({
    where: {
      barberId: validated.barberId,
      status: { not: "CANCELLED" },
      OR: [
        {
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      ],
    },
  });

  if (overlapping) {
    throw new Error("This time slot is already booked.");
  }

  return await prisma.appointment.create({
    data: {
      ...validated,
      endTime,
      totalPrice: service.price,
      customerId: session.user.id,
      status: "PENDING",
    },
  });
};

