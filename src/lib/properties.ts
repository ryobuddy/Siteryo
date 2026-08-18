export type Property = {
  id: string;
  name: string;
  location: string;
  price: string;
  area: string;
  image: string;
  size: "large" | "small";
  loopVideo?: string;
  loopVideoWebm?: string;
};

export const properties: Property[] = [
  {
    id: "casa-arena",
    name: "Casa Arena",
    location: "Sotogrande, Cádiz",
    price: "€2.450.000",
    area: "480 m²",
    image: "/properties/arena.jpg",
    size: "large",
  },
  {
    id: "atico-lumiere",
    name: "Ático Lumière",
    location: "Salamanca, Madrid",
    price: "€1.890.000",
    area: "210 m²",
    image: "/properties/lumiere.jpg",
    size: "small",
    loopVideo: "/videos/card-loop-lumiere.mp4",
    loopVideoWebm: "/videos/card-loop-lumiere.webm",
  },
  {
    id: "villa-oliva",
    name: "Villa Oliva",
    location: "Marbella, Málaga",
    price: "€3.200.000",
    area: "610 m²",
    image: "/properties/oliva.jpg",
    size: "small",
  },
  {
    id: "loft-bruma",
    name: "Loft Bruma",
    location: "Poblenou, Barcelona",
    price: "€980.000",
    area: "160 m²",
    image: "/properties/bruma.jpg",
    size: "large",
  },
];
