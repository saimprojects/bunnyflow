import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateGeneration, useGetCredits, getGetCreditsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

const imageFormSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(1000, "Prompt is too long"),
  model: z.enum(["imagen4", "nano_banana", "nano_banana_pro"]),
  aspectRatio: z.enum(["landscape", "portrait", "square"]),
});

type ImageFormValues = z.infer<typeof imageFormSchema>;

export default function GenerateImage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createGeneration = useCreateGeneration();

  const { data: credits } = useGetCredits({
    query: { queryKey: getGetCreditsQueryKey() }
  });

  const form = useForm<ImageFormValues>({
    resolver: zodResolver(imageFormSchema),
    defaultValues: { prompt: "", model: "imagen4", aspectRatio: "square" },
  });

  const calculateCost = (model: string) => {
    switch (model) {
      case "imagen4": return 5;
      case "nano_banana_pro": return 3;
      case "nano_banana": return 1;
      default: return 5;
    }
  };

  const watchedModel = form.watch("model");
  const estimatedCost = calculateCost(watchedModel);
  const hasEnoughCredits = (credits?.remaining || 0) >= estimatedCost;

  const onSubmit = (data: ImageFormValues) => {
    if (!hasEnoughCredits) {
      toast({ title: "Insufficient credits", description: `You need ${estimatedCost} credits, but only have ${credits?.remaining || 0}`, variant: "destructive" });
      return;
    }
    createGeneration.mutate({ data: { type: "image", prompt: data.prompt, model: data.model, aspectRatio: data.aspectRatio } }, {
      onSuccess: () => { toast({ title: "Generation started!" }); queryClient.invalidateQueries({ queryKey: getGetCreditsQueryKey() }); setLocation("/generations"); },
      onError: (error) => { toast({ title: "Generation failed", description: error.error?.message || "Failed to start generation", variant: "destructive" }); }
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Generate Image</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create high-quality images with Imagen 4 and custom models.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_260px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="prompt" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 text-sm">Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A highly detailed digital illustration of a futuristic landscape..."
                      className="min-h-[140px] resize-y text-sm bg-[#1a1528] border-white/10 text-white placeholder:text-gray-600 focus:border-[#7c3aed]"
                      {...field}
                      data-testid="input-prompt"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-600 text-xs">Be specific about style, medium, lighting, and composition.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="model" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm">Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1a1528] border-white/10 text-white text-sm" data-testid="select-model">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a1528] border-white/10 text-white">
                        <SelectItem value="imagen4">Imagen 4</SelectItem>
                        <SelectItem value="nano_banana_pro">Nano Banana Pro</SelectItem>
                        <SelectItem value="nano_banana">Nano Banana</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="aspectRatio" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm">Aspect Ratio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#1a1528] border-white/10 text-white text-sm" data-testid="select-aspect">
                          <SelectValue placeholder="Select ratio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a1528] border-white/10 text-white">
                        <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                        <SelectItem value="portrait">Portrait (9:16)</SelectItem>
                        <SelectItem value="square">Square (1:1)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Zap className="h-3.5 w-3.5 text-[#a855f7]" />
                  <span>Cost: <strong className={hasEnoughCredits ? "text-[#a855f7]" : "text-red-400"}>{estimatedCost} credits</strong></span>
                </div>
                <Button
                  type="submit"
                  disabled={createGeneration.isPending || !hasEnoughCredits}
                  data-testid="button-generate"
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white border-0 px-6"
                >
                  {createGeneration.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate
                </Button>
              </div>
            </form>
          </Form>

          <div className="rounded-xl bg-[#1a1528] border border-white/10 p-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-3">
              <Zap className="h-3.5 w-3.5 text-[#a855f7]" /> Model Guide
            </h3>
            <ul className="text-xs text-gray-500 space-y-3">
              <li><strong className="text-gray-300 block mb-0.5">Imagen 4</strong> Best overall quality, photorealism, and prompt adherence.</li>
              <li><strong className="text-gray-300 block mb-0.5">Nano Banana Pro</strong> Specialized for creative, artistic styles.</li>
              <li><strong className="text-gray-300 block mb-0.5">Nano Banana</strong> Fast, cheap, great for quick concepting.</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
