"use server";
import "server-only";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signUp(data: z.infer<typeof signupSchema>) {
  const validated = signupSchema.safeParse(data);
  if (!validated.success) return { success: false, error: "Invalid data" };

  const { name, email, password } = validated.data;
  const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (existingUser) return { success: false, error: "Email already exists" };

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "CUSTOMER",
    },
  });
  return { success: true, userId: user.id };
}

