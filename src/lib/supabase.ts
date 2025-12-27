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

// Field lists for selective queries
export const RESOURCE_LIST_FIELDS = 'id, slug, title, excerpt, cover_image_url, category, published_at';
export const PROGRAM_LIST_FIELDS = 'id, slug, title, excerpt, cover_image_url, category, published_at, goal, duration, audience';
export const SEARCH_FIELDS = 'id, slug, title, description, excerpt';
export const CATEGORY_BASIC_FIELDS = 'id, slug, name_en, name_fi, name_sv, type, sort_order';
export const CATEGORY_FULL_FIELDS = 'id, slug, name_en, name_fi, name_sv, description_en, description_fi, description_sv, type, sort_order';

// Helper function: Get resource by slug
export async function getResourceBySlug(slug: string, lang: string): Promise<Resource | null> {
  const { data } = await supabase
    .from('resources')
    .select('*')
    .eq('slug', slug)
    .eq('language', lang)
    .eq('is_published', true)
    .single();
  
  return data || null;
}

// Helper function: Get program by slug
export async function getProgramBySlug(slug: string, lang: string): Promise<Program | null> {
  const { data } = await supabase
    .from('programs')
    .select('*')
    .eq('slug', slug)
    .eq('language', lang)
    .eq('is_published', true)
    .single();
  
  return data || null;
}

// Helper function: Get resources list with pagination
export async function getResourcesList(
  lang: string,
  page: number = 1,
  pageSize: number = 20,
  categoryId?: string
): Promise<{ data: Resource[]; totalCount: number; hasMore: boolean }> {
  const offset = (page - 1) * pageSize;
  
  let query = supabase
    .from('resources')
    .select(RESOURCE_LIST_FIELDS, { count: 'exact' })
    .eq('language', lang)
    .eq('is_published', true);
  
  if (categoryId) {
    query = query.eq('category', categoryId);
  }
  
  const { data, count, error } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + pageSize - 1);
  
  const totalCount = count || 0;
  const hasMore = offset + pageSize < totalCount;
  
  return {
    data: (data || []) as Resource[],
    totalCount,
    hasMore,
  };
}

// Helper function: Get programs list with pagination
export async function getProgramsList(
  lang: string,
  page: number = 1,
  pageSize: number = 20,
  categoryId?: string
): Promise<{ data: Program[]; totalCount: number; hasMore: boolean }> {
  const offset = (page - 1) * pageSize;
  
  let query = supabase
    .from('programs')
    .select(PROGRAM_LIST_FIELDS, { count: 'exact' })
    .eq('language', lang)
    .eq('is_published', true);
  
  if (categoryId) {
    query = query.eq('category', categoryId);
  }
  
  const { data, count, error } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + pageSize - 1);
  
  const totalCount = count || 0;
  const hasMore = offset + pageSize < totalCount;
  
  return {
    data: (data || []) as Program[],
    totalCount,
    hasMore,
  };
}

// Helper function: Get category by ID or slug (optimized lookup)
export async function getCategoryByIdOrSlug(
  idOrSlug: string,
  type: 'resource' | 'program',
  categoryMap?: Map<string, Category>
): Promise<Category | null> {
  // First try categoryMap if provided
  if (categoryMap) {
    const category = categoryMap.get(idOrSlug);
    if (category) return category;
  }
  
  // Fallback: single optimized query with .or()
  const { data } = await supabase
    .from('categories')
    .select(CATEGORY_FULL_FIELDS)
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug},name_en.eq.${idOrSlug},name_fi.eq.${idOrSlug},name_sv.eq.${idOrSlug}`)
    .eq('type', type)
    .maybeSingle();
  
  return data || null;
}

