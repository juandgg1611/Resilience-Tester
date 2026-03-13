"use client";

import { useState } from "react";
import { Gauge, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  velocidad: number;
  onChange: (valor: number) => void;
}

export default function SpeedSlider({ velocidad, onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const getSpeedLabel = (value: number) => {
    if (value < 0.6) return { text: "Muy lenta", color: "#dc2626" };
    if (value < 0.9) return { text: "Lenta", color: "#d97706" };
    if (value < 1.1) return { text: "Normal", color: "#059669" };
    if (value < 1.5) return { text: "Rápida", color: "#2563eb" };
    return { text: "Muy rápida", color: "#7c3aed" };
  };

  const speedInfo = getSpeedLabel(velocidad);

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Gauge
            size={18}
            color={speedInfo.color}
            style={{ transition: "color 0.2s ease" }}
          />
          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: speedInfo.color,
            }}
          >
            {speedInfo.text}
          </span>
        </div>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#1a1714",
            fontFamily: "'DM Mono', monospace",
            background: "#f5f3ef",
            padding: "4px 10px",
            borderRadius: "20px",
          }}
        >
          {(velocidad * 100).toFixed(0)}%
        </span>
      </div>

      {/* Slider */}
      <div style={{ position: "relative", marginBottom: "12px" }}>
        <input
          type="range"
          min={0.2}
          max={2}
          step={0.1}
          value={velocidad}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          style={{
            width: "100%",
            height: "6px",
            background:
              "linear-gradient(to right, #fee2e2 0%, #fef3c7 50%, #d1fae5 100%)",
            borderRadius: "99px",
            WebkitAppearance: "none",
            outline: "none",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        />
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            background: white;
            border: 2px solid ${speedInfo.color};
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            cursor: grab;
            transition: all 0.1s ease;
          }
          input[type=range]::-webkit-slider-thumb:hover {
            transform: scale(1.15);
          }
          input[type=range]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: white;
            border: 2px solid ${speedInfo.color};
            border-radius: 50%;
            cursor: grab;
          }
        `}</style>
      </div>

      {/* Labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "#a09994",
          fontWeight: 500,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <ChevronLeft size={12} />
          Lenta
        </span>
        <span>Normal</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          Rápida
          <ChevronRight size={12} />
        </span>
      </div>

      {/* Valor actual */}
      <div
        style={{
          marginTop: "12px",
          padding: "8px 12px",
          background: "#f5f3ef",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#6b6560",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>Velocidad de respuesta</span>
        <span
          style={{
            fontWeight: 600,
            color: speedInfo.color,
          }}
        >
          {velocidad.toFixed(1)}x
        </span>
      </div>
    </div>
  );
}
