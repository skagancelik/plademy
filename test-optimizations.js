/**
 * Optimization Test Script
 * Tests all optimizations made to the codebase
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Optimization Tests...\n');

const tests = {
  passed: 0,
  failed: 0,
  errors: []
};

function test(name, condition, errorMsg) {
  try {
    if (condition) {
      console.log(`✅ ${name}`);
      tests.passed++;
    } else {
      console.log(`❌ ${name}: ${errorMsg}`);
      tests.failed++;
      tests.errors.push({ name, error: errorMsg });
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    tests.failed++;
    tests.errors.push({ name, error: error.message });
  }
}

// Test 1: Check if CATEGORY constants are defined
const supabaseFile = fs.readFileSync('src/lib/supabase.ts', 'utf8');
test(
  'CATEGORY_BASIC_FIELDS constant exists',
  supabaseFile.includes('CATEGORY_BASIC_FIELDS'),
  'CATEGORY_BASIC_FIELDS not found'
);
test(
  'CATEGORY_FULL_FIELDS constant exists',
  supabaseFile.includes('CATEGORY_FULL_FIELDS'),
  'CATEGORY_FULL_FIELDS not found'
);

// Test 2: Check if Footer uses selective fields
const footerFile = fs.readFileSync('src/components/common/Footer.astro', 'utf8');
test(
  'Footer uses selective fields for categories',
  footerFile.includes("select('id, slug, name_en, name_fi, name_sv, type, sort_order')"),
  'Footer still using select(*) for categories'
);
test(
  'Footer uses selective fields for resources',
  footerFile.includes("select('id, slug, title')"),
  'Footer still using select(*) for resources'
);

// Test 3: Check if count queries use 'id' instead of '*'
const resourcesIndex = fs.readFileSync('src/pages/resources/index.astro', 'utf8');
test(
  'Resources index uses select(id) for count',
  resourcesIndex.includes("select('id', { count: 'exact', head: true })"),
  'Resources index still using select(*) for count'
);

const programsCategory = fs.readFileSync('src/pages/programs/[category]/index.astro', 'utf8');
test(
  'Programs category uses select(id) for count',
  programsCategory.includes("select('id', { count: 'exact', head: true })"),
  'Programs category still using select(*) for count'
);

// Test 4: Check if server-side filtering is implemented
const programsIndex = fs.readFileSync('src/pages/programs/index.astro', 'utf8');
test(
  'Programs index has server-side filtering',
  programsIndex.includes('categoryFilter') && programsIndex.includes('audienceFilter') && programsIndex.includes('goalFilter'),
  'Server-side filtering not implemented'
);
test(
  'Programs index has URL parameter reading',
  programsIndex.includes("Astro.url.searchParams.get('category')"),
  'URL parameter reading not found'
);
test(
  'Programs index has updateURL function',
  programsIndex.includes('function updateURL()'),
  'updateURL function not found'
);

// Test 5: Check if cache headers are optimized
test(
  'List pages have 300s cache',
  resourcesIndex.includes('max-age=300') && programsIndex.includes('max-age=300'),
  'List pages cache not optimized'
);

const resourcesSlug = fs.readFileSync('src/pages/resources/[slug].astro', 'utf8');
test(
  'Detail pages have 600s cache',
  resourcesSlug.includes('max-age=600'),
  'Detail pages cache not optimized'
);

// Test 6: Check if helper functions use selective fields
test(
  'getResourcesList uses RESOURCE_LIST_FIELDS',
  supabaseFile.includes('select(RESOURCE_LIST_FIELDS, { count:'),
  'getResourcesList not using RESOURCE_LIST_FIELDS'
);
test(
  'getProgramsList uses PROGRAM_LIST_FIELDS',
  supabaseFile.includes('select(PROGRAM_LIST_FIELDS, { count:'),
  'getProgramsList not using PROGRAM_LIST_FIELDS'
);

// Test 7: Check if all category queries use selective fields
const allFiles = [
  'src/pages/resources/index.astro',
  'src/pages/programs/index.astro',
  'src/pages/resources/[category]/index.astro',
  'src/pages/programs/[category]/index.astro',
  'src/pages/resurssit/index.astro',
  'src/pages/ohjelmat/index.astro'
];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const hasSelectiveFields = content.includes("select('id, slug, name_en, name_fi, name_sv, type, sort_order')");
  const hasSelectStar = content.match(/\.select\('\*'\)/g);
  
  if (hasSelectStar && hasSelectStar.length > 0) {
    // Check if it's for categories (should not have select('*'))
    const categorySelectStar = content.match(/from\('categories'\).*?\.select\('\*'\)/s);
    if (categorySelectStar) {
      test(
        `${file} uses selective fields for categories`,
        false,
        'Still using select(*) for categories'
      );
    }
  }
});

// Test 8: Check LatestContent uses full fields (description needed)
const latestContent = fs.readFileSync('src/components/home/LatestContent.astro', 'utf8');
test(
  'LatestContent uses full category fields',
  latestContent.includes('description_en, description_fi, description_sv'),
  'LatestContent not using full category fields'
);

// Test 9: Check image lazy loading
const programCard = fs.readFileSync('src/components/programs/ProgramCard.astro', 'utf8');
const resourceCard = fs.readFileSync('src/components/resources/ResourceCard.astro', 'utf8');
test(
  'ProgramCard uses lazy loading',
  programCard.includes('loading="lazy"'),
  'ProgramCard not using lazy loading'
);
test(
  'ResourceCard uses lazy loading',
  resourceCard.includes('loading="lazy"'),
  'ResourceCard not using lazy loading'
);

// Test 10: Check detail pages use eager loading for main images
test(
  'Detail pages use eager loading for main images',
  resourcesSlug.includes('loading="eager"'),
  'Detail pages not using eager loading for main images'
);

console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${tests.passed}`);
console.log(`❌ Failed: ${tests.failed}`);

if (tests.errors.length > 0) {
  console.log('\n❌ Errors:');
  tests.errors.forEach(({ name, error }) => {
    console.log(`  - ${name}: ${error}`);
  });
}

if (tests.failed === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the errors above.');
  process.exit(1);
}

