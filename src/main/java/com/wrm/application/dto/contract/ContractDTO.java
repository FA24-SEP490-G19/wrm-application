package com.wrm.application.dto.contract;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContractDTO {
    private Long id;

    @NotNull(message = "Ngày ký hợp đồng không được để trống")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("signed_date")
    private LocalDateTime signedDate;

    @NotNull(message = "Ngày hết hạn hợp đồng không được để trống")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("expiry_date")
    private LocalDateTime expiryDate;

    @JsonProperty("is_deleted")
    private Boolean isDeleted;

    @JsonProperty("created_date")
    private LocalDateTime createdDate;

    @JsonProperty("last_modified_date")
    private LocalDateTime lastModifiedDate;

    @Size(max = 5, message = "Tối đa chỉ cho phép 5 hình ảnh")
    private List<String> images;

}
