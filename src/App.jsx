import { MantineProvider } from '@mantine/core'
import DiscordColoredTextGenerator from './components/DiscordColoredTextGenerator'
// import './App.css'

function App() {
  return (
    <MantineProvider>
      <DiscordColoredTextGenerator />
    </MantineProvider>
  )
}

export default App
