package com.wrm.application.controller;

import com.wrm.application.dto.FeedbackDTO;
import com.wrm.application.model.Feedback;
import com.wrm.application.response.feedback.FeedbackListResponse;
import com.wrm.application.response.feedback.FeedbackResponse;
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
    public ResponseEntity<List<FeedbackListResponse>> getAllFeedBack() {
        return ResponseEntity.ok(feedbackService.getAllFeedBack());
    }

        @PostMapping("/add")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> addFeedback(@RequestBody FeedbackDTO feedbackDTO, HttpServletRequest req) {
        try {
            FeedbackResponse response = feedbackService.addFeedback(feedbackDTO, req.getRemoteUser());
            return ResponseEntity.ok(response);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Data integrity violation: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<FeedbackListResponse>> getFeedbackByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByWarehouse(warehouseId));
    }



    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/customer")
    public ResponseEntity<List<FeedbackListResponse>> getFeedbackByCustomer(HttpServletRequest req) {
        return ResponseEntity.ok(feedbackService.getFeedbackByCustomer(req.getRemoteUser()));
    }

}
