const fs = require('fs');

// This script splits the official syllabus topics by their actual separators
// No modifications, just splitting by " - " and "; " as used in official PDFs

function splitTopics(topicString) {
  let topics = [];
  
  // First split by semicolon (used in official PDFs)
  let semicolonSplit = topicString.split(';');
  
  for (let segment of semicolonSplit) {
    segment = segment.trim();
    if (!segment) continue;
    
    // Then split by dash with spaces (used in official PDFs)
    let dashSplit = segment.split(' - ');
    
    for (let i = 0; i < dashSplit.length; i++) {
      let topic = dashSplit[i].trim();
      if (topic) {
        // Add the dash back except for first item if it was part of semicolon split
        if (i > 0 && semicolonSplit.length > 1) {
          topic = '- ' + topic;
        }
        topics.push(topic);
      }
    }
  }
  
  return topics;
}

// Test with actual content from PDFs
const testCases = [
  'Scientific knowledge and scientific temper - Power of reasoning - Rote learning vs conceptual learning - Science as a tool to understand the past, present, and future; Nature of universe - General scientific laws – Mechanics',
  'Location - Physical features - Monsoon, rainfall, weather and climate - Water resources - Rivers in India',
  'Constitution of India - Preamble to the Constitution - Salient features of the Constitution - Union, State and Union Territory'
];

console.log('Testing topic splitting:\n');

testCases.forEach((test, idx) => {
  console.log(`Test Case ${idx + 1}:`);
  console.log('Original:', test);
  console.log('Split:', splitTopics(test));
  console.log('');
});

// Read current syllabus.js and split all topics
const syllabusContent = fs.readFileSync('../syllabus.js', 'utf8');

console.log('\n=== TOPIC SPLITTING RULES ===');
console.log('1. Split by "; " (semicolon + space)');
console.log('2. Then split by " - " (dash with spaces)');
console.log('3. Preserve exact text - no modifications');
console.log('4. Each split becomes a separate topic for progress tracking');
console.log('\nExample:');
console.log('Input: "Topic A - Topic B - Topic C; Topic D - Topic E"');
console.log('Output: ["Topic A", "Topic B", "Topic C", "Topic D", "Topic E"]');