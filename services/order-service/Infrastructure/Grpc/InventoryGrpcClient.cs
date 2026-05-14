using Grpc.Net.Client;
using order_service.Application.Interfaces;
using OrderService.Protos;
using Polly;
using Polly.CircuitBreaker;

namespace order_service.Infrastructure.Grpc;

/// <summary>
/// Calls inventory-service via gRPC, protected by a Circuit Breaker.
/// When the circuit is open the call is skipped and a warning is logged
/// so that the order status update itself still succeeds.
/// </summary>
public class InventoryGrpcClient : IInventoryGrpcClient
{
    private readonly ResiliencePipeline _circuitBreaker;
    private readonly ILogger<InventoryGrpcClient> _logger;

    public InventoryGrpcClient(ResiliencePipeline circuitBreaker, ILogger<InventoryGrpcClient> logger)
    {
        _circuitBreaker = circuitBreaker;
        _logger         = logger;
    }

    public async Task SendInventoryAsync(Guid productId, Guid warehouseId, int quantity)
    {
        try
        {
            await _circuitBreaker.ExecuteAsync(async ct =>
            {
                using var channel = GrpcChannel.ForAddress("http://localhost:9090");
                var client  = new InventoryService.InventoryServiceClient(channel);
                var request = new InventoryRequest
                {
                    ProductId   = productId.ToString(),
                    WarehouseId = warehouseId.ToString(),
                    Quantity    = quantity,
                };

                await client.UpdateInventoryAsync(request, cancellationToken: ct);

                _logger.LogInformation(
                    "[gRPC] Inventory updated — productId={ProductId}, warehouseId={WarehouseId}, qty={Quantity}",
                    productId, warehouseId, quantity);
            });
        }
        catch (BrokenCircuitException bce)
        {
            // Circuit is open — degrade gracefully so the order status change still persists.
            _logger.LogWarning(
                "[CircuitBreaker] Skipping inventory gRPC call — circuit is OPEN. " +
                "productId={ProductId}, warehouseId={WarehouseId}. Reason: {Reason}",
                productId, warehouseId, bce.Message);
        }
    }
}
