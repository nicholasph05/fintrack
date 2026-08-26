package com.fintrack.goalcontribution;

import com.fintrack.savingsgoal.SavingsGoal;
import com.fintrack.savingsgoal.SavingsGoalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class GoalContributionService {

    private final GoalContributionRepository contributionRepository;
    private final SavingsGoalRepository savingsGoalRepository;

    public GoalContributionService(
            GoalContributionRepository contributionRepository,
            SavingsGoalRepository savingsGoalRepository
    ) {
        this.contributionRepository = contributionRepository;
        this.savingsGoalRepository = savingsGoalRepository;
    }

    public List<GoalContributionResponse> getContributions(Long goalId, String email) {
        findSavingsGoal(goalId, email);
        return contributionRepository.findAllBySavingsGoalIdAndSavingsGoalUserEmail(goalId, email).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GoalContributionResponse createContribution(
            Long goalId,
            GoalContributionRequest request,
            String email
    ) {
        SavingsGoal savingsGoal = findSavingsGoal(goalId, email);
        GoalContribution contribution = new GoalContribution(
                null,
                request.amount(),
                request.date(),
                savingsGoal
        );

        savingsGoal.setCurrentAmount(savingsGoal.getCurrentAmount() + request.amount());
        savingsGoalRepository.save(savingsGoal);
        return toResponse(contributionRepository.save(contribution));
    }

    @Transactional
    public void deleteContribution(Long goalId, Long contributionId, String email) {
        SavingsGoal savingsGoal = findSavingsGoal(goalId, email);
        GoalContribution contribution = contributionRepository
                .findByIdAndSavingsGoalIdAndSavingsGoalUserEmail(contributionId, goalId, email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Goal contribution not found"
                ));

        savingsGoal.setCurrentAmount(Math.max(savingsGoal.getCurrentAmount() - contribution.getAmount(), 0));
        savingsGoalRepository.save(savingsGoal);
        contributionRepository.delete(contribution);
    }

    private SavingsGoal findSavingsGoal(Long goalId, String email) {
        return savingsGoalRepository.findByIdAndUserEmail(goalId, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Savings goal not found"));
    }

    private GoalContributionResponse toResponse(GoalContribution contribution) {
        return new GoalContributionResponse(
                contribution.getId(),
                contribution.getAmount(),
                contribution.getDate()
        );
    }
}
