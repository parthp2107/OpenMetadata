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

package org.openmetadata.catalog.selenium.pages.tags;

import com.github.javafaker.Faker;
import java.time.Duration;
import java.util.ArrayList;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.openmetadata.catalog.selenium.events.Events;
import org.openmetadata.catalog.selenium.objectRepository.Common;
import org.openmetadata.catalog.selenium.objectRepository.TagsPage;
import org.openmetadata.catalog.selenium.properties.Property;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;

@Slf4j
@Order(3)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class TagsPageTest {
  static WebDriver webDriver;
  static Common common;
  static TagsPage tagsPage;
  static String url = Property.getInstance().getURL();
  static Faker faker = new Faker();
  static String tagCategoryDisplayName = faker.name().firstName();
  static String tagDisplayName = faker.name().firstName();
  static Actions actions;
  static WebDriverWait wait;
  Integer waitTime = Property.getInstance().getSleepTime();
  String webDriverInstance = Property.getInstance().getWebDriver();
  String webDriverPath = Property.getInstance().getWebDriverPath();
  Wait<WebDriver> fluentWait;

  @BeforeEach
  void openMetadataWindow() {
    System.setProperty(webDriverInstance, webDriverPath);
    ChromeOptions options = new ChromeOptions();
    options.addArguments("--headless");
    options.addArguments("--window-size=1280,800");
    webDriver = new ChromeDriver(options);
    common = new Common(webDriver);
    tagsPage = new TagsPage(webDriver);
    actions = new Actions(webDriver);
    wait = new WebDriverWait(webDriver, Duration.ofSeconds(30));
    webDriver.manage().window().maximize();
    webDriver.get(url);
    fluentWait =
        new FluentWait<WebDriver>(webDriver)
            .withTimeout(Duration.ofSeconds(10))
            .pollingEvery(Duration.ofSeconds(10))
            .ignoring(NoSuchElementException.class);
  }

  public void pause(Integer milliseconds) {
    try {
      TimeUnit.MILLISECONDS.sleep(milliseconds);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }

  @Test
  @Order(1)
  void openTagsPage() {
    Events.click(webDriver, common.closeWhatsNew());
    Events.click(webDriver, common.headerSettings());
    Events.click(webDriver, tagsPage.headerSettingsTags());
  }

  @Test
  @Order(2)
  void addTagCategory() {
    openTagsPage();
    Events.click(webDriver, common.addTagCategory());
    Events.sendKeys(webDriver, common.displayName(), tagCategoryDisplayName);
    Events.click(webDriver, common.descriptionBoldButton());
    Events.sendKeys(webDriver, common.focusedDescriptionBox(), faker.address().toString());
    Events.click(webDriver, common.focusedDescriptionBox());
    Events.sendEnter(webDriver, common.focusedDescriptionBox());
    Events.click(webDriver, common.descriptionItalicButton());
    Events.sendKeys(webDriver, common.focusedDescriptionBox(), faker.address().toString());
    Events.click(webDriver, common.focusedDescriptionBox());
    Events.click(webDriver, common.descriptionSaveButton());
  }

  @Test
  @Order(3)
  void editTagCategoryDescription() {
    openTagsPage();
    Events.click(webDriver, common.textEquals(tagCategoryDisplayName));
    Events.click(webDriver, common.editTagCategoryDescription());
    Events.click(webDriver, common.focusedDescriptionBox());
    Events.click(webDriver, common.editDescriptionSaveButton());
  }

  @Test
  @Order(4)
  void addTag() {
    openTagsPage();
    Events.click(webDriver, common.textEquals(tagCategoryDisplayName));
    Events.click(webDriver, common.addTagButton());
    Events.sendKeys(webDriver, common.displayName(), tagDisplayName);
    Events.click(webDriver, common.descriptionBoldButton());
    Events.sendKeys(webDriver, common.focusedDescriptionBox(), faker.address().toString());
    Events.click(webDriver, common.focusedDescriptionBox());
    Events.sendEnter(webDriver, common.focusedDescriptionBox());
    Events.click(webDriver, common.descriptionItalicButton());
    Events.sendKeys(webDriver, common.focusedDescriptionBox(), faker.address().toString());
    Events.click(webDriver, common.focusedDescriptionBox());
    Events.click(webDriver, common.descriptionSaveButton());
  }

  @Test
  @Order(5)
  void changeTagDescription() {
    openTagsPage();
    Events.click(webDriver, common.textEquals(tagCategoryDisplayName));
    pause(waitTime);
    actions.moveToElement(webDriver.findElement(tagsPage.editTagDescription())).perform();
    Events.click(webDriver, tagsPage.editTagDescription());
    Events.sendKeys(webDriver, common.focusedDescriptionBox(), faker.address().toString());
    Events.click(webDriver, common.editDescriptionSaveButton());
  }

  @Test
  @Order(8)
  void addTagToTableColumn() {
    Events.click(webDriver, common.closeWhatsNew());
    Events.click(webDriver, common.headerItem("explore"));
    Events.click(webDriver, tagsPage.sortBy());
    Events.click(webDriver, common.tagListItem());
    Events.click(webDriver, tagsPage.lastTableLink());
    Events.click(webDriver, tagsPage.editTags());
    Events.click(webDriver, common.enterAssociatedTagName());
    Events.sendKeys(webDriver, common.enterAssociatedTagName(), tagCategoryDisplayName + "." + tagDisplayName);
    Events.click(webDriver, common.tagListItem());
    Events.click(webDriver, common.saveAssociatedTag());
    Events.click(webDriver, common.headerSettings());
    Events.click(webDriver, tagsPage.headerSettingsTags());
    fluentWait.until(ExpectedConditions.elementToBeClickable(common.containsText(tagCategoryDisplayName)));
    Events.click(webDriver, common.containsText(tagCategoryDisplayName));
    Events.click(webDriver, tagsPage.tagUsageCount());
  }

  @Test
  @Order(9)
  void checkAddedTagToTableColumn() {
    Events.click(webDriver, common.closeWhatsNew());
    Events.click(webDriver, tagsPage.tables());
    try {
      try {
        WebElement viewMore = wait.until(ExpectedConditions.presenceOfElementLocated(common.viewMore()));
        if (viewMore.isDisplayed()) {
          Events.click(webDriver, common.viewMore());
        }
        Events.click(webDriver, tagsPage.tagFilter(tagCategoryDisplayName, tagDisplayName));
        Events.click(webDriver, tagsPage.tableLink());
      } catch (TimeoutException | NoSuchElementException e) {
        Events.click(webDriver, tagsPage.tagFilter(tagCategoryDisplayName, tagDisplayName));
        Events.click(webDriver, tagsPage.tableLink());
      }
    } catch (TimeoutException | NoSuchElementException e) {
      Assert.fail("Tag not found");
    }
  }

  @Test
  @Order(10)
  void removeTagFromTableColumn() throws InterruptedException {
    openTagsPage();
    Events.click(webDriver, common.textEquals(tagCategoryDisplayName));
    Events.click(webDriver, tagsPage.tagUsageCount());
    try {
      Events.click(webDriver, tagsPage.tableLink());
    } catch (TimeoutException e) {
      Assert.fail("Table is not present for the selected tag filter");
    }
    Events.click(webDriver, tagsPage.editBreadcrumbTag());
    Events.click(webDriver, tagsPage.removeAssociatedTag());
    Events.click(webDriver, common.saveAssociatedTag());
  }

  // DO NOT DELETE
  /*@Test
  @Order(10)
  void addTagWithExistingName() throws InterruptedException {
    openTagsPage();
    Events.click(webDriver, common.containsText("PersonalData"));
    Events.click(webDriver, common.addTagButton());
    Events.sendKeys(webDriver, common.displayName(), "Personals");
    Events.click(webDriver, common.descriptionSaveButton());
    Events.click(webDriver, common.headerItem("explore"));
    Events.click(webDriver, tagsPage.tableLink());
    Events.click(webDriver, common.editAssociatedTagButton());
    Events.click(webDriver, common.enterAssociatedTagName());
    Events.sendKeys(webDriver, common.enterAssociatedTagName(), "Personals");
    Events.click(webDriver, common.tagListItem());
    Events.click(webDriver, common.saveAssociatedTag());
    Events.click(webDriver, common.headerSettings());
    Events.click(webDriver, tagsPage.headerSettingsTags());
    Events.click(webDriver, common.containsText("PersonalData"));
    Thread.sleep(2000);
    String usageCount = webDriver.findElement(tagsPage.aTagUsageCountElementIndex(1)).getAttribute("innerHTML");
    Assert.assertEquals(usageCount, "Not Used");
  }*/

  @Test
  @Order(11)
  void TagUsageCheck() {
    Events.click(webDriver, common.closeWhatsNew());
    Events.click(webDriver, common.headerItem("explore"));
    Events.click(webDriver, common.selectTableLink(5));
    Events.click(webDriver, tagsPage.editTags());
    Events.click(webDriver, common.enterAssociatedTagName());
    Events.sendKeys(webDriver, common.enterAssociatedTagName(), "P");
    fluentWait.until(ExpectedConditions.visibilityOfElementLocated(common.tagListItem()));
    Events.click(webDriver, common.tagListItem());
    Events.click(webDriver, common.saveAssociatedTag());
    Events.click(webDriver, common.headerSettings());
    Events.click(webDriver, tagsPage.headerSettingsTags());
    Events.click(webDriver, common.textEquals("PersonalData"));
    Events.click(webDriver, tagsPage.usageCountElementIndex(1));
    fluentWait.until(ExpectedConditions.elementToBeClickable(common.explore()));
    String beforeFilterCount =
        fluentWait
            .until(ExpectedConditions.visibilityOfElementLocated(tagsPage.tagFilterCount(1)))
            .getAttribute("innerHTML");
    Events.click(webDriver, common.topics());
    pause(waitTime);
    Events.click(webDriver, common.tables());
    String afterFilterCount =
        fluentWait
            .until(ExpectedConditions.visibilityOfElementLocated(tagsPage.tagFilterCount(1)))
            .getAttribute("innerHTML");
    Assert.assertEquals(afterFilterCount, beforeFilterCount);
  }

  // DO NOT DELETE
  /*@Test
  @Order(12)
  void removeTagWithExistingName() throws InterruptedException {
    openTagsPage();

    Events.click(webDriver, common.containsText("PersonalData"));
    Events.click(webDriver, tagsPage.usageCountElementIndex(2));
    try {
      Events.click(webDriver, tagsPage.tableLink());
    } catch (TimeoutException e) {
      Assert.fail("Table is not present for the selected tag filter");
    }
    Events.click(webDriver, common.editAssociatedTagButton());
    Events.click(webDriver, tagsPage.removeAssociatedTag());
    Events.click(webDriver, common.saveAssociatedTag());
    Events.click(webDriver, common.headerSettings());
    Events.click(webDriver, tagsPage.headerSettingsTags());
    Events.click(webDriver, common.containsText("PersonalData"));
    Thread.sleep(2000);
    String usageCount = webDriver.findElement(tagsPage.spanTagUsageCountElementIndex(2)).getAttribute("innerHTML");
    Assert.assertEquals(usageCount, "Not used");
  }*/

  @AfterEach
  void closeTabs() {
    ArrayList<String> tabs = new ArrayList<>(webDriver.getWindowHandles());
    String originalHandle = webDriver.getWindowHandle();
    for (String handle : webDriver.getWindowHandles()) {
      if (!handle.equals(originalHandle)) {
        webDriver.switchTo().window(handle);
        webDriver.close();
      }
    }
    webDriver.switchTo().window(tabs.get(0)).close();
  }
}
