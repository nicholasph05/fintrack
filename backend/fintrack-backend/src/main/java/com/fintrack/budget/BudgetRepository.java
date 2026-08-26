package com.fintrack.budget;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findAllByUserEmail(String email);

    Optional<Budget> findByIdAndUserEmail(Long id, String email);
}
