# Kế hoạch Thiết kế: Chức năng Đăng ký & Phê duyệt Lớp học

Tài liệu này mô tả chi tiết kiến trúc và quy trình triển khai tính năng cho phép Sinh viên đăng ký tham gia lớp học qua mã lớp và Giáo viên phê duyệt yêu cầu đó.

## 1. Luồng nghiệp vụ (Business Workflow)

### 1.1. Phía Sinh viên (Student)
1.  **Tìm kiếm:** Sinh viên nhập **Mã lớp (Class Code)** vào ô tìm kiếm đặc biệt.
2.  **Xem trước:** Hệ thống hiển thị thông tin cơ bản của lớp (Tên lớp, Môn học, Giáo viên) để xác nhận.
3.  **Gửi yêu cầu:** Sinh viên nhấn "Gửi yêu cầu tham gia".
4.  **Theo dõi:** Sinh viên xem trạng thái yêu cầu (Đang chờ/Đã từ chối) trong danh sách lớp học.

### 1.2. Phía Giáo viên (Teacher)
1.  **Thông báo:** Giáo viên thấy số lượng yêu cầu đang chờ xử lý tại trang chi tiết lớp học.
2.  **Xử lý:**
    *   **Phê duyệt (Approve):** Hệ thống tự động thêm sinh viên vào danh sách lớp và thông báo cho sinh viên.
    *   **Từ chối (Reject):** Yêu cầu được đánh dấu là từ chối, sinh viên không được vào lớp.

---

## 2. Thiết kế Cơ sở dữ liệu (Database Design)

### 2.1. Enum mới
```prisma
enum EnrollmentStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### 2.2. Model mới: `EnrollmentRequest`
Quản lý các yêu cầu xin gia nhập lớp.

```prisma
model EnrollmentRequest {
  id          Int              @id @default(autoincrement())
  studentId   Int              @map("student_id")
  classroomId Int              @map("classroom_id")
  status      EnrollmentStatus @default(PENDING)
  message     String?          @db.Text
  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")

  student     User             @relation(fields: [studentId], references: [id], onDelete: Cascade)
  classroom   Classroom        @relation(fields: [classroomId], references: [id], onDelete: Cascade)

  @@unique([studentId, classroomId])
  @@map("enrollment_requests")
}
```

---

## 3. Danh sách API cần triển khai

### 3.1. Cho Sinh viên
*   `GET /api/classrooms/check-code/:code`: Kiểm tra thông tin lớp học từ mã lớp.
*   `POST /api/classrooms/enroll`: Gửi yêu cầu tham gia lớp.
*   `GET /api/classrooms/my-requests`: Lấy danh sách các yêu cầu tham gia lớp của sinh viên hiện tại.

### 3.2. Cho Giáo viên
*   `GET /api/classrooms/:id/enrollments`: Lấy danh sách yêu cầu đang chờ (`PENDING`) của một lớp học.
*   `PATCH /api/classrooms/enrollments/:requestId`: Cập nhật trạng thái yêu cầu (`APPROVED` hoặc `REJECTED`).

---

## 4. Thay đổi Giao diện (Frontend UI)

### 4.1. Trang ClassroomList (Sinh viên)
*   Thêm nút **"Join a Class"**.
*   Khi click hiện Modal:
    *   Ô nhập mã lớp.
    *   Hiển thị thông tin lớp ngay khi gõ xong mã.
    *   Nút "Send Join Request".
*   Thêm Tab "Waiting Approval" để hiển thị các lớp đang chờ.

### 4.2. Trang ClassroomDetail (Giáo viên)
*   Thêm Tab **"Enrollment Requests"** bên cạnh Tab "Students".
*   Hiển thị Badge số lượng yêu cầu đang chờ (ví dụ: `Requests (3)`).
*   Danh sách dạng bảng/card với các thông tin: Tên sinh viên, Email, Ngày gửi, Lời nhắn.
*   Hai nút hành động: **Approve** (Xanh) và **Reject** (Đỏ).

---

## 5. Các quy tắc Logic & Bảo mật (Business Rules)

1.  **Kiểm tra trùng lặp:** Sinh viên không thể gửi yêu cầu nếu đã là thành viên lớp hoặc đã có yêu cầu `PENDING`.
2.  **Transaction:** Khi phê duyệt (Approve), quá trình cập nhật trạng thái yêu cầu và tạo bản ghi `ClassStudent` phải nằm trong một Database Transaction để đảm bảo tính toàn vẹn dữ liệu.
3.  **Bảo mật:** Chỉ giáo viên tạo ra lớp học đó mới có quyền xem và xử lý các yêu cầu gia nhập lớp đó.
4.  **Từ chối:** Nếu bị từ chối, sinh viên có thể gửi lại yêu cầu sau một khoảng thời gian (tùy chọn) hoặc giáo viên có thể chặn vĩnh viễn (tùy chọn).

---
**Tài liệu được tạo bởi:** Gemini CLI Agent
**Ngày cập nhật:** 13/06/2026
