package com.nagyf.serverlesscloud.api;

import com.nagyf.serverlesscloud.service.AuthService;
import com.nagyf.serverlesscloud.service.ConfigurationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.*;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

/**
 * Authentication using Authorization code grant:
 * https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-user-pool-oauth-2-0-grants/
 */
@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthAPI {

    private final ConfigurationService configurationService;
    private final AuthService authService;
    private final RestTemplate restTemplate;

    @Autowired
    public AuthAPI(final ConfigurationService configurationService, AuthService authService, final RestTemplate restTemplate) {
        this.configurationService = configurationService;
        this.authService = authService;
        this.restTemplate = restTemplate;
    }

    @PostMapping("/verify")
    public Mono<Void> verifyAuthorizationCode(@RequestBody final String code, final ServerWebExchange exchange) {
        final String cognitoTokenUrl = this.configurationService.getCognitoTokenUrl();

        final HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(this.configurationService.getCognitoClientId(), this.configurationService.getCognitoClientSecret());

        final MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("code", code);
        params.add("client_id", this.configurationService.getCognitoClientId());
        params.add("redirect_uri", this.configurationService.getCognitoRedirectUri());

        final HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);
        try {
            final ResponseEntity<String> response = this.restTemplate.exchange(cognitoTokenUrl, HttpMethod.POST, entity, String.class);
            final ServerHttpResponse serverHttpResponse = exchange.getResponse();
            serverHttpResponse.setStatusCode(HttpStatus.OK);
            final DataBuffer responseBytes = serverHttpResponse.bufferFactory().wrap(response.getBody().getBytes(StandardCharsets.UTF_8));
            return serverHttpResponse.writeWith(Mono.just(responseBytes));
        } catch (final HttpClientErrorException ex) {
            log.info("Code: {}, error: {}", code, ex.getMessage());
            return this.authService.handleAuthenticationError(exchange, ex);
        }
    }
}
