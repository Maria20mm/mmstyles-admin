type DemoCollection = {
  _id: string;
  title: string;
  description: string;
  image: string;
  products: string[];
  createdAt: string;
  updatedAt: string;
};

type DemoProduct = {
  _id: string;
  title: string;
  description: string;
  media: string[];
  category: string;
  collections: string[];
  tags: string[];
  sizes: string[];
  colors: string[];
  price: number;
  expense: number;
  createdAt: string;
  updatedAt: string;
};

const now = new Date().toISOString();

export const demoCollections: DemoCollection[] = [
  {
    _id: "demo-col-1",
    title: "Boss Collection",
    description: "A power-edit for modern workwear silhouettes.",
    image: "https://res.cloudinary.com/dmtaj7dn0/image/upload/v1717041253/hokr3xbo.jpg",
    products: ["demo-pro-1", "demo-pro-2"],
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "demo-col-2",
    title: "Monochrome Majesty Bag Collection",
    description: "Minimal black-and-white everyday luxury bags.",
    image: "https://res.cloudinary.com/dmtaj7dn0/image/upload/v1717058168/huy5qntl.jpg",
    products: ["demo-pro-3"],
    createdAt: now,
    updatedAt: now,
  },
];

export const demoProducts: DemoProduct[] = [
  {
    _id: "demo-pro-1",
    title: "Tailored Power Blazer",
    description: "Structured blazer for formal and smart-casual looks.",
    media: [
      "https://res.cloudinary.com/dmtaj7dn0/image/upload/v1717041253/hokr3xbo.jpg",
    ],
    category: "Outerwear",
    collections: ["demo-col-1"],
    tags: ["formal", "office"],
    sizes: ["S", "M", "L"],
    colors: ["black", "grey"],
    price: 149,
    expense: 78,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "demo-pro-2",
    title: "Boss Wide-Leg Trousers",
    description: "High-waist trousers with clean drape and wide-leg fit.",
    media: [
      "https://res.cloudinary.com/dmtaj7dn0/image/upload/v1717041253/hokr3xbo.jpg",
    ],
    category: "Bottoms",
    collections: ["demo-col-1"],
    tags: ["minimal", "workwear"],
    sizes: ["S", "M", "L"],
    colors: ["black"],
    price: 89,
    expense: 42,
    createdAt: now,
    updatedAt: now,
  },
  {
    _id: "demo-pro-3",
    title: "Monochrome Tote Bag",
    description: "Daily tote with monochrome panel detailing and zip closure.",
    media: [
      "https://res.cloudinary.com/dmtaj7dn0/image/upload/v1717058168/huy5qntl.jpg",
    ],
    category: "Bags",
    collections: ["demo-col-2"],
    tags: ["bag", "daily"],
    sizes: ["One Size"],
    colors: ["black", "white"],
    price: 120,
    expense: 55,
    createdAt: now,
    updatedAt: now,
  },
];

export const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
