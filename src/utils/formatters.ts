export const formatearPorcentaje = (valor: number): string => `${valor}%`;

export const formatearNumero = (valor: number): string =>
  new Intl.NumberFormat("es-ES").format(valor);

// Devuelve una etiqueta de texto, sin emojis
export const obtenerColorSegunValor = (valor: number): string => {
  if (valor >= 80) return "text-green-600";
  if (valor >= 50) return "text-amber-600";
  return "text-red-600";
};

// Sin emojis — solo etiqueta de texto para usar en lógica
export const obtenerIconoGravedad = (gravedad: number): string => {
  if (gravedad >= 80) return "critico";
  if (gravedad >= 50) return "moderado";
  return "leve";
};
