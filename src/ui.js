import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';

export const showHeader = () => {
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

export const showUnknownCommandBox = (baseCommand) => {
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

export const displayExplanation = (data, fullCommand = '', isAI = false) => {
    let output = '';

    if (isAI) {
        output += chalk.italic.magenta(`🤖 AI Generated Explanation\n\n`);
    }

    output += chalk.bold.cyan(`Command: `) + chalk.white(data.name) + '\n';
    output += chalk.bold.cyan(`What it does: `) + chalk.white(data.description) + '\n';

    const riskColor = data.risk === 'Critical' ? chalk.red.bold : (data.risk === 'High' ? chalk.red : chalk.yellow);
    output += chalk.bold.cyan(`Risk Level: `) + riskColor(data.risk) + '\n';

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
