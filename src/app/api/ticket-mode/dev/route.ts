import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const devJsonPath = path.join(
  process.cwd(),
  "src",
  "features",
  "ticket_Mode",
  "dev.json",
);

type TicketModePayload = {
  data: {
    content: Array<Record<string, unknown>>;
  };
};

async function readDevJson() {
  const content = await fs.readFile(devJsonPath, "utf8");
  return JSON.parse(content) as TicketModePayload;
}

async function writeDevJson(payload: TicketModePayload) {
  await fs.writeFile(devJsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export async function GET() {
  try {
    const payload = await readDevJson();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to read ticket mode data",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      changes?: Record<string, unknown>;
    };

    if (!body.id || !body.changes) {
      return NextResponse.json(
        { message: "Ticket id and changes are required." },
        { status: 400 },
      );
    }

    const payload = await readDevJson();
    const ticketIndex = payload.data.content.findIndex(
      (ticket) => ticket.id === body.id,
    );

    if (ticketIndex === -1) {
      return NextResponse.json(
        { message: "Ticket not found." },
        { status: 404 },
      );
    }

    payload.data.content[ticketIndex] = {
      ...payload.data.content[ticketIndex],
      ...body.changes,
    };

    await writeDevJson(payload);

    return NextResponse.json({
      message: "Ticket updated successfully.",
      data: payload.data.content[ticketIndex],
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update ticket mode data",
      },
      { status: 500 },
    );
  }
}
