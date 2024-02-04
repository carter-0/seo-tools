# SEO Tools

it's just one tool right now

## Generate Blog Post tool

This tool takes a list of keywords and generates Markdown articles according to your config using the OpenAI API. Also optionally generates a meta description and cover image using DALL·E 3

### Installation & Usage

1. Clone this repo
2. `npm i`
3. `mv .env.example .env` and enter your OpenAI API key
4. Edit config.mjs to change config
5. Create `keywords.txt` and fill it with keywords you want to generate articles for. One keyword per line
6. `node generateBlogPosts.mjs`
7. Check your specified output path (default `blog/`)

### Why did you make this

I initially made this for personal use, then extracted it to this repo and cleaned it up a bit with the intention of selling it but I doubt enough people will find value in it so it's open source for now. Provides essentially the same functionality as tryjournalist.com, zimmwriter, etc which all cost $500+ per year but this is free.

### Limitations

- Struggles to generate long articles (max about 2k words)
- Only supports Markdown format
- Not really tested
