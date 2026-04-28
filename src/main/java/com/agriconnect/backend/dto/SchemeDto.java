package com.agriconnect.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class SchemeDto {
    private Long id;
    @NotBlank
    private String name;
    @NotBlank
    private String description;
    private String category;
    private String eligibility;
    private String link;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getEligibility() { return eligibility; }
    public void setEligibility(String eligibility) { this.eligibility = eligibility; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
}
