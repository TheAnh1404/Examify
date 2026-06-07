import { db } from '../config/db.js';

class ExamRepository {
  async findAll() {
    return [...db.exams];
  }

  async findById(id) {
    const exam = db.exams.find(e => e.id === id);
    return exam ? { ...exam } : null;
  }

  async findByTeacherId(teacherId) {
    return db.exams.filter(e => e.teacherId === teacherId).map(e => ({ ...e }));
  }

  async create(examData) {
    const newExam = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: examData.title,
      description: examData.description,
      duration: Number(examData.duration) || 10,
      totalMarks: Number(examData.totalMarks) || 0,
      passPercentage: Number(examData.passPercentage) || 50,
      teacherId: examData.teacherId,
      questions: examData.questions || [],
      createdAt: new Date()
    };
    db.exams.push(newExam);
    return { ...newExam };
  }

  async update(id, updateData) {
    const index = db.exams.findIndex(e => e.id === id);
    if (index === -1) return null;

    db.exams[index] = {
      ...db.exams[index],
      ...updateData,
      id: db.exams[index].id, // keep original id
      teacherId: db.exams[index].teacherId // keep original teacher id
    };

    return { ...db.exams[index] };
  }

  async delete(id) {
    const index = db.exams.findIndex(e => e.id === id);
    if (index === -1) return false;

    db.exams.splice(index, 1);
    
    // Clean up related submissions in real DB, in-memory we can filter them out or keep them.
    // For in-memory consistency, let's remove matching submissions:
    db.submissions = db.submissions.filter(s => s.examId !== id);

    return true;
  }
}

export default new ExamRepository();
