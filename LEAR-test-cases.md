# LEAR Test Cases

Generated from the 10 Jira issues in project `LEAR` on 2026-07-25. All issues are marked `[FAKE]`; these cases validate the supplied sample requirements.

## LEAR-1 — Sample QA task 01: Onboarding checklist

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| LEAR-1-TC-01 | Complete onboarding with valid profile details | 1. Open onboarding. 2. Enter valid required profile fields. 3. Create or select a first workspace. 4. Submit. | Each checklist step is clear; the profile and workspace are saved; a success confirmation is shown. |
| LEAR-1-TC-02 | Required profile validation | 1. Open onboarding. 2. Leave each required field blank in turn. 3. Attempt to continue. | Continuation is blocked and the relevant field has a clear, accessible validation message. |
| LEAR-1-TC-03 | Invalid profile input | 1. Enter malformed input (for example, invalid email) in a validated field. 2. Continue. | Invalid data is rejected with actionable feedback and no partial completion is recorded. |
| LEAR-1-TC-04 | Resume incomplete checklist | 1. Complete profile setup only. 2. Leave and reopen onboarding. | Completed state is retained, remaining steps are clear, and the user can finish workspace setup. |

## LEAR-2 — Sample QA task 02: Mock search

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| LEAR-2-TC-01 | Search returns relevant matches | 1. Enter a term with known matching records. 2. Submit search. | Relevant results appear and clearly relate to the entered term. |
| LEAR-2-TC-02 | No matching records | 1. Search for a unique non-existent term. | A clear empty state appears, with no misleading results or error. |
| LEAR-2-TC-03 | Blank search input | 1. Leave search empty. 2. Submit. | The UI either prevents submission with guidance or shows the defined default state; it does not fail. |
| LEAR-2-TC-04 | Search input edge characters | 1. Search using leading/trailing spaces and special characters. | Input is safely handled; whitespace is normalized where appropriate and the UI remains usable. |

## LEAR-3 — Sample QA task 03: Recent-activity dashboard card

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| LEAR-3-TC-01 | Display recent activity | 1. Open the dashboard with recent activity available. | The card summarizes the expected recent items and their statuses. |
| LEAR-3-TC-02 | Accessible labels | 1. Navigate the card with keyboard and a screen reader. | Controls and status indicators have meaningful accessible names and logical focus order. |
| LEAR-3-TC-03 | No recent activity | 1. Open the dashboard for an account with no activity. | A clear empty state is shown without broken layout or unlabeled controls. |
| LEAR-3-TC-04 | Long activity content | 1. Load items with long titles/statuses. | Text remains readable, is truncated or wrapped deliberately, and status meaning is preserved. |

## LEAR-4 — Sample QA task 04: Notification preferences

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| LEAR-4-TC-01 | Configure email and in-app delivery | 1. Open preferences. 2. Select email and in-app options. 3. Save. | Choices persist and a meaningful success confirmation is displayed. |
| LEAR-4-TC-02 | Disable a delivery channel | 1. Turn off one channel. 2. Save and reopen the page. | The disabled preference persists and the remaining channel is unchanged. |
| LEAR-4-TC-03 | Save failure feedback | 1. Simulate a save failure. | Preferences are not falsely reported as saved; a clear error and retry path are provided. |
| LEAR-4-TC-04 | Keyboard operation | 1. Reach all options and Save using only the keyboard. | Controls are focusable, state is conveyed, and the form can be saved without a mouse. |

## LEAR-5 — Sample QA task 05: Trial checkout

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| LEAR-5-TC-01 | Submit valid checkout | 1. Complete every required field with valid data. 2. Submit. | Submission succeeds once and a clear confirmation is displayed. |
| LEAR-5-TC-02 | Missing required fields | 1. Omit required fields. 2. Submit. | Submission is blocked and each missing field receives useful validation feedback. |
| LEAR-5-TC-03 | Invalid field formats | 1. Enter invalid values in formatted fields. 2. Submit. | Invalid values are identified and no checkout is created. |
| LEAR-5-TC-04 | Prevent duplicate submission | 1. Submit a valid checkout. 2. Immediately submit again. | Only one request/checkout is processed and the user receives unambiguous status feedback. |

## LEAR-6 — Sample QA task 06: File upload

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| LEAR-6-TC-01 | Upload an accepted file | 1. Review format and size guidance. 2. Select a valid file. 3. Upload. | Upload completes and a clear success state identifies the uploaded file. |
| LEAR-6-TC-02 | Reject unsupported format | 1. Select a file with an unsupported extension/type. | The file is not uploaded and the error explains accepted formats. |
| LEAR-6-TC-03 | Reject oversized file | 1. Select a file over the stated size limit. | The file is not uploaded and feedback states the limit and next action. |
| LEAR-6-TC-04 | Upload interruption | 1. Begin a valid upload. 2. Simulate a network interruption. | Failure is clearly communicated; retry is available and no corrupted success state is shown. |

## LEAR-7 — Sample QA task 07: Reporting filters

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| LEAR-7-TC-01 | Apply a valid date range | 1. Choose a valid start and end date. 2. Apply filters. | Results update to the selected range and active filters are visible. |
| LEAR-7-TC-02 | Clear applied filters | 1. Apply a date range. 2. Select Clear. | Dates reset and the unfiltered/default results return. |
| LEAR-7-TC-03 | End date before start date | 1. Choose an end date earlier than the start date. 2. Apply. | Application is blocked with a meaningful date-range validation message. |
| LEAR-7-TC-04 | Boundary dates | 1. Filter using the same start/end date and a range at supported limits. | Valid boundary selections behave predictably and do not exclude intended records. |

## LEAR-8 — Sample QA task 08: Account settings

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| LEAR-8-TC-01 | Save valid contact updates | 1. Edit contact details with valid values. 2. Save. | Changes persist after reload and a success confirmation is displayed. |
| LEAR-8-TC-02 | Required contact validation | 1. Clear a required contact field. 2. Save. | The save is blocked and the field has clear validation feedback. |
| LEAR-8-TC-03 | Invalid contact format | 1. Enter an invalid formatted value, such as an email address. 2. Save. | Invalid input is rejected without overwriting stored valid data. |
| LEAR-8-TC-04 | Save error and recovery | 1. Edit details. 2. Simulate save failure. 3. Retry. | Error feedback is meaningful, entered values are retained, and retry can succeed. |

## LEAR-9 — Sample QA task 09: Integration configuration

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| LEAR-9-TC-01 | Configure and connect successfully | 1. Enter valid configuration. 2. Save/connect. | Connection status clearly changes to success and configuration is retained. |
| LEAR-9-TC-02 | Validate incomplete configuration | 1. Omit each required configuration value in turn. 2. Attempt connection. | Connection is not attempted or accepted; relevant validation is shown. |
| LEAR-9-TC-03 | Failed connection guidance | 1. Use configuration that causes a connection failure. | Failure status is unambiguous and guidance explains how to correct or retry. |
| LEAR-9-TC-04 | Retry connection | 1. Cause a failed connection. 2. Correct configuration or restore service. 3. Retry. | Retry is available, status updates appropriately, and success is reported when connected. |

## LEAR-10 — Sample QA task 10: Help-center feedback

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| LEAR-10-TC-01 | Submit a rating with comment | 1. Open an article. 2. Select a rating. 3. Add a comment. 4. Submit. | Feedback is saved once and a clear confirmation is shown. |
| LEAR-10-TC-02 | Submit rating without comment | 1. Select a rating. 2. Leave comment empty. 3. Submit. | Submission succeeds because comments are optional. |
| LEAR-10-TC-03 | Prevent missing rating submission | 1. Leave rating unselected. 2. Attempt submission. | Submission is blocked with clear guidance to select a rating. |
| LEAR-10-TC-04 | Long or special-character comment | 1. Enter a long comment containing special characters. 2. Submit. | Input is safely handled within configured limits; validation is clear if a limit is exceeded. |

