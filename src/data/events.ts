import { EventoDisruptivo } from '@/types';

export const EVENTOS: EventoDisruptivo[] = [
  {
    id: 'huracan-cat4',
    nombre: 'Huracán Categoría 4',
    descripcion: 'Vientos de 210-250 km/h, inundaciones severas. Impacto en infraestructura costera y redes eléctricas.',
    gravedad: 80,
    tiempoRecuperacionBase: 7,
    factorOscilacion: 0.2,
    icono: 'hurricane'
  },
  {
    id: 'ciberataque',
    nombre: 'Ciberataque Ransomware',
    descripcion: 'Sistemas críticos comprometidos. Pérdida de datos y control operativo.',
    gravedad: 95,
    tiempoRecuperacionBase: 3,
    factorOscilacion: 0.1,
    icono: 'shield'
  },
  {
    id: 'falla-suministro',
    nombre: 'Falla Crítica de Suministro',
    descripcion: 'Cadena de suministro colapsada. Escasez de materiales y repuestos.',
    gravedad: 60,
    tiempoRecuperacionBase: 5,
    factorOscilacion: 0.3,
    icono: 'truck'
  },
  {
    id: 'terremoto',
    nombre: 'Terremoto Magnitud 7.5',
    descripcion: 'Daños estructurales en infraestructura. Vías de comunicación afectadas.',
    gravedad: 90,
    tiempoRecuperacionBase: 14,
    factorOscilacion: 0.15,
    icono: 'mountain'
  },
  {
    id: 'inundacion',
    nombre: 'Inundación Severa',
    descripcion: 'Desbordamiento de ríos. Anegamiento de instalaciones clave.',
    gravedad: 70,
    tiempoRecuperacionBase: 10,
    factorOscilacion: 0.25,
    icono: 'droplets'
  }
];