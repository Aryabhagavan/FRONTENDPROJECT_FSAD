package com.agriconnect.backend.controller;

import com.agriconnect.backend.dto.OfferDto;
import com.agriconnect.backend.exception.ResourceNotFoundException;
import com.agriconnect.backend.model.Offer;
import com.agriconnect.backend.model.Status;
import com.agriconnect.backend.repository.OfferRepository;
import com.agriconnect.backend.repository.ProductRepository;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
public class OfferController {
    private final OfferRepository offerRepository;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;

    public OfferController(OfferRepository offerRepository, ProductRepository productRepository, ModelMapper modelMapper) {
        this.offerRepository = offerRepository;
        this.productRepository = productRepository;
        this.modelMapper = modelMapper;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('BUYER','ADMIN')")
    public OfferDto create(@Valid @RequestBody OfferDto dto) {
        if (!productRepository.existsById(dto.getProductId())) {
            throw new ResourceNotFoundException("Product not found");
        }
        Offer offer = modelMapper.map(dto, Offer.class);
        offer.setStatus(dto.getStatus() == null ? Status.PENDING : Status.valueOf(dto.getStatus().toUpperCase()));
        return toDto(offerRepository.save(offer));
    }

    @GetMapping("/product/{productId}")
    public List<OfferDto> byProduct(@PathVariable Long productId) {
        return offerRepository.findByProductId(productId).stream().map(this::toDto).toList();
    }

    @GetMapping("/buyer/{buyerId}")
    public List<OfferDto> byBuyer(@PathVariable Long buyerId) {
        return offerRepository.findByBuyerId(buyerId).stream().map(this::toDto).toList();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public OfferDto updateStatus(@PathVariable Long id, @RequestParam String status) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));
        offer.setStatus(Status.valueOf(status.toUpperCase()));
        return toDto(offerRepository.save(offer));
    }

    private OfferDto toDto(Offer offer) {
        OfferDto dto = modelMapper.map(offer, OfferDto.class);
        dto.setStatus(offer.getStatus().name());
        return dto;
    }
}
