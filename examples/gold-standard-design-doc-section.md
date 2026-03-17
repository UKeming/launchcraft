# Gold Standard — Design Doc Section Examples

This file shows the MINIMUM depth expected for each section in a domain design doc. Every design doc you write must match or exceed this level of detail.

---

## Example: Components Section

### BookmarkService

**Responsibility:** Manages CRUD operations for bookmarks including creation, retrieval, update, deletion, and batch operations. Enforces business rules (duplicate URL detection, tag limits, collection ownership).

**Public Interface:**
```typescript
class BookmarkService {
  create(userId: string, data: CreateBookmarkInput): Promise<Bookmark>
  getById(userId: string, bookmarkId: string): Promise<Bookmark | null>
  list(userId: string, filters: BookmarkFilters, pagination: PaginationInput): Promise<PaginatedResult<Bookmark>>
  update(userId: string, bookmarkId: string, data: UpdateBookmarkInput): Promise<Bookmark>
  delete(userId: string, bookmarkId: string): Promise<void>
  batchMove(userId: string, bookmarkIds: string[], targetCollectionId: string): Promise<BatchResult>
  batchTag(userId: string, bookmarkIds: string[], tags: string[]): Promise<BatchResult>
  detectDuplicate(userId: string, url: string): Promise<Bookmark | null>
}
```

**Dependencies:**
- `BookmarkRepository` — database access layer
- `TagService` — tag normalization and auto-suggestion
- `MetadataExtractor` — fetches title, description, favicon from URL
- `SearchIndex` — updates full-text search index on create/update/delete
- `EventBus` — publishes `bookmark.created`, `bookmark.updated`, `bookmark.deleted` events

**Internal Behavior:**
1. On `create`: validate URL format → check for duplicate → fetch metadata → create record → update search index → publish event
2. On `list` with filters: build query from filters (tags, collection, date range, search term) → execute with pagination → return with total count
3. `detectDuplicate` normalizes the URL (strip tracking params, normalize www/non-www, lowercase) before comparison
4. Batch operations use database transactions — all succeed or all fail, with per-item error reporting in `BatchResult`

**Error States:**
- `DuplicateBookmarkError` — URL already exists in user's bookmarks. Response includes the existing bookmark ID so the UI can offer "Go to existing" or "Save anyway"
- `CollectionNotFoundError` — target collection doesn't exist or user doesn't own it
- `TagLimitExceededError` — bookmark would exceed 20 tags. Response includes current count
- `MetadataFetchError` — could not extract title/description from URL. Non-blocking — bookmark is created with URL as title, user can edit later
- `RateLimitError` — user exceeded 100 creates per hour

---

## Example: API Design Section

### POST /api/bookmarks

**Description:** Create a new bookmark for the authenticated user.

**Authentication:** Required. Bearer token in `Authorization` header.

**Request:**
```json
{
  "url": "https://example.com/article",
  "title": "Optional custom title",
  "description": "Optional notes",
  "collectionId": "col_abc123",
  "tags": ["reading", "tech", "ai"]
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| url | string | yes | Valid URL, max 2048 chars |
| title | string | no | Max 200 chars. If omitted, auto-extracted from URL |
| description | string | no | Max 5000 chars |
| collectionId | string | no | Must be owned by user. Defaults to "Unsorted" |
| tags | string[] | no | Max 20 tags, each max 50 chars, auto-lowercased |

**Success Response (201):**
```json
{
  "id": "bm_xyz789",
  "url": "https://example.com/article",
  "title": "Example Article — A Deep Dive",
  "description": "",
  "favicon": "https://example.com/favicon.ico",
  "collectionId": "col_abc123",
  "tags": ["reading", "tech", "ai"],
  "createdAt": "2026-03-17T10:30:00Z",
  "updatedAt": "2026-03-17T10:30:00Z"
}
```

**Error Responses:**

| Status | Code | Message | When |
|--------|------|---------|------|
| 400 | `INVALID_URL` | "URL format is invalid" | Malformed URL |
| 400 | `TAG_LIMIT` | "Maximum 20 tags per bookmark" | tags.length > 20 |
| 401 | `UNAUTHORIZED` | "Authentication required" | Missing/invalid token |
| 404 | `COLLECTION_NOT_FOUND` | "Collection not found" | Invalid collectionId |
| 409 | `DUPLICATE_URL` | "Bookmark already exists" | URL already saved |
| 429 | `RATE_LIMITED` | "Too many requests" | > 100 creates/hour |

```json
// Error response shape
{
  "error": {
    "code": "DUPLICATE_URL",
    "message": "This URL is already in your bookmarks",
    "details": {
      "existingBookmarkId": "bm_existing123"
    }
  }
}
```

**Rate Limiting:** 100 requests per hour per user. `X-RateLimit-Remaining` header included in response.

---

## Key Principle

**Write each section as if a developer who has never seen this codebase needs to implement it from your doc alone.** If they would have questions, your doc is not detailed enough.
