# Weekly Sprint Packet - Week 5

## Team

**Team Name**: Campus Helper  
**Sprint Number**: Sprint 4 (Week 5)  
**Repository**: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper  
**PM for this Sprint**: Ujwol Upreti

## Demo Script

1. Open Campus Helper.
2. Demonstrate the complete student journey.
3. Show AI assistant responses.
4. Show direct chat and unread count behavior.
5. Show marketplace, notes, timetable, network, and lost-and-found flows.
6. Show admin notice publishing.

## Sprint Goal

- Complete QA and testing.
- Implement admin workflows.
- Improve mobile responsiveness.
- Fix critical bugs and optimize.
- Finalize documentation.

## Current Board State

### To Do

- Production deployment.
- User feedback collection.
- Future enhancement planning.

### Doing

- Last-minute bug fixes.
- Build verification.
- Documentation cleanup.

### Done

- AI assistant with persisted chat history.
- Admin dashboard.
- Mobile-friendly dashboard.
- Security tightening for admin APIs.
- Build and TypeScript verification.

## What Shipped

- Full-stack Next.js application.
- MongoDB-backed data models.
- OpenAI-powered assistant.
- Admin notices and user management.
- Professional UI refresh.

## What Broke and Fixed

- Old AI SDK hook usage blocked message sending; migrated to AI SDK v6 transport.
- Google font network dependency broke builds; replaced with local font stacks.
- Admin APIs lacked strict role verification; JWT admin checks were added.

## Future Enhancements

- Native mobile app.
- Push notifications.
- Analytics dashboard.
- Voice AI queries.
- Multi-language support.

## Risks or Blockers

- Production environment secrets.
- OpenAI usage limits.
- Cloudinary configuration.
- MongoDB connection availability.

## Engineering Practices

- TypeScript validation.
- Production build checks.
- Security review for protected APIs.
- Documentation cleanup.

