package org.openmetadata.catalog.resources.dqtests;

import com.google.inject.Inject;
import io.swagger.annotations.Api;
import io.swagger.v3.oas.annotations.ExternalDocumentation;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import javax.json.JsonPatch;
import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.PATCH;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import javax.ws.rs.core.UriInfo;
import lombok.extern.slf4j.Slf4j;
import org.apache.maven.shared.utils.io.IOUtil;
import org.openmetadata.catalog.CatalogApplicationConfig;
import org.openmetadata.catalog.Entity;
import org.openmetadata.catalog.api.tests.CreateTestDefinition;
import org.openmetadata.catalog.jdbi3.CollectionDAO;
import org.openmetadata.catalog.jdbi3.ListFilter;
import org.openmetadata.catalog.jdbi3.TestDefinitionRepository;
import org.openmetadata.catalog.resources.Collection;
import org.openmetadata.catalog.resources.EntityResource;
import org.openmetadata.catalog.security.Authorizer;
import org.openmetadata.catalog.tests.TestDefinition;
import org.openmetadata.catalog.type.EntityHistory;
import org.openmetadata.catalog.type.Include;
import org.openmetadata.catalog.type.TestDefinitionEntityType;
import org.openmetadata.catalog.util.EntityUtil;
import org.openmetadata.catalog.util.JsonUtils;
import org.openmetadata.catalog.util.RestUtil;
import org.openmetadata.catalog.util.ResultList;

@Slf4j
@Path("/v1/testDefinition")
@Api(value = "Test Definitions collection", tags = "Test Definitions collection")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Collection(name = "TestDefinitions")
public class TestDefinitionResource extends EntityResource<TestDefinition, TestDefinitionRepository> {
  public static final String COLLECTION_PATH = "/v1/testDefinition";
  private final TestDefinitionRepository daoTestDefinition;

  static final String FIELDS = "owner";

  @Override
  public TestDefinition addHref(UriInfo uriInfo, TestDefinition testDefinition) {
    testDefinition.withHref(RestUtil.getHref(uriInfo, COLLECTION_PATH, testDefinition.getId()));
    Entity.withHref(uriInfo, testDefinition.getOwner());
    return testDefinition;
  }

  @Inject
  public TestDefinitionResource(CollectionDAO dao, Authorizer authorizer) {
    super(TestDefinition.class, new TestDefinitionRepository(dao), authorizer);
    this.daoTestDefinition = new TestDefinitionRepository(dao);
  }

  @SuppressWarnings("unused") // Method used for reflection
  public void initialize(CatalogApplicationConfig config) throws IOException {
    // Find tag definitions and load tag categories from the json file, if necessary
    List<String> testDefinitionFiles = EntityUtil.getJsonDataResources(".*json/data/tests/.*\\.json$");
    testDefinitionFiles.forEach(
        testDefinitionFile -> {
          try {
            LOG.info("Loading test definitions from file {}", testDefinitionFile);
            String testDefinitionJson =
                IOUtil.toString(
                    Objects.requireNonNull(getClass().getClassLoader().getResourceAsStream(testDefinitionFile)));
            testDefinitionJson = testDefinitionJson.replace("<separator>", Entity.SEPARATOR);
            TestDefinition testDefinition = JsonUtils.readValue(testDefinitionJson, TestDefinition.class);
            long now = System.currentTimeMillis();
            testDefinition.withId(UUID.randomUUID()).withUpdatedBy("admin").withUpdatedAt(now);
            daoTestDefinition.initSeedData(testDefinition);
          } catch (Exception e) {
            LOG.warn("Failed to initialize the test definition files {}", testDefinitionFile, e);
          }
        });
  }

  public static class TestDefinitionList extends ResultList<TestDefinition> {
    @SuppressWarnings("unused")
    public TestDefinitionList() {
      // Empty constructor needed for deserialization
    }

    public TestDefinitionList(List<TestDefinition> data, String beforeCursor, String afterCursor, int total) {
      super(data, beforeCursor, afterCursor, total);
    }
  }

  @GET
  @Operation(
      operationId = "listTestDefinitions",
      summary = "List test definitions",
      tags = "TestDefinitions",
      description =
          "Get a list of test definitions, optionally filtered by `service` it belongs to. Use `fields` "
              + "parameter to get only necessary fields. Use cursor-based pagination to limit the number "
              + "entries in the list using `limit` and `before` or `after` query params.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "List of test definitions",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TestDefinitionResource.TestDefinitionList.class)))
      })
  public ResultList<TestDefinition> list(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(
              description = "Fields requested in the returned resource",
              schema = @Schema(type = "string", example = FIELDS))
          @QueryParam("fields")
          String fieldsParam,
      @Parameter(description = "Limit the number test definitions returned. (1 to 1000000, default = " + "10)")
          @DefaultValue("10")
          @QueryParam("limit")
          @Min(0)
          @Max(1000000)
          int limitParam,
      @Parameter(description = "Returns list of test definitions before this cursor", schema = @Schema(type = "string"))
          @QueryParam("before")
          String before,
      @Parameter(description = "Returns list of test definitions after this cursor", schema = @Schema(type = "string"))
          @QueryParam("after")
          String after,
      @Parameter(
              description = "Include all, deleted, or non-deleted entities.",
              schema = @Schema(implementation = Include.class))
          @QueryParam("include")
          @DefaultValue("non-deleted")
          Include include,
      @Parameter(
              description = "Filter by entityType.",
              schema = @Schema(implementation = TestDefinitionEntityType.class))
          @QueryParam("entityType")
          String entityType)
      throws IOException {
    ListFilter filter = new ListFilter(include);
    if (entityType != null) {
      filter.addQueryParam("entityType", entityType);
    }
    return super.listInternal(uriInfo, securityContext, fieldsParam, filter, limitParam, before, after);
  }

  @GET
  @Path("/{id}/versions")
  @Operation(
      operationId = "listAllTestDefinitionVersion",
      summary = "List test definition versions",
      tags = "TestDefinitions",
      description = "Get a list of all the versions of a test definition identified by `id`",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "List of test definition versions",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = EntityHistory.class)))
      })
  public EntityHistory listVersions(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Test Definition Id", schema = @Schema(type = "string")) @PathParam("id") String id)
      throws IOException {
    return dao.listVersions(id);
  }

  @GET
  @Path("/{id}")
  @Operation(
      summary = "Get a Test Definition",
      tags = "TestDefinitions",
      description = "Get a Test Definition by `id`.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "The Test definition",
            content =
                @Content(mediaType = "application/json", schema = @Schema(implementation = TestDefinition.class))),
        @ApiResponse(responseCode = "404", description = "Test Definition for instance {id} is not found")
      })
  public TestDefinition get(
      @Context UriInfo uriInfo,
      @PathParam("id") String id,
      @Context SecurityContext securityContext,
      @Parameter(
              description = "Fields requested in the returned resource",
              schema = @Schema(type = "string", example = FIELDS))
          @QueryParam("fields")
          String fieldsParam,
      @Parameter(
              description = "Include all, deleted, or non-deleted entities.",
              schema = @Schema(implementation = Include.class))
          @QueryParam("include")
          @DefaultValue("non-deleted")
          Include include)
      throws IOException {
    return getInternal(uriInfo, securityContext, id, fieldsParam, include);
  }

  @GET
  @Path("/name/{name}")
  @Operation(
      operationId = "getTestDefinitionByName",
      summary = "Get a test definition by name",
      tags = "TestDefinitions",
      description = "Get a test definition by  name.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "The test definition",
            content =
                @Content(mediaType = "application/json", schema = @Schema(implementation = TestDefinition.class))),
        @ApiResponse(responseCode = "404", description = "Test Definition for instance {id} is not found")
      })
  public TestDefinition getByName(
      @Context UriInfo uriInfo,
      @PathParam("name") String name,
      @Context SecurityContext securityContext,
      @Parameter(
              description = "Fields requested in the returned resource",
              schema = @Schema(type = "string", example = FIELDS))
          @QueryParam("fields")
          String fieldsParam,
      @Parameter(
              description = "Include all, deleted, or non-deleted entities.",
              schema = @Schema(implementation = Include.class))
          @QueryParam("include")
          @DefaultValue("non-deleted")
          Include include)
      throws IOException {
    return getByNameInternal(uriInfo, securityContext, name, fieldsParam, include);
  }

  @GET
  @Path("/{id}/versions/{version}")
  @Operation(
      operationId = "getSpecificTestDefinitionVersion",
      summary = "Get a version of the TestDefinition",
      tags = "TestDefinitions",
      description = "Get a version of the test definition by given `id`",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "TestDefinition",
            content =
                @Content(mediaType = "application/json", schema = @Schema(implementation = TestDefinition.class))),
        @ApiResponse(
            responseCode = "404",
            description = "Test Definition for instance {id} and version {version} is " + "not found")
      })
  public TestDefinition getVersion(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Test Definition Id", schema = @Schema(type = "string")) @PathParam("id") String id,
      @Parameter(
              description = "Test Definition version number in the form `major`.`minor`",
              schema = @Schema(type = "string", example = "0.1 or 1.1"))
          @PathParam("version")
          String version)
      throws IOException {
    return dao.getVersion(id, version);
  }

  @POST
  @Operation(
      operationId = "createTestDefinition",
      summary = "Create a Test Definition",
      tags = "TestDefinitions",
      description = "Create a Test definition.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "The test definition",
            content =
                @Content(mediaType = "application/json", schema = @Schema(implementation = TestDefinition.class))),
        @ApiResponse(responseCode = "400", description = "Bad request")
      })
  public Response create(
      @Context UriInfo uriInfo, @Context SecurityContext securityContext, @Valid CreateTestDefinition create)
      throws IOException {
    TestDefinition testDefinition = getTestDefinition(create, securityContext.getUserPrincipal().getName());
    return create(uriInfo, securityContext, testDefinition, true);
  }

  @PATCH
  @Path("/{id}")
  @Operation(
      operationId = "patchTestDefinition",
      summary = "Update a test definition",
      tags = "TestDefinitions",
      description = "Update an existing topic using JsonPatch.",
      externalDocs = @ExternalDocumentation(description = "JsonPatch RFC", url = "https://tools.ietf.org/html/rfc6902"))
  @Consumes(MediaType.APPLICATION_JSON_PATCH_JSON)
  public Response updateDescription(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @PathParam("id") String id,
      @RequestBody(
              description = "JsonPatch with array of operations",
              content =
                  @Content(
                      mediaType = MediaType.APPLICATION_JSON_PATCH_JSON,
                      examples = {
                        @ExampleObject("[" + "{op:remove, path:/a}," + "{op:add, path: /b, value: val}" + "]")
                      }))
          JsonPatch patch)
      throws IOException {
    return patchInternal(uriInfo, securityContext, id, patch);
  }

  @PUT
  @Operation(
      operationId = "createOrUpdateTestDefinition",
      summary = "Update test definition",
      tags = "TestDefinitions",
      description = "Create a definition, it it does not exist or update an existing test definition.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "The updated test definition ",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = TestDefinition.class)))
      })
  public Response createOrUpdate(
      @Context UriInfo uriInfo, @Context SecurityContext securityContext, @Valid CreateTestDefinition create)
      throws IOException {
    TestDefinition testDefinition = getTestDefinition(create, securityContext.getUserPrincipal().getName());
    return createOrUpdate(uriInfo, securityContext, testDefinition, true);
  }

  @DELETE
  @Path("/{id}")
  @Operation(
      operationId = "deleteTestDefinition",
      summary = "Delete a test definition",
      tags = "TestDefinitions",
      description = "Delete a test definition by `id`.",
      responses = {
        @ApiResponse(responseCode = "200", description = "OK"),
        @ApiResponse(responseCode = "404", description = "Test definition for instance {id} is not found")
      })
  public Response delete(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Hard delete the entity. (Default = `false`)")
          @QueryParam("hardDelete")
          @DefaultValue("false")
          boolean hardDelete,
      @Parameter(description = "Topic Id", schema = @Schema(type = "string")) @PathParam("id") String id)
      throws IOException {
    return delete(uriInfo, securityContext, id, false, hardDelete, true);
  }

  private TestDefinition getTestDefinition(CreateTestDefinition create, String user) throws IOException {
    return copy(new TestDefinition(), create, user)
        .withDescription(create.getDescription())
        .withEntityType(create.getEntityType())
        .withTestPlatforms(create.getTestPlatforms())
        .withDisplayName(create.getDisplayName())
        .withParameterDefinition(create.getParameterDefinition())
        .withName(create.getName());
  }
}
