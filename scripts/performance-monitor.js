#!/usr/bin/env node

// Performance monitoring script for InfoScope OSINT
// Monitors build size, bundle composition, and runtime performance

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 InfoScope OSINT Performance Monitor');
console.log('=====================================\n');

// Check if build directory exists
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
  console.log('❌ Build directory not found. Running build...\n');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Analyze build sizes
console.log('📊 Bundle Size Analysis');
console.log('=======================');

function getDirectorySize(dirPath) {
  let totalSize = 0;
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  });
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Analyze main bundle files
const staticDir = path.join(buildDir, 'static');
if (fs.existsSync(staticDir)) {
  const jsDir = path.join(staticDir, 'js');
  const cssDir = path.join(staticDir, 'css');
  
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    let totalJSSize = 0;
    
    console.log('\n📦 JavaScript Bundles:');
    jsFiles.forEach(file => {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);
      totalJSSize += stats.size;
      
      const sizeFormatted = formatBytes(stats.size);
      const sizeIndicator = stats.size > 1024 * 1024 ? '🔴' : stats.size > 512 * 1024 ? '🟡' : '🟢';
      console.log(`  ${sizeIndicator} ${file}: ${sizeFormatted}`);
    });
    
    console.log(`\n📊 Total JS Size: ${formatBytes(totalJSSize)}`);
    
    // Warnings for large bundles
    if (totalJSSize > 2 * 1024 * 1024) {
      console.log('⚠️  Warning: Total JS bundle size is large (>2MB). Consider code splitting.');
    }
  }
  
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    let totalCSSSize = 0;
    
    console.log('\n🎨 CSS Bundles:');
    cssFiles.forEach(file => {
      const filePath = path.join(cssDir, file);
      const stats = fs.statSync(filePath);
      totalCSSSize += stats.size;
      
      const sizeFormatted = formatBytes(stats.size);
      const sizeIndicator = stats.size > 256 * 1024 ? '🔴' : stats.size > 128 * 1024 ? '🟡' : '🟢';
      console.log(`  ${sizeIndicator} ${file}: ${sizeFormatted}`);
    });
    
    console.log(`\n📊 Total CSS Size: ${formatBytes(totalCSSSize)}`);
  }
}

// Overall build size
const totalBuildSize = getDirectorySize(buildDir);
console.log(`\n📦 Total Build Size: ${formatBytes(totalBuildSize)}`);

// Performance recommendations
console.log('\n💡 Performance Recommendations');
console.log('===============================');

const recommendations = [];

// Check for large assets
const mediaDir = path.join(staticDir, 'media');
if (fs.existsSync(mediaDir)) {
  const mediaFiles = fs.readdirSync(mediaDir);
  mediaFiles.forEach(file => {
    const filePath = path.join(mediaDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.size > 512 * 1024) { // >512KB
      recommendations.push(`🖼️  Optimize large media file: ${file} (${formatBytes(stats.size)})`);
    }
  });
}

// Check for missing optimizations
const indexHtml = path.join(buildDir, 'index.html');
if (fs.existsSync(indexHtml)) {
  const content = fs.readFileSync(indexHtml, 'utf8');
  
  if (!content.includes('preload')) {
    recommendations.push('🔗 Add resource preloading for critical assets');
  }
  
  if (!content.includes('preconnect')) {
    recommendations.push('🌐 Add preconnect hints for external domains');
  }
}

// Service Worker check
const swPath = path.join(buildDir, 'sw.js');
if (fs.existsSync(swPath)) {
  console.log('✅ Service Worker found');
} else {
  recommendations.push('🔧 Consider adding a Service Worker for caching');
}

// Display recommendations
if (recommendations.length > 0) {
  recommendations.forEach(rec => console.log(`  ${rec}`));
} else {
  console.log('✅ No immediate optimization recommendations');
}

// Performance metrics
console.log('\n⚡ Performance Metrics');
console.log('=====================');

// Check for gzip compression potential
const jsDir = path.join(staticDir, 'js');
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
  const mainJSFile = jsFiles.find(file => file.includes('main'));
  
  if (mainJSFile) {
    const filePath = path.join(jsDir, mainJSFile);
    const content = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(content, 'utf8');
    
    // Simulate gzip compression ratio
    const estimatedGzipSize = originalSize * 0.3; // Rough estimate
    console.log(`📦 Main JS: ${formatBytes(originalSize)} → ~${formatBytes(estimatedGzipSize)} (gzipped)`);
  }
}

// Generate performance report
const reportData = {
  timestamp: new Date().toISOString(),
  buildSize: totalBuildSize,
  jsSize: 0,
  cssSize: 0,
  recommendations: recommendations.length,
  hasServiceWorker: fs.existsSync(swPath)
};

// Save performance report
const reportsDir = path.join(__dirname, '..', 'performance-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

const reportPath = path.join(reportsDir, `perf-report-${Date.now()}.json`);
fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

console.log(`\n📊 Performance report saved: ${reportPath}`);
console.log('\n🎯 Next Steps:');
console.log('   1. Run "npm run analyze" to view detailed bundle analysis');
console.log('   2. Run "npm run lighthouse" to audit web performance');
console.log('   3. Monitor Core Web Vitals in production');

console.log('\n✨ Performance monitoring complete!');