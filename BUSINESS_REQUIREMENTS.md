# DSS Web - Business Requirements

## Objective
The Digital Service Standard (DSS) Web application aims to provide a centralized, user-friendly portal for exploring and understanding the control requirements necessary for building, maintaining, and assessing digital services and applications within the organization (e.g. government agencies). 

## Core Problems Solved
1. **Accessibility of Standards:** Previously, controls and standards were often buried in lengthy spreadsheets or static documents that were difficult to parse.
2. **AI-Enhanced Clarity:** The raw standards often contain technical jargon. The system uses AI (Google Gemini) to transform dense language into practical, semi-formal Thai that includes clear recommendations, checklists, and expected evidence.
3. **Targeted Assessment:** Different applications have different risk profiles. The application allows sorting and filtering controls based on exact project profiles, saving time and reducing confusion.

## Key Features & Capabilities
- **Searchable Controls:** Quickly find specific standards using keywords or Control IDs.
- **Dynamic Categorization:** Controls are automatically grouped into logical categories (e.g., "Official Government Domain", "Web Accessibility"). 
- **Contextual Filtering:** Users can filter the vast library of controls based on metadata relevant to their project:
  - **Service Type:** e.g., Informational, Portal, or All.
  - **Application Type:** Whether the standard applies to Web, Mobile, or All app types.
  - **Compliance:** Whether a control is strictly *Mandatory* or just *Optional*.
  - **Impact Level:** Filtering controls based on whether they are mandatory for projects with Low, Medium, or High impact. 

## Target Audience
- **Developers & Engineers:** To ensure their systems meet technical security and architecture standards.
- **Product Owners / Project Managers:** To understand the required checklists and prepare necessary evidence before project launches.
- **Auditors & Quality Assurance (QA):** To assess completed projects against the baseline standards generated for their specific impact levels.
