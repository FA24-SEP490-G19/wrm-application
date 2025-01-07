package com.wrm.application.constant.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum LotStatus {
    AVAILABLE, // có sẵn
    RESERVED,  // BỎ
    OCCUPIED;  // KHI TẠO RENTAL, SET LOT =  OCCUPIED

    @JsonCreator
    public static LotStatus fromValue(String value) {
        return LotStatus.valueOf(value.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return this.name().toLowerCase();
    }
}

