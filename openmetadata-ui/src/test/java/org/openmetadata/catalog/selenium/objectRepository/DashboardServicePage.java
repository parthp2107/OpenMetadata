package org.openmetadata.catalog.selenium.objectRepository;

import javax.annotation.Nonnull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

@Getter
@RequiredArgsConstructor
public class DashboardServicePage {
  @Nonnull WebDriver webDriver;

  By addDashboardServiceUrl = By.cssSelector("[data-testid='dashboard-url']");
  By editDashboardServiceUrl = By.cssSelector("[data-testid='dashboardUrl']");
  By hostPort = By.cssSelector("[id='root_hostPort']");
  By deleteDashboard = By.cssSelector("[data-testid='delete-button']");
  By confirmationDeleteText = By.cssSelector("[data-testid='confirmation-text-input']");
}
