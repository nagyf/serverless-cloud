package com.nagyf.serverlesscloud.service;

import com.google.common.collect.Lists;
import com.nagyf.serverlesscloud.model.CloudDirectory;
import lombok.extern.slf4j.Slf4j;
import org.reactivestreams.Publisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Slf4j
@Service
public class CloudFSService {

    @Autowired
    public CloudFSService() {
    }

    public Publisher<CloudDirectory> getDirectory(final String path) {
        final CloudDirectory root = CloudDirectory.builder().name("/").path(path).build();
        return Flux.fromIterable(Lists.newArrayList(root));
    }
}
