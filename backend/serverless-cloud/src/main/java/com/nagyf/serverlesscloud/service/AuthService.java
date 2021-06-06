package com.nagyf.serverlesscloud.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class AuthService {

    private final ConfigurationService configurationService;

    @Autowired
    public AuthService(final ConfigurationService configurationService) {
        this.configurationService = configurationService;
    }

    public Mono<Void> handleAuthenticationError(final ServerWebExchange exchange, final Exception ex) {
        if (ex != null) {
            log.error(ex.getMessage(), ex);
            final String cognitoLoginUrl = this.configurationService.getCognitoLoginUrl();
            final ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.FORBIDDEN);
            if (!response.getHeaders().containsKey(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN)) {
                response.getHeaders().add("Access-Control-Allow-Origin", "*");
                response.getHeaders().add("Access-Control-Allow-Methods", "*");
                response.getHeaders().add("Access-Control-Max-Age", "3600");
                response.getHeaders().add("Access-Control-Allow-Headers", "Authorization, content-type, xsrf-token");
                response.getHeaders().add("Access-Control-Expose-Headers", "xsrf-token");
            }
            final DataBuffer buffer = response.bufferFactory().wrap(cognitoLoginUrl.getBytes(StandardCharsets.UTF_8));
            return response.writeWith(Mono.just(buffer));
        } else {
            return Mono.empty();
        }
    }
}
