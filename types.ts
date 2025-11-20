export enum UserRole {
  COLLABORATOR = 'COLLABORATOR',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER', // Jefe de área
  KITCHEN = 'KITCHEN'  // Pantalla de cocina
}

export interface User {
  id: string; // Cédula/ID
  name: string;
  role: UserRole;
  department: string;
}

export interface GuestTicket {
  code: string; // 6 digit code
  visitorName: string;
  companyOrReason: string;
  sponsorName: string; // Who requested it
  generatedAt: string;
  redeemedAt?: string; // When they ate
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
}

export interface MealLog {
  id: string;
  userId: string; // User ID or Ticket Code
  userName: string;
  department: string; // Dept or 'VISITANTE'
  timestamp: string; // ISO String
  date: string; // YYYY-MM-DD
  type: 'STANDARD' | 'EXTRA';
  details?: string;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  userName?: string;
  type?: 'STANDARD' | 'EXTRA';
}

export type ViewState = 'KIOSK' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD' | 'KITCHEN_DISPLAY';