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

import static org.openmetadata.catalog.Entity.FIELD_OWNER;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.openmetadata.catalog.Entity;
import org.openmetadata.catalog.entity.services.MessagingService;
import org.openmetadata.catalog.resources.services.messaging.MessagingServiceResource;
import org.openmetadata.catalog.type.ChangeDescription;
import org.openmetadata.catalog.type.EntityReference;
import org.openmetadata.catalog.type.Include;
import org.openmetadata.catalog.type.Relationship;
import org.openmetadata.catalog.util.EntityInterface;
import org.openmetadata.catalog.util.EntityUtil.Fields;

public class MessagingServiceRepository extends EntityRepository<MessagingService> {
  private static final String UPDATE_FIELDS = "owner, connection";

  public MessagingServiceRepository(CollectionDAO dao) {
    super(
        MessagingServiceResource.COLLECTION_PATH,
        Entity.MESSAGING_SERVICE,
        MessagingService.class,
        dao.messagingServiceDAO(),
        dao,
        "",
        UPDATE_FIELDS);
    this.allowEdits = true;
  }

  @Override
  public MessagingService setFields(MessagingService entity, Fields fields) throws IOException {
    entity.setPipelines(fields.contains("pipelines") ? getIngestionPipelines(entity) : null);
    entity.setOwner(fields.contains(FIELD_OWNER) ? getOwner(entity) : null);
    return entity;
  }

  @Override
  public EntityInterface<MessagingService> getEntityInterface(MessagingService entity) {
    return new MessagingServiceEntityInterface(entity);
  }

  @Override
  public void prepare(MessagingService entity) throws IOException {
    // Check if owner is valid and set the relationship
    entity.setOwner(Entity.getEntityReference(entity.getOwner()));
  }

  @Override
  public void storeEntity(MessagingService service, boolean update) throws IOException {
    // Relationships and fields such as href are derived and not stored as part of json
    EntityReference owner = service.getOwner();

    // Don't store owner, database, href and tags as JSON. Build it on the fly based on relationships
    service.withOwner(null).withHref(null);

    store(service.getId(), service, update);

    // Restore the relationships
    service.withOwner(owner);
  }

  @Override
  public void storeRelationships(MessagingService entity) {
    // Add owner relationship
    storeOwner(entity, entity.getOwner());
  }

  @Override
  public EntityUpdater getUpdater(MessagingService original, MessagingService updated, Operation operation) {
    return new MessagingServiceUpdater(original, updated, operation);
  }

  private List<EntityReference> getIngestionPipelines(MessagingService service) throws IOException {
    List<String> ingestionPipelineIds =
        findTo(service.getId(), Entity.MESSAGING_SERVICE, Relationship.CONTAINS, Entity.INGESTION_PIPELINE);
    List<EntityReference> ingestionPipelines = new ArrayList<>();
    for (String ingestionPipelineId : ingestionPipelineIds) {
      ingestionPipelines.add(
          daoCollection
              .ingestionPipelineDAO()
              .findEntityReferenceById(UUID.fromString(ingestionPipelineId), Include.ALL));
    }
    return ingestionPipelines;
  }

  public static class MessagingServiceEntityInterface extends EntityInterface<MessagingService> {
    public MessagingServiceEntityInterface(MessagingService entity) {
      super(Entity.MESSAGING_SERVICE, entity);
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
    public EntityReference getOwner() {
      return entity.getOwner();
    }

    @Override
    public ChangeDescription getChangeDescription() {
      return entity.getChangeDescription();
    }

    @Override
    public MessagingService getEntity() {
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
    public void setOwner(EntityReference owner) {
      entity.setOwner(owner);
    }

    @Override
    public void setDeleted(boolean flag) {
      entity.setDeleted(flag);
    }

    @Override
    public MessagingService withHref(URI href) {
      return entity.withHref(href);
    }
  }

  public class MessagingServiceUpdater extends EntityUpdater {
    public MessagingServiceUpdater(MessagingService original, MessagingService updated, Operation operation) {
      super(original, updated, operation);
    }

    @Override
    public void entitySpecificUpdate() throws IOException {
      MessagingService origService = original.getEntity();
      MessagingService updatedService = updated.getEntity();
      recordChange("connection", origService.getConnection(), updatedService.getConnection(), true);
    }
  }
}
