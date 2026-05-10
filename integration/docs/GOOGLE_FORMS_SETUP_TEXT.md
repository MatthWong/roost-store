# Google Forms Setup - Exact Input Text

## Purpose
Use this document to create the custom order Google Form with exact question text expected by the Apps Script workflow.

## Form Metadata
- Form title: Roost Store Custom Orders
- Form description: Submit custom engraving, embroidery, heat press, or custom item requests. You will receive status updates by email.

## Settings
- Collect email addresses: ON
- Restrict to users in your org: Optional (school policy)
- Limit to 1 response: Optional (school policy)
- Edit after submit: OFF

## Section 1 - Customer Info
Section title: Customer Info
Section description: Tell us who you are and what type of custom order you need.

1. Question type: Short answer
- Question text: Full Name
- Required: Yes

2. Question type: Short answer
- Question text: School Email
- Required: Yes
- Validation: Text is email

3. Question type: Short answer
- Question text: Phone
- Required: No

4. Question type: Multiple choice
- Question text: Order Type
- Options:
  - Engraving
  - Embroidery
  - Heat Press
  - Custom Item
- Required: Yes
- Go to section based on answer:
  - Engraving -> Section 2 - Engraving
  - Embroidery -> Section 3 - Embroidery
  - Heat Press -> Section 4 - Heat Press
  - Custom Item -> Section 5 - Custom Item

## Section 2 - Engraving
Section title: Engraving
Section description: Customer-supplied item. Provide text and/or image.

5. Question type: Paragraph
- Question text: Item Description
- Required: Yes

6. Question type: Short answer
- Question text: Quantity
- Required: Yes
- Validation: Number greater than or equal to 1
- Error text: Quantity must be at least 1.

7. Question type: Paragraph
- Question text: Engraving Text
- Required: No

8. Question type: File upload
- Question text: Design Image Upload
- Required: No
- Allow file types: PNG, JPG, SVG
- Maximum number of files: 1
- Maximum file size: 5 MB

9. Question type: Checkbox
- Question text: Placement Choice
- Option text: I confirm placement details are correct.
- Required: Yes

10. Question type: Checkbox
- Question text: Review Confirmation
- Option text: I understand all engraving orders are reviewed before production.
- Required: Yes

After section: Go to Section 6 - Final Confirmation

## Section 3 - Embroidery
Section title: Embroidery
Section description: Add one or more apparel type-size-quantity lines. Upload one design image.

11. Question type: Dropdown
- Question text: Apparel Type 1
- Options:
  - Short-sleeve t-shirt
  - Long-sleeve t-shirt
  - Hoodie
  - Polo
- Required: Yes

12. Question type: Dropdown
- Question text: Size 1
- Options:
  - XS
  - S
  - M
  - L
  - XL
  - 2XL
  - 3XL
  - 4XL
  - 5XL
- Required: Yes

13. Question type: Short answer
- Question text: Qty 1
- Required: Yes
- Validation: Number greater than or equal to 1
- Error text: Quantity must be at least 1.

14. Question type: Dropdown
- Question text: Apparel Type 2
- Options:
  - Short-sleeve t-shirt
  - Long-sleeve t-shirt
  - Hoodie
  - Polo
- Required: No

15. Question type: Dropdown
- Question text: Size 2
- Options:
  - XS
  - S
  - M
  - L
  - XL
  - 2XL
  - 3XL
  - 4XL
  - 5XL
- Required: No

16. Question type: Short answer
- Question text: Qty 2
- Required: No
- Validation: Number greater than or equal to 1

17. Question type: Dropdown
- Question text: Apparel Type 3
- Options:
  - Short-sleeve t-shirt
  - Long-sleeve t-shirt
  - Hoodie
  - Polo
- Required: No

18. Question type: Dropdown
- Question text: Size 3
- Options:
  - XS
  - S
  - M
  - L
  - XL
  - 2XL
  - 3XL
  - 4XL
  - 5XL
- Required: No

19. Question type: Short answer
- Question text: Qty 3
- Required: No
- Validation: Number greater than or equal to 1

20. Question type: File upload
- Question text: Design Image Upload
- Required: Yes
- Allow file types: PNG, JPG, SVG
- Maximum number of files: 1
- Maximum file size: 5 MB

21. Question type: Multiple choice
- Question text: Placement Choice
- Options:
  - Front Center
  - Left Chest
  - Right Chest
  - Back Center
  - Sleeve
- Required: Yes

22. Question type: Checkbox
- Question text: Review Confirmation
- Option text: I confirmed image prep and placement details.
- Required: Yes

After section: Go to Section 6 - Final Confirmation

## Section 4 - Heat Press
Section title: Heat Press
Section description: Add one or more apparel type-size-quantity lines. Upload one design image.

23. Question type: Dropdown
- Question text: Apparel Type 1
- Options:
  - Short-sleeve t-shirt
  - Long-sleeve t-shirt
  - Hoodie
  - Polo
- Required: Yes

24. Question type: Dropdown
- Question text: Size 1
- Options:
  - XS
  - S
  - M
  - L
  - XL
  - 2XL
  - 3XL
  - 4XL
  - 5XL
- Required: Yes

25. Question type: Short answer
- Question text: Qty 1
- Required: Yes
- Validation: Number greater than or equal to 1

26. Question type: Dropdown
- Question text: Apparel Type 2
- Options:
  - Short-sleeve t-shirt
  - Long-sleeve t-shirt
  - Hoodie
  - Polo
- Required: No

27. Question type: Dropdown
- Question text: Size 2
- Options:
  - XS
  - S
  - M
  - L
  - XL
  - 2XL
  - 3XL
  - 4XL
  - 5XL
- Required: No

28. Question type: Short answer
- Question text: Qty 2
- Required: No
- Validation: Number greater than or equal to 1

29. Question type: Dropdown
- Question text: Apparel Type 3
- Options:
  - Short-sleeve t-shirt
  - Long-sleeve t-shirt
  - Hoodie
  - Polo
- Required: No

30. Question type: Dropdown
- Question text: Size 3
- Options:
  - XS
  - S
  - M
  - L
  - XL
  - 2XL
  - 3XL
  - 4XL
  - 5XL
- Required: No

31. Question type: Short answer
- Question text: Qty 3
- Required: No
- Validation: Number greater than or equal to 1

32. Question type: File upload
- Question text: Design Image Upload
- Required: Yes
- Allow file types: PNG, JPG, SVG
- Maximum number of files: 1
- Maximum file size: 5 MB

33. Question type: Multiple choice
- Question text: Placement Choice
- Options:
  - Front Center
  - Left Chest
  - Right Chest
  - Back Center
  - Sleeve
- Required: Yes

34. Question type: Checkbox
- Question text: Review Confirmation
- Option text: I confirmed image prep and placement details.
- Required: Yes

After section: Go to Section 6 - Final Confirmation

## Section 5 - Custom Item
Section title: Custom Item
Section description: Custom item orders are quote-required.

35. Question type: Paragraph
- Question text: Custom Item Description
- Required: Yes

36. Question type: Short answer
- Question text: Quantity
- Required: Yes
- Validation: Number greater than or equal to 1

37. Question type: Multiple choice
- Question text: Quote Request
- Options:
  - Yes
- Required: Yes

38. Question type: Paragraph
- Question text: Additional Notes
- Required: No

After section: Go to Section 6 - Final Confirmation

## Section 6 - Final Confirmation
Section title: Final Confirmation
Section description: Confirm details before submitting.

39. Question type: Checkbox
- Question text: Terms Confirmation
- Option text: I confirm all details are accurate and understand order status updates are sent by email.
- Required: Yes

40. Question type: Checkbox
- Question text: Duplicate Submission Check
- Option text: I confirm this is not an accidental duplicate submission.
- Required: Yes

## Response Destination and Trigger
- Link form responses to spreadsheet tab: Orders
- In Apps Script trigger config:
  - Function: onFormSubmit
  - Event source: From spreadsheet
  - Event type: On form submit

## Notes for Script Compatibility
- Keep question text exactly as listed when possible.
- The script supports aliases for key fields, but exact text above minimizes mapping issues.
- For file upload, Google Forms returns Drive links in response data.
