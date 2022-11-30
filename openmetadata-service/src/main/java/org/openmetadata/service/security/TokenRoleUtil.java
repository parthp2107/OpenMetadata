package org.openmetadata.service.security;

import com.auth0.jwt.interfaces.Claim;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.core.UriInfo;
import org.openmetadata.schema.entity.teams.User;
import org.openmetadata.schema.type.EntityReference;
import org.openmetadata.service.jdbi3.UserRepository;
import org.openmetadata.service.security.auth.CatalogSecurityContext;

public class TokenRoleUtil {

  public static final String ROLE_CLAIM = "roles";
  public static final String AUTH0_ROLE_CLAIM = "https://openmetadata.com/roles";

  private CatalogSecurityContext catalogSecurityContext;

  public String fetchRolesFromToken(Map<String, Claim> claims, String providerType, String providerName) {
    String roles;
    switch (providerType) {
      case "azure":
        roles = claims.get(ROLE_CLAIM).toString();
        return formatRoles(roles);
      case "auth0":
        roles = claims.get(AUTH0_ROLE_CLAIM).toString();
        return formatRoles(roles);
      case "custom-oidc":
        switch (providerName) {
          case "KeyCloak":
            roles = claims.get(ROLE_CLAIM).toString();
            return formatRoles(roles);
        }
    }
    return "null";
  }

  public List<EntityReference> checkRoles(
      User user, ContainerRequestContext containerRequestContext, UserRepository userRepository, UriInfo uriInfo)
      throws IOException {
    catalogSecurityContext = (CatalogSecurityContext) containerRequestContext.getSecurityContext();
    List<String> rolesList = new ArrayList<>(Arrays.asList(catalogSecurityContext.getRoles().split(",")));
    List<EntityReference> userRoles = user.getRoles();
    List<EntityReference> ssoRoles = userRepository.getRolesReference(rolesList);
    if (!userRoles.equals(ssoRoles)) {
      return ssoRoles;
    } else return userRoles;
  }

  private String formatRoles(String roles) {
    return roles.replaceAll("[\\[\\](){}\"]", "");
  }
}
