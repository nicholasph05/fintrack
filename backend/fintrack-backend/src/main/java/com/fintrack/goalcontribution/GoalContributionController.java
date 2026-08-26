package com.fintrack.goalcontribution;

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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/savings-goals/{goalId}/contributions")
@Tag(name = "Aportes a metas", description = "Gestión de aportes a las metas de ahorro")
@SecurityRequirement(name = "bearerAuth")
public class GoalContributionController {

    private final GoalContributionService contributionService;

    public GoalContributionController(GoalContributionService contributionService) {
        this.contributionService = contributionService;
    }

    @GetMapping
    @Operation(summary = "Listar aportes de una meta")
    public List<GoalContributionResponse> getContributions(
            @PathVariable Long goalId,
            Authentication authentication
    ) {
        return contributionService.getContributions(goalId, authentication.getName());
    }

    @PostMapping
    @Operation(summary = "Registrar un aporte en una meta")
    public GoalContributionResponse createContribution(
            @PathVariable Long goalId,
            @Valid @RequestBody GoalContributionRequest request,
            Authentication authentication
    ) {
        return contributionService.createContribution(goalId, request, authentication.getName());
    }

    @DeleteMapping("/{contributionId}")
    @Operation(summary = "Eliminar un aporte de una meta")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteContribution(
            @PathVariable Long goalId,
            @PathVariable Long contributionId,
            Authentication authentication
    ) {
        contributionService.deleteContribution(goalId, contributionId, authentication.getName());
    }
}
