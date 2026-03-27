package com.marko.logistics.inventory.application.dto;

import java.time.LocalDateTime;

public record InventoryResponse(
   String id,
   String productId,
   String warehouseId,
   int quantity
) {}
