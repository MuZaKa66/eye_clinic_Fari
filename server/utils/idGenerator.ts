import db from '../database';

export function generatePatientId(): string {
  const result = db.prepare('SELECT COUNT(*) as count FROM patients').get() as { count: number };
  const count = result.count + 1;
  return `PID${String(count).padStart(5, '0')}`;
}

export function generateVisitNumber(): string {
  const result = db.prepare('SELECT COUNT(*) as count FROM visits').get() as { count: number };
  const count = result.count + 1;
  return `VIS${String(count).padStart(5, '0')}`;
}

export function generateAppointmentNumber(): string {
  const result = db.prepare('SELECT COUNT(*) as count FROM appointments').get() as { count: number };
  const count = result.count + 1;
  return `APT${String(count).padStart(5, '0')}`;
}

export function generateInvoiceNumber(): string {
  const result = db.prepare('SELECT COUNT(*) as count FROM bills').get() as { count: number };
  const count = result.count + 1;
  return `INV${String(count).padStart(5, '0')}`;
}
