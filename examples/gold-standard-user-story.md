---
id: US-007
title: User Password Reset
priority: High
size: M
persona: End User
features: [F-003, F-004]
domain: auth
---

# US-007: User Password Reset

> As an end user who has forgotten my password, I want to reset it via email verification, so that I can regain access to my account without contacting support.

## Acceptance Criteria

- [ ] Given a registered email address, when the user clicks "Forgot Password" and submits the form, then a password reset email is sent within 30 seconds containing a unique, time-limited reset link
- [ ] Given an unregistered email address, when the user submits the forgot password form, then the same success message is shown (no information leak about whether the email exists)
- [ ] Given a valid reset link, when the user clicks it within 1 hour, then they are taken to a "Set New Password" page with the token pre-filled
- [ ] Given an expired reset link (older than 1 hour), when the user clicks it, then they see a clear message: "This link has expired. Please request a new password reset." with a button to restart the flow
- [ ] Given the "Set New Password" page, when the user enters a new password shorter than 8 characters, then inline validation shows "Password must be at least 8 characters" before form submission
- [ ] Given a valid new password, when the user submits the form, then the password is updated, all existing sessions are invalidated, and the user is redirected to the login page with a success toast: "Password updated. Please log in with your new password."
- [ ] Given a user who has already used a reset link, when they try to use the same link again, then they see "This link has already been used" with a button to request a new one
- [ ] Given a user who requests multiple password resets, when they click any of the links, only the MOST RECENT link should work — all previous links are invalidated

## Notes

- **Rate limiting:** Max 3 password reset requests per email per hour. After that, show "Too many requests. Please try again in 1 hour."
- **Security:** Reset tokens must be cryptographically random (min 32 bytes), stored as hashed values in the database (not plaintext). Token comparison must be timing-safe.
- **Email deliverability:** The reset email subject should be "[App Name] — Reset your password" (not "Password Reset" which triggers spam filters). Include the user's name if available.
- **Accessibility:** The password field should have a show/hide toggle. The form should be fully navigable by keyboard. Error messages should be announced by screen readers (aria-live="polite").
- **Edge case:** If the user resets their password on one device while logged in on another, the other device's session should be terminated within 5 minutes (not immediately — allow for async session cleanup).
