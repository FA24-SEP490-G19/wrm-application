package com.wrm.application.response.feedback;

import java.time.LocalDateTime;

public class FeedbackListResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private Long warehouseId;
    private String warehouseName;
    private String customerEmail;
    private String customerName;
    private LocalDateTime createdDate;

    public FeedbackListResponse(Integer rating, String comment, Long warehouseId, String warehouseName, String customerEmail, String customerName, LocalDateTime createdDate) {
        this.rating = rating;
        this.comment = comment;
        this.warehouseId = warehouseId;
        this.warehouseName = warehouseName;
        this.customerEmail = customerEmail;
        this.customerName = customerName;
        this.createdDate = createdDate;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getWarehouseName() {
        return warehouseName;
    }

    public void setWarehouseName(String warehouseName) {
        this.warehouseName = warehouseName;
    }

    public Long getWarehouseId() {
        return warehouseId;
    }

    public void setWarehouseId(Long warehouseId) {
        this.warehouseId = warehouseId;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }
    // Add constructors, getters, setters
}