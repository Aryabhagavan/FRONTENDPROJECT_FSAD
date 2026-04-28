package com.agriconnect.backend.controller;

import com.agriconnect.backend.dto.ProductDto;
import com.agriconnect.backend.exception.ResourceNotFoundException;
import com.agriconnect.backend.model.Category;
import com.agriconnect.backend.model.Product;
import com.agriconnect.backend.repository.ProductRepository;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;

    public ProductController(ProductRepository productRepository, ModelMapper modelMapper) {
        this.productRepository = productRepository;
        this.modelMapper = modelMapper;
    }

    @GetMapping
    public List<ProductDto> all() {
        return productRepository.findAll().stream().map(this::toDto).toList();
    }

    @GetMapping("/farmer/{name}")
    public List<ProductDto> byFarmer(@PathVariable String name) {
        return productRepository.findByFarmerName(name).stream().map(this::toDto).toList();
    }

    @GetMapping("/category/{category}")
    public List<ProductDto> byCategory(@PathVariable String category) {
        return productRepository.findByCategory(Category.valueOf(category.toUpperCase())).stream().map(this::toDto).toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ProductDto create(@Valid @RequestBody ProductDto dto) {
        Product product = toEntity(dto);
        return toDto(productRepository.save(product));
    }

    @PostMapping("/{id}/buy")
    @PreAuthorize("hasAnyRole('BUYER','ADMIN')")
    public ProductDto buy(@PathVariable Long id, @RequestParam Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        if (quantity <= 0 || product.getQuantity() < quantity) {
            throw new IllegalArgumentException("Invalid purchase quantity");
        }
        product.setQuantity(product.getQuantity() - quantity);
        return toDto(productRepository.save(product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public void delete(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        productRepository.deleteById(id);
    }

    private ProductDto toDto(Product product) {
        ProductDto dto = modelMapper.map(product, ProductDto.class);
        dto.setCategory(product.getCategory().name());
        return dto;
    }

    private Product toEntity(ProductDto dto) {
        Product product = modelMapper.map(dto, Product.class);
        product.setCategory(Category.valueOf(dto.getCategory().toUpperCase()));
        return product;
    }
}
