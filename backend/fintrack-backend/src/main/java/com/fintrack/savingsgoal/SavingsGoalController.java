package com.fintrack.savingsgoal;

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
@RequestMapping("/api/savings-goals")
@Tag(name = "Metas de ahorro", description = "Gestión de metas de ahorro del usuario")
@SecurityRequirement(name = "bearerAuth")
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    public SavingsGoalController(SavingsGoalService savingsGoalService) {
        this.savingsGoalService = savingsGoalService;
    }

    @GetMapping
    @Operation(summary = "Listar metas de ahorro")
    public List<SavingsGoalResponse> getAllSavingsGoals(Authentication authentication) {
        return savingsGoalService.getAllSavingsGoals(authentication.getName());
    }

    @PostMapping
    @Operation(summary = "Crear una meta de ahorro")
    public SavingsGoalResponse createSavingsGoal(
            @Valid @RequestBody SavingsGoalRequest request,
            Authentication authentication
    ) {
        return savingsGoalService.createSavingsGoal(request, authentication.getName());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una meta de ahorro")
    public SavingsGoalResponse updateSavingsGoal(
            @PathVariable Long id,
            @Valid @RequestBody SavingsGoalRequest request,
            Authentication authentication
    ) {
        return savingsGoalService.updateSavingsGoal(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una meta de ahorro")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSavingsGoal(@PathVariable Long id, Authentication authentication) {
        savingsGoalService.deleteSavingsGoal(id, authentication.getName());
    }
}
