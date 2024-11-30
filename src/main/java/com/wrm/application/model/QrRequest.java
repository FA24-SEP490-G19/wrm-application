package com.wrm.application.model;

public class QrRequest {
    private Long orderCode;
    private Integer amount;
    private String description;
    private String cancelUrl;
    private String returnUrl;
    private Integer expiredAt;
    private Long user_id;


    public QrRequest(Long orderCode, Integer amount, String description, String cancelUrl, String returnUrl) {
        this.orderCode = orderCode;
        this.amount = amount;
        this.description = description;
        this.cancelUrl = cancelUrl;
        this.returnUrl = returnUrl;
    }

    public Long getUser_id() {
        return user_id;
    }

    public void setUser_id(Long user_id) {
        this.user_id = user_id;
    }

    public Long getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(Long orderCode) {
        this.orderCode = orderCode;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCancelUrl() {
        return cancelUrl;
    }

    public void setCancelUrl(String cancelUrl) {
        this.cancelUrl = cancelUrl;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }

    public Integer getExpiredAt() {
        return expiredAt;
    }

    public void setExpiredAt(Integer expiredAt) {
        this.expiredAt = expiredAt;
    }
}