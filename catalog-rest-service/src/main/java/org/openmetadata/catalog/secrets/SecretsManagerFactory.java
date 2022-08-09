package org.openmetadata.catalog.secrets;

import org.openmetadata.catalog.services.connections.metadata.OpenMetadataServerConnection.SecretsManagerProvider;

public class SecretsManagerFactory {

  public static SecretsManager createSecretsManager(SecretsManagerConfiguration config, String clusterName) {
    SecretsManagerProvider secretManager =
        config != null && config.getSecretsManager() != null
            ? config.getSecretsManager()
            : SecretsManagerConfiguration.DEFAULT_SECRET_MANAGER;
    switch (secretManager) {
      case LOCAL:
        return LocalSecretsManager.getInstance(clusterName);
      case AWS:
        return AWSSecretsManager.getInstance(config, clusterName);
      default:
        throw new IllegalArgumentException("Not implemented secret manager store: " + secretManager);
    }
  }
}
