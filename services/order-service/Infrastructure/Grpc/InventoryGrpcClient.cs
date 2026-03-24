using Grpc.Net.Client;
using order_service.Application.Interfaces;
using OrderService.Protos;

namespace order_service.Infrastructure.Grpc;

public class InventoryGrpcClient : IInventoryGrpcClient
{
    public async Task SendInventoryAsync(Guid productId, Guid warehouseId, int quantity)
    {
        using var channel = GrpcChannel.ForAddress("http://localhost:9090");

        var client = new InventoryService.InventoryServiceClient(channel);

        var request = new InventoryRequest
        {
            ProductId = productId.ToString(),
            WarehouseId = warehouseId.ToString(),
            Quantity = quantity
        };

        await client.UpdateInventoryAsync(request);
    }
}