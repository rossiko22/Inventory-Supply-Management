using Microsoft.AspNetCore.Mvc;
using order_service.Application.DTOs;
using order_service.Application.Interfaces;

namespace order_service.Controllers;

[ApiController]
[Route("orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _service;
    private readonly IDocumentStorageService _documentStorageService;
    
    public OrdersController(IOrderService service, IDocumentStorageService documentStorageService)
    {
        _service = service;
        _documentStorageService = documentStorageService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        Console.WriteLine($"deliveryDate received: {request.DeliveryDate}");
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
    
    [HttpPost("upload-document")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadDocument([FromForm] UploadDocumentRequest request)
    {
        if (request.File == null || request.File.Length == 0)
            return BadRequest("No file provided.");

        var path = await _documentStorageService.SaveDocumentAsync(request.OrderId, request.File);
        return Ok(new { message = "Document saved.", path });
    }
}