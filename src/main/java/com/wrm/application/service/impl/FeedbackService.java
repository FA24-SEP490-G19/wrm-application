package com.wrm.application.service.impl;

import com.wrm.application.dto.FeedbackDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.Feedback;
import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;
import com.wrm.application.repository.FeedbackRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.repository.WarehouseRepository;
import com.wrm.application.response.feedback.FeedbackListResponse;
import com.wrm.application.response.feedback.FeedbackResponse;
import com.wrm.application.service.IFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService implements IFeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;

    @Override
    public List<FeedbackListResponse> getAllFeedBack() {
        return feedbackRepository.findAll().stream()
                .map(this::mapToFeedbackListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackListResponse> getFeedbackByWarehouse(Long warehouseId) {
        return feedbackRepository.findByWarehouseId(warehouseId).stream()
                .map(this::mapToFeedbackListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackListResponse> getFeedbackByCustomer(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new DataIntegrityViolationException("Không tìm thấy người dùng"));
        return feedbackRepository.findByCustomerId(user.getId()).stream()
                .map(this::mapToFeedbackListResponse)
                .collect(Collectors.toList());
    }

    private FeedbackListResponse mapToFeedbackListResponse(Feedback feedback) {
        return new FeedbackListResponse(
                feedback.getRating(),
                feedback.getComment(),
                feedback.getWarehouse().getId(),
                feedback.getWarehouse().getName(),
                feedback.getCustomer().getEmail(),
                feedback.getCustomer().getFullName(),
                feedback.getCreatedDate()
        );
    }


    @Override
    public FeedbackResponse addFeedback(FeedbackDTO feedbackDTO, String remoteUser) {
        User customer = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataIntegrityViolationException("Không tìm thấy người dùng"));

        if (customer.getRole().getId() != 1) {
            throw new DataIntegrityViolationException("Người dùng không phải là khách hàng");
        }

        Warehouse warehouse = warehouseRepository.findById(feedbackDTO.getWarehouseId())
                .orElseThrow(() -> new DataIntegrityViolationException("Không tìm thấy kho hàng"));

        Feedback feedback = new Feedback();
        feedback.setCustomer(customer);
        feedback.setWarehouse(warehouse);
        feedback.setRating(feedbackDTO.getRating());
        feedback.setComment(feedbackDTO.getComment());

        Feedback savedFeedback = feedbackRepository.save(feedback);

        return new FeedbackResponse(
                savedFeedback.getRating(),
                savedFeedback.getComment(),
                savedFeedback.getWarehouse().getId(),
                savedFeedback.getCustomer().getEmail(),
                savedFeedback.getCreatedDate()
        );
    }

    @Override
    public void deleteFeedback(Long feedbackId) throws Exception {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy feedback"));
        feedback.setDeleted(true);
        feedbackRepository.save(feedback);
    }
}
