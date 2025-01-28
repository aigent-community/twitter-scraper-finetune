# Degen Scraper

Pipeline for generating AI character files and training datasets by scraping public figures' online presence across Twitter and blogs.

> ⚠️ **IMPORTANT**: Create a new Twitter account for this tool. DO NOT use your main account as it may trigger Twitter's automation detection and result in account restrictions.

## Setup

1. Install dependencies:
   
   ```bash
   bun i
   ```

2. Copy the `.env.example` into a `.env` file:
   
   ```properties
   # (Required) Twitter Authentication
   TWITTER_USERNAME=     # your twitter username
   TWITTER_PASSWORD=     # your twitter password

   # (Optional) Scraping Configuration
   MAX_TWEETS=          # max tweets to scrape
   MAX_RETRIES=         # max retries for scraping
   RETRY_DELAY=         # delay between retries
   MIN_DELAY=           # minimum delay between requests
   MAX_DELAY=           # maximum delay between requests
   ```

## Usage

### Twitter Collection
```bash
bun run twitter -- username
```
Example: `bun run twitter -- tomkowalczyk`

### Generate Character
```bash
bun run character -- username YYYY-MM-DD
```
Example: `bun run character -- tomkowalczyk 2025-01-28`

### Finetune
```bash
bun run finetune
```

### Finetune (with test)
```bash
bun run finetune:test
```