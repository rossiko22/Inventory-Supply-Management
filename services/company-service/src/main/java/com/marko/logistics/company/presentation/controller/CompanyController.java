package com.marko.logistics.company.presentation.controller;

import com.marko.logistics.company.application.dto.CompanyResponse;
import com.marko.logistics.company.application.dto.CreateCompanyRequest;
import com.marko.logistics.company.application.dto.TotalCompaniesResponse;
import com.marko.logistics.company.application.dto.UpdateCompanyRequest;
import com.marko.logistics.company.application.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    public CompanyResponse create(
            @RequestBody CreateCompanyRequest request
            ){
        return companyService.createCompany(request);
    }

    @GetMapping
    public List<CompanyResponse> getAll(){
        return companyService.getAllCompanies();
    }

    @GetMapping("/{id}")
    public CompanyResponse getById(
            @PathVariable UUID id
    ){
        return companyService.getCompanyById(id);
    }

    @GetMapping("/total")
    public TotalCompaniesResponse getTotalCompanies(){
        return companyService.countAllCompanies();
    }

    @PutMapping("/{id}")
    public CompanyResponse update(
            @PathVariable UUID id,
            @RequestBody UpdateCompanyRequest request
            ){
        return companyService.updateCompany(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id){
        companyService.deleteCompanyById(id);
    }

}
