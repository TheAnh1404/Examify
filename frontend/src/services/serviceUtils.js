export const getApiErrorMessage = (error, fallback = 'Request failed') => {
  return error.response?.data?.message || error.message || fallback;
};

export const toUserView = (user) => ({
  ...user,
  name: user.fullName ?? user.name,
  avatarUrl: user.avatarUrl || null,
  schoolName: user.schoolName || null
});

export const toSubjectView = (subject) => ({
  ...subject,
  id: String(subject.id),
  questionCount: subject._count?.questions ?? subject.questionCount ?? 0,
  examCount: subject._count?.exams ?? subject.examCount ?? 0,
  assignmentNote: subject.teacherAssignments?.[0]?.note || ''
});
