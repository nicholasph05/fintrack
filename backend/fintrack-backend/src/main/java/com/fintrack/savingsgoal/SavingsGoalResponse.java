package com.fintrack.savingsgoal;

import java.time.LocalDate;

public record SavingsGoalResponse(
        Long id,
        String name,
        Double targetAmount,
        Double currentAmount,
        LocalDate targetDate
) {
}
