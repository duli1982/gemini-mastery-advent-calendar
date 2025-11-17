
export const getDailySurprise = async (prompt: string, day: number): Promise<string> => {
  // Return the static prompt content defined for each day.
  // We keep the async signature so the component code stays the same.
  return Promise.resolve(prompt);
};
