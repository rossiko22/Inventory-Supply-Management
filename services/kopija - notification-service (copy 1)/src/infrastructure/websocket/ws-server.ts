import { WebSocketServer, WebSocket } from 'ws';
import { BehaviorSubject } from 'rxjs';
import { config } from '../config/config';

export class WsServer {
  private readonly wss: WebSocketServer;

  // Reactive state — always holds the current set of live connections
  readonly clients$ = new BehaviorSubject<Set<WebSocket>>(new Set());

  constructor() {
    this.wss = new WebSocketServer({ port: config.ws.port });
    this.bindEvents();
    console.log(`[WS] listening on port ${config.ws.port}`);
  }

  private bindEvents(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      // Emit a new Set — immutable update pattern
      const next = new Set(this.clients$.value);
      next.add(ws);
      this.clients$.next(next);
      console.log(`[WS] client connected — total: ${next.size}`);

      ws.send(JSON.stringify({ type: 'CONNECTED' }));

      ws.on('close', () => {
        const updated = new Set(this.clients$.value);
        updated.delete(ws);
        this.clients$.next(updated);
        console.log(`[WS] client disconnected — total: ${updated.size}`);
      });

      ws.on('error', err =>
        console.error('[WS] client error:', err.message)
      );
    });
  }

  close(): void { this.wss.close(); }
}