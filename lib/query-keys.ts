export const queryKeys = {
  invitationCodes: ['invitation-codes'] as const,
  invitationCode: (id: string) => ['invitation-codes', id] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  dashboard: ['dashboard'] as const,
  analytics: ['analytics'] as const,
} as const;
