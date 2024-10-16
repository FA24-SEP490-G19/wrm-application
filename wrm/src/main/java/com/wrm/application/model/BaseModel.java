package com.wrm.application.model;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
public class BaseModel {
    @Column(name = "created_date")
    private LocalDateTime created_date;
    @Column(name = "last_modified_date")
    private LocalDateTime last_modified_date;
    @Column(name = "is_deleted")
    private boolean is_deleted;

    @PrePersist
    protected void onCreated() {
        this.created_date = LocalDateTime.now();
        this.last_modified_date = LocalDateTime.now();
        this.is_deleted = false;
    }

    @PreUpdate
    protected void onUpdated() {
        this.last_modified_date = LocalDateTime.now();
    }
}
