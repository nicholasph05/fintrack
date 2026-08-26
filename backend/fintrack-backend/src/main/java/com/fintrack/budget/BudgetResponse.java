package com.fintrack.budget;

public record BudgetResponse(
        Long id,
        String category,
        Double limitAmount,
        Integer month,
        Integer year
) {
}
