import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { distance } from 'fastest-levenshtein';
import { displayExplanation } from './ui.js';
import { askAI } from './ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandsPath = path.join(__dirname, 'data', 'commands.json');
export const commandsData = JSON.parse(fs.readFileSync(commandsPath, 'utf8'));

export const cachePath = path.join(os.homedir(), '.whhaaat_cache.json');

export let cacheData = {};
if (fs.existsSync(cachePath)) {
    try {
        cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        Object.assign(commandsData, cacheData);
    } catch (e) {
        // Corrupted cache, ignore
    }
}

export const saveToCache = (cmdKey, data) => {
    cacheData[cmdKey] = data;
    Object.assign(commandsData, cacheData);
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2), 'utf8');
};

export const explainCommand = async (fullCommand) => {
    let bestMatch = null;
    let minDistance = Infinity;

    for (const cmd of Object.keys(commandsData)) {
        const d = distance(fullCommand, cmd);
        if (d < minDistance) {
            minDistance = d;
            bestMatch = cmd;
        }
    }

    // Exact match
    if (minDistance === 0) {
        return displayExplanation(commandsData[bestMatch], fullCommand);
    }

    // Very close match
    if (bestMatch && minDistance <= 3 && minDistance <= Math.max(1, fullCommand.length / 2)) {
        console.log(`\nDid you mean: ${bestMatch} ?\n`);
        return;
    }

    const parts = fullCommand.split(' ');
    const baseCommand = parts[0];
    const subCommand = parts.length > 1 ? `${parts[0]} ${parts[1]}` : null;

    let explanation = subCommand ? commandsData[subCommand] : null;

    // Try distance check on subCommand as well (e.g., "git psuh --force" -> "git psuh")
    if (!explanation && subCommand) {
        let bestSubMatch = null;
        let minSubDistance = Infinity;
        for (const cmd of Object.keys(commandsData)) {
            const d = distance(subCommand, cmd);
            if (d < minSubDistance) {
                minSubDistance = d;
                bestSubMatch = cmd;
            }
        }
        if (bestSubMatch && minSubDistance <= 3 && minSubDistance <= Math.max(1, subCommand.length / 2)) {
            console.log(`\nDid you mean: ${bestSubMatch} ?\n`);
            return;
        }
    }

    // Fallback to one-word lookup (e.g. "git")
    if (!explanation) {
        explanation = commandsData[baseCommand];
    }

    if (!explanation) {
        // Try searching for the fork bomb specifically as it's not a standard command
        if (fullCommand.includes(':(){')) {
            return displayExplanation(commandsData[":(){ :|:& };:"]);
        }

        // Trigger AI Smart Mode
        const aiResult = await askAI(fullCommand);
        if (aiResult) {
            saveToCache(fullCommand, aiResult);
        }
        return;
    }

    displayExplanation(explanation, fullCommand);
};
