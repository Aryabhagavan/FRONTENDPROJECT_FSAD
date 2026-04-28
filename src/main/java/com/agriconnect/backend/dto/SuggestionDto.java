package com.agriconnect.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class SuggestionDto {
    private Long id;
    @NotBlank
    private String advice;
    private String expertName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAdvice() { return advice; }
    public void setAdvice(String advice) { this.advice = advice; }
    public String getExpertName() { return expertName; }
    public void setExpertName(String expertName) { this.expertName = expertName; }
}
