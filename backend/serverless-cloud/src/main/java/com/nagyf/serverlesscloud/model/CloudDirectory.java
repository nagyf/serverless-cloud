package com.nagyf.serverlesscloud.model;

import com.google.common.collect.Lists;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CloudDirectory implements CloudFSEntry {
    private String name;
    private String path;

    @Builder.Default
    private List<CloudFSEntry> entries = Lists.newArrayList();
}
