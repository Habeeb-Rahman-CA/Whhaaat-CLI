#!/usr/bin/env node

import { Command } from 'commander';
import ora from 'ora';
import { showHeader } from '../src/ui.js';
import { explainCommand } from '../src/explain.js';

const program = new Command();

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
