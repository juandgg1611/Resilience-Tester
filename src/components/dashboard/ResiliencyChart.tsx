"use client";

import { PuntoTiempo } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Props {
  data: PuntoTiempo[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  const res = payload.find((p) => p.name === "Resiliente");
  const rig = payload.find((p) => p.name === "Rígido");
  const diff = res && rig ? res.value - rig.value : null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e2dc",
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        minWidth: 180,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#a09994",
          fontFamily: "'DM Mono', monospace",
          marginBottom: 10,
          letterSpacing: ".05em",
        }}
      >
        DÍA {label}
      </div>
      {res && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: "#059669",
              }}
            />
            <span style={{ fontSize: 12, color: "#6b6560" }}>Resiliente</span>
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#059669",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {res.value}%
          </span>
        </div>
      )}
      {rig && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: "#dc2626",
              }}
            />
            <span style={{ fontSize: 12, color: "#6b6560" }}>Rígido</span>
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#dc2626",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {rig.value}%
          </span>
        </div>
      )}
      {diff !== null && diff > 0 && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid #f0ede8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 11, color: "#a09994" }}>Ventaja</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#d97706",
              background: "#fef3c7",
              padding: "2px 8px",
              borderRadius: 6,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            +{diff.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default function ResiliencyChart({ data }: Props) {
  const puntoMinimo = Math.min(...data.map((d) => d.resiliente));
  const diaMinimo = data.find((d) => d.resiliente === puntoMinimo)?.dia ?? 0;

  const step = Math.max(1, Math.floor(data.length / 90));
  const sampled = data.filter((_, i) => i % step === 0);

  return (
    <div className="card" style={{ padding: "24px 28px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#a09994",
              textTransform: "uppercase",
              letterSpacing: ".06em",
              marginBottom: 6,
            }}
          >
            Curvas de Operatividad
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
            Triángulo de Resiliencia
          </h2>
          <p style={{ fontSize: 13, color: "#a09994", marginTop: 4 }}>
            Evolución de la capacidad operativa · Sistema Rígido vs Resiliente
          </p>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="28" height="12">
              <line
                x1="0"
                y1="6"
                x2="28"
                y2="6"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#059669" }}>
              Sistema Resiliente
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="28" height="12">
              <line
                x1="0"
                y1="6"
                x2="28"
                y2="6"
                stroke="#dc2626"
                strokeWidth="2"
                strokeDasharray="5,3"
                strokeLinecap="round"
              />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#dc2626" }}>
              Sistema Rígido
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 20,
                height: 12,
                borderRadius: 3,
                background: "rgba(217,119,6,0.2)",
                border: "1px solid rgba(217,119,6,0.35)",
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#d97706" }}>
              Resiliencia Ganada
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sampled}
            margin={{ top: 10, right: 10, bottom: 32, left: 0 }}
          >
            <defs>
              <linearGradient id="gradRes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradRig" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0.01} />
              </linearGradient>
              {/* Área dorada entre curvas */}
              <linearGradient id="gradGain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.04} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#ece9e4"
              strokeDasharray="0"
              vertical={false}
            />

            <XAxis
              dataKey="dia"
              tick={{ fill: "#a09994", fontSize: 11, fontFamily: "DM Mono" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e2dc" }}
              tickFormatter={(v) => `Día ${v}`}
              interval="preserveStartEnd"
              label={{
                value: "Días desde el impacto",
                position: "insideBottom",
                offset: -16,
                fill: "#a09994",
                fontSize: 11,
                fontFamily: "DM Mono",
              }}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#a09994", fontSize: 11, fontFamily: "DM Mono" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={46}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#e5e2dc", strokeWidth: 1.5 }}
            />

            {/* Línea de punto crítico */}
            <ReferenceLine
              x={diaMinimo}
              stroke="#d97706"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              label={{
                value: `Mínimo D${diaMinimo}`,
                fill: "#d97706",
                fontSize: 11,
                fontFamily: "DM Mono",
                position: "top",
              }}
            />

            {/* Línea 100% */}
            <ReferenceLine
              y={100}
              stroke="#e5e2dc"
              strokeDasharray="4 4"
              label={{
                value: "100%",
                fill: "#ccc9c4",
                fontSize: 10,
                fontFamily: "DM Mono",
                position: "right",
              }}
            />

            {/* Área rígido */}
            <Area
              type="monotone"
              dataKey="rigido"
              name="Rígido"
              stroke="#dc2626"
              strokeWidth={2}
              strokeDasharray="7 3"
              fill="url(#gradRig)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#dc2626",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />

            {/* Área resiliente (encima — crea el triángulo dorado visualmente) */}
            <Area
              type="monotone"
              dataKey="resiliente"
              name="Resiliente"
              stroke="#059669"
              strokeWidth={2.5}
              fill="url(#gradRes)"
              dot={false}
              activeDot={{
                r: 6,
                fill: "#059669",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer con nota */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid #f0ede8",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 20,
            height: 12,
            borderRadius: 3,
            background: "rgba(217,119,6,0.2)",
            flexShrink: 0,
          }}
        />
        <p style={{ fontSize: 12, color: "#a09994", margin: 0 }}>
          El área entre ambas curvas representa la{" "}
          <strong style={{ color: "#d97706" }}>resiliencia ganada</strong>: el
          daño evitado gracias a la capacidad de adaptación y recuperación del
          sistema.
        </p>
      </div>
    </div>
  );
}
