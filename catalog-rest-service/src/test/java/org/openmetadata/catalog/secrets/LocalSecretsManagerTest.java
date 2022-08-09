package org.openmetadata.catalog.secrets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.openmetadata.catalog.services.connections.metadata.OpenMetadataServerConnection.AuthProvider.AUTH_0;
import static org.openmetadata.catalog.services.connections.metadata.OpenMetadataServerConnection.AuthProvider.AZURE;
import static org.openmetadata.catalog.services.connections.metadata.OpenMetadataServerConnection.AuthProvider.CUSTOM_OIDC;
import static org.openmetadata.catalog.services.connections.metadata.OpenMetadataServerConnection.AuthProvider.GOOGLE;
import static org.openmetadata.catalog.services.connections.metadata.OpenMetadataServerConnection.AuthProvider.NO_AUTH;
import static org.openmetadata.catalog.services.connections.metadata.OpenMetadataServerConnection.AuthProvider.OKTA;
import static org.openmetadata.catalog.services.connections.metadata.OpenMetadataServerConnection.AuthProvider.OPENMETADATA;

import java.util.stream.Stream;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.openmetadata.catalog.airflow.AirflowConfiguration;
import org.openmetadata.catalog.airflow.AuthConfiguration;
import org.openmetadata.catalog.api.services.CreateDatabaseService;
import org.openmetadata.catalog.api.services.CreateMlModelService;
import org.openmetadata.catalog.entity.services.ServiceType;
import org.openmetadata.catalog.fernet.Fernet;
import org.openmetadata.catalog.fixtures.ConfigurationFixtures;
import org.openmetadata.catalog.services.connections.database.MysqlConnection;
import org.openmetadata.catalog.services.connections.metadata.OpenMetadataServerConnection;
import org.openmetadata.catalog.services.connections.mlModel.SklearnConnection;

@ExtendWith(MockitoExtension.class)
public class LocalSecretsManagerTest {

  private static final boolean ENCRYPT = true;
  private static final boolean DECRYPT = false;
  private static final String ENCRYPTED_VALUE = "fernet:abcdef";
  private static final String DECRYPTED_VALUE = "123456";
  private static LocalSecretsManager secretsManager;

  @BeforeAll
  static void setUp() {
    secretsManager = LocalSecretsManager.getInstance("openmetadata");
    Fernet fernet = Mockito.mock(Fernet.class);
    lenient().when(fernet.decrypt(anyString())).thenReturn(DECRYPTED_VALUE);
    lenient().when(fernet.encrypt(anyString())).thenReturn(ENCRYPTED_VALUE);
    secretsManager.setFernet(fernet);
  }

  @AfterAll
  static void teardown() {
    // At the end of the test, remove mocked fernet instance so other tests run fine
    secretsManager.setFernet(Fernet.getInstance());
  }

  @Test
  void testIsLocalSecretsManager() {
    assertTrue(secretsManager.isLocal());
  }

  @Test
  void testEncryptDatabaseServiceConnectionConfig() {
    testEncryptDecryptServiceConnection(DECRYPTED_VALUE, ENCRYPTED_VALUE, ENCRYPT);
  }

  @Test
  void testDecryptDatabaseServiceConnectionConfig() {
    testEncryptDecryptServiceConnection(ENCRYPTED_VALUE, DECRYPTED_VALUE, DECRYPT);
  }

  @Test
  void testEncryptServiceConnectionWithoutPassword() {
    testEncryptDecryptServiceConnectionWithoutPassword(ENCRYPT);
  }

  @Test
  void testEncryptDecryptServiceConnectionWithoutPassword() {
    testEncryptDecryptServiceConnectionWithoutPassword(DECRYPT);
  }

  @Test
  void testDecryptServerConnection() {
    AirflowConfiguration airflowConfiguration =
        ConfigurationFixtures.buildAirflowConfig(OpenMetadataServerConnection.AuthProvider.GOOGLE);
    airflowConfiguration.setAuthConfig(ConfigurationFixtures.buildGoogleAuthConfig());
    OpenMetadataServerConnection expectedServerConnection =
        new OpenMetadataServerConnection()
            .withAuthProvider(OpenMetadataServerConnection.AuthProvider.GOOGLE)
            .withHostPort(airflowConfiguration.getMetadataApiEndpoint())
            .withSecurityConfig(airflowConfiguration.getAuthConfig().getGoogle());
    OpenMetadataServerConnection actualServerConnection = secretsManager.decryptServerConnection(airflowConfiguration);
    assertEquals(expectedServerConnection, actualServerConnection);
  }

  @Test
  void testEncryptAirflowConnection() {
    AirflowConfiguration expectedAirflowConfiguration = mock(AirflowConfiguration.class);
    AirflowConfiguration actualAirflowConfiguration =
        secretsManager.encryptAirflowConnection(expectedAirflowConfiguration);
    assertEquals(expectedAirflowConfiguration, actualAirflowConfiguration);
    verifyNoInteractions(expectedAirflowConfiguration);
  }

  @Test
  void testReturnsExpectedSecretManagerProvider() {
    assertEquals(OpenMetadataServerConnection.SecretsManagerProvider.LOCAL, secretsManager.getSecretsManagerProvider());
  }

  @ParameterizedTest
  @MethodSource("testDecryptAuthProviderConfigParams")
  void testDecryptAuthProviderConfig(
      Object expectedAuthProviderConfig,
      OpenMetadataServerConnection.AuthProvider authProvider,
      AuthConfiguration authConfig) {
    assertEquals(expectedAuthProviderConfig, secretsManager.decryptAuthProviderConfig(authProvider, authConfig));
  }

  private void testEncryptDecryptServiceConnectionWithoutPassword(boolean decrypt) {
    SklearnConnection sklearnConnection = new SklearnConnection();
    CreateMlModelService.MlModelServiceType databaseServiceType = CreateMlModelService.MlModelServiceType.Sklearn;
    String connectionName = "test";

    Object actualConfig =
        secretsManager.encryptOrDecryptServiceConnectionConfig(
            sklearnConnection, databaseServiceType.value(), connectionName, ServiceType.ML_MODEL, decrypt);

    assertNotSame(sklearnConnection, actualConfig);
  }

  private void testEncryptDecryptServiceConnection(String encryptedValue, String decryptedValue, boolean decrypt) {
    MysqlConnection mysqlConnection = new MysqlConnection();
    mysqlConnection.setPassword(encryptedValue);
    CreateDatabaseService.DatabaseServiceType databaseServiceType = CreateDatabaseService.DatabaseServiceType.Mysql;
    String connectionName = "test";

    Object actualConfig =
        secretsManager.encryptOrDecryptServiceConnectionConfig(
            mysqlConnection, databaseServiceType.value(), connectionName, ServiceType.DATABASE, decrypt);

    assertEquals(decryptedValue, ((MysqlConnection) actualConfig).getPassword());
    assertNotSame(mysqlConnection, actualConfig);
  }

  private static Stream<Arguments> testDecryptAuthProviderConfigParams() {
    return Stream.of(
        Arguments.of(null, NO_AUTH, null),
        Arguments.of(
            ConfigurationFixtures.buildAuth0SSOClientConfig(), AUTH_0, ConfigurationFixtures.buildAuth0Config()),
        Arguments.of(
            ConfigurationFixtures.buildGoogleSSOClientConfig(), GOOGLE, ConfigurationFixtures.buildGoogleAuthConfig()),
        Arguments.of(
            ConfigurationFixtures.buildOktaSSOClientConfig(), OKTA, ConfigurationFixtures.buildOktaAuthConfig()),
        Arguments.of(
            ConfigurationFixtures.buildOpenMetadataJWTClientConfig(),
            OPENMETADATA,
            ConfigurationFixtures.buildOpenmetadataAuthConfig()),
        Arguments.of(
            ConfigurationFixtures.buildCustomOIDCSSOClientConfig(),
            CUSTOM_OIDC,
            ConfigurationFixtures.buildCustomOIDCConfig()),
        Arguments.of(
            ConfigurationFixtures.buildAzureClientConfig(), AZURE, ConfigurationFixtures.buildAzureAuthConfig()));
  }
}
