package com.marko.logistics.inventory.infrastructure.persistence.entity;

import com.marko.logistics.inventory.domain.model.Inventory;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "inventory")
public class InventoryJpaEntity {

    @Id
    private String id;

    private String productId;
    private String warehouseId;
    private int quantity;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getWarehouseId() { return warehouseId; }
    public void setWarehouseId(String warehouseId) { this.warehouseId = warehouseId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    protected InventoryJpaEntity(){}

    public InventoryJpaEntity(String id, String productId, String warehouseId, int quantity) {
        this.id = id;
        this.productId = productId;
        this.warehouseId = warehouseId;
        this.quantity = quantity;
    }
}
