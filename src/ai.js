import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';
import { showUnknownCommandBox, displayExplanation } from './ui.js';
import { config } from './config.js';

export const askAI = async (fullCommand) => {
    const aiSpinner = ora(chalk.cyan('Consulting AI Smart Mode...')).start();
    try {
        const response = await axios.post(config.ai_url, {
            model: config.ai_model,
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
        }, { timeout: config.timeout || 10000 });

        aiSpinner.stop();
        
        try {
            const result = JSON.parse(response.data.response);
            displayExplanation(result, fullCommand, true);
            return result;
        } catch (parseError) {
            throw new Error('AI returned invalid format');
        }
    } catch (error) {
        aiSpinner.stop();
        showUnknownCommandBox(fullCommand.split(' ')[0]);
    }
};
