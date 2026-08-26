package com.fintrack.budget;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BudgetRequest(
        @NotBlank String category,
        @NotNull @Positive Double limitAmount,
        @NotNull @Min(1) @Max(12) Integer month,
        @NotNull @Min(1) Integer year
) {
}
