package com.nagyf.serverlesscloud.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CloudFile implements CloudFSEntry {
    private String name;
    private String path;
}
