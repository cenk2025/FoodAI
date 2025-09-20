// Test script for sitemap functionality
// Usage: node scripts/test-sitemap.js

// Simple test to verify the sitemap module can be imported without errors
async function testSitemap() {
  try {
    // Import the sitemap function
    const sitemap = (await import('../app/sitemap.js')).default;
    console.log('Sitemap module imported successfully');
    console.log('Sitemap function:', typeof sitemap);
    
    // Note: Full testing would require a running Supabase instance
    // For now, we just verify the module structure
    console.log('\nTo test fully, run the application and visit /sitemap.xml');
    console.log('Ensure NEXT_PUBLIC_SITE_URL is set in your environment');
    
  } catch (error) {
    console.error('Error importing sitemap module:', error);
  }
}

testSitemap();