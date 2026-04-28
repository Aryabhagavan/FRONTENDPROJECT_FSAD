package com.agriconnect.backend.controller;

import com.agriconnect.backend.dto.SuggestionDto;
import com.agriconnect.backend.exception.ResourceNotFoundException;
import com.agriconnect.backend.model.Suggestion;
import com.agriconnect.backend.repository.SuggestionRepository;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {
    private final SuggestionRepository suggestionRepository;
    private final ModelMapper modelMapper;

    public SuggestionController(SuggestionRepository suggestionRepository, ModelMapper modelMapper) {
        this.suggestionRepository = suggestionRepository;
        this.modelMapper = modelMapper;
    }

    @GetMapping
    public List<SuggestionDto> all() {
        return suggestionRepository.findAll().stream()
                .map(suggestion -> modelMapper.map(suggestion, SuggestionDto.class))
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    public SuggestionDto create(@Valid @RequestBody SuggestionDto dto) {
        Suggestion saved = suggestionRepository.save(modelMapper.map(dto, Suggestion.class));
        return modelMapper.map(saved, SuggestionDto.class);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    public void delete(@PathVariable Long id) {
        if (!suggestionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Suggestion not found");
        }
        suggestionRepository.deleteById(id);
    }
}
