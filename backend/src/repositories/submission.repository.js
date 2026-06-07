import { db } from '../config/db.js';

class SubmissionRepository {
  async findAll() {
    return [...db.submissions];
  }

  async findById(id) {
    const submission = db.submissions.find(s => s.id === id);
    return submission ? { ...submission } : null;
  }

  async findByStudentId(studentId) {
    return db.submissions.filter(s => s.studentId === studentId).map(s => ({ ...s }));
  }

  async findByExamId(examId) {
    return db.submissions.filter(s => s.examId === examId).map(s => ({ ...s }));
  }

  async findByTeacherId(teacherId) {
    // Return all submissions where the exam belongs to this teacher
    const teacherExamIds = db.exams
      .filter(e => e.teacherId === teacherId)
      .map(e => e.id);
    
    return db.submissions
      .filter(s => teacherExamIds.includes(s.examId))
      .map(s => ({ ...s }));
  }

  async create(submissionData) {
    const newSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      examId: submissionData.examId,
      studentId: submissionData.studentId,
      answers: submissionData.answers || [],
      score: Number(submissionData.score) || 0,
      totalCorrect: Number(submissionData.totalCorrect) || 0,
      status: submissionData.status || 'fail',
      tabFocusLosses: Number(submissionData.tabFocusLosses) || 0,
      startedAt: submissionData.startedAt || new Date(),
      submittedAt: new Date()
    };
    
    db.submissions.push(newSubmission);
    return { ...newSubmission };
  }
}

export default new SubmissionRepository();
