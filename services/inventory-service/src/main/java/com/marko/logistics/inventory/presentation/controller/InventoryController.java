package com.marko.logistics.inventory.presentation.controller;

import com.marko.logistics.inventory.application.command.AddStockCommand;
import com.marko.logistics.inventory.application.command.handler.AddStockCommandHandler;
import com.marko.logistics.inventory.application.dto.CreateInventoryRequest;
import com.marko.logistics.inventory.application.dto.InventoryResponse;
import com.marko.logistics.inventory.application.query.GetAllInventoryQuery;
import com.marko.logistics.inventory.application.query.GetInventoryByWarehouseQuery;
import com.marko.logistics.inventory.application.query.handler.GetAllInventoryQueryHandler;
import com.marko.logistics.inventory.application.query.handler.GetInventoryByWarehouseQueryHandler;
import com.marko.logistics.inventory.infrastructure.security.RequestContext;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CQRS: write requests are dispatched to command handlers,
 *       read requests are dispatched to query handlers.
 */
@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final AddStockCommandHandler addStockHandler;
    private final GetAllInventoryQueryHandler getAllHandler;
    private final GetInventoryByWarehouseQueryHandler getByWarehouseHandler;
    private final RequestContext requestContext;

    public InventoryController(
            AddStockCommandHandler addStockHandler,
            GetAllInventoryQueryHandler getAllHandler,
            GetInventoryByWarehouseQueryHandler getByWarehouseHandler,
            RequestContext requestContext) {
        this.addStockHandler = addStockHandler;
        this.getAllHandler = getAllHandler;
        this.getByWarehouseHandler = getByWarehouseHandler;
        this.requestContext = requestContext;
    }

    // ── Commands (write side) ──────────────────────────────────────────────

    @PostMapping
    public InventoryResponse createInventory(@RequestBody CreateInventoryRequest request) {
        return addStockHandler.handle(
                new AddStockCommand(request.productId(), request.warehouseId(), request.quantity()));
    }

    // ── Queries (read side) ───────────────────────────────────────────────

    @GetMapping
    public List<InventoryResponse> getAll() {
        return getAllHandler.handle(new GetAllInventoryQuery());
    }

    @GetMapping("/{id}")
    public List<InventoryResponse> getByWarehouseId(@PathVariable String id) {
        return getByWarehouseHandler.handle(new GetInventoryByWarehouseQuery(id));
    }
}
