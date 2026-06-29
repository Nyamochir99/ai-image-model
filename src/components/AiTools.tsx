"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageAnalysis } from "@/components/tools/ImageAnalysis";
import { IngredientRecognition } from "@/components/tools/IngredientRecognition";
import { ImageCreator } from "@/components/tools/ImageCreator";

export function AiTools() {
  return (
    <Tabs defaultValue="analysis" className="flex h-full flex-col gap-6">
      <TabsList className="self-center">
        <TabsTrigger value="analysis">Image analysis</TabsTrigger>
        <TabsTrigger value="ingredient">Ingredient recognition</TabsTrigger>
        <TabsTrigger value="creator">Image creator</TabsTrigger>
      </TabsList>

      <TabsContent
        value="analysis"
        forceMount
        className="data-[state=inactive]:hidden"
      >
        <ImageAnalysis />
      </TabsContent>
      <TabsContent
        value="ingredient"
        forceMount
        className="data-[state=inactive]:hidden"
      >
        <IngredientRecognition />
      </TabsContent>
      <TabsContent
        value="creator"
        forceMount
        className="data-[state=inactive]:hidden"
      >
        <ImageCreator />
      </TabsContent>
    </Tabs>
  );
}
