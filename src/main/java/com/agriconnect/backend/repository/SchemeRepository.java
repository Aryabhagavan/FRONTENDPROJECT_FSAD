package com.agriconnect.backend.repository;

import com.agriconnect.backend.model.Scheme;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchemeRepository extends JpaRepository<Scheme, Long> {
}
