package com.agriconnect.backend.model;

import jakarta.persistence.*;

@Entity
public class Suggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 2000)
    private String advice;

    private String expertName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAdvice() { return advice; }
    public void setAdvice(String advice) { this.advice = advice; }
    public String getExpertName() { return expertName; }
    public void setExpertName(String expertName) { this.expertName = expertName; }
}
