package com.marko.logistics.inventory.grpc;

import com.marko.logistics.inventory.application.dto.CreateInventoryRequest;
import com.marko.logistics.inventory.application.port.in.AddStockUseCase;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

import com.marko.logistics.inventory.grpc.InventoryServiceGrpc;
import com.marko.logistics.inventory.grpc.InventoryRequest;
import com.marko.logistics.inventory.grpc.InventoryResponse;

@GrpcService
public class InventoryGrpcService extends InventoryServiceGrpc.InventoryServiceImplBase {

    private final AddStockUseCase addStockUseCase;

    public InventoryGrpcService(AddStockUseCase addStockUseCase) {
        this.addStockUseCase = addStockUseCase;
    }

    @Override
    public void updateInventory(InventoryRequest request, StreamObserver<InventoryResponse> responseObserver) {
        try {
            System.out.println("🔥 gRPC CALLED");

            var stock = new CreateInventoryRequest(
                    request.getWarehouseId(),
                    request.getProductId(),
                    request.getQuantity()
            );

            addStockUseCase.addStock(stock);

            InventoryResponse response = InventoryResponse.newBuilder()
                    .setSuccess(true)
                    .setMessage("Inventory updated successfully")
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            InventoryResponse response = InventoryResponse.newBuilder()
                    .setSuccess(false)
                    .setMessage(e.getMessage())
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        }
    }
}