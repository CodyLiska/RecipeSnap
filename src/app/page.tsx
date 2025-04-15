
"use client";

import { useState } from "react";
import { identifyIngredients } from "@/ai/flows/identify-ingredients";
import { suggestRecipes } from "@/ai/flows/suggest-recipes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<
    { name: string; quantity: string }[]
  >([]);
  const [recipes, setRecipes] = useState<
    { name: string; description: string; url: string; missingIngredients: string[] }[]
  >([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentifyIngredients = async () => {
    if (!image) {
      toast({
        title: "Error",
        description: "Please upload an image first.",
      });
      return;
    }

    setLoadingIngredients(true);
    try {
      const identifiedIngredients = await identifyIngredients({ photoUrl: image });
      setIngredients(identifiedIngredients);
      toast({
        title: "Ingredients Identified!",
        description: "Check out the identified ingredients below.",
      });
    } catch (error: any) {
      console.error("Error identifying ingredients:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to identify ingredients.",
      });
    } finally {
      setLoadingIngredients(false);
    }
  };

  const handleSuggestRecipes = async () => {
    if (ingredients.length === 0) {
      toast({
        title: "Error",
        description: "Please identify ingredients first.",
      });
      return;
    }

    setLoadingRecipes(true);
    try {
      const suggestedRecipes = await suggestRecipes({ ingredients: ingredients });
      setRecipes(suggestedRecipes);
      toast({
        title: "Recipes Suggested!",
        description: "Here are some recipes you can make.",
      });
    } catch (error: any) {
      console.error("Error suggesting recipes:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to suggest recipes.",
      });
    } finally {
      setLoadingRecipes(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-8 bg-warm-beige">
      <h1 className="text-4xl font-bold text-earthy-green mb-4">RecipeSnap</h1>
      <Card className="w-full max-w-md mb-8">
        <CardHeader>
          <CardTitle>Upload Ingredients Image</CardTitle>
          <CardDescription>Upload an image of your ingredients to get started.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
          {image && (
            <img
              src={image}
              alt="Uploaded Ingredients"
              className="rounded-md object-contain max-h-48 w-full"
            />
          )}
          <Button
            className="bg-burnt-orange text-white hover:bg-orange-600"
            onClick={handleIdentifyIngredients}
            disabled={loadingIngredients}
          >
            {loadingIngredients ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Identifying...
              </>
            ) : (
              "Identify Ingredients"
            )}
          </Button>
        </CardContent>
      </Card>

      {ingredients.length > 0 && (
        <Card className="w-full max-w-md mb-8">
          <CardHeader>
            <CardTitle>Identified Ingredients</CardTitle>
            <CardDescription>Here are the ingredients we found in your image.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              {ingredients.map((ingredient, index) => (
                <li key={index} className="mb-2">
                  {ingredient.name} - {ingredient.quantity}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {ingredients.length > 0 && (
        <Card className="w-full max-w-md mb-8">
          <CardHeader>
            <CardTitle>Suggest Recipes</CardTitle>
            <CardDescription>Click below to get recipe suggestions based on your ingredients.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="bg-burnt-orange text-white hover:bg-orange-600"
              onClick={handleSuggestRecipes}
              disabled={loadingRecipes}
            >
              {loadingRecipes ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Suggesting...
                </>
              ) : (
                "Suggest Recipes"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {recipes.length > 0 && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Suggested Recipes</CardTitle>
            <CardDescription>Here are some recipes you can make with your ingredients.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              {recipes.map((recipe, index) => (
                <li key={index} className="mb-4">
                  <a href={recipe.url} target="_blank" rel="noopener noreferrer">
                    <h3 className="text-lg font-semibold text-earthy-green hover:underline">
                      {recipe.name}
                    </h3>
                  </a>
                  <p className="text-sm">{recipe.description}</p>
                  {recipe.missingIngredients.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Missing Ingredients:</p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.missingIngredients.map((missingIngredient, i) => (
                          <Badge variant="secondary" key={i}>
                            {missingIngredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
