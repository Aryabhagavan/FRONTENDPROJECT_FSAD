package com.agriconnect.backend.controller;

import com.agriconnect.backend.dto.ReportDto;
import com.agriconnect.backend.exception.ResourceNotFoundException;
import com.agriconnect.backend.model.Report;
import com.agriconnect.backend.model.Status;
import com.agriconnect.backend.repository.ProductRepository;
import com.agriconnect.backend.repository.ReportRepository;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportRepository reportRepository;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;

    public ReportController(ReportRepository reportRepository, ProductRepository productRepository, ModelMapper modelMapper) {
        this.reportRepository = reportRepository;
        this.productRepository = productRepository;
        this.modelMapper = modelMapper;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('BUYER','FARMER','EXPERT','ADMIN')")
    public ReportDto create(@Valid @RequestBody ReportDto dto) {
        if (!productRepository.existsById(dto.getProductId())) {
            throw new ResourceNotFoundException("Product not found");
        }
        Report report = modelMapper.map(dto, Report.class);
        report.setStatus(Status.PENDING);
        return toDto(reportRepository.save(report));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ReportDto> all() {
        return reportRepository.findAll().stream().map(this::toDto).toList();
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ReportDto resolve(@PathVariable Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        report.setStatus(Status.RESOLVED);
        return toDto(reportRepository.save(report));
    }

    private ReportDto toDto(Report report) {
        ReportDto dto = modelMapper.map(report, ReportDto.class);
        dto.setStatus(report.getStatus().name());
        return dto;
    }
}
