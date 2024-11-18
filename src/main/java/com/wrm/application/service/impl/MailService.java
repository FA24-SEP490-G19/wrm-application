package com.wrm.application.service.impl;

import com.wrm.application.model.Appointment;
import com.wrm.application.model.Rental;
import com.wrm.application.model.RentalDetail;
import com.wrm.application.model.Request;
import com.wrm.application.repository.RentalDetailRepository;
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
import java.util.List;

@Service
@RequiredArgsConstructor
public class MailService implements IMailService {
    private final JavaMailSender mailSender;
    private final RentalDetailRepository rentalDetailRepository;

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
        String subject = "Password Reset";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>Password Reset Successful</h2>"
                + "<p>Hello,</p>"
                + "<p>Your password has been reset successfully. Please use the following password to log in:</p>"
                + "<div style='margin: 20px 0; padding: 10px; background-color: #f2f2f2; border-radius: 5px;'>"
                + "<strong style='font-size: 18px;'>" + newPassword + "</strong>"
                + "</div>"
                + "<p>For security reasons, please change this password after logging in.</p>"
                + "<p style='color: #888; font-size: 12px;'>If you did not request this change, please contact our support team immediately.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                + "<p style='font-size: 12px; color: #aaa;'>Best Regards,<br/>Warehouse Hub Team</p>"
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

        List<RentalDetail> rentalDetails = rentalDetailRepository.findByEndDateRange(startOfDay, endOfDay);

        for (RentalDetail rentalDetail : rentalDetails) {
            String email = rentalDetail.getRental().getCustomer().getEmail();
            String subject = "Rental Contract Expiration Reminder";
            String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                    + "<h2 style='color: #4a90e2;'>Rental Contract Expiration Reminder</h2>"
                    + "<p>Dear " + rentalDetail.getRental().getCustomer().getFullName() + ",</p>"
                    + "<p>This is a reminder that your rental contract for the lot <strong>#" + rentalDetail.getLot().getId() + "</strong> "
                    + "is about to expire on <strong>" + rentalDetail.getEndDate() + "</strong>.</p>"
                    + "<p>Please take the necessary actions to renew or finalize your contract.</p>"
                    + "<p style='color: #888; font-size: 12px;'>If you have already renewed, please disregard this message.</p>"
                    + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                    + "<p style='font-size: 12px; color: #aaa;'>Best Regards,<br/>Warehouse Hub Team</p>"
                    + "</div>";

            sendEmail(email, subject, htmlContent);
        }
    }

    @Async
    @Override
    public void sendAppointmentConfirmationEmail(String to, Appointment appointment) throws MessagingException {
        String subject = "Appointment Confirmation";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>Appointment Confirmation</h2>"
                + "<p>Hello,</p>"
                + "<p>Your appointment has been scheduled successfully. Here are the details:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Appointment ID:</strong></td><td>" + appointment.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Customer:</strong></td><td>" + appointment.getCustomer().getFullName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Warehouse:</strong></td><td>" + appointment.getWarehouse().getName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Appointment Date:</strong></td><td>" + appointment.getAppointmentDate() + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Status:</strong></td><td>" + appointment.getStatus() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p>We look forward to seeing you.</p>"
                + "<p style='color: #888; font-size: 12px;'>If you have any questions, please contact our support team.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                + "<p style='font-size: 12px; color: #aaa;'>Best Regards,<br/>Warehouse Hub Team</p>"
                + "</div>";

        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendTaskAssignmentNotification(String to, Appointment appointment) throws MessagingException {
        String subject = "New Task Assigned";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>New Task Assigned</h2>"
                + "<p>Hello,</p>"
                + "<p>You have been assigned a new task. Here are the details:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Appointment ID:</strong></td><td>" + appointment.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Customer:</strong></td><td>" + appointment.getCustomer().getFullName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Warehouse:</strong></td><td>" + appointment.getWarehouse().getName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Appointment Date:</strong></td><td>" + appointment.getAppointmentDate() + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Status:</strong></td><td style='color: #4a90e2; font-weight: bold;'>" + appointment.getStatus() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p>Please ensure the task is completed promptly.</p>"
                + "<p style='color: #888; font-size: 12px;'>If you have any questions, please contact the admin team.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                + "<p style='font-size: 12px; color: #aaa;'>Best Regards,<br/>Warehouse Hub Team</p>"
                + "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendAppointmentUpdateNotification(String to, Appointment appointment) throws MessagingException {
        String subject = "Appointment Updated";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2; text-align: center;'>Appointment Status Updated</h2>"
                + "<p>Hello,</p>"
                + "<p>Your appointment has been updated. Below are the updated details:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Appointment ID:</strong></td><td>" + appointment.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Customer:</strong></td><td>" + appointment.getCustomer().getFullName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Warehouse:</strong></td><td>" + appointment.getWarehouse().getName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Appointment Date:</strong></td><td>" + appointment.getAppointmentDate() + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Status:</strong></td><td style='color: #4a90e2; font-weight: bold;'>" + appointment.getStatus() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p>Please log in to your account for further details or to manage your appointment.</p>"
                + "<p style='color: #888; font-size: 12px;'>If you have any questions, feel free to contact our support team.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                + "<p style='font-size: 12px; color: #aaa;'>Best Regards,<br/>Warehouse Hub Team</p>"
                + "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendRentalCreationNotification(String to, Rental rental) throws MessagingException {
        String subject = "New Rental Created";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>New Rental Created</h2>"
                + "<p>Hello Admin,</p>"
                + "<p>A new rental has been created. Here are the details:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Rental ID:</strong></td><td>" + rental.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Customer:</strong></td><td>" + rental.getCustomer().getFullName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Warehouse:</strong></td><td>" + rental.getWarehouse().getName() + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Status:</strong></td><td>" + rental.getStatus() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p>Best Regards,<br/>Warehouse Hub Team</p>"
                + "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendRentalStatusUpdateNotification(String to, Rental rental) throws MessagingException {
        String subject = "Rental Status Updated";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>Rental Status Notification</h2>"
                + "<p>Hello Manager,</p>"
                + "<p>A rental request has been created for a lot in your warehouse. Please visit the rental management page to review and approve the request. Here are the details:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Rental ID:</strong></td><td>" + rental.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Customer:</strong></td><td>" + rental.getCustomer().getFullName() + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Status:</strong></td><td style='color: #4a90e2; font-weight: bold;'>" + rental.getStatus() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p style='color: #888; font-size: 12px;'>If you have any questions, please contact the admin team.</p>"
                + "<hr style='border: none; border-top: 1px solid #eee;'/>"
                + "<p style='font-size: 12px; color: #aaa;'>Best Regards,<br/>Warehouse Hub Team</p>"
                + "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendRequestCreationNotification(String to, Request request) throws MessagingException {
        String subject = "New Request Created";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>New Request Created</h2>"
                + "<p>Hello Admin,</p>"
                + "<p>A new request has been created. Here are the details:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Request ID:</strong></td><td>" + request.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>User:</strong></td><td>" + request.getUser().getFullName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Email:</strong></td><td>" + request.getUser().getEmail() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Role:</strong></td><td>" + request.getUser().getRole().getRoleName() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Type:</strong></td><td>" + request.getType().getContent() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Description:</strong></td><td>" + request.getDescription() + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Status:</strong></td><td style='color: #4a90e2; font-weight: bold;'>" + request.getStatus() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p>Best Regards,<br/>Warehouse Hub Team</p>"
                + "</div>";
        sendEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendRequestUpdateNotification(String to, Request request) throws MessagingException {
        String subject = "Request Status Updated";
        String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #4a90e2;'>Request Status Updated</h2>"
                + "<p>Hello,</p>"
                + "<p>Your request has been updated. Here are the details:</p>"
                + "<div style='margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;'>"
                + "<table style='width: 100%; font-size: 16px; color: #333;'>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Request ID:</strong></td><td>" + request.getId() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Type:</strong></td><td>" + request.getType().getContent() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Description:</strong></td><td>" + request.getDescription() + "</td></tr>"
                + "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Status:</strong></td><td style='color: #4a90e2; font-weight: bold;'>" + request.getStatus() + "</td></tr>"
                + "<tr><td style='padding: 8px;'><strong>Admin Response:</strong></td><td>" + request.getAdminResponse() + "</td></tr>"
                + "</table>"
                + "</div>"
                + "<p>Best Regards,<br/>Warehouse Hub Team</p>"
                + "</div>";
        sendEmail(to, subject, htmlContent);
    }
}
