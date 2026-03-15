package com.marko.logistics.warehouse.infrastructure.persistence.entity;

import com.marko.logistics.warehouse.domain.enums.City;
import com.marko.logistics.warehouse.domain.enums.Country;
import jakarta.persistence.*;


import java.util.UUID;

@Entity
@Table(name = "warehouses")
public class WarehouseJpaEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Country country;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private City city;

    @Column(nullable = false)
    private Integer capacity;

    protected WarehouseJpaEntity() {}

    public WarehouseJpaEntity(UUID id, String name, Country country, City city, Integer capacity){
        this.id = id;
        this.name = name;
        this.country = country;
        this.city = city;
        this.capacity = capacity;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Country getCountry() {
        return country;
    }

    public City getCity() {
        return city;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCountry(Country country) {
        this.country = country;
    }

    public void setCity(City city) {
        this.city = city;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
}
