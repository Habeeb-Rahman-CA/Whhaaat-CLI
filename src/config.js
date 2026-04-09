import fs from 'fs';
import os from 'os';
import path from 'path';

const configPath = path.join(os.homedir(), '.whhaaatrc');

const defaultConfig = {
    ai_model: 'llama3',
    ai_url: 'http://localhost:11434/api/generate',
    timeout: 10000
};

let userConfig = {};

if (fs.existsSync(configPath)) {
    try {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        userConfig = JSON.parse(fileContent);
    } catch (e) {
        console.error(`[!] Failed to parse ~/.whhaaatrc. Make sure it's valid JSON.`);
    }
} else {
    try {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
    } catch(e) {
        // Ignore write failures
    }
}

export const config = { ...defaultConfig, ...userConfig };
