"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { ContentType } from "recharts/types/component/Label.d";
import { EventoDisruptivo } from "@/types";
import { EVENTOS } from "@/data/events";
import {
  generarCurvasResiliencia,
  calcularMetricas,
} from "@/data/simulationMath";
import { Wind, Cpu, Zap, Building2, Waves } from "lucide-react";

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
  diferencia: number; // daño evitado = barra ámbar
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

// Iconos como componentes funcionales correctamente tipados
const EVENT_ICON_MAP: Record<
  string,
  React.ComponentType<{ size: number; color: string }>
> = {
  "huracan-cat4": Wind,
  ciberataque: Cpu,
  "falla-suministro": Zap,
  terremoto: Building2,
  inundacion: Waves,
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────
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
        <div
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
                background: "#fca5a5",
              }}
            />
            <span style={{ fontSize: 12, color: "#6b6560" }}>Daño Rígido</span>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#dc2626",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {d.perdidaRigido.toFixed(0)} u.
          </span>
        </div>
        <div
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
                background: "#6ee7b7",
              }}
            />
            <span style={{ fontSize: 12, color: "#6b6560" }}>
              Daño Resiliente
            </span>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#059669",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {d.perdidaResiliente.toFixed(0)} u.
          </span>
        </div>
        <div
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
                background: "#fbbf24",
              }}
            />
            <span style={{ fontSize: 12, color: "#6b6560" }}>Daño Evitado</span>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#d97706",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {d.diferencia.toFixed(0)} u.
          </span>
        </div>
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

// ─── Custom X tick con ícono ──────────────────────────────────────────────────
// Usamos 'any' para las props del tick porque Recharts pasa docenas de props internas
// que no forman parte de nuestra interfaz.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomXTick(props: any) {
  const { x, y, payload, activeId } = props as {
    x: number;
    y: number;
    payload: { value: string };
    activeId: string;
  };
  if (!payload) return null;

  const IconComp = EVENT_ICON_MAP[payload.value];
  const isActive = payload.value === activeId;

  return (
    <g transform={`translate(${x},${y + 6})`}>
      {/* Caja del icono */}
      <rect
        x={-14}
        y={0}
        width={28}
        height={28}
        rx={7}
        fill={isActive ? "#ecfdf5" : "#f5f3ef"}
        stroke={isActive ? "#6ee7b7" : "#ece9e4"}
        strokeWidth={1.5}
      />
      {/* Usamos foreignObject para el componente React del icono */}
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
          {IconComp && (
            <IconComp size={12} color={isActive ? "#059669" : "#a09994"} />
          )}
        </div>
      </foreignObject>
      {/* Texto debajo */}
      <text
        x={0}
        y={42}
        textAnchor="middle"
        fill={isActive ? "#059669" : "#a09994"}
        fontSize={9}
        fontFamily="DM Mono"
        fontWeight={isActive ? 700 : 400}
      >
        {NOMBRES_CORTOS[payload.value] ?? payload.value}
      </text>
    </g>
  );
}

function useViewportWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ResilienceBarChart({
  velocidad,
  eventoActivoId,
}: Props) {
  const vw = useViewportWidth();
  const isMobile = vw < 480;
  const isTablet = vw >= 480 && vw < 1024;

  const datos: EventoMetrica[] = useMemo(() => {
    return EVENTOS.map((ev: EventoDisruptivo) => {
      const puntos = generarCurvasResiliencia(ev, velocidad);
      const metrics = calcularMetricas(puntos);
      const rigido = parseFloat(metrics.perdidaTotalRigido.toFixed(1));
      const resiliente = parseFloat(metrics.perdidaTotalResiliente.toFixed(1));
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

  const maxDano = Math.max(...datos.map((d) => d.perdidaRigido));
  const chartHeight = isMobile ? 220 : isTablet ? 260 : 300;

  // Formatter seguro para LabelList — evita el error de tipos de Recharts
  const labelFormatter = (value: string | number | undefined): string => {
    if (value == null) return "";
    return String(Math.round(Number(value)));
  };

  return (
    <div
      className="card"
      style={{
        padding: isMobile ? "16px 14px" : isTablet ? "20px 20px" : "24px 28px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: isMobile ? 16 : 24,
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
              fontSize: isMobile ? 16 : isTablet ? 18 : 22,
              fontWeight: 800,
              color: "#1a1714",
              margin: 0,
              letterSpacing: "-.02em",
            }}
          >
            Daño por Evento
          </h2>
          {!isMobile && (
            <p style={{ fontSize: 12, color: "#a09994", marginTop: 3 }}>
              Pérdida acumulada · todos los escenarios · velocidad{" "}
              {velocidad.toFixed(1)}×
            </p>
          )}
        </div>

        {/* Leyenda */}
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

      {/* Gráfico */}
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datos}
            margin={{
              top: 20,
              right: isMobile ? 4 : 12,
              bottom: isMobile ? 48 : 56,
              left: 0,
            }}
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
              height={isMobile ? 54 : 62}
            />

            <YAxis
              domain={[0, Math.ceil(maxDano * 1.15)]}
              tick={{
                fill: "#a09994",
                fontSize: isMobile ? 9 : 10,
                fontFamily: "DM Mono",
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => (isMobile ? `${v}` : `${v} u.`)}
              width={isMobile ? 32 : 52}
            />

            <Tooltip
              content={<BarTooltip />}
              cursor={{ fill: "rgba(0,0,0,0.025)", radius: 6 }}
            />

            {/* Barra: daño rígido */}
            <Bar
              dataKey="perdidaRigido"
              name="Rígido"
              radius={[5, 5, 0, 0]}
              maxBarSize={28}
            >
              {datos.map((d) => (
                <Cell
                  key={d.id}
                  fill={d.id === eventoActivoId ? "#f87171" : "#fca5a5"}
                  opacity={d.id === eventoActivoId ? 1 : 0.7}
                />
              ))}
              {!isMobile && (
                <LabelList
                  dataKey="perdidaRigido"
                  position="top"
                  style={{
                    fontSize: 9,
                    fill: "#dc2626",
                    fontFamily: "DM Mono",
                    fontWeight: 700,
                  }}
                  formatter={labelFormatter as ContentType}
                />
              )}
            </Bar>

            {/* Barra: daño resiliente */}
            <Bar
              dataKey="perdidaResiliente"
              name="Resiliente"
              radius={[5, 5, 0, 0]}
              maxBarSize={28}
            >
              {datos.map((d) => (
                <Cell
                  key={d.id}
                  fill={d.id === eventoActivoId ? "#34d399" : "#6ee7b7"}
                  opacity={d.id === eventoActivoId ? 1 : 0.7}
                />
              ))}
              {!isMobile && (
                <LabelList
                  dataKey="perdidaResiliente"
                  position="top"
                  style={{
                    fontSize: 9,
                    fill: "#059669",
                    fontFamily: "DM Mono",
                    fontWeight: 700,
                  }}
                  formatter={labelFormatter as ContentType}
                />
              )}
            </Bar>

            {/* Barra: daño evitado (ámbar) — la diferencia que aporta la resiliencia */}
            <Bar
              dataKey="diferencia"
              name="Evitado"
              radius={[5, 5, 0, 0]}
              maxBarSize={28}
            >
              {datos.map((d) => (
                <Cell
                  key={d.id}
                  fill={d.id === eventoActivoId ? "#f59e0b" : "#fbbf24"}
                  opacity={d.id === eventoActivoId ? 1 : 0.7}
                />
              ))}
              {!isMobile && (
                <LabelList
                  dataKey="diferencia"
                  position="top"
                  style={{
                    fontSize: 9,
                    fill: "#d97706",
                    fontFamily: "DM Mono",
                    fontWeight: 700,
                  }}
                  formatter={labelFormatter as ContentType}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Fila de efectividad */}
      {!isMobile && (
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
              const IconComp = EVENT_ICON_MAP[d.id];
              return (
                <div
                  key={d.id}
                  style={{
                    flex: "1 1 130px",
                    background: isActive ? bg : "#f9f8f6",
                    border: `1.5px solid ${isActive ? color + "55" : "#ece9e4"}`,
                    borderRadius: 12,
                    padding: "10px 14px",
                    transition: "all 0.2s",
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
                    {IconComp && (
                      <IconComp
                        size={13}
                        color={isActive ? color : "#a09994"}
                      />
                    )}
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
                        transition: "width 0.8s ease",
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
      )}
    </div>
  );
}
