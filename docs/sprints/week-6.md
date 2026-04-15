# Weekly Sprint Packet - Week 6

## Team

**Team Name**: Campus Helper  
**Sprint Number**: Sprint 5 (Week 6)  
**Repository**: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper  
**PM for this Sprint**: Kushal Kharka

## Demo Script

1. Open Campus Helper.
2. Log in as a student and show the dashboard.
3. Demonstrate AI chat with streaming response and saved history.
4. Navigate through timetable, marketplace, notes, network, chat, and lost-and-found.
5. Log in as an admin and publish a campus notice.
6. Show build output and GitHub documentation.

## Sprint Goal

- Deliver a polished demo-ready application.
- Complete admin notice publishing.
- Ensure GitHub repository is professional and organized.
- Preserve and update documentation from Week 1 through Week 6.
- Verify build stability.

## Current Board State

### To Do

- Deploy to hosting platform.
- Add production monitoring.
- Gather user feedback.

### Doing

- Final documentation and README updates.
- Repository cleanup.
- Demo preparation.

### Done

- Next.js app implemented.
- Authentication system completed.
- AI assistant working.
- MongoDB persistence working.
- Admin dashboard completed.
- Documentation updated.
- Build passed.

## What Shipped

- Demo-ready Campus Helper platform.
- Professional README.
- Updated sprint packets for Weeks 1-6.
- Preserved project and team documentation.
- Clean repository structure with current app source.

## What Broke and Fixed

- Admin login confusion was clarified: users log in with email/password, while admin status comes from `role: "admin"`.
- Admin notice publishing was secured by requiring verified JWT admin role.
- Build worker permissions were resolved during local verification.

## Definition of Done

- App builds successfully.
- Admin page publishes notices.
- AI assistant sends and streams messages.
- Documentation is current.
- Repository is pushed to GitHub.

## Testing and Checking Plan

- Run `npx tsc --noEmit`.
- Run `npm run build`.
- Test login and protected routes.
- Test AI assistant.
- Test admin notice publishing.
- Check responsive layout on dashboard and AI page.

## Next Step

- Deploy the app.
- Add seed/admin setup documentation.
- Add automated tests.
- Improve live notification behavior.

## Risks or Blockers

- Production secrets must be configured carefully.
- External services may fail during demo.
- Real campus data may still need validation.

## Engineering Practices

- Agile sprint workflow.
- GitHub documentation and evidence.
- Incremental feature delivery.
- Build verification before push.

