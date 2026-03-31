package com.marko.logistics.inventory.presentation.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marko.logistics.inventory.application.dto.CreateInventoryRequest;
import com.marko.logistics.inventory.application.dto.InventoryResponse;
import com.marko.logistics.inventory.application.service.InventoryService;
import com.marko.logistics.inventory.infrastructure.security.RequestContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class InventoryControllerTest {

    private MockMvc mockMvc;
    private InventoryService inventoryService;
    private ObjectMapper mapper;
    private RequestContext requestContext;

    @BeforeEach
    void setup() {
        inventoryService = mock(InventoryService.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new InventoryController(inventoryService, requestContext))
                .build();
        mapper = new ObjectMapper();
    }

    @Test
    void getAll_shouldReturnListOfInventory() throws Exception {
        InventoryResponse r1 = new InventoryResponse(UUID.randomUUID().toString(), "prod-1", "wh-1", 10);
        InventoryResponse r2 = new InventoryResponse(UUID.randomUUID().toString(), "prod-2", "wh-1", 20);

        when(inventoryService.getAllInventory()).thenReturn(List.of(r1, r2));

        mockMvc.perform(get("/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].productId").value("prod-1"))
                .andExpect(jsonPath("$[1].quantity").value(20));
    }

    @Test
    void getById_shouldReturnInventoryForWarehouse() throws Exception {
        String warehouseId = "wh-42";
        InventoryResponse r = new InventoryResponse(UUID.randomUUID().toString(), "prod-1", warehouseId, 5);

        when(inventoryService.getByWarehouseId(warehouseId)).thenReturn(List.of(r));

        mockMvc.perform(get("/inventory/" + warehouseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].warehouseId").value(warehouseId))
                .andExpect(jsonPath("$[0].productId").value("prod-1"));
    }

    @Test
    void create_shouldReturnCreatedInventoryResponse() throws Exception {
        CreateInventoryRequest request = new CreateInventoryRequest("wh-1", "prod-1", 30);
        InventoryResponse response = new InventoryResponse(UUID.randomUUID().toString(), "prod-1", "wh-1", 30);

        when(inventoryService.addStock(request)).thenReturn(response);

        mockMvc.perform(post("/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("prod-1"))
                .andExpect(jsonPath("$.warehouseId").value("wh-1"))
                .andExpect(jsonPath("$.quantity").value(30));
    }

    @Test
    void create_shouldCallAddStockOnce() throws Exception {
        CreateInventoryRequest request = new CreateInventoryRequest("wh-2", "prod-2", 10);
        InventoryResponse response = new InventoryResponse(UUID.randomUUID().toString(), "prod-2", "wh-2", 10);

        when(inventoryService.addStock(request)).thenReturn(response);

        mockMvc.perform(post("/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(inventoryService, times(1)).addStock(request);
    }
}