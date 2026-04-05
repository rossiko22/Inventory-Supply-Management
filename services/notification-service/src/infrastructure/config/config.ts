import dotenv from 'dotenv';
dotenv.config();

export const config = {
  http: {
    port: parseInt(process.env['PORT'] ?? '8080', 10),
  },
  ws: {
    port: parseInt(process.env['WS_PORT'] ?? '9091', 10),
  },
  kafka: {
    brokers:  (process.env['KAFKA_BROKERS'] ?? 'localhost:9092').split(','),
    groupId:  process.env['KAFKA_GROUP_ID']  ?? 'notification-service-group',
    clientId: process.env['KAFKA_CLIENT_ID'] ?? 'notification-service',
    topics: {
      orderCreated:       process.env['KAFKA_TOPIC_ORDER_CREATED']        ?? 'order.created',
      orderStatusChanged: process.env['KAFKA_TOPIC_ORDER_STATUS_CHANGED'] ?? 'order.status.changed',
      inventoryLow:       process.env['KAFKA_TOPIC_INVENTORY_LOW']        ?? 'inventory.low',
      inventoryOut:       process.env['KAFKA_TOPIC_INVENTORY_OUT']        ?? 'inventory.out',
      warehouseCapacity:  process.env['KAFKA_TOPIC_WAREHOUSE_CAPACITY']   ?? 'warehouse.capacity',
    },
  },
  db: {
    host:     'localhost',
    port:     5439,
    database: 'notifications',
    user:     'administrator',
    password: 'D31#12Sdea@#123SdZZsdup@3!',
  },
} as const;