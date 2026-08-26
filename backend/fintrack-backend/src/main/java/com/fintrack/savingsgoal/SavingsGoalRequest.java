package com.fintrack.savingsgoal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

public record SavingsGoalRequest(
        @NotBlank String name,
        @NotNull @Positive Double targetAmount,
        @NotNull @PositiveOrZero Double currentAmount,
        @NotNull LocalDate targetDate
) {
}
