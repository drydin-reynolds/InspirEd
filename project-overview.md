### Project Problem Identification: clearly define the problem or opportunity for which you are seeking a solution, and provide any relevant historical/ background information

Families managing rare pediatric lung diseases face an overwhelming educational challenge: they must quickly learn complex medical information to become effective care partners, but existing educational resources are fragmented, require high health literacy, and don't adapt to individual learning needs or crisis situations. A previous capstone team built a proof-of-concept mobile application with three core features: health literacy assessment, an AI-powered medical appointment scribe, and an adaptive learning module. While this prototype validated the concept, it revealed critical technical limitations: the educational content database is minimal and unstructured, the AI module lacks scaffolding to guide progressive learning, and there's no systematic way to balance personalized AI-driven exploration with evidence-based educational pathways that ensure families learn essential concepts. This project addresses a real gap affecting thousands of families nationally who are partnering with a pediatric rare disease advocacy organization to co-design solutions.

### Project Objectives: list/describe the desired outcome, problem resolution, end product or opportunity taken

Build an enhanced educational platform that delivers:
- Structured Content Database Architecture: Design and implement a scalable database system for organizing multimedia educational materials with metadata tagging for medical topics, complexity levels, content types, and learning objectives
- Adaptive Scaffolding System: Develop algorithms that create personalized learning pathways combining structured curriculum sequences with AI-driven flexibility, adjusting content delivery based on assessed literacy levels and user progress
- Enhanced AI Integration: Improve the existing AI module to provide contextualized responses that reference structured educational content while maintaining conversational support
- User Dashboard: Create interfaces for families to track learning progress, bookmark resources, and navigate between guided learning modules and open-ended AI interaction
- Content Management System: Build administrative tools allowing medical educators to add, categorize, and update educational materials without developer intervention

### Project Requirements: define the business (why project is happening), solution (functional & non-functional), design specifications, and/or stakeholder requirements that align with the project’s resources and objectives

Business Requirements:
- Solution must serve families with varying health literacy levels (elementary to advanced)
- Content must be accessible during high-stress crisis situations and routine learning
- System must support both mobile and web platforms

Functional Requirements:
- Database must support multiple content formats (text, video, diagrams, interactive modules)
- Recommendation engine must sequence content based on prerequisite concepts
and assessed comprehension
- AI system must cite specific educational resources when applicable
- User progress tracking across structured and AI- driven learning activities 
- Content versioning to allow medical information updates

Non-Functional Requirements:
- HIPAA-compliant data handling (no PHI storage)
- Accessibility compliance (WCAG 2.1 AA standards)
- Scalable architecture

Stakeholder Requirements:
- Medical educators need ability to curate and organize content without technical expertise
- Families need seamless transition between structured learning and AI-assisted exploration
- Research team needs analytics on learning patterns and content effectiveness (aggregated, anonymized)