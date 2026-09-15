import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default class Gemini {

    ai;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }

    async process(userInput) {
        const response = await this.ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: userInput,
        });

        return response.text
    }

}