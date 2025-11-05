import * as crypto from 'crypto';

export class EncryptionUtil {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly secretKey =
    process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here';

  /**
   * Encrypt sensitive data (like database passwords)
   */
  static encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const key = crypto.scryptSync(this.secretKey, 'salt', 32);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Combine iv, authTag, and encrypted data
      return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const key = crypto.scryptSync(this.secretKey, 'salt', 32);
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generate a secure API secret key
   */
  static generateApiSecretKey(length: number = 32): string {
    try {
      return crypto.randomBytes(length).toString('hex').slice(0, length);
    } catch (error) {
      console.error('API key generation error:', error);
      throw new Error('Failed to generate API key');
    }
  }
}
