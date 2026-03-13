"use client";

import { PuntoTiempo } from "@/types";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useEffect, useState, useMemo } from "react";

interface Props {
  data: PuntoTiempo[];
}

interface PuntoGrafico extends PuntoTiempo {
  rigidoBase: number; // Para el área roja (base)
  ganancia: number; // Para el área ámbar (entre líneas)
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color: string;
  }>;
  label?: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  const rigido = payload.find((p) => p.dataKey === "rigido");
  const resiliente = payload.find((p) => p.dataKey === "resiliente");
  const ganancia = resiliente && rigido ? resiliente.value - rigido.value : 0;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e2dc",
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        minWidth: 162,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#a09994",
          fontFamily: "'DM Mono',monospace",
          marginBottom: 8,
          letterSpacing: ".05em",
        }}
      >
        DÍA {label}
      </div>

      {/* Sistema Resiliente - Línea Verde */}
      {resiliente && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 5,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: "#059669",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, color: "#6b6560" }}>Resiliente</span>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#059669",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {resiliente.value.toFixed(1)}%
          </span>
        </div>
      )}

      {/* Sistema Rígido - Línea Roja */}
      {rigido && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 5,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: "#dc2626",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, color: "#6b6560" }}>Rígido</span>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#dc2626",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            {rigido.value.toFixed(1)}%
          </span>
        </div>
      )}

      {/* Resiliencia Ganada - Diferencia */}
      {ganancia > 0 && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid #f0ede8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: "#d97706",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 10, color: "#a09994" }}>Ganancia</span>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#d97706",
              background: "#fef3c7",
              padding: "2px 7px",
              borderRadius: 6,
              fontFamily: "'DM Mono',monospace",
            }}
          >
            +{ganancia.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
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

function calcularTicksDias(
  min: number,
  max: number,
  maxTicks: number,
): number[] {
  const span = max - min;
  const intervals = [1, 2, 5, 7, 10, 14, 15, 30];
  const interval =
    intervals.find((iv) => Math.floor(span / iv) + 1 <= maxTicks) ?? 5;
  const ticks: number[] = [];
  for (let v = min; v <= max; v += interval) ticks.push(v);
  if (ticks[ticks.length - 1] !== max) ticks.push(max);
  return ticks;
}

export default function ResiliencyChart({ data }: Props) {
  const vw = useViewportWidth();
  const isMobile = vw < 480;
  const isTablet = vw >= 480 && vw < 1024;

  // Enriquecer datos para las áreas apiladas
  const datosEnriquecidos: PuntoGrafico[] = useMemo(() => {
    return data.map((d) => ({
      ...d,
      rigidoBase: d.rigido, // Base para el área roja
      ganancia: Math.max(0, d.resiliente - d.rigido), // Diferencia para área ámbar
    }));
  }, [data]);

  // Punto crítico del sistema resiliente
  const puntoMinimo = Math.min(...data.map((d) => d.resiliente));
  const diaMinimo = data.find((d) => d.resiliente === puntoMinimo)?.dia ?? 0;

  const maxTicksX = isMobile ? 5 : isTablet ? 7 : 9;
  const minDia = data[0]?.dia ?? 0;
  const maxDia = data[data.length - 1]?.dia ?? 30;
  const ticksX = useMemo(
    () => calcularTicksDias(minDia, maxDia, maxTicksX),
    [minDia, maxDia, maxTicksX],
  );

  const margin = isMobile
    ? { top: 8, right: 6, bottom: 24, left: 0 }
    : isTablet
      ? { top: 10, right: 10, bottom: 32, left: 0 }
      : { top: 10, right: 14, bottom: 38, left: 0 };

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
            Curvas de Operatividad
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
            Triángulo de Resiliencia
          </h2>
          {!isMobile && (
            <p style={{ fontSize: 12, color: "#a09994", marginTop: 3 }}>
              Sistema Rígido vs Resiliente · {data.length} días simulados
            </p>
          )}
        </div>

        {/* Leyenda */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
          }}
        >
          {/* Sistema Resiliente - Verde Sólido */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="24" height="10">
              <line
                x1="0"
                y1="5"
                x2="24"
                y2="5"
                stroke="#059669"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#059669" }}>
              Sistema Resiliente
            </span>
          </div>

          {/* Sistema Rígido - Rojo Discontinuo */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="24" height="10">
              <line
                x1="0"
                y1="5"
                x2="24"
                y2="5"
                stroke="#dc2626"
                strokeWidth={2.5}
                strokeDasharray="5,3"
                strokeLinecap="round"
              />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#dc2626" }}>
              Sistema Rígido
            </span>
          </div>

          {/* Resiliencia Ganada - Área Ámbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 24,
                height: 10,
                borderRadius: 3,
                background: "rgba(217,119,6,0.35)",
                border: "1px solid #d97706",
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#d97706" }}>
              Resiliencia Ganada
            </span>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div
        className="chart-wrap"
        style={{ height: isMobile ? 220 : isTablet ? 300 : 360 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={datosEnriquecidos} margin={margin}>
            <defs>
              {/* Gradiente rojo para el área rígida */}
              <linearGradient id="gradRigido" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0.04} />
              </linearGradient>

              {/* Gradiente ámbar para el área entre curvas */}
              <linearGradient id="gradGanancia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.15} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#ece9e4" vertical={false} />

            <XAxis
              dataKey="dia"
              type="number"
              scale="linear"
              domain={[minDia, maxDia]}
              ticks={ticksX}
              tickFormatter={(v: number) => (isMobile ? `D${v}` : `Día ${v}`)}
              tick={{
                fill: "#a09994",
                fontSize: isMobile ? 9 : 10,
                fontFamily: "DM Mono",
              }}
              tickLine={false}
              axisLine={{ stroke: "#e5e2dc" }}
              interval={0}
              label={
                !isMobile
                  ? {
                      value: "Días desde el impacto",
                      position: "insideBottom",
                      offset: -20,
                      fill: "#a09994",
                      fontSize: 10,
                      fontFamily: "DM Mono",
                    }
                  : undefined
              }
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{
                fill: "#a09994",
                fontSize: isMobile ? 9 : 10,
                fontFamily: "DM Mono",
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
              width={isMobile ? 36 : 44}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#e5e2dc", strokeWidth: 1.5 }}
            />

            {/* Línea del punto crítico */}
            <ReferenceLine
              x={diaMinimo}
              stroke="#d97706"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              label={{
                value: `Día ${diaMinimo}`,
                fill: "#d97706",
                fontSize: isMobile ? 9 : 10,
                fontFamily: "DM Mono",
                position: "insideTopRight",
              }}
            />

            <ReferenceLine
              y={100}
              stroke="#e5e2dc"
              strokeDasharray="4 4"
              label={{
                value: "100%",
                fill: "#ccc9c4",
                fontSize: 9,
                fontFamily: "DM Mono",
                position: "right",
              }}
            />

            {/* 
              ÁREA ROJA - Sistema Rígido (base)
              Esta área va desde 0 hasta rigido
            */}
            <Area
              type="monotone"
              dataKey="rigidoBase"
              stackId="1"
              stroke="none"
              fill="url(#gradRigido)"
            />

            {/* 
              ÁREA AMBAR - Resiliencia Ganada (apilada SOBRE la roja)
              Esta área va desde rigido hasta resiliente
              Al usar el mismo stackId="1", se apila exactamente sobre la roja
            */}
            <Area
              type="monotone"
              dataKey="ganancia"
              stackId="1"
              stroke="none"
              fill="url(#gradGanancia)"
            />

            {/* 
              LÍNEA VERDE - Sistema Resiliente 
              (se dibuja ENCIMA de las áreas)
            */}
            <Line
              type="monotone"
              dataKey="resiliente"
              stroke="#059669"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                fill: "#059669",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              name="Sistema Resiliente"
            />

            {/* 
              LÍNEA ROJA - Sistema Rígido 
              (discontinua para diferenciarla)
            */}
            <Line
              type="monotone"
              dataKey="rigido"
              stroke="#dc2626"
              strokeWidth={2.5}
              strokeDasharray="7 4"
              dot={false}
              activeDot={{
                r: 6,
                fill: "#dc2626",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              name="Sistema Rígido"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer explicativo */}
      {!isMobile && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid #f0ede8",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 16,
              height: 9,
              borderRadius: 3,
              background: "rgba(217,119,6,0.35)",
              border: "1px solid #d97706",
              flexShrink: 0,
              marginTop: 2,
            }}
          />
          <p
            style={{
              fontSize: 11,
              color: "#a09994",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#059669" }}>Línea verde:</strong> Sistema
            Resiliente ·{" "}
            <strong style={{ color: "#dc2626" }}>
              Línea roja discontinua:
            </strong>{" "}
            Sistema Rígido ·{" "}
            <strong style={{ color: "#d97706" }}>Área ámbar:</strong>{" "}
            Resiliencia Ganada (diferencia entre curvas)
          </p>
        </div>
      )}
    </div>
  );
}
