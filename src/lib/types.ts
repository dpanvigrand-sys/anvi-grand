export type HotelInfo = {
  name: string;
  tagline: string;
  address: string;
  /** Legacy / fallback main desk number */
  phone: string;
  email: string;
  foodBrand: string;
  heroImage?: string;
  logo?: string;
  foodLogo?: string;
  /** Rooms booking line — shown on /rooms */
  roomsPhone?: string;
  /** Food / CHIGURU booking line — shown on /food */
  foodPhone?: string;
  /** Reception / front desk — header, footer, contact */
  receptionPhone?: string;
};

export type Room = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  image: string;
  available: boolean;
};

export type Venue = {
  id: string;
  type: "banquet" | "party-hall";
  name: string;
  tagline: string;
  description: string;
  capacity: number;
  priceFrom: number;
  image: string;
  amenities: string[];
};

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  veg: boolean;
  image: string;
};

export type Buffet = {
  id: string;
  name: string;
  description: string;
  pricePerPerson: number;
  meal: string;
  image: string;
};

export type Facility = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type Catalog = {
  hotel: HotelInfo;
  rooms: Room[];
  venues: Venue[];
  menu: MenuItem[];
  buffets: Buffet[];
  facilities: Facility[];
};

export type RoomBooking = {
  id: string;
  type: "room";
  roomId: string;
  roomName: string;
  guestName: string;
  email: string;
  phone: string;
  /** Guest postal / stay address */
  address?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  total: number;
  /** Amount paid up front (₹) */
  advance: number;
  /** Remaining dues — typically total − advance */
  balance: number;
  notes?: string;
  status: "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled";
  createdAt: string;
};

export type VenueBooking = {
  id: string;
  type: "banquet" | "party-hall";
  venueId: string;
  venueName: string;
  guestName: string;
  email: string;
  phone: string;
  eventDate: string;
  guests: number;
  total: number;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
};

export type FoodOrderItem = {
  menuId: string;
  name: string;
  qty: number;
  price: number;
};

export type FoodOrder = {
  id: string;
  type: "food";
  guestName: string;
  phone: string;
  /** Delivery / billing address */
  address?: string;
  roomNumber?: string;
  items: FoodOrderItem[];
  total: number;
  /** Amount paid up front (₹) */
  advance: number;
  /** Remaining dues — typically total − advance */
  balance: number;
  status: "placed" | "preparing" | "ready" | "served" | "cancelled";
  source: "online" | "server" | "room-service";
  tableId?: string;
  createdAt: string;
};

export type BuffetBooking = {
  id: string;
  type: "buffet";
  buffetId: string;
  buffetName: string;
  guestName: string;
  phone: string;
  date: string;
  guests: number;
  total: number;
  status: "confirmed" | "cancelled";
  createdAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type DiningTable = {
  id: string;
  label: string;
  section: string;
  seats: number;
  status: "free" | "occupied" | "billing" | "reserved";
};

export type KitchenTicket = {
  id: string;
  orderId: string;
  items: FoodOrderItem[];
  tableId?: string;
  status: "queued" | "cooking" | "ready" | "bumped";
  createdAt: string;
  updatedAt: string;
};

export type LedgerEntry = {
  id: string;
  kind: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  refId?: string;
  createdAt: string;
};

export type StockMove = {
  id: string;
  direction: "inward" | "outward";
  item: string;
  quantity: number;
  unit: string;
  vendorOrDept: string;
  notes?: string;
  createdAt: string;
};

export type GuestRecord = {
  id: string;
  name: string;
  phone: string;
  roomId?: string;
  status: string;
};

export type OpsStore = {
  roomBookings: RoomBooking[];
  venueBookings: VenueBooking[];
  foodOrders: FoodOrder[];
  buffetBookings: BuffetBooking[];
  messages: ContactMessage[];
  tables: DiningTable[];
  kitchenTickets: KitchenTicket[];
  ledger: LedgerEntry[];
  inward: StockMove[];
  outward: StockMove[];
  guests: GuestRecord[];
};

export type StaffRole =
  | "reception"
  | "server"
  | "kitchen"
  | "admin"
  | "accounts"
  | "inward"
  | "outward";
