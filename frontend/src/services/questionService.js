import { db } from '../data/mockData';

export const questionService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Enrich with subject details (simulated JOIN)
    const enriched = db.questions.map(q => {
      const subject = db.subjects.find(s => s.id === q.subjectId);
      return {
        ...q,
        subjectName: subject ? subject.name : 'Unknown Subject',
        subjectCode: subject ? subject.code : ''
      };
    });

    return { data: enriched };
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const question = db.questions.find(q => q.id === id);
    if (!question) return Promise.reject(new Error('Question not found'));
    
    const subject = db.subjects.find(s => s.id === question.subjectId);
    return {
      data: {
        ...question,
        subjectName: subject ? subject.name : 'Unknown Subject',
        subjectCode: subject ? subject.code : ''
      }
    };
  },

  getBySubject: async (subjectId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = db.questions.filter(q => q.subjectId === subjectId);
    return { data: list };
  },

  create: async (qData) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newQuestion = {
      id: `q-${Date.now()}`,
      subjectId: qData.subjectId,
      text: qData.text,
      options: [...qData.options],
      correctOption: Number(qData.correctOption),
      marks: Number(qData.marks) || 5,
      difficulty: qData.difficulty || 'Medium'
    };

    db.questions.push(newQuestion);
    db.save('questions');
    return { data: newQuestion };
  },

  update: async (id, qData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = db.questions.findIndex(q => q.id === id);
    if (idx === -1) return Promise.reject(new Error('Question not found'));

    db.questions[idx] = {
      ...db.questions[idx],
      subjectId: qData.subjectId || db.questions[idx].subjectId,
      text: qData.text || db.questions[idx].text,
      options: qData.options ? [...qData.options] : db.questions[idx].options,
      correctOption: qData.correctOption !== undefined ? Number(qData.correctOption) : db.questions[idx].correctOption,
      marks: qData.marks !== undefined ? Number(qData.marks) : db.questions[idx].marks,
      difficulty: qData.difficulty || db.questions[idx].difficulty
    };

    db.save('questions');
    return { data: db.questions[idx] };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const idx = db.questions.findIndex(q => q.id === id);
    if (idx === -1) return Promise.reject(new Error('Question not found'));

    // Verify if question is used in any published exam
    const isUsed = db.exams.some(e => e.questions.includes(id));
    if (isUsed) {
      return Promise.reject(new Error('Cannot delete question. It is currently linked in active exam questionnaires.'));
    }

    db.questions.splice(idx, 1);
    db.save('questions');
    return { data: { message: 'Question deleted' } };
  }
};
