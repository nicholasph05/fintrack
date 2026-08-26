package com.fintrack.budget;

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
class BudgetServiceTest {

    private static final String EMAIL = "user@fintrack.com";

    @Mock BudgetRepository budgetRepository;
    @Mock UserRepository userRepository;
    @InjectMocks BudgetService service;

    @Test
    void createsBudget() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user()));
        when(budgetRepository.save(any(Budget.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BudgetResponse response = service.createBudget(request("Comida", 500.0), EMAIL);

        assertEquals("Comida", response.category());
        assertEquals(500.0, response.limitAmount());
    }

    @Test
    void listsBudgets() {
        when(budgetRepository.findAllByUserEmail(EMAIL))
                .thenReturn(List.of(new Budget(1L, "Comida", 500.0, 8, 2026, user())));

        List<BudgetResponse> result = service.getAllBudgets(EMAIL);

        assertEquals(1, result.size());
        assertEquals(1L, result.getFirst().id());
    }

    @Test
    void rejectsMissingOrUnauthorizedBudget() {
        when(budgetRepository.findByIdAndUserEmail(1L, "other@fintrack.com"))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateBudget(1L, request("Casa", 800.0), "other@fintrack.com"));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void updatesBudget() {
        Budget budget = new Budget(1L, "Comida", 500.0, 8, 2026, user());
        when(budgetRepository.findByIdAndUserEmail(1L, EMAIL)).thenReturn(Optional.of(budget));
        when(budgetRepository.save(budget)).thenReturn(budget);

        BudgetResponse response = service.updateBudget(1L, request("Casa", 800.0), EMAIL);

        assertEquals("Casa", response.category());
        assertEquals(800.0, response.limitAmount());
    }

    @Test
    void deletesBudget() {
        Budget budget = new Budget(1L, "Comida", 500.0, 8, 2026, user());
        when(budgetRepository.findByIdAndUserEmail(1L, EMAIL)).thenReturn(Optional.of(budget));

        service.deleteBudget(1L, EMAIL);

        verify(budgetRepository).delete(budget);
    }

    private BudgetRequest request(String category, Double limit) {
        return new BudgetRequest(category, limit, 8, 2026);
    }

    private User user() {
        return new User("User", EMAIL, "password");
    }
}
