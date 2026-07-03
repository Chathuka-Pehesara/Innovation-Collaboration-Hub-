/**
 * @file        emailService.ts
 * @owner       IT Team
 * @description Email templates constructor sending updates warnings alerts.
 */

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  console.log(`[EmailService] Sending verification email to ${email} with token: ${token}`);
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  console.log(`[EmailService] Sending password reset email to ${email} with token: ${token}`);
};
