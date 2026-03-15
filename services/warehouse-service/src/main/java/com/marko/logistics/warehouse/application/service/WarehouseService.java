package com.marko.logistics.warehouse.application.service;

import com.marko.logistics.warehouse.application.dto.CreateWarehouseRequest;
import com.marko.logistics.warehouse.application.dto.UpdateWarehouseRequest;
import com.marko.logistics.warehouse.application.dto.WarehouseResponse;
import com.marko.logistics.warehouse.application.mapper.WarehouseMapper;
import com.marko.logistics.warehouse.application.port.in.*;
import com.marko.logistics.warehouse.application.port.out.WarehouseRepositoryPort;
import com.marko.logistics.warehouse.domain.exception.WarehouseNotFoundException;
import com.marko.logistics.warehouse.domain.model.Warehouse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseService implements
        CreateWarehouseUseCase,
        DeleteWarehouseUseCase,
        GetAllWarehousesUseCase,
        GetWarehouseUseCase,
        UpdateWarehouseUseCase
{

    private final WarehouseRepositoryPort repository;

    @Override
    public WarehouseResponse createWarehouse(CreateWarehouseRequest request){
        log.info("Creating warehouse: {}", request.name());
        Warehouse warehouse = Warehouse.create(
                request.name(),
                request.country(),
                request.city(),
                request.capacity()
        );

        var saved = repository.save(warehouse);
        log.info("Warehouse created with ID: {}", saved.getId());

        return new WarehouseResponse(
                saved.getId(),
                saved.getName(),
                saved.getCountry(),
                saved.getCity(),
                saved.getCapacity()
        );
    }

    @Override
    public WarehouseResponse updateWarehouse(UUID id, UpdateWarehouseRequest request){
        log.info("Updating warehouse ID: {}", id);
        var warehouse = repository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Warehouse not found for ID: {}", id);
                    return new WarehouseNotFoundException(id);
                });

        warehouse.update(request.name(), request.country(), request.city(), request.capacity());
        var updated = repository.save(warehouse);
        log.info("Warehouse ID {} updated successfully", id);

        return WarehouseMapper.toResponse(warehouse);
    }

    @Override
    public List<WarehouseResponse> getAllWarehouses(){
        log.info("Fetching all warehouses");
        var warehouses = repository.findAll();
        log.info("Fetched {} warehouses", warehouses.size());

        return warehouses
                .stream()
                .map(WarehouseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public WarehouseResponse getWarehouseById(UUID id){
        log.info("Fetching warehouse by ID: {}", id);
        var w = repository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Warehouse not found for ID: {}", id);
                    return new WarehouseNotFoundException(id);
                });
        log.info("Warehouse found: {}", w.getName());

        return new WarehouseResponse(
                w.getId(),
                w.getName(),
                w.getCountry(),
                w.getCity(),
                w.getCapacity()
        );
    }

    @Override
    public void deleteWarehouseById(UUID id){
        log.info("Deleting warehouse ID: {}", id);
        var warehouse = repository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Warehouse not found for ID: {}", id);
                    return new WarehouseNotFoundException(id);
                });

        repository.deleteById(id);
        log.info("Warehouse ID {} deleted", id);
    }

}