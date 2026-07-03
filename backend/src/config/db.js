import bcrypt from 'bcryptjs';

// Hàm hash đồng bộ cho dữ liệu mẫu
const hashPassword = (password) => bcrypt.hashSync(password, 10);

export const db = {
  users: [
    {
      id: "usr-student-809772",
      name: "Nguyễn Anh Tuấn",
      email: "tuan@examify.com",
      password: hashPassword("tuan123"),
      role: "student",
      createdAt: new Date("2026-06-07T11:13:29.772Z")
    },
    {
      id: "usr-admin-1",
      name: "Quản trị hệ thống",
      email: "admin@examify.com",
      password: hashPassword("admin123"),
      role: "admin",
      createdAt: new Date("2026-01-01T00:00:00.000Z")
    },
    {
      id: "usr-teacher-1",
      name: "Nguyễn Minh Anh",
      email: "teacher@examify.com",
      password: hashPassword("teacher123"),
      role: "teacher",
      createdAt: new Date("2026-01-05T00:00:00.000Z")
    },
    {
      id: "usr-student-1",
      name: "Trần Gia Bảo",
      email: "student@examify.com",
      password: hashPassword("student123"),
      role: "student",
      createdAt: new Date("2026-02-10T00:00:00.000Z")
    }
  ],
  
  exams: [
    {
      id: "ex-1",
      title: "Nhập môn Tin học",
      description: "Kiểm tra kiến thức về khái niệm lập trình cơ bản, phép tính nhị phân và phần cứng máy tính.",
      duration: 15, // phút
      totalMarks: 30,
      passPercentage: 50,
      teacherId: "usr-teacher-1",
      questions: [
        {
          id: "q-1-1",
          text: "CPU là viết tắt của cụm từ nào?",
          options: [
            "Bộ xử lý trung tâm",
            "Bộ máy tính cá nhân",
            "Bộ hợp nhất xử lý trung tâm",
            "Bộ xử lý điều khiển"
          ],
          correctOption: 0,
          marks: 10
        },
        {
          id: "q-1-2",
          text: "Công nghệ nào sau đây không phải là ngôn ngữ lập trình?",
          options: [
            "Python",
            "HTML",
            "C++",
            "Java"
          ],
          correctOption: 1,
          marks: 10
        },
        {
          id: "q-1-3",
          text: "Biểu diễn nhị phân của số thập phân 5 là gì?",
          options: [
            "100",
            "101",
            "110",
            "111"
          ],
          correctOption: 1,
          marks: 10
        }
      ],
      createdAt: new Date("2026-05-15T09:00:00.000Z")
    },
    {
      id: "ex-2",
      title: "React nâng cao và quản lý trạng thái",
      description: "Đánh giá kiến thức về Hook, tối ưu hiệu năng, context và chiến lược quản lý trạng thái trong React.",
      duration: 20,
      totalMarks: 40,
      passPercentage: 60,
      teacherId: "usr-teacher-1",
      questions: [
        {
          id: "q-2-1",
          text: "Hook nào dùng để lưu kết quả tính toán giữa các lần render?",
          options: [
            "useEffect",
            "useCallback",
            "useMemo",
            "useRef"
          ],
          correctOption: 2,
          marks: 20
        },
        {
          id: "q-2-2",
          text: "Mục đích chính của React.memo là gì?",
          options: [
            "Lưu trạng thái",
            "Ngăn component render lại trừ khi props thay đổi",
            "Xử lý tác vụ bất đồng bộ",
            "Cập nhật DOM trực tiếp"
          ],
          correctOption: 1,
          marks: 20
        }
      ],
      createdAt: new Date("2026-06-01T14:30:00.000Z")
    }
  ],

  submissions: [
    {
      id: "sub-1",
      examId: "ex-1",
      studentId: "usr-student-1",
      answers: [
        { questionId: "q-1-1", selectedOption: 0 }, // đúng, 10
        { questionId: "q-1-2", selectedOption: 1 }, // đúng, 10
        { questionId: "q-1-3", selectedOption: 0 }  // sai, 0
      ],
      score: 20,
      totalCorrect: 2,
      status: "pass", // 20/30 = 66.6% (điểm đạt >= 50%)
      tabFocusLosses: 0,
      startedAt: new Date("2026-06-05T10:00:00.000Z"),
      submittedAt: new Date("2026-06-05T10:08:32.000Z")
    }
  ]
};
