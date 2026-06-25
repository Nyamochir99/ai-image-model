"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageAnalysis } from "@/components/tools/image-analysis";
import { IngredientRecognition } from "@/components/tools/ingredient-recognition";
import { ImageCreator } from "@/components/tools/image-creator";

export function AiTools() {
  return (
    <Tabs defaultValue="analysis" className="flex h-full flex-col gap-6">
      <TabsList className="self-center">
        <TabsTrigger value="analysis">Image analysis</TabsTrigger>
        <TabsTrigger value="ingredient">Ingredient recognition</TabsTrigger>
        <TabsTrigger value="creator">Image creator</TabsTrigger>
      </TabsList>

      <TabsContent value="analysis">
        <ImageAnalysis />
      </TabsContent>
      <TabsContent value="ingredient">
        <IngredientRecognition />
      </TabsContent>
      <TabsContent value="creator">
        <ImageCreator />
      </TabsContent>
    </Tabs>
  );
}
