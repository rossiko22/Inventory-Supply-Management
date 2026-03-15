package com.marko.logistics.warehouse.domain.model;

import com.marko.logistics.warehouse.domain.enums.City;
import com.marko.logistics.warehouse.domain.enums.Country;

import java.util.UUID;


public class Warehouse {
    private UUID id;
    private String name;
    private Country country;
    private City city;
    private Integer capacity;

    public Warehouse(UUID id, String name, Country country, City city, Integer capacity) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.city = city;
        this.capacity = capacity;
    }

    public static Warehouse create(String name, Country country, City city, Integer capacity) {
        return new Warehouse(
                UUID.randomUUID(),
                name,
                country,
                city,
                capacity
        );
    }

    public void update(String name, Country country, City city, Integer capacity) {
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
}
