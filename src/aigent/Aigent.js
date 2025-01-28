import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import nlp from 'compromise';
dotenv.config();

class Aigent {
  constructor(username) {
    this.username = username;
    this.outputDir = 'aigents';
    this.characterFile = null;
  }

  async initialize() {
    // Create aigent directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir);
    }

    // Find character file
    const characterPath = path.join('characters', `${this.username}.json`);
    if (!fs.existsSync(characterPath)) {
      throw new Error(`Character file not found for username: ${this.username}`);
    }

    this.characterFile = characterPath;
  }

  getRandomElements(array, n) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }

  // Helper function to clean and normalize text
  cleanText(text) {
    return text.toLowerCase()
      .replace(/https?:\/\/\S+/g, '')  // Remove URLs
      .replace(/[^\w\s#]/g, ' ')       // Keep hashtags but remove other special chars
      .replace(/\s+/g, ' ')            // Normalize whitespace
      .trim();
  }

  // Helper function to check if a term should be excluded
  shouldExcludeTerm(term) {
    const commonWords = new Set([
      'you', 'your', 'our', 'we', 'they', 'them', 'its', "it's", 'this', 'that',
      'what', 'who', 'when', 'where', 'why', 'how', 'the', 'and', 'but', 'or',
      'for', 'nor', 'yet', 'so', 'im', "i'm", 'mine', 'yours', 'his', 'hers',
      'some', 'any', 'many', 'few', 'all', 'both', 'time', 'people', 'thing',
      'way', 'day', 'man', 'men', 'woman', 'women', 'today', 'tomorrow', 'year',
      'month', 'week', 'here', 'there', 'now', 'then', 'always', 'never', 'just',
      'don t', 'don', 'amp'
    ]);

    return term.length < 3 || 
           commonWords.has(term) || 
           /^\d+$/.test(term);
  }

  getMostCommonTopics(tweets, n = 7) {
    const termCount = {};
    const phraseCount = {};
    
    tweets.forEach(tweet => {
      const cleanedTweet = this.cleanText(tweet);
      const doc = nlp(cleanedTweet);

      // 1. Extract hashtags (they're often good topic indicators)
      const hashtags = cleanedTweet.match(/#[\w]+/g) || [];
      hashtags.forEach(tag => {
        const cleanTag = tag.slice(1).toLowerCase(); // Remove # and lowercase
        if (!this.shouldExcludeTerm(cleanTag)) {
          termCount[cleanTag] = (termCount[cleanTag] || 0) + 3; // Give hashtags more weight
        }
      });

      // 2. Extract noun phrases (2-3 word combinations)
      const nounPhrases = doc.match('#Noun+ (#Preposition? #Noun+)?')
        .not('#Pronoun')
        .out('array');
      
      nounPhrases.forEach(phrase => {
        const cleanPhrase = phrase.toLowerCase().trim();
        if (cleanPhrase.split(' ').length > 1 && !this.shouldExcludeTerm(cleanPhrase)) {
          phraseCount[cleanPhrase] = (phraseCount[cleanPhrase] || 0) + 2;
        }
      });

      // 3. Extract important single nouns
      const nouns = doc.match('#Noun')
        .not('#Pronoun')
        .not('#Url')
        .not('#Email')
        .not('#PhoneNumber')
        .not('#Date')
        .not('#Money')
        .out('array');

      nouns.forEach(noun => {
        const cleanNoun = noun.toLowerCase().trim();
        if (!this.shouldExcludeTerm(cleanNoun)) {
          termCount[cleanNoun] = (termCount[cleanNoun] || 0) + 1;
        }
      });

      // 4. Extract domain-specific terms
      const domainTerms = doc.match('(#Technology|#Health|#Science|#Business|#Finance|#Crypto|#AI|#Software|#Medical)')
        .out('array');
      
      domainTerms.forEach(term => {
        const cleanTerm = term.toLowerCase().trim();
        if (!this.shouldExcludeTerm(cleanTerm)) {
          termCount[cleanTerm] = (termCount[cleanTerm] || 0) + 2;
        }
      });
    });

    // Combine single terms and phrases, giving preference to meaningful phrases
    const allTopics = {
      ...termCount,
      ...phraseCount
    };

    // Sort by frequency and get top N terms/phrases
    return Object.entries(allTopics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n)
      .map(([term]) => term);
  }

  generateCharacteristics(tweets) {
    const characteristics = [];
    
    // Process all tweets together for overall analysis
    const doc = nlp(tweets.join(' '));
    
    // 1. Most common actions (verbs)
    const commonVerbs = doc.verbs()
      .not('#Auxiliary')  // Remove auxiliary verbs like "is", "have", etc.
      .out('array')
      .slice(0, 5);
    if (commonVerbs.length > 0) {
      characteristics.push(`Frequently talks about ${commonVerbs.join(', ')}.`);
    }

    // 2. Common topics with their associated actions
    const topicActions = doc.match('#Noun+ (#Verb|#Adjective)')
      .out('array')
      .slice(0, 3);
    if (topicActions.length > 0) {
      characteristics.push(`Often discusses ${topicActions.join('; ')}.`);
    }

    // 3. Sentiment analysis using positive/negative words
    const positiveWords = doc.match('#Positive').out('array');
    const negativeWords = doc.match('#Negative').out('array');
    const sentiment = positiveWords.length > negativeWords.length ? 'positive' : 'neutral';
    characteristics.push(`Generally maintains a ${sentiment} tone in discussions.`);

    // 4. Technical vs Casual analysis
    const technicalTerms = doc.match('(#Technical|#Science|#Technology)').out('array');
    const casualTerms = doc.match('(#Expression|#Slang)').out('array');
    if (technicalTerms.length > casualTerms.length) {
      characteristics.push('Uses technical language and industry-specific terms frequently.');
    } else {
      characteristics.push('Communicates in an accessible, conversational style.');
    }

    // 5. Interaction style
    const questions = doc.questions().length;
    const exclamations = doc.match('!').length;
    if (questions > tweets.length * 0.1) {
      characteristics.push('Engages actively with audience through questions and discussions.');
    }
    if (exclamations > tweets.length * 0.1) {
      characteristics.push('Expresses ideas with enthusiasm and energy.');
    }

    return characteristics;
  }

  async processCharacter() {
    // Read character file
    const characterData = JSON.parse(fs.readFileSync(this.characterFile, 'utf8'));

    const postExamples = characterData.postExamples || [];
    
    // Extract relevant information
    const processedData = {
      name: characterData.name || '',
      tweetExamples: this.getRandomElements(postExamples, 10), // Take 10 random tweets
      characteristics: this.generateCharacteristics(postExamples), // Generate characteristics using NLP
      topics: this.getMostCommonTopics(postExamples, 10), // Get 10 most common topics using compromise
      language: 'en', // Default to English since most tweets are in English
      twitterUsername: this.username
    };

    // Save processed data
    const outputPath = path.join(this.outputDir, `${this.username}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));

    return processedData;
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const username = args[0];

if (!username) {
  console.error('Please provide a username as an argument');
  process.exit(1);
}

const aigent = new Aigent(username);

aigent.initialize()
  .then(() => aigent.processCharacter())
  .then(data => {
    console.log('Successfully processed character data:');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
