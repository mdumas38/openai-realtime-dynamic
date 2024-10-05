// src/utils/promptHandler.ts

export const handlePrompt = (message: string, summary: string) => {
  let promptList = getPromptList();
  const contextualPrompt = `Given the following conversation summary: "${summary}", generate an image based on: ${message}`;
  promptList.push(contextualPrompt);
  localStorage.setItem('promptList', JSON.stringify(promptList));
  console.log("Added new contextual prompt:", contextualPrompt);
  console.log("Updated list of prompts:", promptList);
};

export const getPromptList = (): string[] => {
  const promptListString = localStorage.getItem('promptList');
  const promptList = promptListString ? JSON.parse(promptListString) : [];
  console.log("Returning prompt list:", promptList);
  return promptList;
};