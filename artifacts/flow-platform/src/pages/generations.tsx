import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetGenerations, getGetGenerationsQueryKey } from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, Image as ImageIcon, Zap, AlertCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function Generations() {
  const [filterType, setFilterType] = useState<"all" | "video" | "image">("all");
  
  const { data: response, isLoading } = useGetGenerations({
    type: filterType,
    limit: 50,
  }, {
    query: { queryKey: getGetGenerationsQueryKey({ type: filterType, limit: 50 }) }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">History</h1>
            <p className="text-muted-foreground">View and manage your generated content.</p>
          </div>
          <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)} className="w-full sm:w-[400px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (!response?.items || response.items.length === 0) ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-card">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No generations found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or generating new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {response.items.map((gen) => (
              <Card key={gen.id} className="overflow-hidden flex flex-col group border-border hover:border-primary/50 transition-all bg-card">
                <div className={`relative bg-muted ${gen.aspectRatio === 'landscape' ? 'aspect-video' : gen.aspectRatio === 'portrait' ? 'aspect-[9/16]' : 'aspect-square'}`}>
                  {gen.resultUrl || gen.thumbnailUrl ? (
                    gen.type === 'video' && gen.resultUrl ? (
                      <video 
                        src={gen.resultUrl} 
                        poster={gen.thumbnailUrl || undefined}
                        className="object-cover w-full h-full"
                        controls
                        preload="none"
                      />
                    ) : (
                      <img 
                        src={gen.resultUrl || gen.thumbnailUrl!} 
                        alt={gen.prompt} 
                        className="object-cover w-full h-full"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-background/50">
                      {gen.status === 'failed' ? (
                        <AlertCircle className="h-10 w-10 text-destructive mb-2" />
                      ) : gen.status === 'processing' || gen.status === 'pending' ? (
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                      ) : (
                        gen.type === 'video' ? <Video className="h-10 w-10 text-muted-foreground mb-2" /> : <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                      )}
                      <span className="text-sm font-medium capitalize text-muted-foreground">{gen.status}</span>
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant="outline" className={`backdrop-blur-md font-semibold ${getStatusColor(gen.status)} capitalize border`}>
                      {gen.status}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-5 flex-1 flex flex-col">
                  <p className="text-sm text-foreground mb-4 line-clamp-3 leading-relaxed" title={gen.prompt}>{gen.prompt}</p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-muted text-xs font-mono">{gen.model}</Badge>
                      <Badge variant="secondary" className="bg-muted text-xs font-mono">{gen.aspectRatio}</Badge>
                      {gen.duration && <Badge variant="secondary" className="bg-muted text-xs font-mono">{gen.duration}s</Badge>}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                      <span>{format(new Date(gen.createdAt), 'MMM d, yyyy h:mm a')}</span>
                      <span className="flex items-center gap-1 font-medium text-foreground"><Zap className="h-3 w-3 text-primary" /> {gen.creditsUsed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
