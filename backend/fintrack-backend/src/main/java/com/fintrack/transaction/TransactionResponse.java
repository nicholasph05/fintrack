package com.fintrack.transaction;

public record TransactionResponse(
        Long id,
        String description,
        Double amount,
        String category,
        String date,
        String type
) {
}
