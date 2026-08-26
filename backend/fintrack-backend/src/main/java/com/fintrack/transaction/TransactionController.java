package com.fintrack.transaction;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public List<TransactionResponse> getAllTransactions(Authentication authentication) {
        return transactionService.getAllTransactions(authentication.getName());
    }

    @GetMapping("/{id}")
    public TransactionResponse getTransactionById(@PathVariable Long id, Authentication authentication) {
        return transactionService.getTransactionById(id, authentication.getName());
    }

    @PostMapping
    public TransactionResponse createTransaction(
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication
    ) {
        return transactionService.createTransaction(request, authentication.getName());
    }

    @PutMapping("/{id}")
    public TransactionResponse updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication
    ) {
        return transactionService.updateTransaction(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTransaction(@PathVariable Long id, Authentication authentication) {
        transactionService.deleteTransaction(id, authentication.getName());
    }
}
