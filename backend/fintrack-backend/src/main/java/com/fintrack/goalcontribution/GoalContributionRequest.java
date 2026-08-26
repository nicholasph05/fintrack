package com.fintrack.goalcontribution;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record GoalContributionRequest(
        @NotNull @Positive Double amount,
        @NotNull LocalDate date
) {
}
