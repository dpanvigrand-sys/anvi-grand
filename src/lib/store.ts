import { promises as fs } from "fs";
import path from "path";
import type { Booking, ContactMessage, CreateBookingInput, Room } from "./types";

const dataDir = path.join(process.cwd(), "data");

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  const filePath = path.join(dataDir, filename);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(dataDir, filename);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export async function getRooms(): Promise<Room[]> {
  return readJson<Room[]>("rooms.json", []);
}

export async function getRoomById(id: string): Promise<Room | undefined> {
  const rooms = await getRooms();
  return rooms.find((room) => room.id === id);
}

export async function getBookings(): Promise<Booking[]> {
  return readJson<Booking[]>("bookings.json", []);
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  const bookings = await getBookings();
  return bookings.find((booking) => booking.id === id);
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<{ booking?: Booking; error?: string }> {
  const room = await getRoomById(input.roomId);
  if (!room) {
    return { error: "Room not found." };
  }
  if (!room.available) {
    return { error: "This room is currently unavailable." };
  }
  if (!input.guestName?.trim() || !input.email?.trim()) {
    return { error: "Guest name and email are required." };
  }
  if (!input.checkIn || !input.checkOut) {
    return { error: "Check-in and check-out dates are required." };
  }
  const checkIn = new Date(input.checkIn);
  const checkOut = new Date(input.checkOut);
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return { error: "Invalid dates." };
  }
  if (checkOut <= checkIn) {
    return { error: "Check-out must be after check-in." };
  }
  if (input.guests < 1 || input.guests > room.capacity) {
    return {
      error: `Guest count must be between 1 and ${room.capacity} for this room.`,
    };
  }

  const nights = nightsBetween(input.checkIn, input.checkOut);
  const booking: Booking = {
    id: `hm-${Date.now().toString(36)}`,
    roomId: room.id,
    roomName: room.name,
    guestName: input.guestName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || "",
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    nights,
    totalPrice: nights * room.pricePerNight,
    notes: input.notes?.trim() || undefined,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  const bookings = await getBookings();
  bookings.unshift(booking);
  await writeJson("bookings.json", bookings);
  return { booking };
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ message?: ContactMessage; error?: string }> {
  if (!input.name?.trim() || !input.email?.trim() || !input.message?.trim()) {
    return { error: "Name, email, and message are required." };
  }

  const entry: ContactMessage = {
    id: `msg-${Date.now().toString(36)}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    subject: input.subject?.trim() || "General inquiry",
    message: input.message.trim(),
    createdAt: new Date().toISOString(),
  };

  const messages = await readJson<ContactMessage[]>("messages.json", []);
  messages.unshift(entry);
  await writeJson("messages.json", messages);
  return { message: entry };
}

export { formatCurrency } from "./format";
