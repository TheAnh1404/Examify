import SubmissionRepository from '../repositories/submission.repository.js';
import ExamRepository from '../repositories/exam.repository.js';
import UserRepository from '../repositories/user.repository.js';

class SubmissionController {
  async submitExam(req, res) {
    try {
      const { id: examId } = req.params;
      const { answers, tabFocusLosses, startedAt } = req.body;
      const studentId = req.user.id;

      // Find exam
      const exam = await ExamRepository.findById(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Không tìm thấy bài thi.' });
      }

      // Check if student already submitted this exam
      const existingSubmissions = await SubmissionRepository.findByStudentId(studentId);
      const alreadySubmitted = existingSubmissions.some(s => s.examId === examId);
      if (alreadySubmitted) {
        return res.status(400).json({ message: 'Bạn đã nộp bài thi này.' });
      }

      // Calculate score
      let score = 0;
      let totalCorrect = 0;

      exam.questions.forEach(q => {
        const studentAns = (answers || []).find(a => a.questionId === q.id);
        if (studentAns && Number(studentAns.selectedOption) === q.correctOption) {
          score += q.marks;
          totalCorrect += 1;
        }
      });

      // Calculate passing status
      const scorePercentage = exam.totalMarks > 0 ? (score / exam.totalMarks) * 100 : 0;
      const status = scorePercentage >= exam.passPercentage ? 'pass' : 'fail';

      // Create submission
      const submission = await SubmissionRepository.create({
        examId,
        studentId,
        answers: answers || [],
        score,
        totalCorrect,
        status,
        tabFocusLosses: Number(tabFocusLosses) || 0,
        startedAt: startedAt ? new Date(startedAt) : new Date()
      });

      return res.status(201).json({
        message: 'Nộp bài thi thành công.',
        submission,
        details: {
          title: exam.title,
          totalMarks: exam.totalMarks,
          passPercentage: exam.passPercentage,
          score,
          totalQuestions: exam.questions.length,
          totalCorrect,
          status
        }
      });
    } catch (error) {
      console.error('submitExam error:', error);
      return res.status(500).json({ message: 'Lỗi máy chủ khi nộp bài thi.' });
    }
  }

  async getStudentSubmissions(req, res) {
    try {
      const submissions = await SubmissionRepository.findByStudentId(req.user.id);
      
      // Enrich with exam details (simulated JOIN)
      const enriched = await Promise.all(
        submissions.map(async (sub) => {
          const exam = await ExamRepository.findById(sub.examId);
          return {
            ...sub,
            examTitle: exam ? exam.title : 'Bài thi đã xóa',
            examTotalMarks: exam ? exam.totalMarks : 0,
            examPassPercentage: exam ? exam.passPercentage : 50,
            questionCount: exam ? exam.questions.length : 0
          };
        })
      );

      return res.status(200).json(enriched);
    } catch (error) {
      console.error('getStudentSubmissions error:', error);
      return res.status(500).json({ message: 'Lỗi máy chủ khi tải bài đã nộp.' });
    }
  }

  async getTeacherSubmissions(req, res) {
    try {
      const submissions = await SubmissionRepository.findByTeacherId(req.user.id);

      // Enrich with exam details and student details (simulated JOINs)
      const enriched = await Promise.all(
        submissions.map(async (sub) => {
          const exam = await ExamRepository.findById(sub.examId);
          const student = await UserRepository.findById(sub.studentId);
          return {
            ...sub,
            examTitle: exam ? exam.title : 'Bài thi đã xóa',
            examTotalMarks: exam ? exam.totalMarks : 0,
            studentName: student ? student.name : 'Học sinh không xác định',
            studentEmail: student ? student.email : ''
          };
        })
      );

      return res.status(200).json(enriched);
    } catch (error) {
      console.error('getTeacherSubmissions error:', error);
      return res.status(500).json({ message: 'Lỗi máy chủ khi tải sổ điểm giáo viên.' });
    }
  }

  async getSubmissionById(req, res) {
    try {
      const { id } = req.params;
      const submission = await SubmissionRepository.findById(id);

      if (!submission) {
        return res.status(404).json({ message: 'Không tìm thấy bài nộp.' });
      }

      const exam = await ExamRepository.findById(submission.examId);
      const student = await UserRepository.findById(submission.studentId);

      // Access checks: Admin, the student who submitted, or the teacher who owns the exam
      const isOwnerStudent = req.user.role === 'student' && submission.studentId === req.user.id;
      const isOwnerTeacher = req.user.role === 'teacher' && exam && exam.teacherId === req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isOwnerStudent && !isOwnerTeacher && !isAdmin) {
        return res.status(403).json({ message: 'Bạn không có quyền xem bài nộp này.' });
      }

      // Return details along with the exam template (so they can match questions with selections)
      return res.status(200).json({
        submission,
        exam: exam ? {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          totalMarks: exam.totalMarks,
          passPercentage: exam.passPercentage,
          questions: exam.questions // safe to send correct answers now that it's submitted
        } : null,
        student: student ? {
          id: student.id,
          name: student.name,
          email: student.email
        } : null
      });
    } catch (error) {
      console.error('getSubmissionById error:', error);
      return res.status(500).json({ message: 'Lỗi máy chủ khi tải bài nộp.' });
    }
  }
}

export default new SubmissionController();
