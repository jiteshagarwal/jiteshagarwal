import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileJson, Loader2, AlertCircle, Headphones } from 'lucide-react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useDemoScriptStore } from '@/stores/demoScriptStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function UploadScreen() {
  const [isDragging, setIsDragging] = useState(false)
  const { processFile, loadSampleScript } = useFileUpload()
  const { isLoading, error } = useDemoScriptStore()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && file.type === 'application/json') {
        processFile(file)
      }
    },
    [processFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile]
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
          >
            <Headphones className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Real-Time Guidance Agent
          </h1>
          <p className="text-muted-foreground">
            AI-powered call center agent co-pilot demo
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Load Demo Script</CardTitle>
            <CardDescription>
              Upload a JSON demo script or load the sample scenario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              animate={{
                borderColor: isDragging ? 'rgb(59 130 246)' : 'rgb(226 232 240)',
                backgroundColor: isDragging ? 'rgb(239 246 255)' : 'transparent',
              }}
              className="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
            >
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isLoading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  {isLoading ? (
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  ) : (
                    <motion.div
                      animate={{ y: isDragging ? -5 : 0 }}
                      className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
                    >
                      <Upload className="w-6 h-6 text-primary" />
                    </motion.div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {isDragging
                        ? 'Drop the file here'
                        : 'Drag & drop a JSON file'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse
                    </p>
                  </div>
                </div>
              </label>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              onClick={loadSampleScript}
              disabled={isLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <FileJson className="w-5 h-5 mr-2" />
              Load Sample Demo
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              The sample demo features a customer reporting a lost credit card
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
