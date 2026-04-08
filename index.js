#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import ora from 'ora';

const program = new Command();

const commandsData = {
    'rm': {
        name: 'rm (Remove)',
        description: 'Used to delete files and directories.',
        risk: 'High',
        dangerousFlags: {
            '-rf': 'Forcefully and recursively deletes files/folders without asking. This is often permanent!',
            '-r': 'Recursively deletes directories and their contents.',
            '--no-preserve-root': 'Allows deleting the root directory (/). EXTREMELY DANGEROUS.'
        },
        safeness: 'Dangerous if used with flags like -rf on critical paths.',
        alternatives: ['trash-cli', 'mv to a /tmp folder instead']
    },
    'mv': {
        name: 'mv (Move)',
        description: 'Moves or renames files and directories.',
        risk: 'Low/Medium',
        dangerousFlags: {
            '-f': 'Overwrites existing files without asking.'
        },
        safeness: 'Generally safe, but be careful of overwriting.',
        alternatives: ['cp then rm', 'mv -i (interactive mode)']
    },
    'dd': {
        name: 'dd (Data Duplicator)',
        description: 'Converts and copies files, often used for low-level operations on disk drives.',
        risk: 'Critical',
        dangerousFlags: {
            'if=/dev/zero': 'Writing zeros to a disk wipes all data.',
            'of=/dev/sda': 'Writing directly to a hard drive can destroy your OS/data.'
        },
        safeness: 'Nicknamed "Disk Destroyer". Use with extreme caution.',
        alternatives: ['Etcher (for USBs)', 'cat (sometimes)']
    },
    'mkfs': {
        name: 'mkfs (Make File System)',
        description: 'Formats a disk partition with a file system.',
        risk: 'Critical',
        dangerousFlags: {},
        safeness: 'Formatting a partition deletes all data on it.',
        alternatives: ['GParted (Visual tool)']
    },
    'chmod': {
        name: 'chmod (Change Mode)',
        description: 'Changes the access permissions of files or directories.',
        risk: 'Medium',
        dangerousFlags: {
            '777': 'Gives everyone (user, group, others) read, write, and execute permissions. Security risk!',
            '-R': 'Changes permissions recursively. Can break system files if used on root folders.'
        },
        safeness: 'Safe for personal files, dangerous for system directories.',
        alternatives: ['Use specific permissions like 644 or 755']
    },
    'cp': {
        name: 'cp (Copy)',
        description: 'Copies files or directories.',
        risk: 'Low',
        dangerousFlags: {
            '-f': 'Overwrites existing files without asking.',
            '-r': 'Recursively copies directories.'
        },
        safeness: 'Safe, but watch out for overwriting existing files.',
        alternatives: ['rsync (more powerful)', 'cp -n (no clobber)']
    },
    'ln': {
        name: 'ln (Link)',
        description: 'Creates links (shortcuts) between files.',
        risk: 'Low',
        dangerousFlags: {
            '-s': 'Creates a symbolic link instead of a hard link.',
            '-f': 'Removes existing destination files.'
        },
        safeness: 'Generally safe, but can be confusing if you create circular links.',
        alternatives: []
    },
    'find': {
        name: 'find',
        description: 'Searches for files in a directory hierarchy.',
        risk: 'Low/Medium',
        dangerousFlags: {
            '-delete': 'Deletes the files it finds! Use with extreme care.',
            '-exec': 'Runs a command on every file found.'
        },
        safeness: 'Safe for searching, dangerous if combined with deletion flags.',
        alternatives: ['fd-find (modern alternative)']
    },
    'grep': {
        name: 'grep',
        description: 'Searches for patterns within files.',
        risk: 'Zero',
        dangerousFlags: {},
        safeness: 'Completely safe. It only reads files.',
        alternatives: ['ripgrep (rg) (much faster)']
    },
    'rd': {
        name: 'rd / rmdir (Windows)',
        description: 'Removes a directory.',
        risk: 'Medium/High',
        dangerousFlags: {
            '/S': 'Removes all directories and files in the specified directory in addition to the directory itself.',
            '/Q': 'Quiet mode: does not ask for confirmation!'
        },
        safeness: 'Safe for empty folders, but /S makes it like "rm -rf".',
        alternatives: []
    },
    'powershell': {
        name: 'PowerShell / pwsh',
        description: 'A cross-platform task automation solution made up of a command-line shell and a scripting language.',
        risk: 'Medium/High',
        dangerousFlags: {
            '-ExecutionPolicy Bypass': 'Bypasses security protections for running scripts. DANGEROUS!',
            '-EncodedCommand': 'Runs a base64 encoded command. Often used by malware to hide its intentions.'
        },
        safeness: 'Powerful and flexible. Be very careful with scripts from unknown sources.',
        alternatives: []
    },
    'del': {
        name: 'del / erase (Windows)',
        description: 'Deletes one or more files.',
        risk: 'High',
        dangerousFlags: {
            '/S': 'Deletes files from all subdirectories.',
            '/F': 'Forcefully deletes read-only files.',
            '/Q': 'Quiet mode: does not ask for confirmation!'
        },
        safeness: 'Permanently deletes files. Be careful with wildcards like *.*',
        alternatives: ['Move to Recycle Bin manually']
    },
    'format': {
        name: 'format (Windows)',
        description: 'Formats a disk (wipes all data and sets up a new file system).',
        risk: 'Critical',
        dangerousFlags: {},
        safeness: 'EXTREMELY DANGEROUS. Will wipe the entire drive specified.',
        alternatives: ['Disk Management (Visual tool)']
    },
    'ipconfig': {
        name: 'ipconfig (Windows)',
        description: 'Displays all current TCP/IP network configuration values.',
        risk: 'Zero',
        dangerousFlags: {
            '/release': 'Drops your current IP address.',
            '/renew': 'Requests a new IP address from the DHCP server.',
            '/flushdns': 'Clears the DNS resolver cache.'
        },
        safeness: 'Safe for viewing info. Network reset flags may temporarily drop your connection.',
        alternatives: []
    },
    'chown': {
        name: 'chown (Change Owner)',
        description: 'Changes the user and/or group ownership of files or directories.',
        risk: 'Medium',
        dangerousFlags: {
            '-R': 'Changes ownership recursively. Can break system permissions if used on /etc or /var.'
        },
        safeness: 'Safe for personal files, dangerous if used on system-critical folders.',
        alternatives: []
    },
    'tar': {
        name: 'tar (Tape Archiver)',
        description: 'Used to store, list, and extract files from archives (like .tar, .tar.gz).',
        risk: 'Low/Medium',
        dangerousFlags: {
            '-c': 'Create a new archive.',
            '-x': 'Extract files from an archive.',
            '--delete': 'Deletes files from the archive.'
        },
        safeness: 'Generally safe, but extracting archives can overwrite existing files.',
        alternatives: ['unzip (for .zip files)']
    },
    'wget': {
        name: 'wget',
        description: 'A non-interactive network downloader.',
        risk: 'Low/Critical',
        dangerousFlags: {
            '-O': 'Specify where to save the file. Can overwrite existing files.',
            '| bash': 'Pipes a downloaded script to the shell. DANGEROUS!'
        },
        safeness: 'Safe for downloading, but be careful of what you run after downloading.',
        alternatives: ['curl']
    },
    'kill': {
        name: 'kill',
        description: 'Sends a signal to a process (usually to stop it).',
        risk: 'Medium',
        dangerousFlags: {
            '-9': 'Forcefully kills the process. It doesn\'t get a chance to save data!',
            'killall': 'Kills all processes with a specific name.'
        },
        safeness: 'Safe for your own apps, but killing system processes can crash your computer.',
        alternatives: ['pkill']
    },
    'sudo': {
        name: 'sudo (SuperUser DO)',
        description: 'Executes a command with administrative (root) privileges.',
        risk: 'Medium/High',
        dangerousFlags: {},
        safeness: 'Power tools! Only use when you trust the command you are running.',
        alternatives: ['Use your user permissions whenever possible']
    },
    'systemctl': {
        name: 'systemctl',
        description: 'Controls the systemd system and service manager.',
        risk: 'Medium',
        dangerousFlags: {
            'stop': 'Stops a service. Can break things if it is a core service.',
            'disable': 'Prevents a service from starting automatically.'
        },
        safeness: 'Safe if you know which service you are interacting with.',
        alternatives: ['status (to just check)']
    },
    'apt-get': {
        name: 'apt-get / apt',
        description: 'Package handling utility for Debian/Ubuntu.',
        risk: 'Medium',
        dangerousFlags: {
            'purge': 'Removes a package AND its configuration files.',
            'autoremove': 'Removes unused dependencies. Generally safe but check the list!'
        },
        safeness: 'Safe, but always read the list of packages to be removed.',
        alternatives: ['apt list --upgradable']
    },
    'curl': {
        name: 'curl',
        description: 'Transfers data from or to a server.',
        risk: 'Low/Critical',
        dangerousFlags: {
            '| bash': 'Pipes a remote script directly into your shell. EXTREMELY DANGEROUS!',
            '| sh': 'Pipes a remote script directly into your shell. EXTREMELY DANGEROUS!'
        },
        safeness: 'Safe for downloading, but "curl | bash" is a major security risk.',
        alternatives: ['Download first, inspect, then run.']
    },
    'ls': {
        name: 'ls (List)',
        description: 'Lists directory contents.',
        risk: 'Zero',
        dangerousFlags: {},
        safeness: 'Completely safe. Use it as much as you want!',
        alternatives: []
    },
    ":(){ :|:& };:": {
        name: 'Fork Bomb',
        description: 'A shell function that calls itself multiple times until the system crashes.',
        risk: 'Critical',
        dangerousFlags: {},
        safeness: 'EXTREMELY DANGEROUS. Will freeze your computer.',
        alternatives: ["Don't run random strings from the internet!"]
    }
};

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
