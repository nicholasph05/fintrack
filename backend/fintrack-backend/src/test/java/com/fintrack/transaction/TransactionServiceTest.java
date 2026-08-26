package com.fintrack.transaction;

import com.fintrack.user.User;
import com.fintrack.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    private static final String EMAIL = "user@fintrack.com";

    @Mock TransactionRepository transactionRepository;
    @Mock UserRepository userRepository;
    @InjectMocks TransactionService service;

    @Test
    void createsTransaction() {
        User user = user();
        TransactionRequest request = request("Compra", 50.0);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionResponse response = service.createTransaction(request, EMAIL);

        assertEquals("Compra", response.description());
        assertEquals(50.0, response.amount());
        verify(transactionRepository).save(argThat(transaction -> transaction.getUser() == user));
    }

    @Test
    void listsTransactions() {
        when(transactionRepository.findAllByUserEmail(EMAIL))
                .thenReturn(List.of(transaction(1L, "Compra", 50.0)));

        List<TransactionResponse> result = service.getAllTransactions(EMAIL);

        assertEquals(1, result.size());
        assertEquals(1L, result.getFirst().id());
    }

    @Test
    void getsTransactionById() {
        when(transactionRepository.findByIdAndUserEmail(1L, EMAIL))
                .thenReturn(Optional.of(transaction(1L, "Compra", 50.0)));

        assertEquals("Compra", service.getTransactionById(1L, EMAIL).description());
    }

    @Test
    void rejectsMissingTransaction() {
        when(transactionRepository.findByIdAndUserEmail(99L, EMAIL)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.getTransactionById(99L, EMAIL));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void rejectsTransactionFromAnotherUser() {
        when(transactionRepository.findByIdAndUserEmail(1L, "other@fintrack.com"))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> service.getTransactionById(1L, "other@fintrack.com"));
    }

    @Test
    void updatesTransaction() {
        Transaction transaction = transaction(1L, "Antes", 10.0);
        when(transactionRepository.findByIdAndUserEmail(1L, EMAIL)).thenReturn(Optional.of(transaction));
        when(transactionRepository.save(transaction)).thenReturn(transaction);

        TransactionResponse response = service.updateTransaction(1L, request("Después", 20.0), EMAIL);

        assertEquals("Después", response.description());
        assertEquals(20.0, response.amount());
        verify(transactionRepository).save(transaction);
    }

    @Test
    void deletesTransaction() {
        Transaction transaction = transaction(1L, "Compra", 50.0);
        when(transactionRepository.findByIdAndUserEmail(1L, EMAIL)).thenReturn(Optional.of(transaction));

        service.deleteTransaction(1L, EMAIL);

        verify(transactionRepository).delete(transaction);
    }

    private TransactionRequest request(String description, Double amount) {
        return new TransactionRequest(description, amount, "Comida", "2026-08-26", "expense");
    }

    private Transaction transaction(Long id, String description, Double amount) {
        return new Transaction(id, description, amount, "Comida", "2026-08-26", "expense", user());
    }

    private User user() {
        return new User("User", EMAIL, "password");
    }
}
