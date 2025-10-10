package com.example.deviceservice.monitoring;

import org.springframework.boot.actuate.metrics.MetricsEndpoint;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class CpuAndMemoryUsageLogger {

    private final MetricsEndpoint metricsEndpoint;
    private static final Logger logger = LoggerFactory.getLogger(CpuAndMemoryUsageLogger.class);

    public CpuAndMemoryUsageLogger(MetricsEndpoint metricsEndpoint) {
        this.metricsEndpoint = metricsEndpoint;
    }

    @Scheduled(fixedRate = 60000) // every 60 seconds
    public void logSystemMetrics() {
        logCpuUsage();
        logJvmMemoryUsage();
    }

    private void logCpuUsage() {
        var response = metricsEndpoint.metric("system.cpu.usage", null);
        if (response != null && !response.getMeasurements().isEmpty()) {
            double cpuUsage = response.getMeasurements().get(0).getValue();
            logger.info("CPU Usage: {}", cpuUsage);
        }
    }

    private void logJvmMemoryUsage() {
        var usedMetric = metricsEndpoint.metric("jvm.memory.used", null);
        var maxMetric = metricsEndpoint.metric("jvm.memory.max", null);

        Double used = null;
        Double max = null;

        if (usedMetric != null && usedMetric.getMeasurements() != null) {
            for (var m : usedMetric.getMeasurements()) {
                if ("value".equals(m.getStatistic().getTagValueRepresentation())) {
                    used = m.getValue();
                    break;
                }
            }
        }

        if (maxMetric != null && maxMetric.getMeasurements() != null) {
            for (var m : maxMetric.getMeasurements()) {
                if ("value".equals(m.getStatistic().getTagValueRepresentation())) {
                    max = m.getValue();
                    break;
                }
            }
        }

        if (used != null && max != null) {
            double usedMB = used / (1024 * 1024);
            double maxMB = max / (1024 * 1024);
            double usagePercent = (usedMB / maxMB) * 100;

            logger.info(String.format("JVM Heap Memory Usage: %.2f MB used / %.2f MB max (%.2f%%)", usedMB, maxMB, usagePercent));
        } else {
            logger.warn("JVM memory metrics not available");
        }
    }


}
