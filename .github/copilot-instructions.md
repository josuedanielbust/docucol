# Copilot Instructions for DocuCol Architectural Documentation

## Purpose
This document provides guidelines for using GitHub Copilot to assist with architectural documentation and code generation for the DocuCol project.

## Code Generation Guidelines

1. **Code Structure and Style**
  - Follow project-specific coding conventions
  - Implement design patterns appropriate for the context
  - Generate testable and maintainable code
  - Include proper error handling
  - Add comments for complex logic

2. **Implementation Requirements**
  - Align code with documented architecture
  - Ensure code meets functional requirements
  - Consider performance and security best practices
  - Implement validation and data sanitation
  - Follow clean code principles

3. **Integration Considerations**
  - Respect existing interfaces and contracts
  - Ensure backward compatibility when appropriate
  - Consider dependency management
  - Support the defined deployment model
  - Generate appropriate unit tests

4. **Code Quality Standards**
  - Follow language-specific best practices
  - Ensure proper exception handling
  - Implement logging where appropriate
  - Consider resource management
  - Write code that aligns with non-functional requirements

## Documentation Creation Guidelines

1. **Documentation Structure**
  - Follow the C4 model (Context, Containers, Components, Code)
  - Include architecture decision records (ADRs)
  - Document both functional and non-functional requirements
  - Create diagrams using Mermaid syntax

2. **Content Requirements**
  - Write clear, concise descriptions
  - Use consistent terminology throughout
  - Include rationales for architectural decisions
  - Document assumptions and constraints
  - Reference relevant standards or patterns

3. **Diagram Guidelines**
  - Create diagrams showing system boundaries
  - Illustrate component relationships
  - Document API interfaces
  - Show data flows and persistence models
  - Include deployment architecture

4. **Update Process**
  - Document the motivation behind each change
  - Link changes to requirements or issues
  - Document trade-offs considered
  - Maintain version history
  - Update related diagrams when architecture changes

5. **Quality Standards**
  - No spelling or grammatical errors
  - Consistent formatting
  - Logical organization
  - Appropriate level of detail
  - Accessibility for technical and non-technical stakeholders

## Rules for Architecture Changes

1. All significant architectural changes must be documented
2. Changes must include impact analysis
3. Changes should reference business or technical drivers
4. Update affected diagrams and documentation together
5. Maintain traceability between requirements and architecture

When requesting changes, provide:
- Clear description of the change
- Rationale or business driver
- Affected components or areas
- Potential impacts or risks

## Context Requirements

When generating new documentation or modifying existing documentation:

1. **Include Documentation Context**
  - The `docs/` folder should be added as context for all documentation-related prompts
  - Reference existing documentation to maintain consistency
  - Ensure new content aligns with established architectural patterns

2. **Documentation Organization**
  - Place new documents in the appropriate directory within the `docs/` structure
  - Follow the established naming conventions
  - Update index or navigation files when adding new documentation

## Repository Organization

1. **Mono-Repository Structure**
  - Always specify which service/microservice/folder the new code should target
  - Provide the full path for new files being added
  - When modifying existing code, specify the exact file path
  - Ensure changes adhere to the organization of the mono-repository
  - Follow dependency management practices specific to each service

2. **Service Identification**
  - Clearly identify the target service for all code changes
  - Consider cross-service impacts when making changes
  - Respect service boundaries and interfaces
  - Adhere to service-specific coding conventions
  - Document any required changes to service integration points
