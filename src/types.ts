export type Role = "USUARIO" | "ADMIN";

export interface SessionUser {
  id: number;
  nombre: string;
  correo: string;
  rol: Role;
}

export interface Court {
  id: number;
  nombre: string;
  tipoDeporte: string;
  direccion: string;
  latitud?: number;
  longitud?: number;
  precioPorHora: number;
  techada: boolean;
  horaApertura: string;
  horaCierre: string;
  estado: string;
}

export interface TimeSlot {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
}

export interface Availability {
  canchaId: number;
  fecha: string;
  franjas: TimeSlot[];
}

export interface Reservation {
  id: number;
  canchaId: number;
  usuarioId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  precioTotal: number;
  estado: string;
  motivoCancelacion?: string | null;
  fechaCreacion?: string;
}

export interface NotificationItem {
  id: number;
  usuarioId: number;
  destinatario: string;
  canal: string;
  tipo: string;
  mensaje: string;
  estado: string;
  intentos: number;
  fecha: string;
}

export interface ReservationStats {
  desde?: string;
  hasta?: string;
  totalReservas?: number;
  porEstado?: Record<string, number>;
  ocupacionPorCancha?: Array<{ canchaId: number; horasReservadas: number }>;
}

// Respuesta real de GET /api/canchas/{id}/tarifa?fecha=yyyy-MM-dd
export interface Tariff {
  canchaId: number;
  fecha: string;
  precioBase: number;
  factor: number;
  precioPorHora: number;
  esFestivo: boolean;
  esFinDeSemana: boolean;
  nombreFestivo: string | null;
}

// Respuesta real de GET /api/reservas/{id}/pronostico
export interface WeatherForecast {
  reservaId: number;
  aplica: boolean;
  pronosticoDisponible: boolean;
  probabilidadLluvia: number | null;
  riesgoLluvia: boolean;
  umbral: number;
}
