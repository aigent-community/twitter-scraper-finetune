# Aigent Twitter Scraper

A comprehensive pipeline for generating AI character files and training datasets by analyzing public figures' online presence across Twitter. The pipeline consists of multiple stages that transform raw Twitter data into structured character profiles suitable for AI training.

> ⚠️ **IMPORTANT**: Create a new Twitter account for this tool. DO NOT use your main account as it may trigger Twitter's automation detection and result in account restrictions.

## Overview

This pipeline allows you to:
1. Scrape tweets from any public Twitter profile
2. Process and organize the raw data
3. Generate detailed character profiles
4. Create structured AI training datasets
5. Generate fine-tuned character models

## Pipeline Stages

### 1. Twitter Data Collection (`bun run twitter`)
Scrapes tweets from a specified Twitter account and saves them in a structured format:
- Raw tweets are stored in `pipeline/{username}/{date}/raw/tweets.json`
- URLs are extracted to `pipeline/{username}/{date}/raw/urls.txt`
- Media files are saved to `pipeline/{username}/{date}/raw/media/`

```bash
bun run twitter -- username
```

### 2. Character Generation (`bun run character`)
Processes the raw Twitter data to create a comprehensive character profile:
- Analyzes tweet patterns and content
- Extracts behavioral characteristics
- Identifies communication style
- Stores results in `characters/{username}.json`

```bash
bun run character -- username YYYY-MM-DD
```

### 3. Aigent Profile Generation (`bun run aigent`)
Creates a refined AI-ready profile by:
- Selecting representative tweet examples
- Extracting key topics using NLP
- Analyzing communication characteristics
- Identifying language patterns
- Generating a structured profile in `aigent/{username}.json`

```bash
bun run aigent -- username
```

The generated profile includes:
- `name`: Character's name
- `tweetExamples`: 10 representative tweets
- `characteristics`: AI-generated behavioral analysis
- `topics`: Key topics extracted using NLP
- `language`: Primary language used
- `twitterUsername`: Original Twitter handle

### 4. Model Fine-tuning (`bun run finetune`)
Uses the processed data to create custom AI models:
- Prepares training datasets
- Fine-tunes language models
- Creates character-specific models

```bash
bun run finetune           # Regular fine-tuning
bun run finetune:test      # Fine-tuning with test set
```

## Setup

1. Install dependencies:
   ```bash
   bun i
   ```

2. Copy `.env.example` to `.env` and configure:
   ```properties
   # (Required) Twitter Authentication
   TWITTER_USERNAME=     # your twitter username
   TWITTER_PASSWORD=     # your twitter password

   # (Optional) Scraping Configuration
   MAX_TWEETS=          # max tweets to scrape (default: 1000)
   MAX_RETRIES=         # max retries for scraping (default: 3)
   RETRY_DELAY=         # delay between retries (default: 5000)
   MIN_DELAY=           # minimum delay between requests (default: 1000)
   MAX_DELAY=           # maximum delay between requests (default: 3000)
   ```

## Example Workflow

1. Scrape tweets from a user:
   ```bash
   bun run twitter -- tomkowalczyk
   ```

2. Generate character profile:
   ```bash
   bun run character -- tomkowalczyk 2025-01-28
   ```

3. Create AI-ready profile:
   ```bash
   bun run aigent -- tomkowalczyk
   ```

4. Fine-tune model:
   ```bash
   bun run finetune
   ```

## Output Structure

```
project/
├── pipeline/                     # Raw scraped data
│   └── {username}/
│       └── {date}/
│           └── raw/
│               ├── tweets.json
│               ├── urls.txt
│               └── media/
├── characters/                   # Processed character profiles
│   └── {username}.json
└── aigent/                      # AI-ready profiles
    └── {username}.json
```

## Technical Details

- Uses `compromise` for natural language processing
- Implements intelligent topic extraction
- Performs sentiment and style analysis
- Generates weighted topic scoring
- Handles multi-word phrases and domain-specific terms

## Limitations

- Only works with public Twitter profiles
- Rate limited by Twitter's API restrictions
- English language focused analysis
- Requires manual Twitter authentication