import ExamRepository from '../repositories/exam.repository.js';

class ExamController {
  async getAllExams(req, res) {
    try {
      const exams = await ExamRepository.findAll();
      
      // If student, remove question details or just send exam metadata to save bandwidth
      // Let's return the metadata (no questions array, or questions array without correct answers)
      const sanitizedExams = exams.map(exam => {
        const { questions, ...metadata } = exam;
        return {
          ...metadata,
          questionCount: questions.length
        };
      });

      return res.status(200).json(sanitizedExams);
    } catch (error) {
      console.error('getAllExams error:', error);
      return res.status(500).json({ message: 'Internal server error fetching exams.' });
    }
  }

  async getTeacherExams(req, res) {
    try {
      const exams = await ExamRepository.findByTeacherId(req.user.id);
      return res.status(200).json(exams);
    } catch (error) {
      console.error('getTeacherExams error:', error);
      return res.status(500).json({ message: 'Internal server error fetching teacher exams.' });
    }
  }

  async getExamById(req, res) {
    try {
      const { id } = req.params;
      const exam = await ExamRepository.findById(id);

      if (!exam) {
        return res.status(404).json({ message: 'Exam not found.' });
      }

      // Check access & scrub answers for students
      if (req.user.role === 'student') {
        const scrubbedQuestions = exam.questions.map(q => {
          const { correctOption, ...safeQuestion } = q;
          return safeQuestion;
        });

        return res.status(200).json({
          ...exam,
          questions: scrubbedQuestions
        });
      }

      // Teachers or Admins get full access
      return res.status(200).json(exam);
    } catch (error) {
      console.error('getExamById error:', error);
      return res.status(500).json({ message: 'Internal server error fetching exam details.' });
    }
  }

  async createExam(req, res) {
    try {
      const { title, description, duration, totalMarks, passPercentage, questions } = req.body;

      if (!title || !duration) {
        return res.status(400).json({ message: 'Title and duration are required.' });
      }

      // Format questions and calculate automatic total marks if not explicitly set
      const formattedQuestions = (questions || []).map((q, idx) => ({
        id: q.id || `q-${Date.now()}-${idx}`,
        text: q.text,
        options: q.options || [],
        correctOption: Number(q.correctOption) || 0,
        marks: Number(q.marks) || 1
      }));

      const calculatedTotalMarks = totalMarks || formattedQuestions.reduce((sum, q) => sum + q.marks, 0);

      const exam = await ExamRepository.create({
        title,
        description,
        duration: Number(duration),
        totalMarks: Number(calculatedTotalMarks),
        passPercentage: Number(passPercentage) || 50,
        teacherId: req.user.id,
        questions: formattedQuestions
      });

      return res.status(201).json(exam);
    } catch (error) {
      console.error('createExam error:', error);
      return res.status(500).json({ message: 'Internal server error creating exam.' });
    }
  }

  async updateExam(req, res) {
    try {
      const { id } = req.params;
      const { title, description, duration, totalMarks, passPercentage, questions } = req.body;

      const exam = await ExamRepository.findById(id);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found.' });
      }

      // Verify ownership (only the teacher who created it, or an admin, can update)
      if (req.user.role === 'teacher' && exam.teacherId !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized. You do not own this exam.' });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (duration !== undefined) updateData.duration = Number(duration);
      if (passPercentage !== undefined) updateData.passPercentage = Number(passPercentage);

      if (questions !== undefined) {
        updateData.questions = questions.map((q, idx) => ({
          id: q.id || `q-${Date.now()}-${idx}`,
          text: q.text,
          options: q.options,
          correctOption: Number(q.correctOption) || 0,
          marks: Number(q.marks) || 1
        }));
        updateData.totalMarks = totalMarks || updateData.questions.reduce((sum, q) => sum + q.marks, 0);
      } else if (totalMarks !== undefined) {
        updateData.totalMarks = Number(totalMarks);
      }

      const updatedExam = await ExamRepository.update(id, updateData);
      return res.status(200).json(updatedExam);
    } catch (error) {
      console.error('updateExam error:', error);
      return res.status(500).json({ message: 'Internal server error updating exam.' });
    }
  }

  async deleteExam(req, res) {
    try {
      const { id } = req.params;
      const exam = await ExamRepository.findById(id);

      if (!exam) {
        return res.status(404).json({ message: 'Exam not found.' });
      }

      // Verify ownership
      if (req.user.role === 'teacher' && exam.teacherId !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized. You do not own this exam.' });
      }

      const success = await ExamRepository.delete(id);
      if (success) {
        return res.status(200).json({ message: 'Exam deleted successfully.' });
      } else {
        return res.status(400).json({ message: 'Failed to delete exam.' });
      }
    } catch (error) {
      console.error('deleteExam error:', error);
      return res.status(500).json({ message: 'Internal server error deleting exam.' });
    }
  }
}

export default new ExamController();
