package com.marko.logistics.inventory.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
public class InventoryJpaEntity {

    @Id
    private String id;

    private String productId;
    private String warehouseId;
    private int quantity;

    private LocalDateTime createdAt;
    private LocalDateTime lastModified;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.lastModified = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastModified = LocalDateTime.now();
    }

    // constructor (important!)
    public InventoryJpaEntity(String id, String productId, String warehouseId, int quantity) {
        this.id = id;
        this.productId = productId;
        this.warehouseId = warehouseId;
        this.quantity = quantity;
    }

    public InventoryJpaEntity() {} // JPA needs this

    public String getId() {
        return id;
    }

    public String getProductId() {
        return productId;
    }

    public String getWarehouseId() {
        return warehouseId;
    }

    public int getQuantity() {
        return quantity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getLastModified() {
        return lastModified;
    }
}