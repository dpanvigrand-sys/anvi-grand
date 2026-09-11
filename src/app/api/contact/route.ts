import { NextResponse } from "next/server";
import { createContactMessage } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };
    const result = await createContactMessage({
      name: body.name ?? "",
      email: body.email ?? "",
      subject: body.subject ?? "",
      message: body.message ?? "",
    });
    if (result.error || !result.message) {
      return NextResponse.json(
        { error: result.error ?? "Message failed." },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: result.message }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid contact request." },
      { status: 400 },
    );
  }
}
