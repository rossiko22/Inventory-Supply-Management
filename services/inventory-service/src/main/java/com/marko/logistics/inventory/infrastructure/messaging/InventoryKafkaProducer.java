package com.marko.logistics.inventory.infrastructure.messaging;

import com.marko.logistics.inventory.application.event.InventoryUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryKafkaProducer {
    private static final String TOPIC = "inventory.stock.updated";

    private final KafkaTemplate<String, InventoryUpdatedEvent> kafkaTemplate;

    public void sendStockUpdatedEvent(String warehouseId, int quantity) {
        var event = new InventoryUpdatedEvent(warehouseId, quantity);
        kafkaTemplate.send(TOPIC, warehouseId, event)  // keyed by warehouseId for ordering
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to send Kafka event for warehouseId={}: {}", warehouseId, ex.getMessage());
                    } else {
                        log.info("Kafka event sent → topic={}, warehouseId={}, quantity={}",
                                TOPIC, warehouseId, quantity);
                    }
                });
    }
}
