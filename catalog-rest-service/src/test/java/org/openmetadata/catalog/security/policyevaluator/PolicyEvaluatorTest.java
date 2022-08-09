package org.openmetadata.catalog.security.policyevaluator;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.openmetadata.catalog.type.Permission.Access;

class PolicyEvaluatorTest {
  @Test
  public void test_AccessOrderOfPrecedence() {
    //
    // Order of precedence for access Deny > Allow > ConditionalDeny > ConditionalAllow > NotAllow
    //

    // newAccess (Deny|Allow|ConditionDeny|ConditionalAllow|NotAllow) and currentAccess Deny takes precedence
    assertFalse(PolicyEvaluator.overrideAccess(Access.DENY, Access.DENY));
    assertFalse(PolicyEvaluator.overrideAccess(Access.ALLOW, Access.DENY));
    assertFalse(PolicyEvaluator.overrideAccess(Access.CONDITIONAL_DENY, Access.DENY));
    assertFalse(PolicyEvaluator.overrideAccess(Access.CONDITIONAL_ALLOW, Access.DENY));
    assertFalse(PolicyEvaluator.overrideAccess(Access.NOT_ALLOW, Access.DENY));

    // newAccess (Deny) and currentAccess Allow - newAccess Deny takes precedence
    assertTrue(PolicyEvaluator.overrideAccess(Access.DENY, Access.ALLOW));

    // newAccess (Allow|ConditionDeny|ConditionalAllow|NotAllow) and currentAccess Allow takes precedence
    assertFalse(PolicyEvaluator.overrideAccess(Access.ALLOW, Access.ALLOW));
    assertFalse(PolicyEvaluator.overrideAccess(Access.CONDITIONAL_DENY, Access.ALLOW));
    assertFalse(PolicyEvaluator.overrideAccess(Access.CONDITIONAL_ALLOW, Access.ALLOW));
    assertFalse(PolicyEvaluator.overrideAccess(Access.NOT_ALLOW, Access.ALLOW));

    // newAccess (Deny|Allow) and currentAccess ConditionalDeny - newAccess takes precedence
    assertTrue(PolicyEvaluator.overrideAccess(Access.DENY, Access.CONDITIONAL_DENY));
    assertTrue(PolicyEvaluator.overrideAccess(Access.ALLOW, Access.CONDITIONAL_DENY));

    // newAccess (ConditionDeny|ConditionalAllow|NotAllow) and currentAccess ConditionalDeny takes precedence
    assertFalse(PolicyEvaluator.overrideAccess(Access.CONDITIONAL_DENY, Access.CONDITIONAL_DENY));
    assertFalse(PolicyEvaluator.overrideAccess(Access.CONDITIONAL_ALLOW, Access.CONDITIONAL_DENY));
    assertFalse(PolicyEvaluator.overrideAccess(Access.NOT_ALLOW, Access.CONDITIONAL_DENY));

    // newAccess (Deny|Allow|ConditionalDeny) and currentAccess ConditionalAllow - newAccess takes precedence
    assertTrue(PolicyEvaluator.overrideAccess(Access.DENY, Access.CONDITIONAL_ALLOW));
    assertTrue(PolicyEvaluator.overrideAccess(Access.ALLOW, Access.CONDITIONAL_ALLOW));
    assertTrue(PolicyEvaluator.overrideAccess(Access.CONDITIONAL_DENY, Access.CONDITIONAL_ALLOW));

    // newAccess (ConditionalAllow|NotAllow) and currentAccess ConditionalDeny takes precedence
    assertFalse(PolicyEvaluator.overrideAccess(Access.CONDITIONAL_ALLOW, Access.CONDITIONAL_ALLOW));
    assertFalse(PolicyEvaluator.overrideAccess(Access.NOT_ALLOW, Access.CONDITIONAL_ALLOW));

    // newAccess (Deny|Allow|ConditionalDeny|ConditionalAllow) and currentAccess notAllow - newAccess takes precedence
    assertTrue(PolicyEvaluator.overrideAccess(Access.DENY, Access.NOT_ALLOW));
    assertTrue(PolicyEvaluator.overrideAccess(Access.ALLOW, Access.NOT_ALLOW));
    assertTrue(PolicyEvaluator.overrideAccess(Access.CONDITIONAL_DENY, Access.NOT_ALLOW));
    assertTrue(PolicyEvaluator.overrideAccess(Access.CONDITIONAL_ALLOW, Access.NOT_ALLOW));

    // newAccess (ConditionalAllow|NotAllow) and currentAccess ConditionalDeny takes precedence
    assertFalse(PolicyEvaluator.overrideAccess(Access.NOT_ALLOW, Access.NOT_ALLOW));
  }
}
