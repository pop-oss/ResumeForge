# ResumeForge

A pure frontend resume builder built with React, TypeScript, Vite, and TailwindCSS.
Features drag-and-drop section reordering, real-time A4 preview, PDF export, and local storage persistence.

## Features

- **Real-time Preview**: See your resume update instantly as you type.
- **Drag & Drop**: Reorder sections (Experience, Education, Skills, etc.) using drag and drop.
- **Two Templates**: Choose between "Classic" and "Modern" designs.
- **Customizable**: Change theme colors, fonts, and visibility of sections.
- **Privacy First**: All data is stored locally in your browser (`localStorage`). No backend interaction.
- **Import/Export**: detailed JSON export and import to save/load your resume data.
- **PDF Export**: Uses native browser print functionality for high-quality PDF generation.
- **Mobile Friendly**: Responsive layout with tab switching on mobile devices.

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Radix UI / Shadcn Concepts
- **Form Handling**: React Hook Form (concepts used)
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## Usage

1.  **Edit**: Use the left panel to fill in your details.
2.  **Reorder**: Drag the handle (grid icon) next to section titles to reorder them on the resume.
3.  **Hide/Show**: Click the eye icon to toggle visibility of sections.
4.  **Theme**: Use the color picker in the header to change the accent color.
5.  **Export**:
    -   Click "Export JSON" to save your data backup.
    -   Click "Export PDF" (or Print) to save as PDF. **Ensure "Background graphics" is enabled in print settings.**

## Project Structure

-   `src/components/ui`: Reusable UI components.
-   `src/features/editor`: Form components and logic.
-   `src/features/preview`: Resume renderers and templates.
-   `src/features/resume`: Core data types and context/state.
-   `src/features/layout`: Main app layout.
