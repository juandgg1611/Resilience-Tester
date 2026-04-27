export interface EventoDisruptivo {
  id: string;
  nombre: string;
  descripcion: string;
  probabilidad: number;         // 0-1, ej. 0.75
  labelProbabilidad: string;    // "Probable", "Muy Probable", etc.
  consecuencia: number;         // 0-1, ej. 0.85
  labelConsecuencia: string;    // "Catastrófica", "Crítica", "Moderada"
  nivelRiesgo: string;          // "Crítico" | "Alto" | "Moderado"
  gravedad: number;             // 0-100, para compatibilidad de colores en UI
  tiempoRecuperacionRigido: number;       // días (sistema rígido)
  puntoCriticoRigido: number;            // % mínimo operatividad sistema rígido
  tiempoRecuperacionResiliente: number;  // días (sistema resiliente)
  puntoCriticoResiliente: number;        // % mínimo operatividad sistema resiliente
  icono?: string;
}

export interface PuntoTiempo {
  dia: number;
  rigido: number;
  resiliente: number;
}

export interface MetricasRecuperacion {
  tiempoRecuperacionResiliente: number;  // días hasta 100% operatividad
  tiempoRecuperacionRigido: number;      // días hasta 100% operatividad (sistema rígido)
  efectividad: number;                   // % — Efectividad del sistema resiliente
  mejoraAbsorcion: number;               // % — Mejora en la Capacidad de Absorción
  tiempoInactivo: number;                // días inactivo sistema rígido
  tiempoInactivoResiliente: number;      // días inactivo sistema resiliente
  comparativaDano: number;               // diferencia en días inactivos (rígido - resiliente)
  puntoMinimo: number;                   // % operatividad mínima (sistema resiliente)
  puntoCriticoRigido: number;            // % operatividad mínima (sistema rígido)
}

export interface SimulacionConfig {
  velocidadRespuesta: number;
  horizonteTiempo: number;
}
