export type Room = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  sizeSqFt: number;
  amenities: string[];
  image: string;
  gallery: string[];
  available: boolean;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  roomId: string;
  roomName: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type CreateBookingInput = {
  roomId: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes?: string;
};
