import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, X } from 'lucide-react'
import { useCallStateStore } from '@/stores/callStateStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { KnowledgeArticle } from '@/types/demo-script'

function KnowledgeCard({ article }: { article: KnowledgeArticle }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  const hideKnowledge = useCallStateStore((state) => state.hideKnowledge)

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <Card className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 w-6 h-6"
            onClick={() => hideKnowledge(article.id)}
          >
            <X className="w-3 h-3" />
          </Button>
          <CardHeader className="p-4 pb-2 pr-10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-info" />
              </div>
              <div>
                <CardTitle className="text-base">{article.title}</CardTitle>
                {article.category && (
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    {article.category}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-sm text-muted-foreground">{article.excerpt}</p>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-3 border-t">
                    <p className="text-sm whitespace-pre-wrap">
                      {article.fullContent.slice(0, 300)}...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Preview
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullContent(true)}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Full Article
              </Button>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showFullContent} onOpenChange={setShowFullContent}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{article.title}</DialogTitle>
            <DialogDescription>{article.category}</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{article.fullContent}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function KnowledgePanel() {
  const visibleKnowledge = useCallStateStore((state) => state.visibleKnowledge)

  return (
    <div className="h-full overflow-y-auto p-4">
      {visibleKnowledge.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mb-4 opacity-50" />
          <p>No knowledge articles</p>
          <p className="text-sm mt-1">
            Relevant articles will appear based on conversation context
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {visibleKnowledge.map((article) => (
              <KnowledgeCard key={article.id} article={article} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
