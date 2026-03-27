package com.marko.logistics.auth.presentation.controller;


import com.marko.logistics.auth.application.dto.AuthResponse;
import com.marko.logistics.auth.application.dto.LoginRequest;
import com.marko.logistics.auth.application.dto.RegisterRequest;
import com.marko.logistics.auth.application.port.in.LoginUseCase;
import com.marko.logistics.auth.application.port.in.RegisterUseCase;
import com.marko.logistics.auth.application.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final LoginUseCase loginUseCase;
    private final RegisterUseCase registerUseCase;

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
            ){
        String token = authService.generateToken(request);
        AuthResponse userInfo = loginUseCase.login(request);

        response.addHeader(HttpHeaders.SET_COOKIE, buildSessionCookie(token).toString());

        return ResponseEntity.ok(userInfo);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
            ){
        AuthResponse userInfo = registerUseCase.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userInfo);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildExpiredCookie().toString());
        return ResponseEntity.noContent().build();
    }


    private ResponseCookie buildSessionCookie(String token){
        return ResponseCookie.from("SESSION", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Strict")
                .build();
    }

    public ResponseCookie buildExpiredCookie() {
        return ResponseCookie.from("SESSION", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
    }

}
