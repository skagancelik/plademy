-- Program Kategorilerini Güncelle
-- Bu script'i Supabase SQL Editor'de çalıştırabilirsiniz

-- Eski program kategorilerini sil (ERG'yi ve yeni listede olanları koru)
DELETE FROM categories 
WHERE type = 'program' 
AND id NOT IN (
  'erg',  -- ERG'yi koru
  'leadership',  -- Yeni listede var, koru
  'mentoring-program',  -- Yeni listede var, koru
  'coaching-program'  -- Yeni listede var, koru
);

-- Yeni program kategorilerini ekle
INSERT INTO categories (id, type, name_en, name_fi, name_sv, slug, sort_order) VALUES
('mentoring-program', 'program', 'Mentoring Program', 'Mentorointiohjelma', 'Mentorprogram', 'mentoring-program', 1),
('coaching-program', 'program', 'Coaching Program', 'Valmennusohjelma', 'Coachingprogram', 'coaching-program', 2),
('networking-program', 'program', 'Networking Program', 'Verkostoitumisohjelma', 'Nätverksprogram', 'networking-program', 3),
('training-program', 'program', 'Training Program', 'Koulutusohjelma', 'Utbildningsprogram', 'training-program', 4),
('onboarding-program', 'program', 'Onboarding Program', 'Perehdytysohjelma', 'Introduktionsprogram', 'onboarding-program', 5),
('employee-wellbeing-program', 'program', 'Employee Wellbeing Program', 'Työhyvinvointiohjelma', 'Program för medarbetarvälmående', 'employee-wellbeing-program', 6),
('leadership', 'program', 'Leadership', 'Johtajuus', 'Ledarskap', 'leadership', 7),
('career-management', 'program', 'Career Management', 'Uranhallinta', 'Karriärhantering', 'career-management', 8),
('career-program', 'program', 'Career Program', 'Uraohjelma', 'Karriärprogram', 'career-program', 9),
('internship-program', 'program', 'Internship Program', 'Harjoitteluohjelma', 'Praktikprogram', 'internship-program', 10),
('accelerator', 'program', 'Accelerator', 'Kiihdyttämö', 'Accelerator', 'accelerator', 11),
('incubator', 'program', 'Incubator', 'Hautomo', 'Inkubator', 'incubator', 12),
('fundraising-support', 'program', 'Fundraising Support', 'Rahoituksen tuki', 'Finansieringsstöd', 'fundraising-support', 13),
('business-development', 'program', 'Business Development', 'Liiketoiminnan kehitys', 'Affärsutveckling', 'business-development', 14),
('volunteer-program', 'program', 'Volunteer Program', 'Vapaaehtoishjelma', 'Volontärprogram', 'volunteer-program', 15),
('ambassador-program', 'program', 'Ambassador Program', 'Lähettiläsohjelma', 'Ambassadörsprogram', 'ambassador-program', 16)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_fi = EXCLUDED.name_fi,
  name_sv = EXCLUDED.name_sv,
  slug = EXCLUDED.slug,
  sort_order = EXCLUDED.sort_order;

