package com.agriconnect.backend.controller;

import com.agriconnect.backend.dto.JwtResponse;
import com.agriconnect.backend.dto.LoginRequest;
import com.agriconnect.backend.dto.MessageResponse;
import com.agriconnect.backend.dto.SignupRequest;
import com.agriconnect.backend.exception.BadRequestException;
import com.agriconnect.backend.model.Role;
import com.agriconnect.backend.model.User;
import com.agriconnect.backend.repository.UserRepository;
import com.agriconnect.backend.security.JwtService;
import com.agriconnect.backend.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/signin")
    public JwtResponse signin(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        String jwt = jwtService.generateToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .toList();
        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), userDetails.getEmail(), roles);
    }

    @PostMapping("/signup")
    public MessageResponse signup(@Valid @RequestBody SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }
        if (!request.getEmail().endsWith("@gmail.com")) {
            throw new BadRequestException("Only @gmail.com IDs are allowed");
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setApproved(role != Role.ADMIN);
        userRepository.save(user);

        String message = role == Role.ADMIN
                ? "Admin request submitted. Existing admin approval is required before login."
                : "Registration successful";
        return new MessageResponse(message);
    }
}
