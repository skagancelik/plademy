-- Add SEO-friendly descriptions to resource categories
-- Update existing resource categories with descriptions

UPDATE categories 
SET 
  description_en = 'Explore insights, guides, and tools to enhance your mentoring and coaching programs. Discover best practices, strategies, and resources to build effective mentorship relationships and drive professional growth.',
  description_fi = 'Tutustu näkemyksiin, oppaisiin ja työkaluihin, jotka parantavat mentorointi- ja valmennusohjelmiasi. Löydä parhaat käytännöt, strategiat ja resurssit tehokkaiden mentorointisuhteiden rakentamiseen ja ammatilliseen kasvuun.',
  description_sv = 'Utforska insikter, guider och verktyg för att förbättra dina mentor- och coachningsprogram. Upptäck bästa praxis, strategier och resurser för att bygga effektiva mentorrelationer och driva professionell utveckling.'
WHERE id = 'mentoring-coaching' AND type = 'resource';

UPDATE categories 
SET 
  description_en = 'Explore insights, guides, and tools to enhance your career and talent management programs. Discover strategies for career development, talent retention, and building high-performing teams.',
  description_fi = 'Tutustu näkemyksiin, oppaisiin ja työkaluihin, jotka parantavat ura- ja talentinhallintaohjelmiasi. Löydä strategioita uran kehittämiseen, talenttien säilyttämiseen ja korkean suorituskyvyn tiimien rakentamiseen.',
  description_sv = 'Utforska insikter, guider och verktyg för att förbättra dina karriär- och talenthanteringsprogram. Upptäck strategier för karriärutveckling, talentrekrytering och byggande av högpresterande team.'
WHERE id = 'career-talent' AND type = 'resource';

UPDATE categories 
SET 
  description_en = 'Explore insights, guides, and tools to enhance your employee experience and culture programs. Discover strategies for building positive workplace cultures, improving employee engagement, and creating meaningful work experiences.',
  description_fi = 'Tutustu näkemyksiin, oppaisiin ja työkaluihin, jotka parantavat työntekijäkokemus- ja kulttuuriohjelmiasi. Löydä strategioita positiivisten työpaikkakulttuurien rakentamiseen, työntekijöiden sitoutumisen parantamiseen ja merkityksellisten työkokemusten luomiseen.',
  description_sv = 'Utforska insikter, guider och verktyg för att förbättra dina medarbetarupplevelse- och kulturprogram. Upptäck strategier för att bygga positiva arbetsplatskulturer, förbättra medarbetarengagemang och skapa meningsfulla arbetsupplevelser.'
WHERE id = 'employee-experience' AND type = 'resource';

UPDATE categories 
SET 
  description_en = 'Explore insights, guides, and tools to enhance your HR technology and innovation programs. Discover the latest HR tech trends, automation strategies, and digital transformation solutions for modern workplaces.',
  description_fi = 'Tutustu näkemyksiin, oppaisiin ja työkaluihin, jotka parantavat HR-teknologia- ja innovaatioohjelmiasi. Löydä uusimmat HR-tekniikan trendit, automatisointistrategiat ja digitaalisen muutoksen ratkaisut nykyaikaisille työpaikoille.',
  description_sv = 'Utforska insikter, guider och verktyg för att förbättra dina HR-teknik- och innovationsprogram. Upptäck de senaste HR-tekniktrenderna, automatiseringsstrategier och digitala transformationslösningar för moderna arbetsplatser.'
WHERE id = 'hr-tech' AND type = 'resource';

UPDATE categories 
SET 
  description_en = 'Explore insights, guides, and tools to enhance your entrepreneurship and startup programs. Discover strategies for building successful startups, scaling businesses, and fostering innovation in entrepreneurial ecosystems.',
  description_fi = 'Tutustu näkemyksiin, oppaisiin ja työkaluihin, jotka parantavat yrittäjyys- ja startup-ohjelmiasi. Löydä strategioita menestyksekkäiden startup-yritysten rakentamiseen, liiketoimintojen skaalauttamiseen ja innovaation edistämiseen yrittäjäekosysteemeissä.',
  description_sv = 'Utforska insikter, guider och verktyg för att förbättra dina entreprenörskaps- och startupsprogram. Upptäck strategier för att bygga framgångsrika startups, skala verksamheter och främja innovation i entreprenöriella ekosystem.'
WHERE id = 'entrepreneurship' AND type = 'resource';

UPDATE categories 
SET 
  description_en = 'Explore insights, guides, and tools to enhance your community management programs. Discover strategies for building engaged communities, fostering connections, and creating meaningful member experiences.',
  description_fi = 'Tutustu näkemyksiin, oppaisiin ja työkaluihin, jotka parantavat yhteisönhallintaohjelmiasi. Löydä strategioita sitoutuneiden yhteisöjen rakentamiseen, yhteyksien luomiseen ja merkityksellisten jäsenkokemusten luomiseen.',
  description_sv = 'Utforska insikter, guider och verktyg för att förbättra dina gemenskapshanteringsprogram. Upptäck strategier för att bygga engagerade gemenskaper, främja anslutningar och skapa meningsfulla medlemsupplevelser.'
WHERE id = 'community-management' AND type = 'resource';


