package com.agriconnect.backend.controller;

import com.agriconnect.backend.dto.UserDto;
import com.agriconnect.backend.exception.ResourceNotFoundException;
import com.agriconnect.backend.model.Role;
import com.agriconnect.backend.model.User;
import com.agriconnect.backend.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public AdminController(UserRepository userRepository, ModelMapper modelMapper) {
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
    }

    @GetMapping("/pending")
    public List<UserDto> pendingAdmins() {
        return userRepository.findByRoleAndApprovedFalse(Role.ADMIN).stream().map(this::toDto).toList();
    }

    @PutMapping("/approve/{id}")
    public UserDto approve(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setApproved(true);
        return toDto(userRepository.save(user));
    }

    @GetMapping("/users")
    public List<UserDto> users() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    private UserDto toDto(User user) {
        UserDto dto = modelMapper.map(user, UserDto.class);
        dto.setRole(user.getRole().name());
        return dto;
    }
}
