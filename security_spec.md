# Security Specification

## Data Invariants
1. A user can only access, create, update, or delete projects and notes that belong to their own authenticated user directory (`/users/{userId}/...`).
2. An unauthenticated user cannot read or write any project, profile, or note records.
3. Every write requires `request.auth.uid == userId` and identity matching.
4. User profiles can only be written by the owning authenticated user.
5. All document IDs must conform to valid string regex `^[a-zA-Z0-9_\-]+$` and length constraints (<= 128 characters).

## The Dirty Dozen Payloads & Validation Rules
1. Unauthenticated read of `/users/{userId}/projects/{projectId}` -> Denied.
2. User A attempting to read User B's `/users/{userIdB}/projects` -> Denied.
3. User A attempting to create a project in User B's subcollection -> Denied.
4. Payload with oversize project name (> 200 chars) -> Denied.
5. Payload with spoofed `ownerId` different from `request.auth.uid` -> Denied.
6. Injected junk characters in document ID -> Denied.
7. Unauthenticated write to notes -> Denied.
8. User A updating User B's profile -> Denied.
9. Deleting another user's project -> Denied.
10. Listing another user's projects collection -> Denied.
11. Blanket write to root documents -> Denied by default-deny catch-all.
12. Modifying immutable fields like document owner -> Denied.
