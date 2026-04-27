import { EventoDisruptivo, PuntoTiempo, MetricasRecuperacion } from "@/types";
import { CHART_DATA, METRICAS_BASE, interpolar } from "@/data/chartData";

/**
 * Genera los puntos de la curva de operatividad para el gráfico.
 *
 * - La curva del sistema rígido usa los datos exactos del Excel (sin modificar).
 * - La curva resiliente se escala con velocidadRespuesta:
 *     > 1x → recuperación más rápida (comprime el eje X resiliente)
 *     < 1x → recuperación más lenta (expande el eje X resiliente)
 * - El horizonte de tiempo se extiende hasta tiempoRecuperacionRigido del evento.
 *
 * @param evento - Evento disruptivo seleccionado
 * @param velocidadRespuesta - Factor de velocidad de respuesta (1.0 = base del Excel)
 * @returns Array de PuntoTiempo con valores enteros de día
 */
export const generarCurvasResiliencia = (
  evento: EventoDisruptivo,
  velocidadRespuesta: number = 1.0,
): PuntoTiempo[] => {
  const datos = CHART_DATA[evento.id];
  if (!datos || datos.length === 0) return [];

  const maxDias = evento.tiempoRecuperacionRigido;
  const puntos: PuntoTiempo[] = [];

  for (let dia = 0; dia <= maxDias; dia++) {
    // Sistema rígido: datos exactos del Excel
    const rigido = interpolar(datos, dia, 1);

    // Sistema resiliente: mismos datos pero el eje X se escala por velocidadRespuesta
    // Con velocidad 2x, el día 5 del resiliente equivale al día 10 del rigid → llega antes
    const xResiliente = dia * velocidadRespuesta;
    const resiliente = Math.min(100, interpolar(datos, xResiliente, 2));

    puntos.push({
      dia,
      rigido: Math.round(rigido * 10) / 10,
      resiliente: Math.round(resiliente * 10) / 10,
    });
  }

  return puntos;
};

/**
 * Calcula las métricas KPI para el evento seleccionado.
 *
 * Los valores base (efectividad, mejoraAbsorcion, tiempos inactivos, comparativaDano)
 * vienen directamente del Excel (Tabla 2). Solo tiempoRecuperacionResiliente se ajusta
 * dinámicamente según velocidadRespuesta.
 *
 * @param puntos - Array de PuntoTiempo generado por generarCurvasResiliencia
 * @param evento - Evento disruptivo seleccionado
 * @param velocidadRespuesta - Factor de velocidad de respuesta
 */
export const calcularMetricas = (
  puntos: PuntoTiempo[],
  evento: EventoDisruptivo,
  velocidadRespuesta: number = 1.0,
): MetricasRecuperacion => {
  const base = METRICAS_BASE[evento.id];

  // Tiempo de recuperación resiliente: ajustado por velocidad (compresión de tiempo)
  const tRecBase = evento.tiempoRecuperacionResiliente;
  const tRecAjustado = Math.max(1, Math.round(tRecBase / velocidadRespuesta));

  // Punto mínimo resiliente y rígido: del array de puntos generados
  const puntoMinimoResiliente = puntos.length > 0
    ? Math.min(...puntos.map((p) => p.resiliente))
    : evento.puntoCriticoResiliente;

  return {
    tiempoRecuperacionResiliente: tRecAjustado,
    tiempoRecuperacionRigido: evento.tiempoRecuperacionRigido,
    efectividad: base?.efectividad ?? 0,
    mejoraAbsorcion: base?.mejoraAbsorcion ?? 0,
    tiempoInactivo: base?.tiempoInactivo ?? 0,
    tiempoInactivoResiliente: base?.tiempoInactivoResiliente ?? 0,
    comparativaDano: base?.comparativaDano ?? 0,
    puntoMinimo: Math.round(puntoMinimoResiliente * 10) / 10,
    puntoCriticoRigido: evento.puntoCriticoRigido,
  };
};

export const formatearTiempoRecuperacion = (dias: number): string => {
  if (dias === 1) return "1 día";
  return `${dias} días`;
};
