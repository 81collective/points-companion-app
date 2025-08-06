// Advanced data encryption and protection utilities
'use client';

class DataProtection {
  private static instance: DataProtection;
  private encryptionKey: string | null = null;

  static getInstance(): DataProtection {
    if (!DataProtection.instance) {
      DataProtection.instance = new DataProtection();
    }
    return DataProtection.instance;
  }

  // Initialize encryption key (in production, this would be managed securely)
  async initializeEncryption(): Promise<void> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const key = await window.crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        
        const exported = await window.crypto.subtle.exportKey('jwk', key);
        this.encryptionKey = JSON.stringify(exported);
      } catch (error) {
        console.warn('Failed to initialize encryption:', error);
        // Fallback to a basic encoding for demo purposes
        this.encryptionKey = 'fallback_key_' + Date.now();
      }
    }
  }

  // Encrypt sensitive data
  async encryptData(data: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initializeEncryption();
    }

    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && this.encryptionKey?.startsWith('{')) {
      try {
        const keyData = JSON.parse(this.encryptionKey);
        const key = await window.crypto.subtle.importKey(
          'jwk',
          keyData,
          { name: 'AES-GCM' },
          false,
          ['encrypt']
        );

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encodedData = new TextEncoder().encode(data);
        
        const encrypted = await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          key,
          encodedData
        );

        const encryptedArray = new Uint8Array(encrypted);
        const combined = new Uint8Array(iv.length + encryptedArray.length);
        combined.set(iv);
        combined.set(encryptedArray, iv.length);

        return btoa(String.fromCharCode(...combined));
      } catch (error) {
        console.warn('Encryption failed, using fallback:', error);
      }
    }

    // Fallback encoding (not secure, for demo only)
    return btoa(data);
  }

  // Decrypt sensitive data
  async decryptData(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initializeEncryption();
    }

    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && this.encryptionKey?.startsWith('{')) {
      try {
        const keyData = JSON.parse(this.encryptionKey);
        const key = await window.crypto.subtle.importKey(
          'jwk',
          keyData,
          { name: 'AES-GCM' },
          false,
          ['decrypt']
        );

        const combined = new Uint8Array(
          Array.from(atob(encryptedData), c => c.charCodeAt(0))
        );
        
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);

        const decrypted = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          key,
          encrypted
        );

        return new TextDecoder().decode(decrypted);
      } catch (error) {
        console.warn('Decryption failed, using fallback:', error);
      }
    }

    // Fallback decoding
    try {
      return atob(encryptedData);
    } catch {
      return encryptedData; // Return as-is if not encoded
    }
  }

  // Mask sensitive data for display
  maskSensitiveData(data: string, type: 'card' | 'ssn' | 'email' | 'phone' = 'card'): string {
    switch (type) {
      case 'card':
        // Mask credit card numbers (show last 4 digits)
        if (data.length >= 4) {
          return '**** **** **** ' + data.slice(-4);
        }
        return '****';
        
      case 'ssn':
        // Mask SSN (show last 4 digits)
        if (data.length >= 4) {
          return '***-**-' + data.slice(-4);
        }
        return '***-**-****';
        
      case 'email':
        // Mask email (show first letter and domain)
        const emailMatch = data.match(/^(.)[^@]*@(.+)$/);
        if (emailMatch) {
          return emailMatch[1] + '****@' + emailMatch[2];
        }
        return '****@****.***';
        
      case 'phone':
        // Mask phone number (show last 4 digits)
        if (data.length >= 4) {
          return '***-***-' + data.slice(-4);
        }
        return '***-***-****';
        
      default:
        return '****';
    }
  }

  // Generate secure random tokens
  generateSecureToken(length: number = 32): string {
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback for environments without crypto API
    return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  // Hash data (for comparison without storing actual values)
  async hashData(data: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        console.warn('Hashing failed:', error);
      }
    }
    
    // Simple fallback hash (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Validate data integrity
  async validateDataIntegrity(originalData: string, hash: string): Promise<boolean> {
    const currentHash = await this.hashData(originalData);
    return currentHash === hash;
  }

  // Secure session storage
  setSecureSessionData(key: string, data: unknown): void {
    try {
      const jsonData = JSON.stringify(data);
      this.encryptData(jsonData).then(encrypted => {
        sessionStorage.setItem(key, encrypted);
      });
    } catch (error) {
      console.error('Failed to store secure session data:', error);
    }
  }

  // Retrieve secure session data
  async getSecureSessionData<T>(key: string): Promise<T | null> {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = await this.decryptData(encrypted);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Failed to retrieve secure session data:', error);
      return null;
    }
  }

  // Clear sensitive data from memory
  clearSensitiveData(obj: Record<string, unknown>): void {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'pin', 'ssn', 'card_number'];
    
    Object.keys(obj).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        delete obj[key];
      }
    });
  }
}

// Content Security Policy helpers
export class CSPManager {
  static generateNonce(): string {
    return DataProtection.getInstance().generateSecureToken(16);
  }

  static getCSPHeader(): string {
    const nonce = this.generateNonce();
    return [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' https://maps.googleapis.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }
}

// Input validation and sanitization
export class InputValidator {
  private static xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];

  private static sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bOR\b.*=.*)/i,
    /(--|\#|\/\*)/
  ];

  static sanitizeInput(input: string): string {
    let sanitized = input;
    
    // Remove potential XSS patterns
    this.xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Basic HTML entity encoding
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    return sanitized.trim();
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && !this.containsMaliciousPattern(email);
  }

  static validateCreditCard(cardNumber: string): boolean {
    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    
    // Check if it's all digits and has valid length
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  static containsMaliciousPattern(input: string): boolean {
    return [...this.xssPatterns, ...this.sqlPatterns].some(pattern => pattern.test(input));
  }

  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (this.containsMaliciousPattern(password)) {
      errors.push('Password contains invalid characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default DataProtection;
