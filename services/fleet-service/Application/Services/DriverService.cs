using fleet_service.Application.DTOs;
using fleet_service.Application.Mappers;
using fleet_service.Application.Ports.In;
using fleet_service.Domain.Entities;
using fleet_service.Domain.Exceptions;
using fleet_service.Infrastructure.Repositories;

namespace fleet_service.Application.Services;

public class DriverService :
    ICreateDriverUseCase,
    IDeleteDriverUseCase,
    IGetAllDriversUseCase,
    IGetDriverUseCase,
    IUpdateDriverUseCase
{
    private readonly DriverRepositoryAdapter _driverRepository;
    private readonly VehicleRepositoryAdapter _vehicleRepository;

    public DriverService(VehicleRepositoryAdapter vehicleRepository, DriverRepositoryAdapter driverRepository)
    {
        _driverRepository = driverRepository;
        _vehicleRepository = vehicleRepository;
    }


    public async Task<DriverResponse> CreateDriver(CreateDriverRequest request)
    {
        var vehicle = await _vehicleRepository.GetById(request.VehicleId);

        if (vehicle == null)
        {
            throw new Exception("Vehicle not found");
        }

        var driver = Driver.Create
        (
            request.Name,
            request.Phone,
            request.Email,
            vehicle.Id,
            request.CompanyId
        );
        
        var saved = await _driverRepository.Save(driver);

        return DriverMapper.ToResponse(saved);
    }

    public async Task<DriverResponse> UpdateDriver(Guid id, UpdateDriverRequest request)
    {
        var driver = await _driverRepository.GetById(id);

        if (driver == null)
        {
            throw new DriverNotFoundException(id);
        }
        
        var vehicle = await _vehicleRepository.GetById(request.VehicleId);
        if (vehicle == null)
        {
            throw new VehicleNotFoundException(id);
        }
        
        driver.Update(
            request.Name,
            request.Phone,
            request.Email,
            request.VehicleId,
            request.CompanyId
            );
        
        var saved = await _driverRepository.Save(driver);
        return DriverMapper.ToResponse(saved);
    }

    public async Task<List<DriverResponse>> GetAllDrivers()
    {
        var drivers = await _driverRepository.GetAll();

        return drivers
            .Select(DriverMapper.ToResponse)
            .ToList();
    }


    public async Task<DriverResponse> GetDriverById(Guid id)
    {
        var driver = await _driverRepository.GetById(id);

        if (driver == null)
        {
            throw new DriverNotFoundException(id);
        }

        return DriverMapper.ToResponse(driver);
    }
    
    public async Task DeleteById(Guid id)
    {
        var driver = await _driverRepository.GetById(id);

        if (driver == null)
        {
            throw new DriverNotFoundException(id);
        }
    }
}