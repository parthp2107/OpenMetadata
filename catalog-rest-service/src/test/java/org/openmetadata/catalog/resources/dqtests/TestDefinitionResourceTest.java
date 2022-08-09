package org.openmetadata.catalog.resources.dqtests;

import static javax.ws.rs.core.Response.Status.BAD_REQUEST;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.openmetadata.catalog.util.TestUtils.ADMIN_AUTH_HEADERS;
import static org.openmetadata.catalog.util.TestUtils.assertResponse;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.apache.http.client.HttpResponseException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
import org.openmetadata.catalog.Entity;
import org.openmetadata.catalog.api.tests.CreateTestDefinition;
import org.openmetadata.catalog.resources.EntityResourceTest;
import org.openmetadata.catalog.tests.TestDefinition;
import org.openmetadata.catalog.tests.TestPlatform;
import org.openmetadata.catalog.type.TestDefinitionEntityType;

public class TestDefinitionResourceTest extends EntityResourceTest<TestDefinition, CreateTestDefinition> {
  public TestDefinitionResourceTest() {
    super(
        Entity.TEST_DEFINITION,
        TestDefinition.class,
        TestDefinitionResource.TestDefinitionList.class,
        "testDefinition",
        TestDefinitionResource.FIELDS);
    supportsEmptyDescription = false;
    supportsFollowers = false;
    supportsAuthorizedMetadataOperations = false;
    supportsOwner = false;
  }

  public void setupTestDefinitions(TestInfo test) throws IOException {
    TestDefinitionResourceTest testDefinitionResourceTest = new TestDefinitionResourceTest();
    TEST_DEFINITION1 =
        testDefinitionResourceTest.getEntityByName("columnValueLengthsToBeBetween", "owner", ADMIN_AUTH_HEADERS);
    TEST_DEFINITION1_REFERENCE = TEST_DEFINITION1.getEntityReference();
    TEST_DEFINITION2 =
        testDefinitionResourceTest.getEntityByName("columnValuesToBeNotNull", "owner", ADMIN_AUTH_HEADERS);
    TEST_DEFINITION2_REFERENCE = TEST_DEFINITION2.getEntityReference();
    TEST_DEFINITION3 =
        testDefinitionResourceTest.getEntityByName("columnValuesMissingCount", "owner", ADMIN_AUTH_HEADERS);
    TEST_DEFINITION3_REFERENCE = TEST_DEFINITION3.getEntityReference();
  }

  @Test
  void post_testDefinitionWithoutRequiredFields_4xx(TestInfo test) {
    // Test Platform is required field
    assertResponse(
        () -> createEntity(createRequest(test).withTestPlatforms(null), ADMIN_AUTH_HEADERS),
        BAD_REQUEST,
        "testPlatforms must not be empty");

    // name is required field
    assertResponse(
        () -> createEntity(createRequest(test).withName(null), ADMIN_AUTH_HEADERS),
        BAD_REQUEST,
        "[name must not be null]");
  }

  @Override
  public CreateTestDefinition createRequest(String name) {
    return new CreateTestDefinition()
        .withName(name)
        .withDescription(name)
        .withEntityType(TestDefinitionEntityType.COLUMN)
        .withTestPlatforms(List.of(TestPlatform.OPEN_METADATA));
  }

  @Override
  public void validateCreatedEntity(
      TestDefinition createdEntity, CreateTestDefinition request, Map<String, String> authHeaders)
      throws HttpResponseException {
    assertEquals(request.getName(), createdEntity.getName());
    assertEquals(request.getDescription(), createdEntity.getDescription());
    assertEquals(request.getTestPlatforms(), createdEntity.getTestPlatforms());
  }

  @Override
  public void compareEntities(TestDefinition expected, TestDefinition updated, Map<String, String> authHeaders)
      throws HttpResponseException {
    assertEquals(expected.getName(), updated.getName());
    assertEquals(expected.getDescription(), updated.getDescription());
    assertEquals(expected.getTestPlatforms(), updated.getTestPlatforms());
  }

  @Override
  public TestDefinition validateGetWithDifferentFields(TestDefinition entity, boolean byName)
      throws HttpResponseException {
    return null;
  }

  @Override
  public void assertFieldChange(String fieldName, Object expected, Object actual) throws IOException {
    if (expected == actual) {
      return;
    }
    assertCommonFieldChange(fieldName, expected, actual);
  }
}
