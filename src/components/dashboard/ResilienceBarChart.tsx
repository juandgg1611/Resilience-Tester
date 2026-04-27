"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { EventoDisruptivo } from "@/types";
import { EVENTOS } from "@/data/events";
import {
  generarCurvasResiliencia,
  calcularMetricas,
} from "@/data/simulationMath";
import {
  Wind,
  Shield,
  Truck,
  Mountain,
  Droplets,
  AlertTriangle,
} from "lucide-react";

interface Props {
  velocidad: number;
  eventoActivoId: string;
}

interface EventoMetrica {
  id: string;
  nombre: string;
  nombreCorto: string;
  gravedad: number;
  perdidaRigido: number;
  perdidaResiliente: number;
  diferencia: number;
  efectividad: number;
  tiempoRecuperacion: number;
  puntoMinimo: number;
}

const NOMBRES_CORTOS: Record<string, string> = {
  "huracan-cat4": "Huracán",
  ciberataque: "Ciberataque",
  "falla-suministro": "Falla Sup.",
  terremoto: "Terremoto",
  inundacion: "Inundación",
};

// Mapa de iconos de Lucide
const EVENT_ICONS: Record<string, React.ElementType> = {
  "huracan-cat4": Wind,
  ciberataque: Shield,
  "falla-suministro": Truck,
  terremoto: Mountain,
  inundacion: Droplets,
};

interface BarTTProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; payload: EventoMetrica }>;
}

function BarTooltip({ active, payload }: BarTTProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e2dc",
        borderRadius: 12,
        padding: "14px 16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        minWidth: 200,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: "#1a1714",
          marginBottom: 12,
        }}
      >
        {d.nombre}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          {
            dot: "#fca5a5",
            label: "Daño Rígido",
            value: `${d.perdidaRigido.toFixed(0)} u.`,
            color: "#dc2626",
          },
          {
            dot: "#6ee7b7",
            label: "Daño Resiliente",
            value: `${d.perdidaResiliente.toFixed(0)} u.`,
            color: "#059669",
          },
          {
            dot: "#fbbf24",
            label: "Daño Evitado",
            value: `${d.diferencia.toFixed(0)} u.`,
            color: "#d97706",
          },
        ].map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 2,
                  background: row.dot,
                }}
              />
              <span style={{ fontSize: 12, color: "#6b6560" }}>
                {row.label}
              </span>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: row.color,
                fontFamily: "'DM Mono',monospace",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
        <div
          style={{
            paddingTop: 8,
            borderTop: "1px solid #f0ede8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, color: "#a09994" }}>Efectividad</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#d97706",
              background: "#fef3c7",
              padding: "2px 8px",
              borderRadius: 6,
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {d.efectividad.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// Tick con icono de Lucide
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomXTick(props: any) {
  const { x, y, payload, activeId } = props;
  if (!payload?.value) return null;

  const isActive = payload.value === activeId;
  const IconComponent = EVENT_ICONS[payload.value] || AlertTriangle;
  const label = NOMBRES_CORTOS[payload.value] ?? payload.value;
  const iconColor = isActive ? "#059669" : "#a09994";
  const bgFill = isActive ? "#ecfdf5" : "#f5f3ef";
  const bgStroke = isActive ? "#6ee7b7" : "#ece9e4";

  return (
    <g transform={`translate(${x},${y + 4})`}>
      <rect
        x={-14}
        y={0}
        width={28}
        height={28}
        rx={7}
        fill={bgFill}
        stroke={bgStroke}
        strokeWidth={1.5}
      />
      <foreignObject x={-8} y={6} width={16} height={16}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            height: 16,
          }}
        >
          <IconComponent size={14} color={iconColor} />
        </div>
      </foreignObject>
      <text
        x={0}
        y={42}
        textAnchor="middle"
        fill={iconColor}
        fontSize={9}
        fontFamily="DM Mono, monospace"
        fontWeight={isActive ? 700 : 400}
      >
        {label}
      </text>
    </g>
  );
}

export default function ResilienceBarChart({
  velocidad,
  eventoActivoId,
}: Props) {
  const datos: EventoMetrica[] = useMemo(() => {
    return EVENTOS.map((ev: EventoDisruptivo) => {
      const puntos = generarCurvasResiliencia(ev, velocidad);
      const metrics = calcularMetricas(puntos, ev, velocidad);
      const rigido = parseFloat(metrics.tiempoInactivo.toFixed(1));
      const resiliente = parseFloat(metrics.tiempoInactivoResiliente.toFixed(1));
      return {
        id: ev.id,
        nombre: ev.nombre,
        nombreCorto: NOMBRES_CORTOS[ev.id] ?? ev.nombre,
        gravedad: ev.gravedad,
        perdidaRigido: rigido,
        perdidaResiliente: resiliente,
        diferencia: parseFloat((rigido - resiliente).toFixed(1)),
        efectividad: parseFloat(metrics.efectividad.toFixed(1)),
        tiempoRecuperacion: metrics.tiempoRecuperacionResiliente,
        puntoMinimo: metrics.puntoMinimo,
      };
    }).sort((a, b) => b.gravedad - a.gravedad);
  }, [velocidad]);

  const datoActivo = datos.find((d) => d.id === eventoActivoId);
  const maxDano = Math.max(...datos.map((d) => d.perdidaRigido));

  return (
    <>
      <style>{`
        .rbc-mobile  { display: block; }
        .rbc-desktop { display: none;  }
        @media (min-width: 1024px) {
          .rbc-mobile  { display: none;  }
          .rbc-desktop { display: block; }
        }
      `}</style>

      <div
        className="card"
        style={{ padding: "clamp(16px,3vw,24px) clamp(14px,3vw,28px)" }}
      >
        {/* ══ MÓVIL (< 1024px): solo evento activo ══ */}
        <div className="rbc-mobile">
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#a09994",
                textTransform: "uppercase",
                letterSpacing: ".07em",
                marginBottom: 5,
              }}
            >
              Impacto del Evento
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              {datoActivo &&
                (() => {
                  const IconComponent =
                    EVENT_ICONS[datoActivo.id] || AlertTriangle;
                  return <IconComponent size={24} color="#059669" />;
                })()}
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1a1714",
                  margin: 0,
                }}
              >
                {datoActivo?.nombre ?? "Evento"}
              </h2>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {[
                { bg: "#fca5a5", color: "#dc2626", label: "Rígido" },
                { bg: "#6ee7b7", color: "#059669", label: "Resiliente" },
                { bg: "#fbbf24", color: "#d97706", label: "Evitado" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: item.bg,
                    }}
                  />
                  <span
                    style={{ fontSize: 11, fontWeight: 500, color: item.color }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico móvil */}
          <div style={{ height: 260, marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datos.filter((d) => d.id === eventoActivoId)}
                margin={{ top: 28, right: 10, bottom: 25, left: 5 }}
                barCategoryGap={30}
                barGap={4}
              >
                <CartesianGrid stroke="#ece9e4" vertical={false} />
                <XAxis
                  dataKey="nombreCorto"
                  tick={{
                    fill: "#059669",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "DM Mono",
                  }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e2dc" }}
                  height={30}
                />
                <YAxis
                  domain={[0, Math.ceil(maxDano * 1.15)]}
                  tick={{
                    fill: "#a09994",
                    fontSize: 10,
                    fontFamily: "DM Mono",
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v}`}
                  width={35}
                />
                <Tooltip
                  content={<BarTooltip />}
                  cursor={{ fill: "rgba(0,0,0,0.02)" }}
                />

                <Bar
                  dataKey="perdidaRigido"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                >
                  <Cell fill="#f87171" />
                </Bar>
                <Bar
                  dataKey="perdidaResiliente"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                >
                  <Cell fill="#34d399" />
                </Bar>
                <Bar dataKey="diferencia" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  <Cell fill="#f59e0b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tarjetas de métricas */}
          {datoActivo && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <div
                style={{
                  background: "#fee2e2",
                  borderRadius: 12,
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#dc2626",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {datoActivo.perdidaRigido.toFixed(0)}
                </div>
                <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }}>
                  Daño Rígido
                </div>
              </div>
              <div
                style={{
                  background: "#d1fae5",
                  borderRadius: 12,
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#059669",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {datoActivo.perdidaResiliente.toFixed(0)}
                </div>
                <div style={{ fontSize: 11, color: "#059669", marginTop: 2 }}>
                  Daño Resiliente
                </div>
              </div>
              <div
                style={{
                  background: "#fef3c7",
                  borderRadius: 12,
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#d97706",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {datoActivo.diferencia.toFixed(0)}
                </div>
                <div style={{ fontSize: 11, color: "#d97706", marginTop: 2 }}>
                  Daño Evitado
                </div>
              </div>
              <div
                style={{
                  background: "#e0f2fe",
                  borderRadius: 12,
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#0284c7",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {datoActivo.efectividad.toFixed(0)}%
                </div>
                <div style={{ fontSize: 11, color: "#0284c7", marginTop: 2 }}>
                  Efectividad
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 12,
              textAlign: "center",
              fontSize: 10,
              color: "#a09994",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Velocidad de respuesta: {velocidad.toFixed(1)}× ·{" "}
            {datoActivo?.gravedad}% gravedad
          </div>
        </div>

        {/* ══ DESKTOP (≥ 1024px): todos los eventos ══ */}
        <div className="rbc-desktop">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#a09994",
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  marginBottom: 5,
                }}
              >
                Comparativa de Impacto
              </div>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#1a1714",
                  margin: 0,
                  letterSpacing: "-.02em",
                }}
              >
                Daño por Evento
              </h2>
              <p style={{ fontSize: 12, color: "#a09994", marginTop: 3 }}>
                Pérdida acumulada · todos los escenarios · velocidad{" "}
                {velocidad.toFixed(1)}×
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                { bg: "#fca5a5", color: "#dc2626", label: "Daño rígido" },
                { bg: "#6ee7b7", color: "#059669", label: "Daño resiliente" },
                { bg: "#fbbf24", color: "#d97706", label: "Daño evitado" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 3,
                      background: item.bg,
                    }}
                  />
                  <span
                    style={{ fontSize: 11, fontWeight: 600, color: item.color }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datos}
                margin={{ top: 28, right: 12, bottom: 56, left: 0 }}
                barCategoryGap="28%"
                barGap={3}
              >
                <CartesianGrid stroke="#ece9e4" vertical={false} />
                <XAxis
                  dataKey="id"
                  tick={(props) => (
                    <CustomXTick {...props} activeId={eventoActivoId} />
                  )}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e2dc" }}
                  height={62}
                />
                <YAxis
                  domain={[0, Math.ceil(maxDano * 1.15)]}
                  tick={{
                    fill: "#a09994",
                    fontSize: 10,
                    fontFamily: "DM Mono",
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v} u.`}
                  width={52}
                />
                <Tooltip
                  content={<BarTooltip />}
                  cursor={{ fill: "rgba(0,0,0,0.025)", radius: 6 }}
                />

                <Bar
                  dataKey="perdidaRigido"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                >
                  {datos.map((d) => (
                    <Cell
                      key={d.id}
                      fill={d.id === eventoActivoId ? "#f87171" : "#fca5a5"}
                      opacity={d.id === eventoActivoId ? 1 : 0.7}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="perdidaResiliente"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                >
                  {datos.map((d) => (
                    <Cell
                      key={d.id}
                      fill={d.id === eventoActivoId ? "#34d399" : "#6ee7b7"}
                      opacity={d.id === eventoActivoId ? 1 : 0.7}
                    />
                  ))}
                </Bar>
                <Bar dataKey="diferencia" radius={[6, 6, 0, 0]} maxBarSize={28}>
                  {datos.map((d) => (
                    <Cell
                      key={d.id}
                      fill={d.id === eventoActivoId ? "#f59e0b" : "#fbbf24"}
                      opacity={d.id === eventoActivoId ? 1 : 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #f0ede8",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#a09994",
                textTransform: "uppercase",
                letterSpacing: ".07em",
                marginBottom: 12,
              }}
            >
              Efectividad de la resiliencia por evento
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {datos.map((d) => {
                const isActive = d.id === eventoActivoId;
                const color =
                  d.efectividad >= 60
                    ? "#059669"
                    : d.efectividad >= 35
                      ? "#d97706"
                      : "#dc2626";
                const bg =
                  d.efectividad >= 60
                    ? "#d1fae5"
                    : d.efectividad >= 35
                      ? "#fef3c7"
                      : "#fee2e2";
                const IconComponent = EVENT_ICONS[d.id] || AlertTriangle;
                return (
                  <div
                    key={d.id}
                    style={{
                      flex: "1 1 130px",
                      background: isActive ? bg : "#f9f8f6",
                      border: `1.5px solid ${isActive ? color + "55" : "#ece9e4"}`,
                      borderRadius: 12,
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        marginBottom: 8,
                      }}
                    >
                      <IconComponent
                        size={14}
                        color={isActive ? color : "#a09994"}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isActive ? "#1a1714" : "#6b6560",
                        }}
                      >
                        {d.nombreCorto}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 5,
                        background: "#ece9e4",
                        borderRadius: 99,
                        overflow: "hidden",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 99,
                          width: `${d.efectividad}%`,
                          background: color,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 10, color: "#a09994" }}>
                        Daño evitado
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color,
                          fontFamily: "'DM Mono',monospace",
                        }}
                      >
                        {d.efectividad.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
