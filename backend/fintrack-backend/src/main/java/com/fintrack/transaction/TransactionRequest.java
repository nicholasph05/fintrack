package com.fintrack.transaction;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record TransactionRequest(
        @NotBlank String description,
        @NotNull @Positive Double amount,
        @NotBlank String category,
        @NotBlank String date,
        @NotBlank @Pattern(regexp = "income|expense") String type
) {
}
