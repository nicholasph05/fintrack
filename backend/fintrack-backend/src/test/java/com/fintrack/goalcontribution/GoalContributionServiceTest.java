package com.fintrack.goalcontribution;

import com.fintrack.savingsgoal.SavingsGoal;
import com.fintrack.savingsgoal.SavingsGoalRepository;
import com.fintrack.user.User;
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
class GoalContributionServiceTest {

    private static final String EMAIL = "user@fintrack.com";
    private static final LocalDate DATE = LocalDate.of(2026, 8, 26);

    @Mock GoalContributionRepository contributionRepository;
    @Mock SavingsGoalRepository savingsGoalRepository;
    @InjectMocks GoalContributionService service;

    @Test
    void listsContributions() {
        SavingsGoal goal = goal(100.0);
        when(savingsGoalRepository.findByIdAndUserEmail(1L, EMAIL)).thenReturn(Optional.of(goal));
        when(contributionRepository.findAllBySavingsGoalIdAndSavingsGoalUserEmail(1L, EMAIL))
                .thenReturn(List.of(new GoalContribution(2L, 50.0, DATE, goal)));

        List<GoalContributionResponse> result = service.getContributions(1L, EMAIL);

        assertEquals(1, result.size());
        assertEquals(50.0, result.getFirst().amount());
    }

    @Test
    void addsAmountWhenCreatingContribution() {
        SavingsGoal goal = goal(100.0);
        when(savingsGoalRepository.findByIdAndUserEmail(1L, EMAIL)).thenReturn(Optional.of(goal));
        when(contributionRepository.save(any(GoalContribution.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        GoalContributionResponse response = service.createContribution(
                1L, new GoalContributionRequest(50.0, DATE), EMAIL);

        assertEquals(50.0, response.amount());
        assertEquals(150.0, goal.getCurrentAmount());
        verify(savingsGoalRepository).save(goal);
    }

    @Test
    void subtractsAmountWhenDeletingContribution() {
        SavingsGoal goal = goal(100.0);
        GoalContribution contribution = new GoalContribution(2L, 30.0, DATE, goal);
        when(savingsGoalRepository.findByIdAndUserEmail(1L, EMAIL)).thenReturn(Optional.of(goal));
        when(contributionRepository.findByIdAndSavingsGoalIdAndSavingsGoalUserEmail(2L, 1L, EMAIL))
                .thenReturn(Optional.of(contribution));

        service.deleteContribution(1L, 2L, EMAIL);

        assertEquals(70.0, goal.getCurrentAmount());
        verify(savingsGoalRepository).save(goal);
        verify(contributionRepository).delete(contribution);
    }

    @Test
    void neverSubtractsBelowZero() {
        SavingsGoal goal = goal(20.0);
        GoalContribution contribution = new GoalContribution(2L, 30.0, DATE, goal);
        when(savingsGoalRepository.findByIdAndUserEmail(1L, EMAIL)).thenReturn(Optional.of(goal));
        when(contributionRepository.findByIdAndSavingsGoalIdAndSavingsGoalUserEmail(2L, 1L, EMAIL))
                .thenReturn(Optional.of(contribution));

        service.deleteContribution(1L, 2L, EMAIL);

        assertEquals(0.0, goal.getCurrentAmount());
    }

    @Test
    void rejectsMissingGoalOrWrongUser() {
        when(savingsGoalRepository.findByIdAndUserEmail(1L, "other@fintrack.com"))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.getContributions(1L, "other@fintrack.com"));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void rejectsMissingContribution() {
        when(savingsGoalRepository.findByIdAndUserEmail(1L, EMAIL)).thenReturn(Optional.of(goal(100.0)));
        when(contributionRepository.findByIdAndSavingsGoalIdAndSavingsGoalUserEmail(2L, 1L, EMAIL))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.deleteContribution(1L, 2L, EMAIL));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    private SavingsGoal goal(Double currentAmount) {
        User user = new User("User", EMAIL, "password");
        return new SavingsGoal(1L, "Viaje", 3000.0, currentAmount,
                LocalDate.of(2027, 1, 1), user);
    }
}
