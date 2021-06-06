package com.nagyf.serverlesscloud.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class CustomAuthenticationFailureHandler implements ServerAuthenticationFailureHandler {

    private final AuthService authService;

    @Autowired
    public CustomAuthenticationFailureHandler(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public Mono<Void> onAuthenticationFailure(final WebFilterExchange webFilterExchange, AuthenticationException e) {
        return this.authService.handleAuthenticationError(webFilterExchange.getExchange(), e);
    }
}
