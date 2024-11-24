package com.wrm.application.controller;

import com.wrm.application.dto.FeedbackDTO;
import com.wrm.application.model.Feedback;
import com.wrm.application.service.IFeedbackService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final IFeedbackService feedbackService;

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public List<Feedback> getAllFeedBack() {
        return feedbackService.getAllFeedBack();
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> addFeedback(@RequestBody FeedbackDTO feedbackDTO, HttpServletRequest req) {
        try {
            Feedback feedback = feedbackService.addFeedback(feedbackDTO, req.getRemoteUser());
            return ResponseEntity.ok(feedback);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Data integrity violation: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/warehouse/{warehouseId}")
    public List<Feedback> getFeedbackByWarehouse(@PathVariable Long warehouseId) {
        return feedbackService.getFeedbackByWarehouse(warehouseId);
    }


    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/customer")
    public List<Feedback> getFeedbackByCustomer(HttpServletRequest req) {
        return feedbackService.getFeedbackByCustomer(req.getRemoteUser());
    }
}
