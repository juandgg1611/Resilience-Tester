"use client";

import { EventoDisruptivo } from "@/types";
import {
  Wind,
  Shield,
  Truck,
  Mountain,
  Droplets,
  AlertTriangle,
  Check,
} from "lucide-react";

interface Props {
  eventos: EventoDisruptivo[];
  seleccionado: EventoDisruptivo;
  onChange: (evento: EventoDisruptivo) => void;
}

const EVENT_ICONS: Record<string, React.ElementType> = {
  "huracan-cat4": Wind,
  ciberataque: Shield,
  "falla-suministro": Truck,
  terremoto: Mountain,
  inundacion: Droplets,
};

const SEVERITY_CONFIG: Record<
  number,
  { label: string; color: string; bg: string }
> = {
  80: { label: "Crítico", color: "#dc2626", bg: "#fee2e2" },
  60: { label: "Alto", color: "#d97706", bg: "#fef3c7" },
  0: { label: "Moderado", color: "#2563eb", bg: "#dbeafe" },
};

function getSeverityConfig(gravedad: number) {
  if (gravedad >= 80) return SEVERITY_CONFIG[80];
  if (gravedad >= 60) return SEVERITY_CONFIG[60];
  return SEVERITY_CONFIG[0];
}

export default function EventSelector({
  eventos,
  seleccionado,
  onChange,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {eventos.map((ev, i) => {
        const isActive = ev.id === seleccionado.id;
        const severity = getSeverityConfig(ev.gravedad);
        const IconComponent = EVENT_ICONS[ev.id] || AlertTriangle;

        return (
          <button
            key={ev.id}
            onClick={() => onChange(ev)}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              background: isActive ? "#ecfdf5" : "#ffffff",
              border: `1px solid ${isActive ? "#6ee7b7" : "#ece9e4"}`,
              borderRadius: "12px",
              width: "100%",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: isActive ? "0 4px 12px rgba(5,150,105,0.08)" : "none",
              animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "#faf9f7";
                e.currentTarget.style.borderColor = "#d4d0cb";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#ece9e4";
              }
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "3px",
                  height: "28px",
                  background: "#059669",
                  borderRadius: "0 3px 3px 0",
                }}
              />
            )}

            {/* Icono */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: severity.bg,
                color: severity.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconComponent size={20} />
            </div>

            {/* Contenido */}
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: isActive ? "#065f46" : "#1a1714",
                  marginBottom: "4px",
                  lineHeight: 1.2,
                }}
              >
                {ev.nombre}
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "20px",
                    background: severity.bg,
                    color: severity.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  {severity.label}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#a09994",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {ev.gravedad}% gravedad
                </span>
              </div>
            </div>

            {/* Check si está activo */}
            {isActive && (
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Check size={14} color="#ffffff" />
              </div>
            )}
          </button>
        );
      })}

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
