package com.agriconnect.backend.controller;

import com.agriconnect.backend.dto.SchemeDto;
import com.agriconnect.backend.exception.ResourceNotFoundException;
import com.agriconnect.backend.model.Scheme;
import com.agriconnect.backend.repository.SchemeRepository;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schemes")
public class SchemeController {
    private final SchemeRepository schemeRepository;
    private final ModelMapper modelMapper;

    public SchemeController(SchemeRepository schemeRepository, ModelMapper modelMapper) {
        this.schemeRepository = schemeRepository;
        this.modelMapper = modelMapper;
    }

    @GetMapping
    public List<SchemeDto> all() {
        return schemeRepository.findAll().stream()
                .map(scheme -> modelMapper.map(scheme, SchemeDto.class))
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SchemeDto create(@Valid @RequestBody SchemeDto dto) {
        Scheme saved = schemeRepository.save(modelMapper.map(dto, Scheme.class));
        return modelMapper.map(saved, SchemeDto.class);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        if (!schemeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Scheme not found");
        }
        schemeRepository.deleteById(id);
    }
}
