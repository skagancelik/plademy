-- Resource Categories
INSERT INTO categories (id, type, name_en, name_fi, name_sv, slug, sort_order) VALUES
('mentoring-coaching', 'resource', 'Mentoring & Coaching', 'Mentorointi & Valmennus', 'Mentorering & Coaching', 'mentoring-coaching', 1),
('career-talent', 'resource', 'Career & Talent Management', 'Ura & Talentinhallinta', 'Karriär & Talenthantering', 'career-talent', 2),
('employee-experience', 'resource', 'Employee Experience & Culture', 'Työntekijäkokemus & Kulttuuri', 'Medarbetarupplevelse & Kultur', 'employee-experience', 3),
('hr-tech', 'resource', 'HR Tech & Innovation', 'HR-tekniikka & Innovointi', 'HR-teknik & Innovation', 'hr-tech', 4),
('entrepreneurship', 'resource', 'Entrepreneurship & Startups', 'Yrittäjyys & Startupit', 'Entreprenörskap & Startups', 'entrepreneurship', 5),
('community-management', 'resource', 'Community Management', 'Yhteisönhallinta', 'Gemenskapshantering', 'community-management', 6)
ON CONFLICT (id) DO NOTHING;

-- Program Categories
INSERT INTO categories (id, type, name_en, name_fi, name_sv, slug, sort_order) VALUES
('talent-career-starter', 'program', 'Talent & Career Starter', 'Talentti & Ura-aloittaja', 'Talang & Karriärstartare', 'talent-career-starter', 1),
('professional-development', 'program', 'Professional Development', 'Ammatillinen kehitys', 'Professionell utveckling', 'professional-development', 2),
('entrepreneurship-program', 'program', 'Entrepreneurship', 'Yrittäjyys', 'Entreprenörskap', 'entrepreneurship-program', 3),
('leadership', 'program', 'Leadership', 'Johtajuus', 'Ledarskap', 'leadership', 4),
('mentoring-program', 'program', 'Mentoring', 'Mentorointi', 'Mentorering', 'mentoring-program', 5),
('coaching-program', 'program', 'Coaching', 'Valmennus', 'Coaching', 'coaching-program', 6),
('erg', 'program', 'ERG', 'ERG', 'ERG', 'erg', 7),
('dei', 'program', 'Diversity, Equity, & Inclusion', 'Monimuotoisuus, Oikeudenmukaisuus & Osallisuus', 'Mångfald, Rättvisa & Inkludering', 'dei', 8)
ON CONFLICT (id) DO NOTHING;

