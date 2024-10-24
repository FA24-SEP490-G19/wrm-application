package com.wrm.application.component.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum LotStatus {
    AVAILABLE,
    RESERVED,
    OCCUPIED,
    UNDER_MAINTENANCE,
    SOLD_OUT;

    @JsonCreator
    public static LotStatus fromValue(String value) {
        return LotStatus.valueOf(value.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return this.name().toLowerCase();
    }
}

