export type ContentItem = {
  id: string;
  type: "section"|"course"|"feature"|"contact"|"teacher";
  title: string;
  slug: string;
  status: string;
  seoDescription?: string;
  body?: string;
  features?: string; // bullets en texto plano (líneas con "- ")
  price?: string;
  duration?: string;
  schedule?: string;
  level?: string;
  teacher?: string;
  role?: string;
  languages?: string;
  photo?: string;
  rating?: string|number;
  phone?: string;
  email?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
};