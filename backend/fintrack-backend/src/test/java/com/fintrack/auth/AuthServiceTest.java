package com.fintrack.auth;

import com.fintrack.user.User;
import com.fintrack.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String EMAIL = "user@fintrack.com";

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @InjectMocks AuthService service;

    @Test
    void registersUser() {
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("encoded");
        when(jwtService.generateToken(EMAIL)).thenReturn("jwt-token");

        AuthResponse response = service.register(new RegisterRequest("User", EMAIL, "secret"));

        assertEquals("jwt-token", response.token());
        verify(userRepository).save(argThat(user ->
                EMAIL.equals(user.getEmail()) && "encoded".equals(user.getPassword())));
    }

    @Test
    void rejectsDuplicateEmail() {
        when(userRepository.existsByEmail(EMAIL)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.register(new RegisterRequest("User", EMAIL, "secret")));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(userRepository, never()).save(any());
    }

    @Test
    void logsInWithValidCredentials() {
        User user = new User("User", EMAIL, "encoded");
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "encoded")).thenReturn(true);
        when(jwtService.generateToken(EMAIL)).thenReturn("jwt-token");

        AuthResponse response = service.login(new LoginRequest(EMAIL, "secret"));

        assertEquals("jwt-token", response.token());
    }

    @Test
    void rejectsInvalidCredentials() {
        User user = new User("User", EMAIL, "encoded");
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.login(new LoginRequest(EMAIL, "wrong")));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        verify(jwtService, never()).generateToken(anyString());
    }
}
