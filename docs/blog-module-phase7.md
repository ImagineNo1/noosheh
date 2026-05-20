# Blog Module – Phase 7 (Testing, Hardening, Performance, Documentation)

## Scope
This phase focuses on stabilization and production hardening of the blog module built in previous phases.

## What was validated
- Full app build (`npm run build`) to ensure type-safety, route compilation and CSS generation.
- Blog routes included in build output:
  - `/blog`
  - `/blog/[slug]`
  - `/blog/category/[slug]`
  - `/blog/tag/[slug]`
  - `/blog/author/[slug]`
  - `/pages/[slug]`
- Blog APIs included in build output:
  - Admin APIs under `/api/admin/blog/*`
  - Public APIs under `/api/blog/*`

## Hardening improvements applied
1. **Soft-delete aware public queries**
   - Public post listing and post-by-slug APIs only expose published and non-deleted posts.
2. **Comments endpoint safety**
   - Public comments fetch returns approved comments only.
   - Public comment submit remains rate-limited and sanitized.
3. **Sitemap / RSS consistency**
   - Sitemap includes only publishable blog content.
   - RSS includes only published and non-deleted posts.

## Performance notes
- Listing endpoints use server-side filters and result slicing (pagination baseline).
- Mongo indexes for blog entities are created in bootstrap (`ensureBlogIndexes`) to improve read performance:
  - unique slug indexes
  - status/date indexes
  - text index for post search fields

## Known gaps / Next actions
- Replace lightweight validators with Zod schemas for all blog endpoints.
- Add cursor-based pagination and projection controls in listing endpoints.
- Add integration tests for:
  - post workflow (`draft -> publish -> archive`)
  - comment moderation flow
  - sitemap/RSS content assertions
- Add role-specific RBAC (editor/seo-manager) beyond admin-only checks.

## Operational checklist
- Ensure `MONGODB_URI` and `JWT_SECRET` are set in production.
- Ensure absolute `site_url` exists in SEO settings for canonical/sitemap consistency.
- Review admin token expiry policy and rotation cadence.
