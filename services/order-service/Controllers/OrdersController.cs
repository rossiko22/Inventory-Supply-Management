using Microsoft.AspNetCore.Mvc;
using order_service.Application.DTOs;
using order_service.Application.Interfaces;

namespace order_service.Controllers;

[ApiController]
[Route("orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _service;
    
    public OrdersController(IOrderService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        var order = await _service.CreateOrderAsync(request);
        return Ok(order);
    }

    [HttpGet]
    public async Task<IActionResult> GetOrdersAsync()
    {
        return Ok(await _service.GetOrdersAsync());
    }
    
    [HttpPut("status")]
    public async Task<IActionResult> UpdateStatus([FromBody] UpdateOrderStatusRequest request)
    {
        var result = await _service.UpdateStatusAsync(request.OrderId, request.Status);
        return Ok(result);
    }
}