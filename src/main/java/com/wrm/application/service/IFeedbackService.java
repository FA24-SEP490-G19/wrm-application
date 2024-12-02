package com.wrm.application.service;

import com.wrm.application.dto.FeedbackDTO;
import com.wrm.application.model.Feedback;
import com.wrm.application.response.feedback.FeedbackListResponse;
import com.wrm.application.response.feedback.FeedbackResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface IFeedbackService {


    List<FeedbackListResponse> getAllFeedBack();
    List<FeedbackListResponse> getFeedbackByWarehouse(Long warehouseId);
    List<FeedbackListResponse> getFeedbackByCustomer(String email);

    FeedbackResponse addFeedback(FeedbackDTO feedbackDTO, String remoteUser);
}
