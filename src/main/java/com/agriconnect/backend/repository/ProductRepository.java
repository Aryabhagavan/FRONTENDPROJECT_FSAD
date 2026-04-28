package com.agriconnect.backend.repository;

import com.agriconnect.backend.model.Category;
import com.agriconnect.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByFarmerName(String farmerName);
    List<Product> findByCategory(Category category);
}
