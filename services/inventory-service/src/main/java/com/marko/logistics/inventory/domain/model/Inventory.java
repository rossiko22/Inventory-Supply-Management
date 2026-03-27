package com.marko.logistics.inventory.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Inventory {

    private final String id;
    private final String warehouseId;
    private final String productId;
    private int quantity;


    public Inventory(String id, String productId, String warehouseId,
                     int quantity) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.warehouseId = warehouseId;

    }

    public String getId() { return id; }
    public String getProductId() { return productId; }
    public String getWarehouseId(){ return warehouseId; }
    public int getQuantity() { return quantity; }

    public static Inventory create(String productId, String warehouseId, int quantity){
        return new Inventory(
                UUID.randomUUID().toString(),
                productId,
                warehouseId,
                quantity
        );
    }

    public void increase(int amount){
        validate(amount);
        quantity += amount;
    }

    public void validate(int amount){
        if(amount <= 0){
            throw new IllegalArgumentException("Amount must be > 0");
        }
    }
}