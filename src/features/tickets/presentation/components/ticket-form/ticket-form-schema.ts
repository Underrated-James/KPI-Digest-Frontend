import { z } from "zod";

export const ticketFormSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  sprintId: z.string().optional(),
  ticketNumber: z.string().min(1, "Ticket number is required"),
  ticketTitle: z.string().min(1, "Ticket title is required"),
  // Backend validates non-empty string only (not URL format). Avoid Zod's strict .url()
  // so existing links (e.g. missing scheme) do not block save.
  descriptionLink: z.string().min(1, "Description link is required"),
  status: z.enum(['open', 'inProgress', 'done', 'cancelled']),
  assignedDevId: z.string().nullable().optional(),
  assignedQaId: z.string().nullable().optional(),
  developmentEstimation: z.number().min(0, "Must be at least 0").optional().nullable(),
  estimationTesting: z.number().min(0, "Must be at least 0").optional().nullable(),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;
