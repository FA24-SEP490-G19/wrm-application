package com.wrm.application.response.feedback;

import java.time.LocalDateTime;

public class FeedbackResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private Long warehouseId;
    private String customerEmail;
    private LocalDateTime createdAt;

    public FeedbackResponse(Integer rating, String comment, Long warehouseId, String customerEmail, LocalDateTime createdAt) {
        this.rating = rating;
        this.comment = comment;
        this.warehouseId = warehouseId;
        this.customerEmail = customerEmail;
        this.createdAt = createdAt;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Long getWarehouseId() {
        return warehouseId;
    }

    public void setWarehouseId(Long warehouseId) {
        this.warehouseId = warehouseId;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
