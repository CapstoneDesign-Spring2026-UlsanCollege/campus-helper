const COMMON_WEAK_TERMS = [
  'password',
  '123456',
  'qwerty',
  'admin',
  'welcome',
  'campus',
  'ulsan',
];

export const PASSWORD_REQUIREMENTS = [
  'At least 10 characters',
  'At least one uppercase letter',
  'At least one lowercase letter',
  'At least one number',
  'At least one special character',
  'No spaces',
] as const;

export function validateStrongPassword(password: string, context?: { email?: string; name?: string }) {
  const issues: string[] = [];
  const normalized = password.trim();

  if (password !== normalized) {
    issues.push('Password cannot start or end with spaces.');
  }

  if (/\s/.test(password)) {
    issues.push('Password cannot contain spaces.');
  }

  if (password.length < 10) {
    issues.push('Password must be at least 10 characters long.');
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('Password must include at least one uppercase letter.');
  }

  if (!/[a-z]/.test(password)) {
    issues.push('Password must include at least one lowercase letter.');
  }

  if (!/[0-9]/.test(password)) {
    issues.push('Password must include at least one number.');
  }

  if (!/[^A-Za-z0-9\s]/.test(password)) {
    issues.push('Password must include at least one special character.');
  }

  const lowerPassword = password.toLowerCase();
  if (COMMON_WEAK_TERMS.some((term) => lowerPassword.includes(term))) {
    issues.push('Password is too easy to guess. Avoid common words like "password", "admin", or "123456".');
  }

  const emailLocalPart = context?.email?.split('@')[0]?.trim().toLowerCase();
  if (emailLocalPart && emailLocalPart.length >= 3 && lowerPassword.includes(emailLocalPart)) {
    issues.push('Password cannot include your email name.');
  }

  const compactName = context?.name?.replace(/\s+/g, '').trim().toLowerCase();
  if (compactName && compactName.length >= 3 && lowerPassword.includes(compactName)) {
    issues.push('Password cannot include your name.');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
