// domain/schemas/user.schema.ts
import { z } from "zod";


export const userRoleEnum = z.enum(["ADMIN", "DEVS", "QA"]);

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Email is required"),
  role: userRoleEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;