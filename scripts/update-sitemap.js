#!/usr/bin/env node

/**
 * Sitemap Update Script for GrantBridge
 * 
 * This script helps you update the sitemap.xml with current dates
 * Run: node scripts/update-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

console.log('Updating sitemap.xml with current date...');
console.log(`Current date: ${today}`);

try {
  // Read the sitemap
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  
  // Replace all lastmod dates with today's date
  const updatedSitemap = sitemap.replace(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
    `<lastmod>${today}</lastmod>`
  );
  
  // Write back to file
  fs.writeFileSync(sitemapPath, updatedSitemap, 'utf8');
  
  console.log('Sitemap updated successfully!');
  console.log(`Location: ${sitemapPath}`);
  
} catch (error) {
  console.error('Error updating sitemap:', error.message);
  process.exit(1);
}
