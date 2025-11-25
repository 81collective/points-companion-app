module.exports = {
  ci: {
    collect: {
      // Start the server before collecting results
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 60000,
      
      // URLs to test
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/cards',
      ],
      
      // Number of runs per URL
      numberOfRuns: 3,
      
      // Lighthouse settings
      settings: {
        preset: 'desktop',
        // Skip audits that don't work in CI
        skipAudits: ['uses-http2'],
      },
    },
    
    assert: {
      // Assertions for Core Web Vitals
      assertions: {
        // Performance metrics
        'categories:performance': ['warn', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3500 }],
        
        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.9 }],
        
        // Best practices
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        
        // SEO
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Specific audits
        'viewport': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-description': 'warn',
        'link-text': 'warn',
        'image-alt': 'error',
        'color-contrast': 'warn',
        'tap-targets': 'warn',
      },
    },
    
    upload: {
      // Upload to temporary public storage for PR comments
      target: 'temporary-public-storage',
    },
  },
};
