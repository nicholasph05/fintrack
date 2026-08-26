package com.fintrack.savingsgoal;

import com.fintrack.user.User;
import com.fintrack.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SavingsGoalServiceTest {

    private static final String EMAIL = "user@fintrack.com";
    private static final LocalDate TARGET_DATE = LocalDate.of(2027, 1, 1);

    @Mock SavingsGoalRepository savingsGoalRepository;
    @Mock UserRepository userRepository;
    @InjectMocks SavingsGoalService service;

    @Test
    void createsSavingsGoal() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user()));
        when(savingsGoalRepository.save(any(SavingsGoal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SavingsGoalResponse response = service.createSavingsGoal(request("Viaje", 3000.0, 100.0), EMAIL);

        assertEquals("Viaje", response.name());
        assertEquals(100.0, response.currentAmount());
    }

    @Test
    void listsSavingsGoals() {
        when(savingsGoalRepository.findAllByUserEmail(EMAIL))
                .thenReturn(List.of(goal(1L, "Viaje", 100.0)));

        List<SavingsGoalResponse> result = service.getAllSavingsGoals(EMAIL);

        assertEquals(1, result.size());
        assertEquals(1L, result.getFirst().id());
    }

    @Test
    void rejectsMissingOrUnauthorizedSavingsGoal() {
        when(savingsGoalRepository.findByIdAndUserEmail(1L, "other@fintrack.com"))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.updateSavingsGoal(1L, request("Viaje", 3000.0, 100.0), "other@fintrack.com"));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void updatesSavingsGoal() {
        SavingsGoal goal = goal(1L, "Viaje", 100.0);
        when(savingsGoalRepository.findByIdAndUserEmail(1L, EMAIL)).thenReturn(Optional.of(goal));
        when(savingsGoalRepository.save(goal)).thenReturn(goal);

        SavingsGoalResponse response = service.updateSavingsGoal(
                1L, request("Casa", 10000.0, 500.0), EMAIL);

        assertEquals("Casa", response.name());
        assertEquals(500.0, response.currentAmount());
    }

    @Test
    void deletesSavingsGoal() {
        SavingsGoal goal = goal(1L, "Viaje", 100.0);
        when(savingsGoalRepository.findByIdAndUserEmail(1L, EMAIL)).thenReturn(Optional.of(goal));

        service.deleteSavingsGoal(1L, EMAIL);

        verify(savingsGoalRepository).delete(goal);
    }

    private SavingsGoalRequest request(String name, Double target, Double current) {
        return new SavingsGoalRequest(name, target, current, TARGET_DATE);
    }

    private SavingsGoal goal(Long id, String name, Double current) {
        return new SavingsGoal(id, name, 3000.0, current, TARGET_DATE, user());
    }

    private User user() {
        return new User("User", EMAIL, "password");
    }
}
