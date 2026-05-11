import Semester from '@/models/Semester';
import AcademicEvent from '@/models/AcademicEvent';

const DEFAULT_SEMESTERS = [
  {
    key: '2026-spring',
    name: '2026 1st Semester',
    year: 2026,
    term: 'spring' as const,
    registrationStart: new Date('2026-02-23'),
    registrationEnd: new Date('2026-02-25'),
    classStart: new Date('2026-03-02'),
    classEnd: new Date('2026-06-19'),
    examStart: new Date('2026-06-15'),
    examEnd: new Date('2026-06-19'),
    status: 'active' as const,
    events: [
      { title: '1st semester course registration', category: 'registration' as const, startDate: new Date('2026-02-09'), endDate: new Date('2026-02-11') },
      { title: '1st semester tuition registration', category: 'registration' as const, startDate: new Date('2026-02-23'), endDate: new Date('2026-02-25') },
      { title: 'Spring classes begin', category: 'classes' as const, startDate: new Date('2026-03-02') },
    ],
  },
  {
    key: '2026-summer',
    name: '2026 Summer Session',
    year: 2026,
    term: 'summer' as const,
    classStart: new Date('2026-06-22'),
    classEnd: new Date('2026-07-24'),
    status: 'upcoming' as const,
    events: [],
  },
  {
    key: '2026-fall',
    name: '2026 2nd Semester',
    year: 2026,
    term: 'fall' as const,
    registrationStart: new Date('2026-08-17'),
    registrationEnd: new Date('2026-08-20'),
    classStart: new Date('2026-08-31'),
    classEnd: new Date('2026-12-18'),
    examStart: new Date('2026-12-14'),
    examEnd: new Date('2026-12-18'),
    status: 'upcoming' as const,
    events: [
      { title: 'Fall semester registration', category: 'registration' as const, startDate: new Date('2026-08-17'), endDate: new Date('2026-08-20') },
      { title: 'Fall classes begin', category: 'classes' as const, startDate: new Date('2026-08-31') },
      { title: 'Final exam recommendation period', category: 'exams' as const, startDate: new Date('2026-12-14'), endDate: new Date('2026-12-18') },
    ],
  },
  {
    key: '2026-winter',
    name: '2026 Winter Session',
    year: 2026,
    term: 'winter' as const,
    registrationStart: new Date('2026-12-07'),
    registrationEnd: new Date('2026-12-08'),
    classStart: new Date('2026-12-21'),
    classEnd: new Date('2027-01-13'),
    status: 'upcoming' as const,
    events: [
      { title: 'Winter session registration', category: 'registration' as const, startDate: new Date('2026-12-07'), endDate: new Date('2026-12-08') },
      { title: 'Winter session begins', category: 'classes' as const, startDate: new Date('2026-12-21') },
    ],
  },
];

export async function ensureDefaultSemesters() {
  const count = await Semester.countDocuments();
  if (count > 0) return;

  for (const semester of DEFAULT_SEMESTERS) {
    const created = await Semester.create({
      name: semester.name,
      year: semester.year,
      term: semester.term,
      registrationStart: semester.registrationStart,
      registrationEnd: semester.registrationEnd,
      classStart: semester.classStart,
      classEnd: semester.classEnd,
      examStart: semester.examStart,
      examEnd: semester.examEnd,
      status: semester.status,
    });

    if (semester.events.length > 0) {
      await AcademicEvent.insertMany(
        semester.events.map((event) => ({
          semesterId: created._id,
          title: event.title,
          category: event.category,
          startDate: event.startDate,
          endDate: event.endDate,
        }))
      );
    }
  }
}
