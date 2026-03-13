"use client";

import { useState, useEffect } from "react";
import { EVENTOS } from "@/data/events";
import {
  generarCurvasResiliencia,
  calcularMetricas,
} from "@/data/simulationMath";
import { EventoDisruptivo, MetricasRecuperacion, PuntoTiempo } from "@/types";
import ResiliencyChart from "./ResiliencyChart";
import KPIGrid from "./KPIGrid";
import EventSelector from "../controls/EventSelector";
import SpeedSlider from "../controls/SpeedSlider";
import {
  Menu,
  X,
  Activity,
  Clock,
  BarChart2,
  Wind,
  Cpu,
  Zap,
  Building2,
  Waves,
  ChevronRight,
  Info,
} from "lucide-react";

// Mapa de iconos por evento
const EVENT_ICONS: Record<string, React.ReactNode> = {
  "huracan-cat4": <Wind size={22} />,
  ciberataque: <Cpu size={22} />,
  "falla-suministro": <Zap size={22} />,
  terremoto: <Building2 size={22} />,
  inundacion: <Waves size={22} />,
};

function getSeverityStyle(g: number) {
  if (g >= 80) return { label: "Crítico", color: "#dc2626", bg: "#fee2e2" };
  if (g >= 60) return { label: "Alto", color: "#d97706", bg: "#fef3c7" };
  return { label: "Moderado", color: "#2563eb", bg: "#dbeafe" };
}

// ─── Reloj ──────────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      setDate(
        now.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: "right" }}>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#1a1714",
          fontFamily: "'DM Mono', monospace",
          letterSpacing: ".03em",
        }}
      >
        {time}
      </div>
      <div
        style={{ fontSize: 11, color: "#a09994", textTransform: "capitalize" }}
      >
        {date}
      </div>
    </div>
  );
}

// ─── Loading ────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f3ef",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "3px solid #e5e2dc",
            borderTopColor: "#059669",
            margin: "0 auto 16px",
            animation: "spinAnim 0.8s linear infinite",
          }}
        />
        <p style={{ fontSize: 14, color: "#a09994", fontWeight: 500 }}>
          Cargando simulación...
        </p>
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [eventoSeleccionado, setEventoSeleccionado] =
    useState<EventoDisruptivo>(EVENTOS[0]);
  const [velocidadRespuesta, setVelocidadRespuesta] = useState<number>(1);
  const [puntos, setPuntos] = useState<PuntoTiempo[]>([]);
  const [metricas, setMetricas] = useState<MetricasRecuperacion | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const nuevosPuntos = generarCurvasResiliencia(
      eventoSeleccionado,
      velocidadRespuesta,
    );
    setPuntos(nuevosPuntos);
    setMetricas(calcularMetricas(nuevosPuntos));
  }, [eventoSeleccionado, velocidadRespuesta]);

  if (puntos.length === 0) return <LoadingScreen />;

  const ev = eventoSeleccionado;
  const evIcon = EVENT_ICONS[ev.id] ?? <Zap size={22} />;
  const sev = getSeverityStyle(ev.gravedad);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f3ef" }}>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #ece9e4",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: 1600,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
            gap: 16,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              id="mobile-menu-btn"
              onClick={() => setSidebarOpen((o) => !o)}
              style={{
                display: "none",
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid #e5e2dc",
                background: "#fff",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {sidebarOpen ? (
                <X size={16} color="#6b6560" />
              ) : (
                <Menu size={16} color="#6b6560" />
              )}
            </button>

            {/* Logomark */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #059669, #34d399)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Activity size={18} color="#fff" />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#1a1714",
                    margin: 0,
                    letterSpacing: "-.02em",
                  }}
                >
                  EHCOPEK
                </h1>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#059669",
                    background: "#d1fae5",
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: ".05em",
                  }}
                >
                  RESILIENCE
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#a09994", marginTop: 1 }}>
                Simulador · Triángulo de Resiliencia
              </div>
            </div>
          </div>

          {/* Centro: evento activo */}
          <div
            id="header-event"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#f5f3ef",
              borderRadius: 10,
              padding: "8px 14px",
              border: "1px solid #e5e2dc",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#fff",
                border: "1px solid #ece9e4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b6560",
              }}
            >
              {evIcon}
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#a09994", fontWeight: 600 }}>
                Evento activo
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1a1714",
                  maxWidth: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ev.nombre}
              </div>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                background: sev.bg,
                color: sev.color,
                padding: "2px 8px",
                borderRadius: 6,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: ".04em",
                textTransform: "uppercase",
              }}
            >
              {sev.label}
            </span>
          </div>

          {/* Derecha: reloj */}
          <div id="header-clock">
            <LiveClock />
          </div>
        </div>
      </header>

      {/* ── LAYOUT ─────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: "28px 24px",
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
        <aside
          id="sidebar"
          style={{
            width: 300,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Eventos */}
          <div className="card" style={{ padding: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#a09994",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 3,
                  height: 14,
                  background: "#dc2626",
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              Evento Disruptivo
            </div>
            <EventSelector
              eventos={EVENTOS}
              seleccionado={eventoSeleccionado}
              onChange={setEventoSeleccionado}
            />
          </div>

          {/* Velocidad */}
          <div className="card" style={{ padding: 20 }}>
            <SpeedSlider
              velocidad={velocidadRespuesta}
              onChange={setVelocidadRespuesta}
            />
          </div>

          {/* Info evento */}
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: "#d1fae5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {evIcon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#064e3b",
                    lineHeight: 1.25,
                  }}
                >
                  {ev.nombre}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      color: "#059669",
                    }}
                  >
                    <BarChart2 size={11} />
                    Grav. {ev.gravedad}%
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      color: "#059669",
                    }}
                  >
                    <Clock size={11} />
                    Base {ev.tiempoRecuperacionBase}d
                  </div>
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 12,
                color: "#065f46",
                lineHeight: 1.65,
                margin: "0 0 14px",
              }}
            >
              {ev.descripcion}
            </p>

            {/* Barra gravedad */}
            <div
              style={{
                height: 6,
                background: "#a7f3d0",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${ev.gravedad}%`,
                  background:
                    ev.gravedad >= 80
                      ? "#dc2626"
                      : ev.gravedad >= 60
                        ? "#d97706"
                        : "#059669",
                  borderRadius: 99,
                  transition: "width 0.7s ease",
                }}
              />
            </div>
          </div>

          {/* Leyenda */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#a09994",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Info size={11} color="#a09994" />
              Referencias
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  color: "#059669",
                  dash: false,
                  label: "Sistema Resiliente",
                  sub: "Recuperación efectiva",
                },
                {
                  color: "#dc2626",
                  dash: true,
                  label: "Sistema Rígido",
                  sub: "Degradación continua",
                },
                {
                  color: "#d97706",
                  dash: false,
                  label: "Resiliencia Ganada",
                  sub: "Diferencia entre curvas",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <svg width="24" height="10" style={{ flexShrink: 0 }}>
                    <line
                      x1="0"
                      y1="5"
                      x2="24"
                      y2="5"
                      stroke={item.color}
                      strokeWidth={item.dash ? 1.5 : 2.5}
                      strokeDasharray={item.dash ? "5,3" : "0"}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#1a1714",
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: 10, color: "#a09994" }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── CONTENIDO PRINCIPAL ──────────────────────────────────────── */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Título */}
          <div className="animate-fade-up" style={{ opacity: 0 }}>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#1a1714",
                margin: 0,
                letterSpacing: "-.03em",
              }}
            >
              Simulador de Resiliencia
            </h2>
            <p style={{ fontSize: 14, color: "#6b6560", marginTop: 4 }}>
              Triángulo de Resiliencia · Gestión de crisis organizacional
            </p>
          </div>

          {/* KPIs */}
          {metricas && <KPIGrid metricas={metricas} eventoActual={ev.nombre} />}

          {/* Gráfico */}
          <div
            className="animate-fade-up"
            style={{ animationDelay: "0.15s", opacity: 0 }}
          >
            <ResiliencyChart data={puntos} />
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <span
              style={{
                fontSize: 11,
                color: "#d1cdc7",
                fontFamily: "'DM Mono', monospace",
                letterSpacing: ".15em",
                textTransform: "uppercase",
              }}
            >
              EHCOPEK · Resilience Framework · v2.0
            </span>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex" }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
            }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            style={{
              position: "relative",
              zIndex: 41,
              width: 320,
              background: "#f5f3ef",
              padding: 24,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
            }}
            className="animate-fade-in"
          >
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                alignSelf: "flex-end",
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid #e5e2dc",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={14} color="#6b6560" />
            </button>
            <EventSelector
              eventos={EVENTOS}
              seleccionado={eventoSeleccionado}
              onChange={(e) => {
                setEventoSeleccionado(e);
                setSidebarOpen(false);
              }}
            />
            <div className="card" style={{ padding: 20 }}>
              <SpeedSlider
                velocidad={velocidadRespuesta}
                onChange={setVelocidadRespuesta}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          #sidebar        { display: none !important; }
          #header-event   { display: none !important; }
          #header-clock   { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
        @keyframes spinAnim { to { transform: rotate(360deg); } }
        @keyframes progressFill { from { width: 0%; } }
      `}</style>
    </div>
  );
}
