import dotenv from 'dotenv';
dotenv.config();

export const config = {
  http: {
    port: parseInt(process.env['PORT'] ?? '3100', 10),
  },
  ws: {
    port: parseInt(process.env['WS_PORT'] ?? '3101', 10),
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
    host:     process.env['DB_HOST']     ?? 'localhost',
    port:     parseInt(process.env['DB_PORT'] ?? '5432', 10),
    database: process.env['DB_NAME']     ?? 'notifications_db',
    user:     process.env['DB_USER']     ?? 'postgres',
    password: process.env['DB_PASSWORD'] ?? 'postgres',
  },
} as const;