"use client";

import { EventoDisruptivo } from "@/types";
import EventSelector from "./EventSelector";
import SpeedSlider from "./SpeedSlider";
import { RotateCcw } from "lucide-react";

interface Props {
  eventos: EventoDisruptivo[];
  eventoSeleccionado: EventoDisruptivo;
  velocidad: number;
  onEventoChange: (evento: EventoDisruptivo) => void;
  onVelocidadChange: (velocidad: number) => void;
  onReset: () => void;
}

export default function SimulationControls({
  eventos,
  eventoSeleccionado,
  velocidad,
  onEventoChange,
  onVelocidadChange,
  onReset,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#a09994",
            textTransform: "uppercase",
            letterSpacing: ".08em",
            marginBottom: 10,
          }}
        >
          Evento Disruptivo
        </div>
        <EventSelector
          eventos={eventos}
          seleccionado={eventoSeleccionado}
          onChange={onEventoChange}
        />
      </div>
      <div>
        <SpeedSlider velocidad={velocidad} onChange={onVelocidadChange} />
      </div>
      <button
        onClick={onReset}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: 10,
          border: "1.5px solid #e5e2dc",
          background: "#fff",
          fontSize: 13,
          fontWeight: 600,
          color: "#6b6560",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        <RotateCcw size={14} />
        Reiniciar Simulación
      </button>
    </div>
  );
}
