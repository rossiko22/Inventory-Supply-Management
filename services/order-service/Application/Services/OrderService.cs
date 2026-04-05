using Microsoft.Extensions.Logging;
using order_service.Application.DTOs;
using order_service.Application.Interfaces;
using order_service.Domain;
using order_service.Domain.Enums;

namespace order_service.Application.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _repository;
    private readonly IInventoryGrpcClient _inventoryClient;
    private readonly ILogger<OrderService> _logger;
    private readonly IDocumentStorageService _documentStorageService;
    private readonly IKafkaProducer _kafkaProducer;

    public OrderService(
        IOrderRepository repository,
        IInventoryGrpcClient inventoryClient,
        ILogger<OrderService> logger,
        IDocumentStorageService documentStorageService,
        IKafkaProducer kafkaProducer)
    {
        _repository = repository;
        _inventoryClient = inventoryClient;
        _logger = logger;
        _documentStorageService = documentStorageService;
        _kafkaProducer =  kafkaProducer;
    }
    
    public async Task<OrderResponse> UpdateStatusAsync(Guid orderId, Status status)
    {
        _logger.LogInformation("Updating status for orderId={OrderId} to {Status}", orderId, status);

        var order = await _repository.GetByIdAsync(orderId);

        if (order == null)
        {
            _logger.LogWarning("Order not found: orderId={OrderId}", orderId);
            throw new Exception("Order not found");
        }

        var oldStatus = order.Status.ToString();

        order.UpdateStatus(status);
        await _repository.UpdateAsync(order);

        _logger.LogInformation("Order {OrderId} status updated to {Status}", orderId, status);

        if (status == Status.Closed)
        {
            _logger.LogInformation("Order {OrderId} closed — sending inventory update via gRPC: productId={ProductId}, warehouseId={WarehouseId}, quantity={Quantity}",
                orderId, order.ProductId, order.WarehouseId, order.Quantity);

            await _inventoryClient.SendInventoryAsync(order.ProductId, order.WarehouseId, order.Quantity);

            _logger.LogInformation("Inventory gRPC call completed for order {OrderId}", orderId);
        }

        // ── Publish to Kafka ──────────────────────────────────────────────
        await _kafkaProducer.PublishOrderStatusChangedAsync(new OrderStatusChangedEvent
        {
            OrderId   = order.Id.ToString(),
            OldStatus = oldStatus,
            NewStatus = status.ToString(),
            ChangedAt = DateTime.UtcNow.ToString("o"),
        });
        
        return new OrderResponse
        {
            Id = order.Id,
            ProductId = order.ProductId,
            CompanyId = order.CompanyId,
            WarehouseId = order.WarehouseId,
            DriverId = order.DriverId,
            Quantity = order.Quantity,
            Status = order.Status,
            CreatedAt = order.CreatedAt,
            LastModified = order.LastModified
        };
    }

    public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request)
    {
        _logger.LogInformation("Creating order: productId={ProductId}, quantity={Quantity}",
            request.ProductId, request.Quantity);

        var order = new Order(
            request.ProductId,
            request.CompanyId,
            request.WarehouseId,
            request.DriverId,
            request.Quantity,
            request.DeliveryDate
        );

        var saved = await _repository.SaveAsync(order);

        _logger.LogInformation("Order created successfully: orderId={OrderId}", saved.Id);

        // ── Publish to Kafka ──────────────────────────────────────────────
        await _kafkaProducer.PublishOrderCreatedAsync(new OrderCreatedEvent
        {
            OrderId     = saved.Id.ToString(),
            CompanyId   = saved.CompanyId.ToString(),
            CompanyName = saved.CompanyId.ToString(), // swap for real name if you have it
            WarehouseId = saved.WarehouseId.ToString(),
            Status      = saved.Status.ToString(),
            CreatedAt   = saved.CreatedAt.ToString("o"),
        });
        
        return new OrderResponse
        {
            Id = saved.Id,
            ProductId = saved.ProductId,
            CompanyId = saved.CompanyId,
            WarehouseId = saved.WarehouseId,
            DriverId = saved.DriverId,
            Quantity = saved.Quantity,
            Status = saved.Status,
            DeliveryDate = saved.DeliveryDate,
            CreatedAt = saved.CreatedAt,
            LastModified = saved.LastModified
        };
    }

    public async Task<List<OrderResponse>> GetOrdersAsync()
    {
        _logger.LogInformation("Fetching all orders");
        var orders = await _repository.GetAllAsync();
        _logger.LogDebug("Retrieved {Count} orders", orders.Count);

        return orders.Select(o => new OrderResponse
        {
            Id = o.Id,
            ProductId = o.ProductId,
            CompanyId = o.CompanyId,
            WarehouseId = o.WarehouseId,
            DriverId = o.DriverId,
            Quantity = o.Quantity,
            Status = o.Status,
            DeliveryDate = o.DeliveryDate,
            CreatedAt = o.CreatedAt,
            LastModified = o.LastModified
        }).ToList();
    }
}
