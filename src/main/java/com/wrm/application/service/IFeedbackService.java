package com.wrm.application.service;

import com.wrm.application.dto.FeedbackDTO;
import com.wrm.application.model.Feedback;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface IFeedbackService {

    Feedback addFeedback(FeedbackDTO feedbackDTO, String remoteUser);

    List<Feedback> getFeedbackByWarehouse(Long warehouseId);


    List<Feedback> getAllFeedBack();

    List<Feedback> getFeedbackByCustomer(String req);
}
