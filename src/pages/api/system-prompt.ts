import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Define the path to system.txt in the root of the project
    const systemFilePath = path.join(process.cwd(), 'system.txt');
    
    // Check if file exists - if not, return null
    if (!fs.existsSync(systemFilePath)) {
      return res.status(200).json({ prompt: null });
    }
    
    // Read the system.txt file
    const promptText = fs.readFileSync(systemFilePath, 'utf8');
    
    // Return the prompt text
    res.status(200).json({ prompt: promptText });
  } catch (error) {
    console.error('Error handling system prompt request:', error);
    res.status(500).json({ error: 'Failed to read system prompt' });
  }
} 