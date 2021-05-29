package com.nagyf.serverlesscloud.api;

import com.nagyf.serverlesscloud.model.CloudDirectory;
import com.nagyf.serverlesscloud.service.CloudFSService;
import org.reactivestreams.Publisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class CloudAPI {

    private final CloudFSService cloudFSService;

    @Autowired
    public CloudAPI(final CloudFSService cloudFSService) {
        this.cloudFSService = cloudFSService;
    }

    @GetMapping
    public Publisher<CloudDirectory> root() {
        return this.cloudFSService.getDirectory("/");
    }
}
