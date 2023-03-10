package org.openmetadata.service.security.auth;

import static org.openmetadata.service.exception.CatalogExceptionMessage.MAX_FAILED_LOGIN_ATTEMPT;

import freemarker.template.TemplateException;
import java.io.IOException;
import java.util.UUID;
import org.jdbi.v3.core.Jdbi;
import org.openmetadata.catalog.security.client.SamlSSOClientConfig;
import org.openmetadata.schema.api.configuration.LoginConfiguration;
import org.openmetadata.schema.auth.LoginRequest;
import org.openmetadata.schema.entity.teams.User;
import org.openmetadata.service.OpenMetadataApplicationConfig;
import org.openmetadata.service.auth.JwtResponse;
import org.openmetadata.service.exception.EntityNotFoundException;
import org.openmetadata.service.jdbi3.CollectionDAO;
import org.openmetadata.service.jdbi3.TokenRepository;
import org.openmetadata.service.jdbi3.UserRepository;
import org.openmetadata.service.security.AuthenticationException;
import org.openmetadata.service.util.EmailUtil;

public class SamlAuthenticator implements AuthenticatorHandler {

  private UserRepository userRepository;
  private TokenRepository tokenRepository;
  private LoginAttemptCache loginAttemptCache;
  private SamlSSOClientConfig samlSSOClientConfig;
  private LoginConfiguration loginConfiguration;

  @Override
  public void init(OpenMetadataApplicationConfig config, Jdbi jdbi) {
    this.userRepository = new UserRepository(jdbi.onDemand(CollectionDAO.class));
    this.tokenRepository = new TokenRepository(jdbi.onDemand(CollectionDAO.class));
    this.samlSSOClientConfig = config.getAuthenticationConfiguration().getSamlConfiguration();
    this.loginAttemptCache = new LoginAttemptCache(config);
    this.loginConfiguration = config.getApplicationConfiguration().getLoginConfig();
  }

  @Override
  public JwtResponse loginUser(LoginRequest loginRequest) throws IOException, TemplateException {
    checkIfLoginBlocked(loginRequest.getEmail());
    User storedUser = lookUserInProvider(loginRequest.getEmail());
    validatePassword(storedUser, loginRequest.getPassword());
    User omUser = checkAndCreateUser(loginRequest.getEmail());
    return getJwtResponse(omUser, loginConfiguration.getJwtTokenExpiryTime());
  }

  @Override
  public void checkIfLoginBlocked(String userName) {
    if (loginAttemptCache.isLoginBlocked(userName)) {
      throw new AuthenticationException(MAX_FAILED_LOGIN_ATTEMPT);
    }
  }

  @Override
  public void recordFailedLoginAttempt(User storedUser) throws TemplateException, IOException {
    loginAttemptCache.recordFailedLogin(storedUser.getName());
    int failedLoginAttempt = loginAttemptCache.getUserFailedLoginCount(storedUser.getName());
    if (failedLoginAttempt == loginConfiguration.getMaxLoginFailAttempts()) {
      EmailUtil.getInstance()
          .sendAccountStatus(
              storedUser,
              "Multiple Failed Login Attempts.",
              String.format(
                  "Someone is tried accessing your account. Login is Blocked for %s minutes.",
                  loginConfiguration.getAccessBlockTime()));
    }
  }

  @Override
  public void validatePassword(User storedUser, String reqPassword) throws TemplateException, IOException {}

  @Override
  public User lookUserInProvider(String userName) {
    return null;
  }

  private User checkAndCreateUser(String email) throws IOException {
    // Check if the user exists in OM Database
    try {
      return userRepository.getByName(null, email.split("@")[0], userRepository.getFields("id,name,email"));
    } catch (EntityNotFoundException ex) {
      // User does not exist
      return userRepository.create(null, getUserForSaml(email));
    }
  }

  private User getUserForSaml(String email) {
    String userName = email.split("@")[0];
    return new User()
        .withId(UUID.randomUUID())
        .withName(userName)
        .withFullyQualifiedName(userName)
        .withEmail(email)
        .withIsBot(false)
        .withUpdatedBy(userName)
        .withUpdatedAt(System.currentTimeMillis())
        .withIsEmailVerified(false)
        .withAuthenticationMechanism(null);
  }
}
