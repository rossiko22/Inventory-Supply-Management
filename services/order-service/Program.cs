using Microsoft.EntityFrameworkCore;
using order_service.Application.Interfaces;
using order_service.Infrastructure.Grpc;
using order_service.Infrastructure.Persistence;
using order_service.Application.Services;
using order_service.Infrastructure.Kafka;

namespace order_service;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // ── CORS ──────────────────────────────────────────────────────────
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAngular", policy =>
            {
                policy
                    .WithOrigins("http://localhost:4200")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials(); // required because Angular sends withCredentials: true
            });
        });
        
        // Controllers
        builder.Services.AddControllers();

        // Kafka
        builder.Services.AddSingleton<IKafkaProducer, KafkaProducer>();
        
        // Dependency Injection
        builder.Services.AddScoped<IOrderService, Application.Services.OrderService>();
        builder.Services.AddScoped<IOrderRepository, OrderRepository>();
        
        builder.Services.AddScoped<IDocumentStorageService, DocumentStorageService>();

        builder.Services.AddScoped<IInventoryGrpcClient, InventoryGrpcClient>();
        // Database
        builder.Services.AddDbContext<OrderDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        // Swagger
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new()
            {
                Title = "Order Service API",
                Version = "v1",
                Description = "API for managing orders"
            });
        });

        var app = builder.Build();

        // ✅ Enable Swagger ONLY in development
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();

            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "Order Service API v1");
                options.RoutePrefix = string.Empty; // Opens Swagger at root (http://localhost:xxxx/)
            });
        }

        app.UseHttpsRedirection();

        app.UseAuthorization();

        app.MapControllers();

        app.UseCors("AllowAngular");
        app.Run();
    }
}