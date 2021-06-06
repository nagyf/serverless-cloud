package com.nagyf.serverlesscloud.service;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Getter
public class ConfigurationService {

    @Value("#{environment.CLIENT_ID}")
    private String cognitoClientId;

    @Value("#{environment.CLIENT_SECRET}")
    private String cognitoClientSecret;

    @Value("#{environment.COGNITO_URL}")
    private String cognitoUrl;

    @Value("#{environment.REDIRECT_URI}")
    private String cognitoRedirectUri;

    public String getCognitoLoginUrl() {
        return String.format("%s/login?response_type=code&client_id=%s&redirect_uri=%s",
                this.getCognitoUrl(),
                this.getCognitoClientId(),
                this.getCognitoRedirectUri()
        );
    }

    public String getCognitoTokenUrl(){
        return String.format("%s/oauth2/token", this.getCognitoUrl());
    }
}
