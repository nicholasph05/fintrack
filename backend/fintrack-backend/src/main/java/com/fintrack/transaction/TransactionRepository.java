package com.fintrack.transaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByUserEmail(String email);

    Optional<Transaction> findByIdAndUserEmail(Long id, String email);
}
