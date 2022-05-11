/*
 *  Copyright 2021 Collate
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

package org.openmetadata.catalog.jdbi3;

import static org.openmetadata.common.utils.CommonUtil.listOrEmpty;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.ws.rs.core.UriInfo;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.jdbi.v3.sqlobject.transaction.Transaction;
import org.openmetadata.catalog.Entity;
import org.openmetadata.catalog.entity.teams.Role;
import org.openmetadata.catalog.entity.teams.User;
import org.openmetadata.catalog.exception.CatalogExceptionMessage;
import org.openmetadata.catalog.exception.EntityNotFoundException;
import org.openmetadata.catalog.resources.teams.RoleResource;
import org.openmetadata.catalog.type.ChangeDescription;
import org.openmetadata.catalog.type.EntityReference;
import org.openmetadata.catalog.type.Relationship;
import org.openmetadata.catalog.util.EntityInterface;
import org.openmetadata.catalog.util.EntityUtil;
import org.openmetadata.catalog.util.EntityUtil.Fields;
import org.openmetadata.catalog.util.JsonUtils;
import org.openmetadata.catalog.util.ResultList;

@Slf4j
public class RoleRepository extends EntityRepository<Role> {
  public RoleRepository(CollectionDAO dao) {
    super(RoleResource.COLLECTION_PATH, Entity.ROLE, Role.class, dao.roleDAO(), dao, "policies", "policies");
  }

  @Override
  public Role setFields(Role role, Fields fields) throws IOException {
    role.setPolicies(fields.contains("policies") ? getPolicies(role) : null);
    role.setTeams(fields.contains("teams") ? getTeams(role) : null);
    role.setUsers(fields.contains("users") ? getUsers(role) : null);
    return role;
  }

  private List<EntityReference> getPolicies(@NonNull Role role) throws IOException {
    List<String> result = findTo(role.getId(), Entity.ROLE, Relationship.HAS, Entity.POLICY);
    return EntityUtil.populateEntityReferences(result, Entity.POLICY);
  }

  private List<EntityReference> getUsers(@NonNull Role role) throws IOException {
    List<String> ids = findFrom(role.getId(), Entity.ROLE, Relationship.HAS, Entity.USER);
    return EntityUtil.populateEntityReferences(ids, Entity.USER);
  }

  private List<EntityReference> getTeams(@NonNull Role role) throws IOException {
    List<String> ids = findFrom(role.getId(), Entity.ROLE, Relationship.HAS, Entity.TEAM);
    return EntityUtil.populateEntityReferences(ids, Entity.TEAM);
  }

  @Override
  public void restorePatchAttributes(Role original, Role updated) {
    // Patch can't make changes to following fields. Ignore the changes
    updated.withName(original.getName()).withId(original.getId());
  }

  @Override
  public EntityInterface<Role> getEntityInterface(Role entity) {
    return new RoleEntityInterface(entity);
  }

  /**
   * If policy does not exist for this role, create a new entity reference. The actual policy gets created within the
   * storeEntity method call.
   */
  @Override
  public void prepare(Role role) throws IOException {
    EntityUtil.populateEntityReferences(role.getPolicies());
  }

  /**
   * For regular incoming POST, PUT, PATCH operation calls, {@link RoleRepository#prepare(Role)} would create a policy
   * entity reference if it does not exist.
   *
   * <p>This method ensures that the role and its policy are stored correctly.
   */
  @Override
  @Transaction
  public void storeEntity(Role role, boolean update) throws IOException {
    // Don't store policy and href as JSON. Build it on the fly based on relationships
    List<EntityReference> policies = role.getPolicies();
    role.withPolicies(null).withHref(null);
    store(role.getId(), role, update);
    role.withPolicies(policies); // Restore policies
  }

  @Override
  public void storeRelationships(Role role) {
    for (EntityReference policy : listOrEmpty(role.getPolicies())) {
      addRelationship(role.getId(), policy.getId(), Entity.ROLE, Entity.POLICY, Relationship.HAS);
    }
  }

  public ResultList<Role> getDefaultRolesResultList(UriInfo uriInfo, Fields fields) throws IOException {
    List<Role> roles = getDefaultRoles(uriInfo, fields);
    return new ResultList<>(roles, null, null, roles.size());
  }

  private List<Role> getDefaultRoles(UriInfo uriInfo, Fields fields) throws IOException {
    List<Role> roles = new ArrayList<>();
    for (String roleJson : daoCollection.roleDAO().getDefaultRoles()) {
      roles.add(withHref(uriInfo, setFields(JsonUtils.readValue(roleJson, Role.class), fields)));
    }
    if (roles.size() > 1) {
      LOG.warn(
          "{} roles {}, are registered as default. There SHOULD be only one role marked as default.",
          roles.size(),
          roles.stream().map(Role::getName).collect(Collectors.toList()));
    }
    return roles;
  }

  @Override
  public EntityUpdater getUpdater(Role original, Role updated, Operation operation) {
    return new RoleUpdater(original, updated, operation);
  }

  public static class RoleEntityInterface extends EntityInterface<Role> {
    public RoleEntityInterface(Role entity) {
      super(Entity.ROLE, entity);
    }

    @Override
    public UUID getId() {
      return entity.getId();
    }

    @Override
    public String getDescription() {
      return entity.getDescription();
    }

    @Override
    public String getDisplayName() {
      return entity.getDisplayName();
    }

    @Override
    public String getName() {
      return entity.getName();
    }

    @Override
    public Boolean isDeleted() {
      return entity.getDeleted();
    }

    @Override
    public String getFullyQualifiedName() {
      return entity.getName();
    }

    @Override
    public Double getVersion() {
      return entity.getVersion();
    }

    @Override
    public String getUpdatedBy() {
      return entity.getUpdatedBy();
    }

    @Override
    public long getUpdatedAt() {
      return entity.getUpdatedAt();
    }

    @Override
    public URI getHref() {
      return entity.getHref();
    }

    @Override
    public Role getEntity() {
      return entity;
    }

    @Override
    public void setId(UUID id) {
      entity.setId(id);
    }

    @Override
    public void setDescription(String description) {
      entity.setDescription(description);
    }

    @Override
    public void setDisplayName(String displayName) {
      entity.setDisplayName(displayName);
    }

    @Override
    public void setName(String name) {
      entity.setName(name);
    }

    @Override
    public void setUpdateDetails(String updatedBy, long updatedAt) {
      entity.setUpdatedBy(updatedBy);
      entity.setUpdatedAt(updatedAt);
    }

    @Override
    public void setChangeDescription(Double newVersion, ChangeDescription changeDescription) {
      entity.setVersion(newVersion);
      entity.setChangeDescription(changeDescription);
    }

    @Override
    public void setDeleted(boolean flag) {
      entity.setDeleted(flag);
    }

    @Override
    public Role withHref(URI href) {
      return entity.withHref(href);
    }

    @Override
    public ChangeDescription getChangeDescription() {
      return entity.getChangeDescription();
    }
  }

  /** Handles entity updated from PUT and POST operation. */
  public class RoleUpdater extends EntityUpdater {
    public RoleUpdater(Role original, Role updated, Operation operation) {
      super(original, updated, operation);
    }

    @Override
    public void entitySpecificUpdate() throws IOException {
      updateDefault(original.getEntity(), updated.getEntity());
    }

    private void updateDefault(Role origRole, Role updatedRole) throws IOException {
      long startTime = System.nanoTime();
      if (Boolean.FALSE.equals(origRole.getDefaultRole()) && Boolean.TRUE.equals(updatedRole.getDefaultRole())) {
        setDefaultToTrue(updatedRole);
      }
      if (Boolean.TRUE.equals(origRole.getDefaultRole()) && Boolean.FALSE.equals(updatedRole.getDefaultRole())) {
        setDefaultToFalse(updatedRole);
      }
      recordChange("default", origRole.getDefaultRole(), updatedRole.getDefaultRole());
      LOG.debug(
          "Took {} ns to update {} role field default from {} to {}",
          System.nanoTime() - startTime,
          updatedRole.getName(),
          origRole.getDefaultRole(),
          updatedRole.getDefaultRole());
    }

    private void setDefaultToTrue(Role role) throws IOException {
      List<Role> defaultRoles = getDefaultRoles(null, Fields.EMPTY_FIELDS);
      EntityRepository<Role> roleRepository = Entity.getEntityRepository(Entity.ROLE);
      // Set default=FALSE for all existing default roles.
      for (Role defaultRole : defaultRoles) {
        if (defaultRole.getId().equals(role.getId())) {
          // Skip the current role which is being set with default=TRUE.
          continue;
        }
        Role origDefaultRole = roleRepository.get(null, defaultRole.getId().toString(), Fields.EMPTY_FIELDS);
        Role updatedDefaultRole = roleRepository.get(null, defaultRole.getId().toString(), Fields.EMPTY_FIELDS);
        updatedDefaultRole = updatedDefaultRole.withDefaultRole(false);
        new RoleUpdater(origDefaultRole, updatedDefaultRole, Operation.PATCH).update();
      }
    }

    private void setDefaultToFalse(Role role) {
      LOG.info("Deleting 'user --- has ---> role' relationship for {} role", role.getName());
      daoCollection
          .relationshipDAO()
          .deleteTo(role.getId().toString(), Entity.ROLE, Relationship.HAS.ordinal(), Entity.USER);
    }

    private List<User> getAllUsers() {
      EntityRepository<User> userRepository = Entity.getEntityRepository(Entity.USER);
      try {
        // Assumptions:
        // - we will not have more than Integer.MAX_VALUE users in the system.
        // - we do not need to update deleted user's roles.
        ListFilter filter = new ListFilter();
        return userRepository.listAfter(null, Fields.EMPTY_FIELDS, filter, Integer.MAX_VALUE - 1, null).getData();
      } catch (IOException e) {
        throw EntityNotFoundException.byMessage(CatalogExceptionMessage.entitiesNotFound(Entity.USER));
      }
    }
  }
}
