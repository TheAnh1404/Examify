import { db } from '../data/mockData';

export const subjectService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { data: [...db.subjects] };
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const subject = db.subjects.find(s => s.id === id);
    if (!subject) return Promise.reject(new Error('Subject not found'));
    return { data: { ...subject } };
  },

  create: async (subjectData) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    const codeExists = db.subjects.some(s => s.code.toUpperCase() === subjectData.code.toUpperCase());
    if (codeExists) return Promise.reject(new Error('Subject code already exists'));

    const newSubject = {
      id: `sbj-${Date.now()}`,
      code: subjectData.code.toUpperCase(),
      name: subjectData.name,
      description: subjectData.description || ''
    };

    db.subjects.push(newSubject);
    db.save('subjects');
    return { data: newSubject };
  },

  update: async (id, subjectData) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    const idx = db.subjects.findIndex(s => s.id === id);
    if (idx === -1) return Promise.reject(new Error('Subject not found'));

    db.subjects[idx] = {
      ...db.subjects[idx],
      code: subjectData.code ? subjectData.code.toUpperCase() : db.subjects[idx].code,
      name: subjectData.name || db.subjects[idx].name,
      description: subjectData.description !== undefined ? subjectData.description : db.subjects[idx].description
    };

    db.save('subjects');
    return { data: db.subjects[idx] };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const idx = db.subjects.findIndex(s => s.id === id);
    if (idx === -1) return Promise.reject(new Error('Subject not found'));

    // Check if questions are linked to this subject
    const hasQuestions = db.questions.some(q => q.subjectId === id);
    if (hasQuestions) {
      return Promise.reject(new Error('Cannot delete subject. It has questions linked in the Question Bank.'));
    }

    db.subjects.splice(idx, 1);
    db.save('subjects');
    return { data: { message: 'Subject deleted' } };
  }
};
