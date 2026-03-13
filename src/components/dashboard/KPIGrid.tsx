import { MetricasRecuperacion } from "@/types";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Gauge,
  Target,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

interface Props {
  metricas: MetricasRecuperacion;
  eventoActual: string;
}

function formatTiempo(dias: number): string {
  if (dias <= 0) return "< 1d";
  if (dias >= 30) return "+30d";
  return `${dias}d`;
}

interface KPICardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
  progress?: number;
  delay?: number;
}

function KPICard({
  label,
  value,
  sub,
  color,
  bg,
  icon,
  progress,
  delay = 0,
}: KPICardProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ece9e4",
        borderRadius: 16,
        padding: "20px 22px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
        animationDelay: `${delay}s`,
        opacity: 0,
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      className="animate-fade-up card-hover"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#a09994",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            lineHeight: 1.3,
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: bg,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Valor principal — grande */}
      <div
        style={{
          fontSize: 44,
          fontWeight: 800,
          color,
          lineHeight: 1,
          marginBottom: 6,
          letterSpacing: "-0.03em",
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {value}
      </div>

      {/* Sub */}
      <div
        style={{
          fontSize: 12,
          color: "#a09994",
          marginBottom: progress !== undefined ? 14 : 0,
        }}
      >
        {sub}
      </div>

      {/* Barra de progreso */}
      {progress !== undefined && (
        <div
          style={{
            height: 5,
            background: "#f0ede8",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            className="animate-progress"
            style={{
              height: "100%",
              borderRadius: 99,
              width: `${Math.min(100, Math.max(0, progress))}%`,
              background: color,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function KPIGrid({ metricas, eventoActual }: Props) {
  const recOk = metricas.tiempoRecuperacionResiliente < 30;

  const kpis: KPICardProps[] = [
    {
      label: "Tiempo de Recuperación",
      value: formatTiempo(metricas.tiempoRecuperacionResiliente),
      sub: recOk
        ? `Día ${metricas.tiempoRecuperacionResiliente} — 95% operatividad`
        : "Sin recuperación en 30 días",
      color: recOk ? "#059669" : "#dc2626",
      bg: recOk ? "#d1fae5" : "#fee2e2",
      icon: <Clock size={18} />,
      progress: recOk
        ? Math.round((1 - metricas.tiempoRecuperacionResiliente / 30) * 100)
        : 5,
      delay: 0,
    },
    {
      label: "Pérdida Evitada",
      value: `${metricas.resilienciaGanada.toFixed(0)}%`,
      sub: "del daño total vs sistema rígido",
      color: "#d97706",
      bg: "#fef3c7",
      icon: <TrendingUp size={18} />,
      progress:
        metricas.perdidaTotalRigido > 0
          ? Math.round(
              (metricas.resilienciaGanada / metricas.perdidaTotalRigido) * 100,
            )
          : 0,
      delay: 0.08,
    },
    {
      label: "Punto Crítico",
      value: `${metricas.puntoMinimo}%`,
      sub: "Operatividad mínima durante la crisis",
      color: "#dc2626",
      bg: "#fee2e2",
      icon: <AlertTriangle size={18} />,
      progress: metricas.puntoMinimo,
      delay: 0.16,
    },
    {
      label: "Efectividad",
      value: `${metricas.efectividad.toFixed(1)}%`,
      sub: "Porcentaje de daño evitado",
      color: "#2563eb",
      bg: "#dbeafe",
      icon: <Shield size={18} />,
      progress: metricas.efectividad,
      delay: 0.24,
    },
  ];

  // Diagnóstico
  const diag =
    metricas.efectividad > 70
      ? {
          Icon: CheckCircle2,
          text: "Alta resiliencia",
          sub: "El sistema absorbe y se recupera con eficacia.",
          color: "#059669",
          bg: "#d1fae5",
        }
      : metricas.efectividad > 40
        ? {
            Icon: AlertCircle,
            text: "Resiliencia moderada",
            sub: "Se recupera con pérdidas operativas significativas.",
            color: "#d97706",
            bg: "#fef3c7",
          }
        : {
            Icon: XCircle,
            text: "Baja resiliencia",
            sub: "Impacto severo sin recuperación efectiva.",
            color: "#dc2626",
            bg: "#fee2e2",
          };

  // Etiqueta de tiempo
  const timeLabel =
    metricas.tiempoRecuperacionResiliente < 7
      ? {
          Icon: Zap,
          text: "Recuperación rápida — menos de 7 días",
          color: "#059669",
        }
      : metricas.tiempoRecuperacionResiliente < 14
        ? {
            Icon: ArrowUpRight,
            text: "Recuperación media — entre 7 y 14 días",
            color: "#d97706",
          }
        : metricas.tiempoRecuperacionResiliente < 30
          ? {
              Icon: RotateCcw,
              text: "Recuperación lenta — más de 14 días",
              color: "#dc2626",
            }
          : {
              Icon: AlertTriangle,
              text: "Sin recuperación en el horizonte de 30d",
              color: "#dc2626",
            };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 4 KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 14,
        }}
      >
        {kpis.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </div>

      {/* Fila secundaria */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Comparativa de daño */}
        <div
          className="card animate-fade-up"
          style={{ padding: "20px 22px", animationDelay: "0.3s", opacity: 0 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Target size={14} color="#a09994" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#a09994",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              Comparativa de Daño
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#1a1714",
              marginBottom: 18,
              lineHeight: 1.3,
            }}
          >
            {eventoActual}
          </div>

          {/* Rígido */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 7,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <TrendingDown size={13} color="#dc2626" />
                <span style={{ fontSize: 12, color: "#6b6560" }}>
                  Sistema Rígido
                </span>
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#dc2626",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {metricas.perdidaTotalRigido.toFixed(0)} u.
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "#f0ede8",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                className="animate-progress"
                style={{
                  height: "100%",
                  width: "100%",
                  background: "#fca5a5",
                  borderRadius: 99,
                }}
              />
            </div>
          </div>

          {/* Resiliente */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 7,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <TrendingUp size={13} color="#059669" />
                <span style={{ fontSize: 12, color: "#6b6560" }}>
                  Sistema Resiliente
                </span>
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#059669",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {metricas.perdidaTotalResiliente.toFixed(0)} u.
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "#f0ede8",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                className="animate-progress"
                style={{
                  height: "100%",
                  borderRadius: 99,
                  width:
                    metricas.perdidaTotalRigido > 0
                      ? `${(metricas.perdidaTotalResiliente / metricas.perdidaTotalRigido) * 100}%`
                      : "0%",
                  background: "#6ee7b7",
                }}
              />
            </div>
          </div>
        </div>

        {/* Diagnóstico */}
        <div
          className="card animate-fade-up"
          style={{ padding: "20px 22px", animationDelay: "0.36s", opacity: 0 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Gauge size={14} color="#a09994" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#a09994",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              Diagnóstico del Sistema
            </span>
          </div>

          {/* Badge de estado */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: diag.bg,
              color: diag.color,
              borderRadius: 10,
              padding: "8px 14px",
              marginBottom: 12,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <diag.Icon size={16} />
            {diag.text}
          </div>

          <p
            style={{
              fontSize: 13,
              color: "#6b6560",
              lineHeight: 1.6,
              margin: "0 0 16px",
            }}
          >
            {diag.sub}
          </p>

          {/* Tiempo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 12px",
              borderRadius: 8,
              background: "#f5f3ef",
              fontSize: 12,
              fontWeight: 600,
              color: timeLabel.color,
            }}
          >
            <timeLabel.Icon size={13} />
            {timeLabel.text}
          </div>
        </div>
      </div>
    </div>
  );
}
