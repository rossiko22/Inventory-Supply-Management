package com.marko.logistics.gateway.util;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> OPEN_ENDPOINTS = List.of(
            "/auth/login",
            "/auth/logout",
            "/auth/register"
    );

    public Predicate<String> isSecure =
            uri -> OPEN_ENDPOINTS
                    .stream()
                    .noneMatch(uri::contains);
}
