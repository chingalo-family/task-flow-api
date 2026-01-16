# API Implementation vs Mobile Data Model Gap Analysis

## Executive Summary
This document outlines the discrepancies found between the provided Mobile App Data Model for `Task`/`Subtask` and the current API implementation (Prisma Schema, Controllers, and Documentation).

## 1. Missing Fields in API

The following fields exist in the Mobile Data Model but are **missing** or partially implemented in the API:

| Field | Mobile Model | API Status | Notes |
|-------|--------------|------------|-------|
| `assignedUserIds` | `List<String>?` | **Missing** | API only has `userId` (owner). No support for multiple assignees. |
| `assignedToUserId` | `String?` | Missing | Could map to `userId` conceptually, but `userId` is usually "Creator". |
| `assignedToUsername`| `String?` | Missing | Not stored on Task. Needs relation lookup or denormalization. |
| `teamName` | `String?` | Missing | Not stored on Task. Available via `team` relation. |
| `projectName` | `String?` | Missing | `projectName` field exists in Prisma schema but might need manual population if not joined. |

## 2. Data Type & Serialization Mismatches

| Field | Mobile Expectation | API Implementation | Mismatch Details |
|-------|--------------------|--------------------|------------------|
| `tags` | `List<String>` | `String` (JSON) | API stores as JSON string and returns it as a **String** (e.g. `"[ \"tag\" ]"`). Mobile expects a native JSON Array. **API does not parse this before sending.** |
| `attachments` | `List<String>` | `String` (JSON) | Same as `tags`. API returns a stringified JSON, not an array. |
| `subtasks` | `List<Subtask>` | `List<Task>` | API models subtasks as recursive `Task` objects. Mobile uses a simplified `Subtask` model. |

## 3. Documentation vs Implementation Mismatches

| Context | Documentation says... | Code expects... | Verdict |
|---------|-----------------------|-----------------|---------|
| `createTask` (subtasks basic) | uses `status: "pending"` | uses `isCompleted: boolean` | **Docs are incorrect.** Code matches Mobile Model (`isCompleted`). |
| `getTasks` (tags/attachments) | Returns Array `["tag"]` | Returns String `"[ \"tag\" ]"`| **Docs are incorrect** or Code is incomplete (missing deserialization). |

## 4. Subtask Structure Differences

**Mobile Model:**
```dart
class Subtask {
  final String id;
  final String title;
  final bool isCompleted;
}
```

**API Model (Prisma):**
Subtasks are just `Task` records with a `parentTaskId`.
- They have all `Task` fields (`priority`, `description`, etc.), mostly unused for simple subtasks.
- `status` is used instead of `isCompleted`. The Controller maps `isCompleted` input to `status`.
- **Response Shape**: The API returns full `Task` objects in the `subtasks` array. The mobile app will receive extra fields it doesn't expect in `Subtask`, and might miss `isCompleted` property (API has `status`). **The Mobile App likely needs a getter or mapping for `isCompleted` from `status` if the API doesn't transform it.**

## 5. Logic Discrepancies

- **Assignees**: The mobile app supports multiple assignees (`assignedUserIds`), but the database schema only links a task to a single `User` (`userId`), which usually represents the creator. There is no many-to-many relationship table for assignments.

## Recommendations

1.  **Fix Serialization**: Update `TaskController` to parse `tags` and `attachments` from JSON strings to Arrays before sending the response.
2.  **Add Assignees Support**: Create a `TaskAssignee` join table (many-to-many between `Task` and `User`) to support `assignedUserIds`.
3.  **Update Subtask Response**: Ensure the API response for `subtasks` includes an `isCompleted` boolean field (computed from `status`) to match the Mobile expectation, or ensure the Mobile app handles `status`.
4.  **Correction Documentation**: Update `api-reference.md` to correctly reflect the `subtasks` input structure (using `isCompleted` instead of `status`).
