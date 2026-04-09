#!/usr/bin/env node

import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import boxen from 'boxen';
import { showHeader } from '../src/ui.js';
import { explainCommand } from '../src/explain.js';

const showError = (msg) => {
    console.error(boxen(chalk.red(msg), {
        padding: 1, margin: 1, borderColor: 'red', borderStyle: 'round', title: 'Fatal Error'
    }));
    process.exit(1);
};

process.on('uncaughtException', (err) => showError(`An unexpected error occurred:\n${err.message || err}`));
process.on('unhandledRejection', (reason) => showError(`An asynchronous task failed:\n${reason}`));

const program = new Command();

program
    .name('whhaaat')
    .description('A CLI to explain scary terminal commands')
    .version('1.0.0')
    .argument('[command...]', 'The command to explain')
    .action(async (commandArgs) => {
        try {
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
        } catch (e) {
            showError(e.message || 'Unknown error occurred during execution.');
        }
    });

program.parse(process.argv);
