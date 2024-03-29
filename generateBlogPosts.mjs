import OpenAI from 'openai';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import config from './config.mjs';
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
});

const currentDate = new Date();
const year = currentDate.getFullYear();
const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Months are 0 based, so +1 and pad with 0 if needed
const day = ("0" + currentDate.getDate()).slice(-2); // Pad with 0 if needed

const formattedDate = `${year}-${month}-${day}`;

async function main() {
    if (!fs.existsSync(config.keywordSource)) {
        console.error("[ERROR]: Keyword source file does not exist.");
        process.exit(1);
    }

    const questions = fs.readFileSync(config.keywordSource, 'utf-8').split('\n');

    if (questions.length === 0) {
        console.error("[ERROR]: No questions found in the keyword source file.");
        process.exit(1);
    }

    for (const question of questions) {
        let keyword = question

        keyword = keyword.trim();
        keyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);

        let urlKeyword = keyword.replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

        if (!fs.existsSync(config.outputDirectory)) {
            try {
                fs.mkdirSync(config.outputDirectory);
            } catch (err) {
                console.error("[ERROR]: Error creating output directory.", err);
                process.exit(1);
            }
        }

        if (!fs.existsSync(`${config.outputDirectory}/${urlKeyword}`)) {
            try {
                fs.mkdirSync(`${config.outputDirectory}/${urlKeyword}`);
            } catch (err) {
                console.error("[ERROR]: Error creating output directory.", err);
                process.exit(1);
            }
        }

        if (config.generateArticle) {
            console.log(`[Article #${questions.indexOf(question)}] Generating article for keyword: ${question}`)

            const chatCompletion = await openai.chat.completions.create({
                messages: [{ role: 'user', content: `
Create an article that will be ${config.recommendedWordCount ?? `2,000`} words on the keyword "${keyword}" with the goal of ranking #1 on Google. Respond with only the article in markdown format (in a code block). Include the keyword in the first paragraph. Try to include the keyword in most headings too. ${config.highKeywordDensity ? `You want to aim for a high keyword density. ` : ""}Make sure you follow the format I've given you below too e.g. ${config.includeTOC ? `toc` : ""}${config.includeTOC && config.includeKeyTakeaways ? `/key takeaways` : config.includeKeyTakeaways ? `key takeaways. ` : ""}${config.includeLSIKeywords ? `Generate a long list of LSI and NLP keywords related to my keyword and add them naturally. Also include any other words related to the keyword.` : ""}
${config.includeFAQs ?
`Include FAQs section too, with relevant questions.` : ""}
Format with markdown in a code block.
${config.italicImportantSections ?
`Italic the most important keywords` : ""}
Use some bullet points but also plenty of paragraphs
${config.includeExternalLinks ? (
`Link out within the 2nd and 3rd paragraph using ${config.generateExternalLinks ? `external links you create yourself` : `a choice of the best fitting external links from the following`}, not at the end, to the resources. ${config.generateExternalLinks ? "" : `Here is the list of external links: ${config.externalLinks.toString()}`}.`
) : ""}
${config.includeLSIKeywords ?
`Include LSI and NLP keywords inside the content naturally.` : ""}
Write in markdown format in a code block so it can be easily copied.
Create a ${config.recommendedWordCount ?? `2,000`} word article to be published on my website ${config.website}.
${config.includeKeyTakeaways ?
`Write a 2-3 sentence keyword optimized introduction to hook people in
Don’t call it introduction.` : ""}
${config.includeTOC ?
`Include ${config.TOC} at the top, after introduction. ${config.TOC} is paragraph text.
${config.includeKeyTakeaways ? `Create a h2 called key takeaways after the ${config.TOC}. Add bullet points to the key takeaways.` : ""}` : config.includeKeyTakeaways ? `Create a h2 called key takeaways towards the beginning of the article. Add bullet points to the key takeaways.` : ""}
Include relevant headings. All headings must be h2 or h3.
Insert a line break between each sentence. No exceptions.
Writing style = ${config.writingStyle}. No fluff. ${config.tone}. Write at ${config.readingLevel}
${config.includeFAQs ?
`Include an FAQs section too: h3s for the question, paragraph text for the answers` : ""}
${config.includeInternalLinks ? `Add links to the user's provided internal links: ${config.internalLinks.toString()}.` : ""}
Every section must be separated by h2 headings.
${config.boldImportantSections ?
`Bolden most important keywords in the article` : ""}
${config.includeTables ?
`Include tables throughout the content with relevant facts` : ""}
Every sentence on a new line with line breaks.
No fluff or filler.
No paragraphs longer than ${config.recommendedParagraphLines ?? `1-2`} lines.
Format it neatly and split up the text with h2 headings.
Every paragraph needs a heading.
Restructure the content with the appropriate H2 headings for clarity.
${config.includeIntroduction &&
`Answer the question quickly in the introduction + explain why people should keep reading.`}
Your entire response must be valid Markdown.
Never hallucinate links: Insert links naturally throughout the content, inside the paragraph text (not the headings).
Ensure it's clear and simplified, easy enough for anyone to understand, including those without prior knowledge on the topic.
Make sure the article is in a code block and in markdown format.
`.trim() }],
                model: config.model,
                max_tokens: 4096
            });

            let formattedContent = chatCompletion.choices[0].message.content;

            if (formattedContent.includes('```markdown')) {
                formattedContent = formattedContent.replace('```markdown', '```')
            }

            // get content inside code block
            formattedContent = formattedContent.substring(formattedContent.indexOf('```') + 3);
            formattedContent = formattedContent.substring(0, formattedContent.indexOf('```'));

            let descriptionCompletion = "";

            if (config.generateDescription) {
                descriptionCompletion = await openai.chat.completions.create({
                    messages: [{ role: 'user', content: `Respond with an appropriate, SEO optimised description for a blog post with the title ${keyword}. Your entire response should be the description.` }],
                    model: config.model,
                    max_tokens: 196
                });
            }

            formattedContent = 
`---
title: '${keyword}'
date: '${formattedDate}'
${config.generateDescription ? `description: ${descriptionCompletion.choices[0].message.content}` : ""}
---
${formattedContent}`.trim()

            await writeFile(`${config.outputDirectory}/${urlKeyword}/${urlKeyword}.md`, formattedContent)
            console.log(`[Article #${questions.indexOf(question)}] Article content generated for keyword ${question}`)
        }

        if (config.generateImage) {
            console.log(`[Article #${questions.indexOf(question)}] Generating image for keyword: ${question}`)
            const image = await openai.images.generate({
                model: "dall-e-3",
                prompt: `A cover image for a blog post titled "${keyword}"`,
                n: 1,
                size: "1024x1024",
                quality: 'hd'
            });
            
            const image_url = image.data[0].url;
            
            const response = await fetch(image_url)
            const buffer = Buffer.from(await response.arrayBuffer())
            await writeFile(`${config.outputDirectory}/${urlKeyword}/${urlKeyword}.png`, buffer)
            console.log(`[Article #${questions.indexOf(question)}] Image generated for keyword ${question}`)
        }
    }
}

main();
