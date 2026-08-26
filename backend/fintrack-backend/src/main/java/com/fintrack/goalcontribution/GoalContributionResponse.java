package com.fintrack.goalcontribution;

import java.time.LocalDate;

public record GoalContributionResponse(
        Long id,
        Double amount,
        LocalDate date
) {
}
