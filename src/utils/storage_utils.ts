export const saveUserMessage = (message: string): void => {
  const messages = getUserMessages();
  messages.push(message);
  localStorage.setItem('userMessages', JSON.stringify(messages));
};

export const getUserMessages = (): string[] => {
  const messages = localStorage.getItem('userMessages');
  return messages ? JSON.parse(messages) : [];
};
