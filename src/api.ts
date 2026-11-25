import axios from "axios";
import type {
  Availability,
  Court,
  NotificationItem,
  Reservation,
  ReservationStats,
  SessionUser,
  Tariff,
  WeatherForecast,
} from "./types";

const env = import.meta.env;

const make = (url: string | undefined, fallback: string) =>
  axios.create({
    baseURL: url || fallback,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
  });

export const authApi = make(env.VITE_AUTH_API_URL, "http://localhost:8081");
export const courtsApi = make(env.VITE_COURTS_API_URL, "http://localhost:8082");
export const reservationsApi = make(
  env.VITE_RESERVATIONS_API_URL,
  "http://localhost:8083",
);
export const notificationsApi = make(
  env.VITE_NOTIFICATIONS_API_URL,
  "http://localhost:8084",
);

// El contrato actual exige X-Usuario-Id en operaciones administrativas.
[courtsApi, reservationsApi].forEach((client) =>
  client.interceptors.request.use((config) => {
    const raw = localStorage.getItem("reservas_session");
    if (raw) {
      config.headers["X-Usuario-Id"] = String(
        (JSON.parse(raw) as SessionUser).id,
      );
    }
    return config;
  }),
);

export function apiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as
      | { mensaje?: string; error?: string }
      | undefined;
    if (body?.mensaje) return body.mensaje;
    if (body?.error) return body.error;
    if (error.code === "ECONNABORTED") return "La solicitud tardó demasiado.";
    if (!error.response) {
      return "No fue posible conectar con el servicio. Revisa las URLs y CORS.";
    }
    return `Error ${error.response.status}: revisa los datos enviados.`;
  }
  return "Ocurrió un error inesperado.";
}

export const money = (value?: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const authService = {
  async login(correo: string, clave: string): Promise<SessionUser> {
    return (await authApi.post("/api/auth/login", { correo, clave })).data;
  },
  async register(payload: {
    nombre: string;
    correo: string;
    clave: string;
    edad: number;
    numeroTelefonico: string;
    telegramChatId?: string;
  }) {
    return (await authApi.post("/api/auth/save", payload)).data;
  },
  async getUser(id: number) {
    return (await authApi.get(`/api/auth/${id}`)).data;
  },
};

export const courtService = {
  async list(): Promise<Court[]> {
    return (await courtsApi.get("/api/canchas")).data;
  },
  async search(params: {
    deporte?: string;
    techada?: boolean | "";
    precioMax?: number | "";
  }): Promise<Court[]> {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== "" && value !== undefined),
    );
    return (await courtsApi.get("/api/canchas/buscar", { params: clean })).data;
  },
  async tariff(id: number, fecha: string): Promise<Tariff> {
    return (
      await courtsApi.get<Tariff>(`/api/canchas/${id}/tarifa`, {
        params: { fecha },
      })
    ).data;
  },
  async create(payload: Partial<Court>) {
    return (await courtsApi.post("/api/canchas", payload)).data;
  },
  async update(id: number, payload: Partial<Court>) {
    return (await courtsApi.put(`/api/canchas/${id}`, payload)).data;
  },
  async remove(id: number) {
    return courtsApi.delete(`/api/canchas/${id}`);
  },
  async createBlock(
    id: number,
    payload: { fechaInicio: string; fechaFin: string; motivo: string },
  ) {
    return (await courtsApi.post(`/api/canchas/${id}/bloqueos`, payload)).data;
  },
  async removeBlock(courtId: number, blockId: number) {
    return courtsApi.delete(`/api/canchas/${courtId}/bloqueos/${blockId}`);
  },
};

export const reservationService = {
  async availability(canchaId: number, fecha: string): Promise<Availability> {
    return (
      await reservationsApi.get("/api/reservas/disponibilidad", {
        params: { canchaId, fecha },
      })
    ).data;
  },
  async create(payload: {
    canchaId: number;
    usuarioId: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
  }): Promise<Reservation> {
    return (await reservationsApi.post("/api/reservas", payload)).data;
  },
  async history(userId: number): Promise<Reservation[]> {
    return (await reservationsApi.get(`/api/reservas/usuario/${userId}`)).data;
  },
  async all(): Promise<Reservation[]> {
    return (await reservationsApi.get("/api/reservas")).data;
  },
  async cancel(id: number, motivo = "USUARIO") {
    return (
      await reservationsApi.patch(`/api/reservas/${id}/cancelar`, null, {
        params: { motivo },
      })
    ).data;
  },
  async reschedule(
    id: number,
    payload: { fecha: string; horaInicio: string; horaFin: string },
  ): Promise<Reservation> {
    return (
      await reservationsApi.patch(`/api/reservas/${id}/reprogramar`, payload)
    ).data;
  },
  async weather(id: number): Promise<WeatherForecast> {
    return (
      await reservationsApi.get<WeatherForecast>(`/api/reservas/${id}/pronostico`)
    ).data;
  },
  async stats(desde: string, hasta: string): Promise<ReservationStats> {
    return (
      await reservationsApi.get("/api/reservas/estadisticas", {
        params: { desde, hasta },
      })
    ).data;
  },
  async courtAgenda(canchaId: number, fecha: string): Promise<Reservation[]> {
    return (
      await reservationsApi.get(`/api/reservas/cancha/${canchaId}/agenda`, {
        params: { fecha },
      })
    ).data;
  },
  async markAttendance(id: number, estado: "COMPLETADA" | "NO_ASISTIO") {
    return (
      await reservationsApi.patch(`/api/reservas/${id}/asistencia`, { estado })
    ).data;
  },
  async sendRainAlerts(fecha: string) {
    return (
      await reservationsApi.post("/api/reservas/alertas/lluvia", null, {
        params: { fecha },
      })
    ).data;
  },
  async sendReminders(fecha: string) {
    return (
      await reservationsApi.post("/api/reservas/recordatorios", null, {
        params: { fecha },
      })
    ).data;
  },
};

export const notificationService = {
  async history(userId: number): Promise<NotificationItem[]> {
    return (await notificationsApi.get(`/api/notificaciones/usuario/${userId}`)).data;
  },
};
