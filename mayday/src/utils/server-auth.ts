import fs from 'fs';
import path from 'path';
import { User } from './auth';

// Path to account.json
const accountFilePath = path.join(process.cwd(), 'account.json');

// Server-side function to read accounts from account.json
export const getAccounts = (): User[] => {
  try {
    if (!fs.existsSync(accountFilePath)) {
      fs.writeFileSync(accountFilePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(accountFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading accounts:', error);
    return [];
  }
};

// Server-side function to save accounts to account.json
export const saveAccounts = (accounts: User[]): void => {
  try {
    fs.writeFileSync(accountFilePath, JSON.stringify(accounts, null, 2));
  } catch (error) {
    console.error('Error saving accounts:', error);
  }
}; 