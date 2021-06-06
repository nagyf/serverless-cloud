package com.nagyf.serverlesscloud.config;

import com.nagyf.serverlesscloud.service.ConfigurationService;
import com.nagyf.serverlesscloud.service.CustomAuthenticationFailureHandler;
import com.nagyf.serverlesscloud.service.CustomServerAuthenticationEntryPoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Autowired
    private ConfigurationService configurationService;

    @Autowired
    private CustomServerAuthenticationEntryPoint customServerAuthenticationEntryPoint;

    @Autowired
    private CustomAuthenticationFailureHandler customAuthenticationFailureHandler;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(final ServerHttpSecurity http) {
        http
                // TODO
                .cors().and()
                .csrf().disable()
                .authorizeExchange().pathMatchers(HttpMethod.OPTIONS, "/**").permitAll().and()
                .authorizeExchange().pathMatchers("/health").permitAll().and()
                .authorizeExchange().pathMatchers("/auth/**").permitAll().and()
                .authorizeExchange().anyExchange().authenticated().and()
                .exceptionHandling().authenticationEntryPoint(this.customServerAuthenticationEntryPoint).and()
                .oauth2ResourceServer().jwt();
        return http.build();
    }
}
