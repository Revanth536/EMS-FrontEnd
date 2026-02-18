package com.example.First;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private EmRepo employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    // ─── Login ────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Optional<Employee> employeeOpt = employeeRepository.findByEmail(loginRequest.getEmail());

            if (employeeOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password",
                                "status", HttpStatus.UNAUTHORIZED.value()));
            }

            Employee employee = employeeOpt.get();

            if (!passwordEncoder.matches(loginRequest.getPassword(), employee.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password",
                                "status", HttpStatus.UNAUTHORIZED.value()));
            }

            LoginResponse response = new LoginResponse(
                    employee.getId(),
                    employee.getFirstName(),
                    employee.getEmail(),
                    null,
                    "Login successful"
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred during login: " + e.getMessage(),
                            "status", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    // ─── Validate Token ───────────────────────────────────────────────────────

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(
            @RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "No token provided",
                            "status", HttpStatus.UNAUTHORIZED.value()));
        }
        return ResponseEntity.ok(Map.of("message", "Token valid"));
    }

    // ─── Forgot Password ──────────────────────────────────────────────────────

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            Optional<Employee> employeeOpt = employeeRepository.findByEmail(request.getEmail());

            // Always return 200 even if email not found (security best practice)
            if (employeeOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "message", "If that email exists, a reset link has been sent."));
            }

            Employee employee = employeeOpt.get();

            // Delete any existing token for this employee
            tokenRepository.deleteByEmployee(employee);

            // Generate a new token valid for 1 hour
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken(
                    token,
                    employee,
                    LocalDateTime.now().plusHours(1)
            );
            tokenRepository.save(resetToken);

            // TODO: Send email with reset link containing the token
            // Wire up JavaMailSender here when ready
            System.out.println("=== PASSWORD RESET TOKEN (dev only) ===");
            System.out.println("Email: " + employee.getEmail());
            System.out.println("Token: " + token);
            System.out.println("Link:  http://localhost:5173/reset-password?token=" + token);
            System.out.println("=======================================");

            return ResponseEntity.ok(Map.of(
                    "message", "If that email exists, a reset link has been sent."));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred. Please try again.",
                            "status", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    // ─── Reset Password ───────────────────────────────────────────────────────

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(request.getToken());

            if (tokenOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid or expired reset link.",
                                "status", HttpStatus.BAD_REQUEST.value()));
            }

            PasswordResetToken resetToken = tokenOpt.get();

            if (resetToken.isExpired() || resetToken.isUsed()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Reset link has expired. Please request a new one.",
                                "status", HttpStatus.BAD_REQUEST.value()));
            }

            Employee employee = resetToken.getEmployee();
            employee.setPassword(passwordEncoder.encode(request.getNewPassword()));
            employeeRepository.save(employee);

            // Mark token as used so it cannot be reused
            resetToken.setUsed(true);
            tokenRepository.save(resetToken);

            return ResponseEntity.ok(Map.of("message", "Password reset successfully."));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred. Please try again.",
                            "status", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    // ─── Inner request DTOs ───────────────────────────────────────────────────

    @Getter
    @Setter
    public static class ForgotPasswordRequest {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;
    }

    @Getter
    @Setter
    public static class ResetPasswordRequest {
        @NotBlank(message = "Token is required")
        private String token;

        @NotBlank(message = "New password is required")
        private String newPassword;
    }
}
