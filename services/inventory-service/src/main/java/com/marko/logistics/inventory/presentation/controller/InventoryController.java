package com.marko.logistics.inventory.presentation.controller;

import com.marko.logistics.inventory.application.dto.CreateInventoryRequest;
import com.marko.logistics.inventory.application.dto.InventoryResponse;
import com.marko.logistics.inventory.application.service.InventoryService;
import com.marko.logistics.inventory.infrastructure.security.RequestContext;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/inventory")
public class InventoryController {
    private final InventoryService inventoryService;
    private final RequestContext requestContext;

    public InventoryController(
            InventoryService inventoryService,
            RequestContext requestContext){
        this.inventoryService = inventoryService;
        this.requestContext = requestContext;
    }


    @PostMapping
    public InventoryResponse createInventory(
            @RequestBody CreateInventoryRequest request
            ){
        return inventoryService.addStock(request);
    }

    @GetMapping
    public List<InventoryResponse> getAll(){
        return inventoryService.getAllInventory();
    }

    @GetMapping("/{id}")
    public List<InventoryResponse> getById(@PathVariable String id) {
        return inventoryService.getByWarehouseId(id);
    }
}
