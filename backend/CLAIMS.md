# Claims App — Decision & Scope

## Decision

The `claims` app is delivered as a **functional scaffold** with the complete data model, endpoints, and workflow, but without business automation around coverage-rule matching or automated payouts. This mirrors the pattern already adopted for `risk_management` (placeholder until ML/business rules are validated).

## Why a Scaffold (not full automation)

The Claims domain depends on inputs that are not yet finalized in the project:

- **Coverage rules** — `insurer.CoverageRule` is in place but its eligibility logic (which project types / risk levels / claim types are covered, caps, deductibles) is not formally defined.
- **Payouts** — no payment processor / treasury integration is in place to disburse funds.
- **Document evidence** — no storage pattern (S3? local?) or required document types have been agreed.

Adding automated decisioning without those decisions would have to be reworked later. The scaffold gives a working surface (UI-ready API, audit trail, role-based access) so the final business rules can be plugged in without a migration.

## What is shipped

### Models

- `Claim` — main entity (status, type, priority, claimant, optional investment, resolution)
- `ClaimNote` — discussion thread attached to a claim; supports internal-only notes

### Status Workflow

```
SUBMITTED → UNDER_REVIEW → APPROVED → PAID → CLOSED
                 └─────────→ REJECTED → CLOSED
```

Status transitions are managed by `INSURER` / `ADMIN` via `PATCH /api/claims/<pk>/review/`.

### Endpoints

| Method | Endpoint | Permission | Purpose |
|--------|----------|------------|---------|
| GET | `/api/claims/` | IsAuthenticated | Investors see their own; Insurer/Admin see all |
| POST | `/api/claims/` | IsAuthenticated | Submit a new claim |
| GET | `/api/claims/<pk>/` | IsAuthenticated (owner or reviewer) | Read claim detail |
| DELETE | `/api/claims/<pk>/` | IsAuthenticated (owner or reviewer) | Delete only while `SUBMITTED` |
| PATCH | `/api/claims/<pk>/review/` | INSURER or ADMIN | Update status/priority/assignment/resolution |
| POST | `/api/claims/<pk>/notes/` | IsAuthenticated (owner or reviewer) | Add comment; internal flag requires reviewer |

All endpoints are documented via `drf-spectacular` and visible in `/api/docs/`.

### Permissions

- **Investors** see and create their own claims and notes; cannot mark notes internal.
- **Insurer / Admin** see all claims, can review, can close, can post internal notes.

## Deferred Items

| Item | Why deferred | Where to plug in |
|------|--------------|------------------|
| Automatic eligibility check against `CoverageRule` | Coverage business rules not finalized | `claims/services.py` to be added; call from `ClaimReviewView.patch` |
| Automated payout on `APPROVED → PAID` | Treasury integration not in scope | `claims/services.py::process_payout` |
| Document uploads for evidence | Storage backend not chosen | Extend `Claim` with a `documents` JSONField or FK to a generic `Attachment` app |
| Email notifications on status change | Email service not configured (see T11) | Hook in `claims/signals.py` after `post_save` |

## Next Steps (when business rules are validated)

1. Add `claims/services.py` with `evaluate_eligibility(claim) -> CoverageRule | None`.
2. Add `claims/services.py::process_payout(claim)` calling the future payouts module.
3. Add `claims/signals.py` to emit notifications on status change (depends on T11).
4. Wire a frontend `/claims` page (My Claims for investors; Review Queue for insurer/admin).
5. Add document uploads for evidence.