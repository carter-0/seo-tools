const config = {
    // Information
    website: "osuconfigs.com",  // Your website

    // Content Style
    tone: 'natural',  // Tone of the content: 'formal', 'natural', 'casual' (allows custom strings as well)
    writingStyle: 'informative',  // Writing style: 'professional', 'creative', 'entertaining' (allows custom strings as well)
    readingLevel: '10th grade reading level, it should be easy to read using simple language. Explain everything to me like I’m an idiot.',  // Reading level: '8th grade', etc.
    highKeywordDensity: true,  // Should the content have a high keyword density?
    includeLSIKeywords: true,  // Include LSI keywords in the content?

    // Content Format
    recommendedParagraphLines: 2,  // Recommended number of lines per paragraph
    recommendedWordCount: 2000,  // 2,000 words recommended, any more and the model may not be able to handle it
    italicImportantSections: true,
    boldImportantSections: true,

    // Internal Links
    includeInternalLinks: false,  // Include internal links in the content?
    internalLinks: [],  // Array of links to be naturally linked to in the content

    // External Links
    includeExternalLinks: false,  // Include external links in the content?
    externalLinks: [],  // Array of links to be naturally linked to in the content
    generateExternalLinks: false,  // Ask the model to generate it's own external links to related content? (may hallucinate links)

    // Table of Contents
    includeTOC: true,  // Include a Table of Contents in the content?
    TOC: '[toc]',  // Table of Contents string to be used in the content

    // Other Sections
    includeIntroduction: true,  // Include an introduction section in the content?
    includeKeyTakeaways: true,  // Include Key Takeaways section in the content?
    includeTables: true,  // Include tables in the content?
    includeFAQs: true,  // Include an FAQ section in the content?
}

export default config;
