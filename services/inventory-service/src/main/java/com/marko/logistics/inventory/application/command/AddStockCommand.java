package com.marko.logistics.inventory.application.command;

public record AddStockCommand(String productId, String warehouseId, int quantity) {}
