package com.marko.logistics.inventory.application.command.handler;

import com.marko.logistics.inventory.application.command.ReduceStockCommand;
import com.marko.logistics.inventory.application.port.out.InventoryRepositoryPort;
import com.marko.logistics.inventory.domain.exception.InventoryNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReduceStockCommandHandler {

    private final InventoryRepositoryPort inventoryRepository;

    public void handle(ReduceStockCommand command) {
        log.info("ReduceStockCommand: productId={}, warehouseId={}, quantity={}",
                command.productId(), command.warehouseId(), command.quantity());

        var inventory = inventoryRepository
                .findByProductIdAndWarehouseId(command.productId(), command.warehouseId())
                .orElseThrow(() -> new InventoryNotFoundException(
                        "No inventory for productId=" + command.productId()
                        + " warehouseId=" + command.warehouseId()));

        inventory.reduce(command.quantity());
        inventoryRepository.save(inventory);

        log.info("Stock reduced: productId={}, warehouseId={}, newQuantity={}",
                command.productId(), command.warehouseId(), inventory.getQuantity());
    }
}
