package com.fintrack.savingsgoal;

import com.fintrack.user.User;
import com.fintrack.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final UserRepository userRepository;

    public SavingsGoalService(SavingsGoalRepository savingsGoalRepository, UserRepository userRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.userRepository = userRepository;
    }

    public List<SavingsGoalResponse> getAllSavingsGoals(String email) {
        return savingsGoalRepository.findAllByUserEmail(email).stream()
                .map(this::toResponse)
                .toList();
    }

    public SavingsGoalResponse createSavingsGoal(SavingsGoalRequest request, String email) {
        User user = findUser(email);
        SavingsGoal savingsGoal = new SavingsGoal(
                null,
                request.name(),
                request.targetAmount(),
                request.currentAmount(),
                request.targetDate(),
                user
        );
        return toResponse(savingsGoalRepository.save(savingsGoal));
    }

    public SavingsGoalResponse updateSavingsGoal(Long id, SavingsGoalRequest request, String email) {
        SavingsGoal savingsGoal = findSavingsGoal(id, email);
        savingsGoal.setName(request.name());
        savingsGoal.setTargetAmount(request.targetAmount());
        savingsGoal.setCurrentAmount(request.currentAmount());
        savingsGoal.setTargetDate(request.targetDate());
        return toResponse(savingsGoalRepository.save(savingsGoal));
    }

    public void deleteSavingsGoal(Long id, String email) {
        savingsGoalRepository.delete(findSavingsGoal(id, email));
    }

    private SavingsGoal findSavingsGoal(Long id, String email) {
        return savingsGoalRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Savings goal not found"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"
                ));
    }

    private SavingsGoalResponse toResponse(SavingsGoal savingsGoal) {
        return new SavingsGoalResponse(
                savingsGoal.getId(),
                savingsGoal.getName(),
                savingsGoal.getTargetAmount(),
                savingsGoal.getCurrentAmount(),
                savingsGoal.getTargetDate()
        );
    }
}
