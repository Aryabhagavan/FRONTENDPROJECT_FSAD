package com.agriconnect.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long productId;
    private Long buyerId;
    private BigDecimal offeredPrice;
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }
    public BigDecimal getOfferedPrice() { return offeredPrice; }
    public void setOfferedPrice(BigDecimal offeredPrice) { this.offeredPrice = offeredPrice; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
