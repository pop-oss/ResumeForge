import { ResumeProvider, useResume } from './features/resume/ResumeContext'
import { LanguageProvider } from './i18n'
import { Layout } from './features/layout/Layout'
import { AgentProvider, TemplateSearchDialog, AgentErrorBoundary } from './features/agent'

function AppContent() {
  const { setResumeData } = useResume();
  
  return (
    <AgentProvider onTemplateImport={setResumeData}>
      <AgentErrorBoundary>
        <Layout />
        <TemplateSearchDialog />
      </AgentErrorBoundary>
    </AgentProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ResumeProvider>
        <AppContent />
      </ResumeProvider>
    </LanguageProvider>
  )
}

export default App
