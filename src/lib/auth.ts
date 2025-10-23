/**
 * Check if user is authenticated by checking sessionStorage
 */
export const isAuthenticated = (): boolean => {
  return sessionStorage.getItem('isAuthenticated') === 'true';
};

/**
 * Get authenticated user's email
 */
export const getUserEmail = (): string | null => {
  return sessionStorage.getItem('userEmail');
};

/**
 * Set authentication status
 */
export const setAuthentication = (email: string): void => {
  sessionStorage.setItem('isAuthenticated', 'true');
  sessionStorage.setItem('userEmail', email);
};

/**
 * Clear authentication status
 */
export const clearAuthentication = (): void => {
  sessionStorage.removeItem('isAuthenticated');
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('accountData');
};
