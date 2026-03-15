package com.marko.logistics.warehouse.presentation.controller;

import com.marko.logistics.warehouse.application.dto.CreateWarehouseRequest;
import com.marko.logistics.warehouse.application.dto.UpdateWarehouseRequest;
import com.marko.logistics.warehouse.application.dto.WarehouseResponse;
import com.marko.logistics.warehouse.application.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/warehouses")
@RequiredArgsConstructor
@Slf4j
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    public WarehouseResponse create(@RequestBody CreateWarehouseRequest request) {
        log.info("Creating warehouse: {}", request.name());
        var response = warehouseService.createWarehouse(request);
        log.info("Created warehouse with ID: {}", response.id());
        return response;
    }

    @PutMapping("/{id}")
    public WarehouseResponse update(@PathVariable UUID id, @RequestBody UpdateWarehouseRequest request) {
        log.info("Updating warehouse {} with data: {}", id, request.name());
        var response = warehouseService.updateWarehouse(id, request);
        log.info("Updated warehouse {} successfully", id);
        return response;
    }

    @GetMapping
    public List<WarehouseResponse> getAll() {
        log.info("Fetching all warehouses");
        var response = warehouseService.getAllWarehouses();
        log.info("Fetched {} warehouses", response.size());
        return response;
    }

    @GetMapping("/{id}")
    public WarehouseResponse getById(@PathVariable UUID id) {
        log.info("Fetching warehouse by ID: {}", id);
        var response = warehouseService.getWarehouseById(id);
        log.info("Fetched warehouse {}: {}", id, response.name());
        return response;
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable UUID id) {
        log.info("Deleting warehouse with ID: {}", id);
        warehouseService.deleteWarehouseById(id);
        log.info("Deleted warehouse {}", id);
    }
}