import { User, UserRole, MealLog, CheckInResult, GuestTicket } from '../types';

// Simulate Users: 160 Collabs, Admins, Managers, Kitchen
const MOCK_USERS: User[] = [
  { id: '1001', name: 'Admin Principal', role: UserRole.ADMIN, department: 'Operaciones' },
  { id: '1002', name: 'Gerente RRHH', role: UserRole.MANAGER, department: 'Recursos Humanos' }, // Manager
  { id: '1003', name: 'Jefe Logística', role: UserRole.MANAGER, department: 'Logística' }, // Manager
  { id: '9000', name: 'Pantalla Cocina', role: UserRole.KITCHEN, department: 'Cocina' }, // Kitchen User
  ...Array.from({ length: 160 }, (_, i) => ({
    id: (2000 + i).toString(),
    name: `Colaborador ${i + 1}`,
    role: UserRole.COLLABORATOR,
    department: ['Logística', 'Ventas', 'IT', 'Finanzas'][Math.floor(Math.random() * 4)]
  }))
];

// Storage
let logs: MealLog[] = [];
let tickets: GuestTicket[] = [];

// Helpers
export const getUserById = (id: string): User | undefined => {
  return MOCK_USERS.find(u => u.id === id);
};

export const searchUsers = (query: string): User[] => {
  const lowerQuery = query.toLowerCase();
  return MOCK_USERS.filter(u => 
    u.name.toLowerCase().includes(lowerQuery) || 
    u.id.includes(lowerQuery)
  ).slice(0, 5); // Limit results
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// --- CORE LOGIC ---

// 1. Generate Tickets for Visitors
export const createGuestTickets = (sponsorId: string, guests: {name: string, reason: string}[]): GuestTicket[] => {
  const sponsor = getUserById(sponsorId);
  if (!sponsor) return [];

  const newTickets: GuestTicket[] = guests.map(guest => {
    // Generate simple 6-digit code (avoiding collision logic for simplicity of mock)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return {
      code,
      visitorName: guest.name,
      companyOrReason: guest.reason,
      sponsorName: sponsor.name,
      generatedAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
  });

  tickets.push(...newTickets);
  return newTickets;
};

// 2. Universal Check-in (ID or Ticket Code)
export const checkInUser = (input: string): CheckInResult => {
  const today = getTodayDateString();

  // A. Try as Employee ID (Length usually 4 in this mock)
  const user = getUserById(input);
  
  if (user) {
    // Logic for Employee
    const existingLog = logs.find(l => l.userId === user.id && l.date === today && l.type === 'STANDARD');
    
    if (existingLog) {
      return { 
        success: false, 
        message: `Ya registró consumo hoy (${new Date(existingLog.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}).` 
      };
    }

    const newLog: MealLog = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      department: user.department,
      timestamp: new Date().toISOString(),
      date: today,
      type: 'STANDARD'
    };
    logs.push(newLog);
    return { success: true, message: '¡Buen provecho!', userName: user.name, type: 'STANDARD' };
  }

  // B. Try as Visitor Ticket (Length usually 6)
  const ticketIndex = tickets.findIndex(t => t.code === input);
  if (ticketIndex !== -1) {
    const ticket = tickets[ticketIndex];

    if (ticket.status === 'REDEEMED') return { success: false, message: 'Este ticket ya fue utilizado.' };
    if (ticket.status === 'EXPIRED') return { success: false, message: 'Ticket expirado.' };

    // Redeem Ticket
    tickets[ticketIndex].status = 'REDEEMED';
    tickets[ticketIndex].redeemedAt = new Date().toISOString();

    const newLog: MealLog = {
      id: Date.now().toString(),
      userId: ticket.code,
      userName: `${ticket.visitorName} (Visita)`,
      department: 'EXTERNO',
      timestamp: new Date().toISOString(),
      date: today,
      type: 'EXTRA',
      details: `Autoriza: ${ticket.sponsorName}. Motivo: ${ticket.companyOrReason}`
    };
    logs.push(newLog);

    return { 
        success: true, 
        message: 'Ticket Válido. Bienvenido.', 
        userName: ticket.visitorName, 
        type: 'EXTRA' 
    };
  }

  return { success: false, message: 'ID o Código no encontrado.' };
};

// 3. Get Data
export const getDailyLogs = (): MealLog[] => {
  const today = getTodayDateString();
  // Sort by newest first
  return logs.filter(l => l.date === today).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getStats = () => {
    const dailyLogs = getDailyLogs();
    const standard = dailyLogs.filter(l => l.type === 'STANDARD').length;
    const extra = dailyLogs.filter(l => l.type === 'EXTRA').length;
    return { standard, extra, total: standard + extra };
};