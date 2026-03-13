import { EventoDisruptivo, PuntoTiempo, MetricasRecuperacion } from "@/types";

export const generarCurvasResiliencia = (
  evento: EventoDisruptivo,
  velocidadRespuesta: number = 1.0,
  horizonteTiempo: number = 30,
): PuntoTiempo[] => {
  const puntos: PuntoTiempo[] = [];

  for (let dia = 0; dia <= horizonteTiempo; dia++) {
    // Sistema Rígido: impacto severo y degradación continua
    let rigido = 100 - evento.gravedad;
    if (dia > 0) {
      rigido = Math.max(5, rigido - dia * 0.8);
    }

    // Sistema Resiliente: recuperación con velocidad ajustable
    let resiliente = 100 - evento.gravedad;
    if (dia > 0) {
      const factorRecuperacion = Math.log10(dia * velocidadRespuesta + 1) * 35;
      resiliente = Math.min(100, resiliente + factorRecuperacion);
    }

    // Oscilaciones para realismo
    if (evento.factorOscilacion && dia > 0) {
      const oscilacion = Math.sin(dia * 0.8) * evento.factorOscilacion * 5;
      resiliente = Math.min(100, Math.max(0, resiliente + oscilacion));
      rigido = Math.min(100, Math.max(0, rigido + oscilacion * 0.3));
    }

    puntos.push({
      dia,
      rigido: Math.round(rigido * 10) / 10,
      resiliente: Math.round(resiliente * 10) / 10,
    });
  }

  return puntos;
};

export const calcularMetricas = (
  puntos: PuntoTiempo[],
): MetricasRecuperacion => {
  const puntoMinimo = Math.min(...puntos.map((p) => p.resiliente));

  const perdidaTotalRigido = puntos.reduce(
    (acc, p) => acc + (100 - p.rigido),
    0,
  );
  const perdidaTotalResiliente = puntos.reduce(
    (acc, p) => acc + (100 - p.resiliente),
    0,
  );

  // ✅ FIX: umbral 95% en vez de 99.9% — las curvas sí alcanzan ese nivel en 30 días
  const primerDiaRecuperacion = puntos.findIndex(
    (p) => p.dia > 0 && p.resiliente >= 95,
  );
  const tiempoRecuperacionResiliente =
    primerDiaRecuperacion === -1 ? puntos.length : primerDiaRecuperacion;

  const ultimoPunto = puntos[puntos.length - 1];
  const tiempoRecuperacionRigido = ultimoPunto.rigido < 50 ? puntos.length : 0;

  const efectividad =
    perdidaTotalRigido > 0
      ? ((perdidaTotalRigido - perdidaTotalResiliente) / perdidaTotalRigido) *
        100
      : 0;

  return {
    tiempoRecuperacionResiliente,
    tiempoRecuperacionRigido,
    perdidaTotalRigido: Math.round(perdidaTotalRigido * 10) / 10,
    perdidaTotalResiliente: Math.round(perdidaTotalResiliente * 10) / 10,
    resilienciaGanada:
      Math.round((perdidaTotalRigido - perdidaTotalResiliente) * 10) / 10,
    puntoMinimo: Math.round(puntoMinimo * 10) / 10,
    efectividad: Math.round(efectividad * 10) / 10,
  };
};

export const formatearTiempoRecuperacion = (dias: number): string => {
  if (dias >= 30) return "No recuperado";
  if (dias === 1) return "1 día";
  return `${dias} días`;
};
