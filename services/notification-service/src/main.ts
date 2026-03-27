import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { catchError } from 'rxjs';

import { config } from './infrastructure/config/config';
import { initDb, pool } from './infrastructure/persistence/db';
import { KafkaConsumerStream } from './infrastructure/kafka/kafka-consumer.stream';
import { WsServer } from './infrastructure/websocket/ws-server';
import { WsBroadcaster } from './infrastructure/websocket/ws-broadcaster';
import { PgNotificationRepository } from './infrastructure/persistence/notification.repository.impl';
import { ProcessKafkaEventUseCase } from './application/use-cases/process-kafka-event.usecase';
import { createNotificationRouter } from './presentation/http/notification.router';

async function bootstrap(): Promise<void> {
  // 1. Database
  await initDb();

  // 2. Build the dependency graph manually (no DI container needed)
  const repository  = new PgNotificationRepository(pool);
  const wsServer    = new WsServer();
  const broadcaster = new WsBroadcaster(wsServer.clients$);
  const kafkaStream = new KafkaConsumerStream();
  const useCase     = new ProcessKafkaEventUseCase(repository, broadcaster);

  // 3. Wire the full reactive pipeline
  //    Kafka → parse → map → persist → broadcast
  //    One chain, no imperative control flow, error recovers via catchError
  useCase
    .execute(kafkaStream.messages$)
    .pipe(
      catchError((err, caught) => {
        // Return `caught` to resubscribe — stream never dies on a single bad message
        console.error('[Pipeline] recoverable error:', err.message);
        return caught;
      }),
    )
    .subscribe({
      next:  n   => console.log(`[Pipeline] ✓ [${n.severity}] ${n.title}`),
      error: err => console.error('[Pipeline] fatal error:', err),
    });

  // 4. Connect Kafka (starts pumping messages into the Subject)
  await kafkaStream.connect();

  // 5. HTTP REST API
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/notifications', createNotificationRouter(repository));
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));
  app.listen(config.http.port, () =>
    console.log(`[HTTP] listening on port ${config.http.port}`)
  );

  // 6. Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`[Main] ${signal} — shutting down gracefully`);
    await kafkaStream.disconnect();
    wsServer.close();
    await pool.end();
    process.exit(0);
  };
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch(err => {
  console.error('[Main] bootstrap failed:', err);
  process.exit(1);
});