package com.wrm.application.service.impl;

import com.wrm.application.dto.FeedbackDTO;
import com.wrm.application.model.Feedback;
import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;
import com.wrm.application.repository.FeedbackRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.repository.WarehouseRepository;
import com.wrm.application.service.IFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService implements IFeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;

    @Override
    public Feedback addFeedback(FeedbackDTO feedbackDTO, String remoteUser) {
        User customer = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataIntegrityViolationException("User not found"));

        if (customer.getRole().getId() != 1) {
            throw new DataIntegrityViolationException("User is not a customer");
        }
        Warehouse warehouse = warehouseRepository.findById(feedbackDTO.getWarehouseId())
                .orElseThrow(() -> new DataIntegrityViolationException("Warehouse not found"));

        Feedback feedback = new Feedback();
        feedback.setCustomer(customer);
        feedback.setWarehouse(warehouse);
        feedback.setRating(feedbackDTO.getRating());
        feedback.setComment(feedbackDTO.getComment());
        feedback.setReviewDate(feedbackDTO.getReviewDate());

        return feedbackRepository.save(feedback);
    }




    @Override
    public List<Feedback> getFeedbackByWarehouse(Long warehouseId) {
        return feedbackRepository.findByWarehouseId(warehouseId);
    }

    @Override
    public List<Feedback> getFeedbackByCustomer(Long customerId) {
        return feedbackRepository.findByCustomerId(customerId);
    }
}
