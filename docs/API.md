# ParkBound API Documentation

Base URL (local): `http://localhost:4000`

All request and response bodies are JSON. Protected routes require a header:

```
Authorization: Bearer <token>
```

The token is returned by register and login.

---

## Auth

### POST /api/auth/register
Create an account.

Request body:
```json
{ "username": "jamie", "email": "jamie@example.com", "password": "password123" }
```
Success `201`:
```json
{ "token": "<jwt>", "user": { "id": 1, "username": "jamie" } }
```
Errors: `400` validation failed, `409` email or username already taken.

### POST /api/auth/login
Log in.

Request body:
```json
{ "email": "jamie@example.com", "password": "password123" }
```
Success `200`:
```json
{ "token": "<jwt>", "user": { "id": 1, "username": "jamie" } }
```
Errors: `400` validation failed, `401` wrong email or password.

### GET /api/auth/me  (protected)
Return the current user.

Success `200`:
```json
{ "user": { "id": 1, "username": "jamie", "email": "jamie@example.com", "created_at": "..." } }
```

---

## Parks and days

### GET /api/parks
List the parks.

Success `200`:
```json
{ "parks": [ { "id": "mk", "name": "Magic Kingdom" }, ... ] }
```

### GET /api/days?park=hs&date=2026-07-30
Return a generated lineup and the films to bound to.

Success `200`:
```json
{
  "park": "hs",
  "date": "2026-07-30",
  "films": ["Hercules", "Encanto"],
  "events": [
    { "title": "Hercules: A Hero's Anthem", "type": "musical", "location": "Backlot Stage", "film": "Hercules", "time": "10:30 AM" }
  ]
}
```
Errors: `400` unknown park or invalid date.

---

## Plans (all protected)

### GET /api/plans
List the current user's plans, newest visit date first.

### GET /api/plans/:id
Return one plan with its items.
Errors: `404` if the plan does not exist or is not yours.

### POST /api/plans
Create a plan, optionally with starting items.

Request body:
```json
{
  "title": "Birthday trip",
  "park": "hs",
  "visit_date": "2026-07-30",
  "bound_film": "Hercules",
  "notes": "Matching coral and gold",
  "items": [
    { "event_title": "Hercules: A Hero's Anthem", "event_time": "10:30 AM", "event_type": "musical", "location": "Backlot Stage" }
  ]
}
```
Success `201`: `{ "id": 12 }`

### PUT /api/plans/:id
Update a plan's title, bound_film, notes, or visit_date.

### DELETE /api/plans/:id
Delete a plan. Its items are removed automatically.

### POST /api/plans/:id/items
Add one show to a plan.

Request body:
```json
{ "event_title": "Encanto LIVE!", "event_time": "1:45 PM", "event_type": "musical", "location": "Sunset Showcase Theater" }
```
Success `201`: `{ "id": 45 }`

### DELETE /api/plans/:id/items/:itemId
Remove one show from a plan.

---

## Status codes used

- `200` success
- `201` created
- `400` validation error (body includes `errors` array)
- `401` missing or invalid token
- `404` resource not found or not owned by the user
- `409` conflict (duplicate email or username)
- `500` server error
