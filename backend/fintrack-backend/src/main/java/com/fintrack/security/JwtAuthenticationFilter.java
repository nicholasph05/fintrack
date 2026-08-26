package com.fintrack.security;

import com.fintrack.auth.JwtService;
import com.fintrack.user.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");

        if (authorization != null
                && authorization.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String email = jwtService.getEmail(authorization.substring(7));
                System.out.println("JWT EMAIL: " + email);
                System.out.println("EXISTS: " + userRepository.existsByEmail(email));
                if (userRepository.existsByEmail(email)) {
                    var authentication = new UsernamePasswordAuthenticationToken(
                            email,
                            null,





















































                            
                            List.of());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("AUTHENTICATED: " + authentication.isAuthenticated());
                    System.out.println("AUTH NAME: " + authentication.getName());
                }
            } catch (JwtException | IllegalArgumentException ignored) {
                // An invalid token leaves the request unauthenticated.
            }
        }

        filterChain.doFilter(request, response);
    }
}
