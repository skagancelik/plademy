import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Citation {
  url: string;
  title: string;
  snippet?: string;
}

export interface Resource {
  id: string;
  slug: string;
  language: 'en' | 'fi' | 'sv';
  title: string;
  description: string | null;
  excerpt: string | null;
  content: string | null;
  keypoints: string[];
  category: string;
  faqs: Array<{ question: string; answer: string }> | null;
  cover_image_url: string | null;
  citations: Citation[] | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface Program {
  id: string;
  slug: string;
  language: 'en' | 'fi' | 'sv';
  title: string;
  description: string | null;
  excerpt: string | null;
  content: string | null;
  keypoints: string[];
  goal: string | null;
  audience: string | null;
  duration: string | null;
  category: string;
  faqs: Array<{ question: string; answer: string }> | null;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface Category {
  id: string;
  type: 'resource' | 'program';
  name_en: string;
  name_fi: string | null;
  name_sv: string | null;
  description_en: string | null;
  description_fi: string | null;
  description_sv: string | null;
  slug: string;
  sort_order: number;
}

