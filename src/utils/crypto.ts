/**
 * Browser-safe crypto utilities using Web Crypto API
 */

/**
 * Generate random bytes using the Web Crypto API
 * @param length Number of bytes to generate
 * @returns Uint8Array of random bytes
 */
export function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Generate a random UUID using the Web Crypto API
 * @returns Random UUID string
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Convert bytes to hex string
 * @param bytes Uint8Array of bytes
 * @returns Hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates a random hex string of specified length
 * @param length The length of the hex string to generate
 * @returns A random hex string
 */
export const getRandomHex = (length: number): string => {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
};

/**
 * Generate a secure random number between min and max (inclusive)
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random number between min and max
 */
export function getRandomNumber(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxNum = Math.pow(256, bytesNeeded);
  const cutoff = maxNum - (maxNum % range);
  
  while (true) {
    const bytes = getRandomBytes(bytesNeeded);
    let num = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      num = (num << 8) | bytes[i];
    }
    if (num < cutoff) {
      return min + (num % range);
    }
  }
}

// Crypto utilities for secure operations
export class CryptoUtils {
  /**
   * Generate a cryptographically secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    const bytes = randomBytes(length);
    return bytes.toString('hex');
  }

  /**
   * Generate a secure random UUID v4
   */
  static generateUUID(): string {
    const bytes = randomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant bits
    
    const hex = bytes.toString('hex');
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32)
    ].join('-');
  }

  /**
   * Hash data using Web Crypto API
   */
  static async sha256(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a secure password hash
   */
  static async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const passwordSalt = salt || this.generateSecureRandom(16);
    const hash = await this.sha256(password + passwordSalt);
    return { hash, salt: passwordSalt };
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const { hash: computedHash } = await this.hashPassword(password, salt);
    return computedHash === hash;
  }

  /**
   * Generate a secure session token
   */
  static generateSessionToken(): string {
    const timestamp = Date.now().toString();
    const random = this.generateSecureRandom(32);
    return this.generateSecureRandom(64);
  }

  /**
   * Validate Ethereum-style address format
   */
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Validate Root Network address format
   */
  static isValidRootAddress(address: string): boolean {
    // Root Network uses Substrate addresses (SS58 format)
    return /^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(address);
  }

  /**
   * Generate a secure API key
   */
  static generateApiKey(): string {
    const prefix = 'gai_'; // Genre AI prefix
    const key = this.generateSecureRandom(32);
    return prefix + key;
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Generate a secure nonce for cryptographic operations
   */
  static generateNonce(): string {
    return this.generateSecureRandom(16);
  }

  /**
   * Create a checksum for data integrity
   */
  static async createChecksum(data: string): Promise<string> {
    const hash = await this.sha256(data);
    return hash.slice(0, 8);
  }

  /**
   * Verify data integrity using checksum
   */
  static async verifyChecksum(data: string, checksum: string): Promise<boolean> {
    const computedChecksum = await this.createChecksum(data);
    return this.secureCompare(computedChecksum, checksum);
  }
}

// Initialize crypto utilities
export async function initializeCrypto(): Promise<void> {
  try {
    // Test crypto functionality
    const testData = 'test-data';
    const hash = await CryptoUtils.sha256(testData);
    const uuid = CryptoUtils.generateUUID();
    
    console.log('Crypto utilities initialized successfully');
    console.log('Test hash:', hash.slice(0, 16) + '...');
    console.log('Test UUID:', uuid);
  } catch (error) {
    console.error('Failed to initialize crypto utilities:', error);
    throw error;
  }
}

// Export default crypto instance
export default CryptoUtils;