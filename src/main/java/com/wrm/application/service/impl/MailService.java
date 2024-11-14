package com.wrm.application.service.impl;

import com.wrm.application.service.IMailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService  implements IMailService {
    private final JavaMailSender mailSender;

    private void sendEmail(String to, String subject, String text) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text, true);

        mailSender.send(message);
    }

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
}
