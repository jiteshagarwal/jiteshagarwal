import { useCallStateStore } from '@/stores/callStateStore'
import { useDemoScriptStore } from '@/stores/demoScriptStore'
import { TooltipProvider } from '@/components/ui/tooltip'
import { UploadScreen } from '@/components/upload/UploadScreen'
import { IncomingCallScreen } from '@/components/incoming-call/IncomingCallScreen'
import { ActiveCallScreen } from '@/components/active-call/ActiveCallScreen'
import { PostCallScreen } from '@/components/post-call/PostCallScreen'

function App() {
  const phase = useCallStateStore((state) => state.phase)
  const script = useDemoScriptStore((state) => state.script)

  const renderScreen = () => {
    if (!script || phase === 'idle') {
      return <UploadScreen />
    }

    switch (phase) {
      case 'incoming':
        return <IncomingCallScreen />
      case 'active':
        return <ActiveCallScreen />
      case 'post_call':
        return <PostCallScreen />
      default:
        return <UploadScreen />
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {renderScreen()}
      </div>
    </TooltipProvider>
  )
}

export default App
