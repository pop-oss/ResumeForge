import { ResumeProvider } from './features/resume/ResumeContext'
import { LanguageProvider } from './i18n'
import { Layout } from './features/layout/Layout'

function App() {
  return (
    <LanguageProvider>
      <ResumeProvider>
        <Layout />
      </ResumeProvider>
    </LanguageProvider>
  )
}

export default App
