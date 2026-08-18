export type Property = {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  size: "large" | "small" | "banner";
  loopVideo?: string;
  loopVideoWebm?: string;
};

export const properties: Property[] = [
  {
    id: "casa-arena",
    name: "Casa Arena",
    location: "Sotogrande, Cádiz",
    description:
      "Volumen contemporáneo entre pinos, con cubierta volada y el jardín como prolongación del salón.",
    image: "/properties/arena.jpg",
    size: "large",
  },
  {
    id: "atico-lumiere",
    name: "Ático Lumière",
    location: "Salamanca, Madrid",
    description:
      "Luz cenital y techos altos en el barrio de Salamanca, con la calle como telón de fondo.",
    image: "/properties/lumiere.jpg",
    size: "small",
    loopVideo: "/videos/card-loop-lumiere.mp4",
    loopVideoWebm: "/videos/card-loop-lumiere.webm",
  },
  {
    id: "villa-oliva",
    name: "Villa Oliva",
    location: "Marbella, Málaga",
    description:
      "Líneas depuradas y piscina infinita frente a la sierra, pensada para el clima mediterráneo.",
    image: "/properties/oliva.jpg",
    size: "small",
  },
  {
    id: "loft-bruma",
    name: "Loft Bruma",
    location: "Poblenou, Barcelona",
    description:
      "Antigua nave reconvertida en vivienda de planta abierta, con el verde entrando por los ventanales.",
    image: "/properties/bruma.jpg",
    size: "banner",
  },
];
