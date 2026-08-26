package com.fintrack.transaction;

import com.fintrack.user.User;
import com.fintrack.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            UserRepository userRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public List<TransactionResponse> getAllTransactions(String email) {
        return transactionRepository.findAllByUserEmail(email).stream()
                .map(this::toResponse)
                .toList();
    }

    public TransactionResponse createTransaction(TransactionRequest request, String email) {
        User user = findUser(email);
        Transaction transaction = new Transaction(
                null,
                request.description(),
                request.amount(),
                request.category(),
                request.date(),
                request.type(),
                user
        );
        return toResponse(transactionRepository.save(transaction));
    }

    public TransactionResponse getTransactionById(Long id, String email) {
        return toResponse(findTransaction(id, email));
    }

    public TransactionResponse updateTransaction(Long id, TransactionRequest request, String email) {
        Transaction transaction = findTransaction(id, email);
        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setCategory(request.category());
        transaction.setDate(request.date());
        transaction.setType(request.type());
        return toResponse(transactionRepository.save(transaction));
    }

    public void deleteTransaction(Long id, String email) {
        transactionRepository.delete(findTransaction(id, email));
    }

    private Transaction findTransaction(Long id, String email) {
        return transactionRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found"
                ));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"
                ));
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getDescription(),
                transaction.getAmount(),
                transaction.getCategory(),
                transaction.getDate(),
                transaction.getType()
        );
    }
}
