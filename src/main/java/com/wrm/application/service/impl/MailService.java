package com.wrm.application.service.impl;

import com.wrm.application.constant.enums.RentalType;
import com.wrm.application.model.Appointment;
import com.wrm.application.model.Rental;
import com.wrm.application.model.Request;
import com.wrm.application.model.User;
import com.wrm.application.repository.RentalRepository;
import com.wrm.application.service.IMailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MailService implements IMailService {
    private final JavaMailSender mailSender;
    private final RentalRepository rentalRepository;

    private void sendEmail(String to, String subject, String text) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text, true);

        mailSender.send(message);
    }

    @Async
    @Override
    public void sendPasswordResetEmail(String to, String newPassword) throws MessagingException {
        String subject = "Đặt lại mật khẩu";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>Đặt lại mật khẩu thành công</h2>"
                + "<p>Xin chào,</p>"
                + "<p>Mật khẩu của bạn đã được đặt lại thành công. Vui lòng sử dụng mật khẩu sau để đăng nhập:</p>"
                + "<div style='margin: 20px 0; padding: 10px; background-color: #f2f2f2; border-radius: 5px;'>"
                + "<strong style='font-size: 18px;'>" + newPassword + "</strong>"
                + "</div>"
                + "<p>Vì lý do bảo mật, hãy đổi mật khẩu này sau khi đăng nhập.</p>"
                + "<p style='color: #888; font-size: 12px;'>Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng liên hệ ngay với đội ngũ hỗ trợ của chúng tôi.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                + "<p style='font-size: 12px; color: #aaa;'>Trân trọng,<br/>Đội ngũ Warehouse Hub</p>"
                + "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    @Scheduled(cron = "0 0 0 * * ?")
    public void sendRentalExpirationReminders() throws MessagingException {
        LocalDateTime today = LocalDateTime.now();
        LocalDateTime reminderDate = today.plusDays(10);

        LocalDateTime startOfDay = reminderDate.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<Rental> rentals = rentalRepository.findByEndDateRange(startOfDay, endOfDay);

        for (Rental rental : rentals) {
            String email = rental.getCustomer().getEmail();
            String subject = "Nhắc nhở sắp hết hạn hợp đồng thuê";
            String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                    + "<h2 style='color: #4a90e2;'>Nhắc nhở sắp hết hạn hợp đồng thuê</h2>"
                    + "<p>Kính gửi " + rental.getCustomer().getFullName() + ",</p>"
                    + "<p>Đây là thông báo nhắc nhở rằng hợp đồng thuê của bạn cho lô hàng <strong>#" + rental.getLot().getId() + "</strong> "
                    + "sẽ hết hạn vào ngày <strong>" + rental.getEndDate() + "</strong>.</p>"
                    + "<p>Vui lòng thực hiện các hành động cần thiết để gia hạn hoặc hoàn tất hợp đồng của bạn.</p>"
                    + "<p style='color: #888; font-size: 12px;'>Nếu bạn đã gia hạn hợp đồng, vui lòng bỏ qua email này.</p>"
                    + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                    + "<p style='font-size: 12px; color: #aaa;'>Trân trọng,<br/>Đội ngũ Warehouse Hub</p>"
                    + "</div>";

            sendEmail(email, subject, htmlContent);
        }
    }

    @Async
    @Override
    public void sendAppointmentConfirmationEmail(String to, Appointment appointment) throws MessagingException {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy 'lúc' HH:mm");
        String formattedDate = appointment.getAppointmentDate().format(formatter);

        String subject = "Xác nhận lịch hẹn";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>Xác nhận lịch hẹn</h2>"
                + "<p>Xin chào,</p>"
                + "<p>Lịch hẹn của bạn đã được đặt thành công. Dưới đây là chi tiết:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Mã lịch hẹn:</strong></td><td>" + appointment.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Khách hàng:</strong></td><td>" + appointment.getCustomer().getFullName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Kho hàng:</strong></td><td>" + appointment.getWarehouse().getName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Địa điểm:</strong></td><td>" + appointment.getWarehouse().getAddress() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Ngày hẹn:</strong></td><td>" + formattedDate + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Trạng thái:</strong></td><td>" + appointment.getStatus() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p>Chúng tôi mong được phục vụ bạn.</p>"
                + "<p style='color: #888; font-size: 12px;'>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ đội hỗ trợ của chúng tôi.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                + "<p style='font-size: 12px; color: #aaa;'>Trân trọng,<br/>Đội ngũ Warehouse Hub</p>"
                + "</div>";

        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendTaskAssignmentNotification(String to, Appointment appointment) throws MessagingException {
        String subject = "Thông báo nhiệm vụ mới";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>Thông báo nhiệm vụ mới</h2>"
                + "<p>Xin chào,</p>"
                + "<p>Bạn đã được giao một nhiệm vụ mới. Dưới đây là chi tiết:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Mã lịch hẹn:</strong></td><td>" + appointment.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Khách hàng:</strong></td><td>" + appointment.getCustomer().getFullName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Kho hàng:</strong></td><td>" + appointment.getWarehouse().getName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Ngày hẹn:</strong></td><td>" + appointment.getAppointmentDate() + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Trạng thái:</strong></td><td style='color: #4a90e2; font-weight: bold;'>" + appointment.getStatus() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p>Vui lòng đảm bảo hoàn thành nhiệm vụ kịp thời.</p>"
                + "<p style='color: #888; font-size: 12px;'>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ đội ngũ quản trị.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                + "<p style='font-size: 12px; color: #aaa;'>Trân trọng,<br/>Đội ngũ Warehouse Hub</p>"
                + "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendAppointmentUpdateNotification(String to, Appointment appointment) throws MessagingException {
        String subject = "Cập nhật lịch hẹn";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2; text-align: center;'>Trạng thái lịch hẹn được cập nhật</h2>"
                + "<p>Xin chào,</p>"
                + "<p>Lịch hẹn của bạn đã được cập nhật. Dưới đây là thông tin chi tiết mới:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Mã lịch hẹn:</strong></td><td>" + appointment.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Khách hàng:</strong></td><td>" + appointment.getCustomer().getFullName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Kho hàng:</strong></td><td>" + appointment.getWarehouse().getName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Ngày hẹn:</strong></td><td>" + appointment.getAppointmentDate() + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Trạng thái:</strong></td><td style='color: #4a90e2; font-weight: bold;'>" + appointment.getStatus() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p>Vui lòng đăng nhập vào tài khoản của bạn để biết thêm chi tiết hoặc quản lý lịch hẹn.</p>"
                + "<p style='color: #888; font-size: 12px;'>Nếu có bất kỳ câu hỏi nào, hãy liên hệ với đội hỗ trợ của chúng tôi.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                + "<p style='font-size: 12px; color: #aaa;'>Trân trọng,<br/>Đội ngũ Warehouse Hub</p>"
                + "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendRentalCreationNotification(String to, Rental rental) throws MessagingException {
        String subject = "Tạo hợp đồng thuê mới";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>Hợp đồng thuê mới được tạo</h2>"
                + "<p>Xin chào Quản trị viên,</p>"
                + "<p>Một hợp đồng thuê mới đã được tạo. Dưới đây là thông tin chi tiết:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Mã hợp đồng thuê:</strong></td><td>" + rental.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Khách hàng:</strong></td><td>" + rental.getCustomer().getFullName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Kho hàng:</strong></td><td>" + rental.getWarehouse().getName() + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Trạng thái:</strong></td><td>" + rental.getStatus() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p>Trân trọng,<br/>Đội ngũ Warehouse Hub</p>"
                + "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendRequestCreationNotification(String to, Request request) throws MessagingException {
        String subject = "Yêu cầu mới được tạo";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>Yêu cầu mới được tạo</h2>"
                + "<p>Xin chào Quản trị viên,</p>"
                + "<p>Một yêu cầu mới đã được tạo. Dưới đây là thông tin chi tiết:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Mã yêu cầu:</strong></td><td>" + request.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Người tạo:</strong></td><td>" + request.getUser().getFullName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Email:</strong></td><td>" + request.getUser().getEmail() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Vai trò:</strong></td><td>" + request.getUser().getRole().getRoleName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Loại yêu cầu:</strong></td><td>" + request.getType().getContent() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Mô tả:</strong></td><td>" + request.getDescription() + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Trạng thái:</strong></td><td style='color: #4a90e2; font-weight: bold;'>" + request.getStatus() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p>Trân trọng,<br/>Đội ngũ Warehouse Hub</p>"
                + "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendRequestUpdateNotification(String to, Request request) throws MessagingException {
        String subject = "Cập nhật trạng thái yêu cầu";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>Trạng thái yêu cầu được cập nhật</h2>"
                + "<p>Xin chào,</p>"
                + "<p>Yêu cầu của bạn đã được cập nhật. Dưới đây là thông tin chi tiết:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Mã yêu cầu:</strong></td><td>" + request.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Loại yêu cầu:</strong></td><td>" + request.getType().getContent() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Mô tả:</strong></td><td>" + request.getDescription() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Trạng thái:</strong></td><td style='color: #4a90e2; font-weight: bold;'>" + request.getStatus() + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Phản hồi của quản trị viên:</strong></td><td>" + request.getAdminResponse() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p>Trân trọng,<br/>Đội ngũ Warehouse Hub</p>"
                + "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendVerificationEmail(String email, String token) throws MessagingException {
        String subject = "Xác minh địa chỉ email của bạn";
        String htmlContent = "<div style='font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;'>"
                + "<div style='background-color: #4a90e2; color: white; padding: 20px; text-align: center;'>"
                + "<h2 style='margin: 0; font-size: 24px;'>Xác minh email của bạn</h2>"
                + "</div>"
                + "<div style='padding: 20px; color: #333;'>"
                + "<p>Xin chào,</p>"
                + "<p>Cảm ơn bạn đã đăng ký tài khoản với chúng tôi. Để hoàn tất quá trình đăng ký, vui lòng nhấp vào liên kết bên dưới để xác minh địa chỉ email của bạn:</p>"
                + "<div style='text-align: center; margin: 20px;'>"
                + "<a href='http://localhost:8080/users/verify?token=" + token + "' style='background-color: #4a90e2; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;'>Xác minh email</a>"
                + "</div>"
                + "<p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>"
                + "</div>"
                + "<div style='background-color: #f2f2f2; padding: 10px; text-align: center; font-size: 12px; color: #777;'>"
                + "<p>Bản quyền © 2024 Warehouse Hub. Mọi quyền được bảo lưu.</p>"
                + "</div>"
                + "</div>"
                + "</div>";
        sendEmail(email, subject, htmlContent);
    }

    @Async
    @Override
    public void sendPaymentDueNotification(String to, Rental rental) throws MessagingException {
        String subject = "Thông báo đến hạn thanh toán";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>Thông báo đến hạn thanh toán</h2>"
                + "<p>Kính gửi " + rental.getCustomer().getFullName() + ",</p>";

        if (rental.getRentalType() == RentalType.MONTHLY) {
            htmlContent += "<p>Hợp đồng thuê hàng tháng của bạn cho lô hàng <strong>#" + rental.getLot().getId() + "</strong> "
                    + "đã đến hạn thanh toán. Vui lòng thanh toán trước ngày <strong>" + rental.getStartDate().plusDays(37).toLocalDate() + "</strong>.</p>";
        } else if (rental.getRentalType() == RentalType.FLEXIBLE) {
            htmlContent += "<p>Hợp đồng thuê linh hoạt của bạn cho lô hàng <strong>#" + rental.getLot().getId() + "</strong> "
                    + "sẽ kết thúc vào ngày <strong>" + rental.getEndDate().toLocalDate() + "</strong>. Vui lòng thực hiện thanh toán.</p>";
        }

        htmlContent += "<p style='color: #888; font-size: 12px;'>Nếu bạn đã thực hiện thanh toán, vui lòng bỏ qua email này.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                + "<p style='font-size: 12px; color: #aaa;'>Trân trọng,<br/>Đội ngũ Warehouse Hub</p>"
                + "</div>";

        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendOverdueNotification(Rental rental) throws MessagingException {
        String email = rental.getCustomer().getEmail();
        String subject = "Thông báo hợp đồng quá hạn";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: red;'>Thông báo hợp đồng quá hạn</h2>"
                + "<p>Kính gửi " + rental.getCustomer().getFullName() + ",</p>"
                + "<p>Hợp đồng thuê của bạn cho lô hàng <strong>#" + rental.getLot().getId() + "</strong> đã quá hạn thanh toán.</p>"
                + "<p>Vui lòng thanh toán sớm nhất để tránh các rủi ro hoặc chi phí phát sinh.</p>"
                + "<p>Trân trọng,<br/>Đội ngũ Warehouse Hub</p>"
                + "</div>";

        sendEmail(email, subject, htmlContent);
    }

    @Async
    @Override
    public void sendAccountCreationEmail(User user) throws MessagingException {
        String email = user.getEmail();
        String subject = "Thông báo tài khoản mới";
        String htmlContent = "<div style='font-family: Arial, sans-serif;'>"
                + "<h2>Xin chào " + user.getFullName() + ",</h2>"
                + "<p>Bạn đã được tạo một tài khoản trên hệ thống Warehouse Hub bởi quản trị viên.</p>"
                + "<p>Thông tin tài khoản của bạn như sau:</p>"
                + "<ul>"
                + "<li><strong>Email:</strong> " + user.getEmail() + "</li>"
                + "<li><strong>Mật khẩu:</strong> " + user.getPassword() + "</li>"
                + "</ul>"
                + "<p>Vui lòng đăng nhập và đổi mật khẩu sau khi đăng nhập lần đầu.</p>"
                + "<p>Trân trọng,<br/>Đội ngũ hỗ trợ Warehouse Hub</p>"
                + "</div>";

        sendEmail(email, subject, htmlContent);
    }
}
