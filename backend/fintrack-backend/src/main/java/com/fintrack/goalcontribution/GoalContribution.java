package com.fintrack.goalcontribution;

import com.fintrack.savingsgoal.SavingsGoal;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "goal_contributions")
public class GoalContribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "savings_goal_id", nullable = false)
    private SavingsGoal savingsGoal;

    public GoalContribution() {
    }

    public GoalContribution(Long id, Double amount, LocalDate date, SavingsGoal savingsGoal) {
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.savingsGoal = savingsGoal;
    }

    public Long getId() {
        return id;
    }

    public Double getAmount() {
        return amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public SavingsGoal getSavingsGoal() {
        return savingsGoal;
    }
}
