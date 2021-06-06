package com.nagyf.serverlesscloud.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class CustomServerAuthenticationEntryPoint implements ServerAuthenticationEntryPoint {

    private final AuthService authService;

    @Autowired
    public CustomServerAuthenticationEntryPoint(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public Mono<Void> commence(ServerWebExchange serverWebExchange, AuthenticationException e) {
        return this.authService.handleAuthenticationError(serverWebExchange, e);
    }
}
