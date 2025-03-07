
// Ensure that str is a valid string before calling trim(), or handle it as needed (throw error, log, etc.)
export const normalizeString = (str: string) => typeof str === 'string' ? str.trim().toLowerCase() : '';

