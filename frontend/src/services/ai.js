export const SUGGESTED_COPILOT_QUESTIONS = [
  "Create a personalized wellness plan.",
  "Help me improve my sleep.",
  "Suggest a balanced daily meal plan.",
  "Help me build a beginner workout routine.",
  "Explain how to improve my daily habits.",
  "What health patterns do you notice in my logs?",
  "How can I manage stress during a busy work week?",
  "Why might I be feeling tired in the afternoons?"
];


export function parseStructuredAIResponse(content) {
  if (!content) return null;

  const sections = {
    summary: '',
    whatYourDataShows: '',
    generalInformation: '',
    possibleNextSteps: [],
    whenToSeekHelp: '',
  };

  const lines = content.split('\n');
  let currentKey = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('### SUMMARY')) {
      currentKey = 'summary';
      continue;
    } else if (trimmed.startsWith('### WHAT YOUR DATA SHOWS')) {
      currentKey = 'whatYourDataShows';
      continue;
    } else if (trimmed.startsWith('### GENERAL INFORMATION')) {
      currentKey = 'generalInformation';
      continue;
    } else if (trimmed.startsWith('### POSSIBLE NEXT STEPS')) {
      currentKey = 'possibleNextSteps';
      continue;
    } else if (trimmed.startsWith('### WHEN TO SEEK PROFESSIONAL HELP')) {
      currentKey = 'whenToSeekHelp';
      continue;
    } else if (trimmed.startsWith('---') || trimmed.startsWith('**Medical Disclaimer:**')) {
      currentKey = null;
      continue;
    }

    if (currentKey === 'summary') {
      sections.summary += (sections.summary ? ' ' : '') + trimmed;
    } else if (currentKey === 'whatYourDataShows') {
      sections.whatYourDataShows += (sections.whatYourDataShows ? ' ' : '') + trimmed;
    } else if (currentKey === 'generalInformation') {
      sections.generalInformation += (sections.generalInformation ? ' ' : '') + trimmed;
    } else if (currentKey === 'possibleNextSteps') {
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed)) {
        sections.possibleNextSteps.push(trimmed.replace(/^[-•\d.]+\s*/, ''));
      }
    } else if (currentKey === 'whenToSeekHelp') {
      sections.whenToSeekHelp += (sections.whenToSeekHelp ? ' ' : '') + trimmed;
    }
  }

  return sections;
}
