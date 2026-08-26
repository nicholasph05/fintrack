package com.fintrack.budget;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@Tag(name = "Presupuestos", description = "Gestión de presupuestos del usuario")
@SecurityRequirement(name = "bearerAuth")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    @Operation(summary = "Listar presupuestos")
    public List<BudgetResponse> getAllBudgets(Authentication authentication) {
        return budgetService.getAllBudgets(authentication.getName());
    }

    @PostMapping
    @Operation(summary = "Crear un presupuesto")
    public BudgetResponse createBudget(
            @Valid @RequestBody BudgetRequest request,
            Authentication authentication
    ) {
        return budgetService.createBudget(request, authentication.getName());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un presupuesto")
    public BudgetResponse updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request,
            Authentication authentication
    ) {
        return budgetService.updateBudget(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un presupuesto")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBudget(@PathVariable Long id, Authentication authentication) {
        budgetService.deleteBudget(id, authentication.getName());
    }
}
