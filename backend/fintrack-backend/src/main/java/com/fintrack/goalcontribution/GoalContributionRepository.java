package com.fintrack.goalcontribution;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoalContributionRepository extends JpaRepository<GoalContribution, Long> {

    List<GoalContribution> findAllBySavingsGoalIdAndSavingsGoalUserEmail(Long goalId, String email);

    Optional<GoalContribution> findByIdAndSavingsGoalIdAndSavingsGoalUserEmail(
            Long id,
            Long goalId,
            String email
    );
}
