package com.fintrack.budget;

import com.fintrack.user.User;
import com.fintrack.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository, UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }

    public List<BudgetResponse> getAllBudgets(String email) {
        return budgetRepository.findAllByUserEmail(email).stream()
                .map(this::toResponse)
                .toList();
    }

    public BudgetResponse createBudget(BudgetRequest request, String email) {
        User user = findUser(email);
        Budget budget = new Budget(
                null,
                request.category(),
                request.limitAmount(),
                request.month(),
                request.year(),
                user
        );
        return toResponse(budgetRepository.save(budget));
    }

    public BudgetResponse updateBudget(Long id, BudgetRequest request, String email) {
        Budget budget = findBudget(id, email);
        budget.setCategory(request.category());
        budget.setLimitAmount(request.limitAmount());
        budget.setMonth(request.month());
        budget.setYear(request.year());
        return toResponse(budgetRepository.save(budget));
    }

    public void deleteBudget(Long id, String email) {
        budgetRepository.delete(findBudget(id, email));
    }

    private Budget findBudget(Long id, String email) {
        return budgetRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"
                ));
    }

    private BudgetResponse toResponse(Budget budget) {
        return new BudgetResponse(
                budget.getId(),
                budget.getCategory(),
                budget.getLimitAmount(),
                budget.getMonth(),
                budget.getYear()
        );
    }
}
