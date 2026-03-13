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
      className="card card-hover animate-fade-up card-pad"
      style={{ animationDelay: `${delay}s`, opacity: 0 }}
    >
      {/* Header */}
      <div
        className="kpi-card-header"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
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
            width: 34,
            height: 34,
            borderRadius: 9,
            flexShrink: 0,
            background: bg,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>

      {/* Valor */}
      <div className="kpi-value" style={{ color, marginBottom: 5 }}>
        {value}
      </div>

      {/* Sub */}
      <div
        className="kpi-sub"
        style={{
          color: "#a09994",
          marginBottom: progress !== undefined ? 12 : 0,
        }}
      >
        {sub}
      </div>

      {/* Progress */}
      {progress !== undefined && (
        <div className="progress-track">
          <div
            className="progress-fill animate-progress"
            style={{
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
      label: "Tiempo Recuperación",
      value: formatTiempo(metricas.tiempoRecuperacionResiliente),
      sub: recOk
        ? `Día ${metricas.tiempoRecuperacionResiliente} — 95% operatividad`
        : "Sin recuperación en 30 días",
      color: recOk ? "#059669" : "#dc2626",
      bg: recOk ? "#d1fae5" : "#fee2e2",
      icon: <Clock size={17} />,
      progress: recOk
        ? Math.round((1 - metricas.tiempoRecuperacionResiliente / 30) * 100)
        : 5,
      delay: 0,
    },
    {
      label: "Pérdida Evitada",
      value: `${metricas.resilienciaGanada.toFixed(0)}%`,
      sub: "del daño vs sistema rígido",
      color: "#d97706",
      bg: "#fef3c7",
      icon: <TrendingUp size={17} />,
      progress:
        metricas.perdidaTotalRigido > 0
          ? Math.round(
              (metricas.resilienciaGanada / metricas.perdidaTotalRigido) * 100,
            )
          : 0,
      delay: 0.07,
    },
    {
      label: "Punto Crítico",
      value: `${metricas.puntoMinimo}%`,
      sub: "Operatividad mínima",
      color: "#dc2626",
      bg: "#fee2e2",
      icon: <AlertTriangle size={17} />,
      progress: metricas.puntoMinimo,
      delay: 0.14,
    },
    {
      label: "Efectividad",
      value: `${metricas.efectividad.toFixed(1)}%`,
      sub: "Daño evitado total",
      color: "#2563eb",
      bg: "#dbeafe",
      icon: <Shield size={17} />,
      progress: metricas.efectividad,
      delay: 0.21,
    },
  ];

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
            sub: "Recuperación con pérdidas operativas significativas.",
            color: "#d97706",
            bg: "#fef3c7",
          }
        : {
            Icon: XCircle,
            text: "Baja resiliencia",
            sub: "Impacto severo. Requiere intervención urgente.",
            color: "#dc2626",
            bg: "#fee2e2",
          };

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
            text: "Recuperación media — 7 a 14 días",
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
              text: "Sin recuperación en 30 días",
              color: "#dc2626",
            };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 4 KPIs */}
      <div className="kpi-grid">
        {kpis.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </div>

      {/* Secundario */}
      <div className="kpi-secondary">
        {/* Comparativa */}
        <div
          className="card card-pad animate-fade-up"
          style={{ animationDelay: "0.28s", opacity: 0 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 14,
            }}
          >
            <Target size={13} color="#a09994" />
            <span
              style={{
                fontSize: 10,
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
              marginBottom: 14,
              lineHeight: 1.3,
            }}
          >
            {eventoActual}
          </div>

          {/* Rígido */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TrendingDown size={12} color="#dc2626" />
                <span style={{ fontSize: 11, color: "#6b6560" }}>
                  Sistema Rígido
                </span>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#dc2626",
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                {metricas.perdidaTotalRigido.toFixed(0)} u.
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill animate-progress"
                style={{ width: "100%", background: "#fca5a5" }}
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
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TrendingUp size={12} color="#059669" />
                <span style={{ fontSize: 11, color: "#6b6560" }}>
                  Sistema Resiliente
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
                {metricas.perdidaTotalResiliente.toFixed(0)} u.
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill animate-progress"
                style={{
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
          className="card card-pad animate-fade-up"
          style={{ animationDelay: "0.32s", opacity: 0 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 14,
            }}
          >
            <Gauge size={13} color="#a09994" />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#a09994",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              Diagnóstico
            </span>
          </div>

          <div
            className="diag-pill"
            style={{ background: diag.bg, color: diag.color }}
          >
            <diag.Icon size={15} />
            {diag.text}
          </div>

          <p
            style={{
              fontSize: 12,
              color: "#6b6560",
              lineHeight: 1.6,
              margin: "0 0 12px",
            }}
          >
            {diag.sub}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 10px",
              borderRadius: 8,
              background: "#f5f3ef",
              fontSize: 11,
              fontWeight: 600,
              color: timeLabel.color,
            }}
          >
            <timeLabel.Icon size={12} />
            {timeLabel.text}
          </div>
        </div>
      </div>
    </div>
  );
}
