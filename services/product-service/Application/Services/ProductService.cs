using product_service.Application.DTOs;
using product_service.Application.Mappers;
using product_service.Application.Ports.In.Product;
using product_service.Domain.Entities;
using product_service.Domain.Exceptions;
using product_service.Infrastructure.Repositories;

namespace product_service.Application.Services;

public class ProductService :
    ICreateProductUseCase,
    IUpdateProductUseCase,
    IGetAllProductsUseCase,
    IGetProductUseCase,
    IGetByCategoryUseCase,
    IDeleteProductUseCase
{
    private readonly ProductRepositoryAdapter _productRepository;
    private readonly CategoryRepositoryAdapter _categoryRepository;

    public ProductService(ProductRepositoryAdapter productRepository, CategoryRepositoryAdapter categoryRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<ProductResponse> CreateProduct(CreateProductRequest request)
    {
        var category = await _categoryRepository.GetById(request.CategoryId);

        if (category == null)
        {
            throw new CategoryNotFoundException(request.CategoryId);
        }
        
        var product = Product.Create(request.Name, request.SKU, request.Description, request.Weight, request.CategoryId);
        
        var saved = await _productRepository.Save(product);
        return ProductMapper.ToResponse(saved);
    }

    public async Task<ProductResponse> UpdateProduct(Guid id, UpdateProductRequest request)
    {
        var product = await _productRepository.GetById(id);

        if (product == null)
        {
            throw new ProductNotFoundException(id);
        }
        
        var category = await _categoryRepository.GetById(request.CategoryId);

        if (category == null)
        {
            throw new CategoryNotFoundException(request.CategoryId);
        }

        product.Update(
            request.Name,
            request.SKU,
            request.Description,
            request.Weight,
            request.CategoryId
        );
        
        var saved = await _productRepository.Save(product);
        return ProductMapper.ToResponse(saved);
    }

    public async Task<IEnumerable<ProductResponse>> GetAllProducts()
    {
        var products = await _productRepository.GetAll();
        
        return products
            .Select(ProductMapper.ToResponse)
            .ToList();
    }
    
    public async Task<IEnumerable<ProductResponse>> GetAllByCategoryIdOrName(Guid? categoryId = null, string? categoryName = null)
    {
        var products = await _productRepository.GetByFilterAsync(categoryId, categoryName);
        
        return products
            .Select(ProductMapper.ToResponse)
            .ToList();
    }
    
    public async Task<ProductResponse> GetById(Guid id)
    {
        var product = await _productRepository.GetById(id);

        if (product == null)
        {
            throw new ProductNotFoundException(id);
        }
        
        return ProductMapper.ToResponse(product);
    }

    public async Task DeleteById(Guid id)
    {
        var product = await _productRepository.DeleteById(id);
        if (product == null)
        {
            throw new ProductNotFoundException(id);
        }
    }
}

