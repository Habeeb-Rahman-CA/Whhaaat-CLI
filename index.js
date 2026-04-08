#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const explainCommand = (fullCommand) => {
    const parts = fullCommand.split(' ');
    const baseCommand = parts[0];

    const explanation = commandsData[baseCommand];

    if (!explanation) {
        // Try searching for the fork bomb specifically as it's not a standard command
        if (fullCommand.includes(':(){')) {
            return displayExplanation(commandsData[":(){ :|:& };:"]);
        }

        console.log(boxen(
            chalk.yellow(`\n[!] Whhaaat? I don't know the command: `) + chalk.white.bold(baseCommand) + `\n\n` +
            chalk.dim(`I'm still learning! You can try:\n`) +
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
        return;
    }

    displayExplanation(explanation, fullCommand);
};

const displayExplanation = (data, fullCommand = '') => {
    let output = '';

    output += chalk.bold.cyan(`\nCommand: `) + chalk.white(data.name) + '\n';
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
    .action((commandArgs) => {
        if (commandArgs.length === 0) {
            showHeader();
            program.outputHelp();
            return;
        }

        // If the first arg is 'explain', we can keep it or skip it
        // If the user typed 'whhaaat explain rm', commandArgs is ['explain', 'rm']
        // If the user typed 'whhaaat rm', commandArgs is ['rm']
        let cmdToExplain = commandArgs;
        if (commandArgs[0] === 'explain') {
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
        
        setTimeout(() => {
            spinner.stop();
            explainCommand(fullCommand);
        }, 800);
    });

program.parse(process.argv);
