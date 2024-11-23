package com.wrm.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ConfirmWebhookDTO {

    @JsonProperty("webhook_url")
    @NotBlank(message = "Webhook URL cannot be blank")
    private String webhookUrl;
}
