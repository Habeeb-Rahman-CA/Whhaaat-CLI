#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import axios from 'axios';
import { distance } from 'fastest-levenshtein';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// Load command data from JSON
const commandsPath = path.join(__dirname, 'commands.json');
const commandsData = JSON.parse(fs.readFileSync(commandsPath, 'utf8'));

const showHeader = () => {
    console.log(gradient.pastel.multiline([
        ' __      __.__      .__                      __   ',
        '/  \\    /  \\  |__   |  |__ _____ _____ _____/  |_ ',
        '\\   \\/\\/   /  |  \\  |  |  \\\\__  \\\\__  \\\\__  \\   __\\',
        ' \\        /|   Y  \\ |   Y  \\/ __ \\/ __ \\/ __ \\|  |  ',
        '  \\__/\\  / |___|  / |___|  (____  (____  (____  /__|  ',
        '       \\/       \\/       \\/     \\/     \\/     \\/      ',
        '             EXPLAIN MY COMMAND v1.0.0\n'
    ].join('\n')));
};

const askAI = async (fullCommand) => {
    const aiSpinner = ora(chalk.cyan('Consulting AI Smart Mode...')).start();
    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'llama3', // Default to llama3, user can change
            prompt: `Explain the terminal command '${fullCommand}' in simple English for a beginner. 
            Output ONLY a JSON object without any markdown or extra text. 
            The JSON MUST have these keys: 
            "name" (string), 
            "description" (string), 
            "risk" (one of: Zero, Low, Medium, High, Critical), 
            "dangerousFlags" (object where keys are flags and values are descriptions), 
            "safeness" (short safety tip), 
            "alternatives" (array of strings).`,
            stream: false
        }, { timeout: 10000 });

        aiSpinner.stop();
        
        try {
            const result = JSON.parse(response.data.response);
            displayExplanation(result, fullCommand, true);
        } catch (parseError) {
            throw new Error('AI returned invalid format');
        }
    } catch (error) {
        aiSpinner.stop();
        showUnknownCommandBox(fullCommand.split(' ')[0]);
    }
};

const showUnknownCommandBox = (baseCommand) => {
    console.log(boxen(
        chalk.yellow(`\n[!] Whhaaat? I don't know the command: `) + chalk.white.bold(baseCommand) + `\n\n` +
        chalk.dim(`I'm still learning and AI Smart Mode is either off or unavailable.\n`) +
        chalk.cyan(`  • Checking if you spelled it correctly\n`) +
        chalk.cyan(`  • Using "man ${baseCommand}" for technical details\n`) +
        chalk.cyan(`  • Contributing this command to my database!`),
        {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'yellow',
            title: 'Unknown Command',
            titleAlignment: 'center'
        }
    ));
};

const explainCommand = async (fullCommand) => {
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
        await askAI(fullCommand);
        return;
    }

    displayExplanation(explanation, fullCommand);
};

const displayExplanation = (data, fullCommand = '', isAI = false) => {
    let output = '';

    if (isAI) {
        output += chalk.italic.magenta(`🤖 AI Generated Explanation\n\n`);
    }

    output += chalk.bold.cyan(`Command: `) + chalk.white(data.name) + '\n';
    output += chalk.bold.cyan(`What it does: `) + chalk.white(data.description) + '\n';

    const riskColor = data.risk === 'Critical' ? chalk.red.bold : (data.risk === 'High' ? chalk.red : chalk.yellow);
    output += chalk.bold.cyan(`Risk Level: `) + riskColor(data.risk) + '\n';

    // Check for flags in the full command
    const foundFlags = [];
    if (fullCommand && data.dangerousFlags) {
        for (const [flag, desc] of Object.entries(data.dangerousFlags)) {
            if (fullCommand.includes(flag)) {
                foundFlags.push({ flag, desc });
            }
        }
    }

    if (foundFlags.length > 0) {
        output += chalk.bold.red(`\n[!] DANGER WARNINGS FOUND:\n`);
        foundFlags.forEach(f => {
            output += chalk.red(`  • ${f.flag}: `) + chalk.white(f.desc) + '\n';
        });
    }

    output += chalk.bold.cyan(`\nSafety Tip: `) + chalk.white(data.safeness) + '\n';

    if (data.alternatives && data.alternatives.length > 0) {
        output += chalk.bold.green(`\nSafer Alternatives:\n`);
        data.alternatives.forEach(alt => {
            output += chalk.green(`  → `) + chalk.white(alt) + '\n';
        });
    }

    console.log(boxen(output, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: data.risk === 'Critical' || foundFlags.length > 0 ? 'red' : 'cyan',
        title: 'Whhaaat? Explanation',
        titleAlignment: 'center'
    }));
};

program
    .name('whhaaat')
    .description('A CLI to explain scary terminal commands')
    .version('1.0.0')
    .argument('[command...]', 'The command to explain')
    .action(async (commandArgs) => {
        if (commandArgs.length === 0) {
            showHeader();
            program.outputHelp();
            return;
        }

        let cmdToExplain = commandArgs;
        if (commandArgs[0] === 'whhaaat') {
            cmdToExplain = commandArgs.slice(1);
        }

        if (cmdToExplain.length === 0) {
            showHeader();
            program.outputHelp();
            return;
        }

        const fullCommand = cmdToExplain.join(' ');
        showHeader();
        const spinner = ora('Analyzing your command...').start();
        
        await new Promise(resolve => setTimeout(resolve, 800));
        spinner.stop();
        await explainCommand(fullCommand);
    });

program.parse(process.argv);
