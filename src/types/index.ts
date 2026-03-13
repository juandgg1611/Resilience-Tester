export interface EventoDisruptivo {
  id: string;
  nombre: string;
  descripcion: string;
  gravedad: number; // 0-100, impacto inicial
  tiempoRecuperacionBase: number; // en días
  factorOscilacion?: number; // para hacer las curvas más realistas
  color?: string;
  icono?: string;
}

export interface PuntoTiempo {
  dia: number;
  rigido: number;
  resiliente: number;
}

export interface MetricasRecuperacion {
  tiempoRecuperacionResiliente: number; // días hasta volver a 100%
  tiempoRecuperacionRigido: number; // días o "No recuperado"
  perdidaTotalRigido: number; // área bajo la curva (días * % pérdida)
  perdidaTotalResiliente: number;
  resilienciaGanada: number; // diferencia de áreas
  puntoMinimo: number; // peor momento de la crisis
  efectividad: number; // porcentaje de daño evitado
}

export interface SimulacionConfig {
  velocidadRespuesta: number;
  horizonteTiempo: number;
}
