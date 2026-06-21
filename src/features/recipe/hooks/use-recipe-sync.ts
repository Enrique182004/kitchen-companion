import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import { useRecipeStore } from "../recipe.store";
import { recipeService } from "../services/recipe.service";
import type { Recipe } from "@/types";
import type { RecipeFormValues } from "../recipe.store";

const isDemo = !import.meta.env.VITE_SUPABASE_URL;

const SEED_RECIPES: Omit<RecipeFormValues, never>[] = [
  {
    title: "Carne de res con brócoli",
    description: "Carne en cuadritos salteada con brócoli y salsa Maggi.",
    servings: 3,
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    tags: "carne, brócoli, sartén",
    ingredients: [
      { name: "Brócoli", quantity: 1, unit: "cabeza" },
      { name: "Carne de res en cuadritos (bistec)", quantity: 500, unit: "g" },
      { name: "Maizena", quantity: 2, unit: "cdas" },
      { name: "Salsa Maggi", quantity: 1, unit: "al gusto" },
      { name: "Aceite", quantity: 2, unit: "cdas" },
      { name: "Sal", quantity: 1, unit: "al gusto" },
      { name: "Pimienta", quantity: 1, unit: "al gusto" },
    ],
    instructions: [
      { text: "Sazonar el brócoli con aceite y reservar." },
      {
        text: "Poner los cuadritos de carne en un bowl y mezclar con poca maizena.",
      },
      {
        text: "En una sartén calentar aceite y cocinar la carne con sal y pimienta hasta que esté lista.",
      },
      {
        text: "Agregar el brócoli a la carne y revolver poco a poco con salsa Maggi. ¡Listo!",
      },
    ],
  },
  {
    title: "Pasta Alfredo",
    description: "Espagueti cremoso con pollo y salsa de crema licuada.",
    servings: 4,
    prep_time_minutes: 10,
    cook_time_minutes: 25,
    tags: "pasta, pollo, cremoso",
    ingredients: [
      { name: "Espagueti", quantity: 500, unit: "g" },
      { name: "Crema", quantity: 1, unit: "lata" },
      { name: "Pimienta", quantity: 1, unit: "al gusto" },
      { name: "Knorsuiza", quantity: 1, unit: "al gusto" },
      { name: "Pollo (en trocitos)", quantity: 2, unit: "pechugas" },
      { name: "Sal", quantity: 1, unit: "al gusto" },
    ],
    instructions: [
      { text: "Cocer el espagueti en agua con poca sal. Escurrir y reservar." },
      { text: "Licuar la crema con pimienta y Knorsuiza." },
      {
        text: "Sazonar el pollo en trocitos con pimienta y sal, cocinar hasta que esté listo.",
      },
      {
        text: "En un refractario combinar el espagueti y el pollo, agregar la crema licuada y mezclar bien.",
      },
    ],
  },
  {
    title: "Tortas ahogadas",
    description: "Salsa de chile guajillo con crema para bañar tortas.",
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    tags: "tortas, salsa, mexicano, picante",
    ingredients: [
      { name: "Chiles guajillo", quantity: 8, unit: "" },
      { name: "Chiles de árbol (opcional)", quantity: 2, unit: "" },
      { name: "Dientes de ajo", quantity: 2, unit: "" },
      { name: "Cebolla", quantity: 0.5, unit: "pieza" },
      { name: "Tomates", quantity: 3, unit: "" },
      { name: "Crema ácida o media crema", quantity: 1, unit: "bote mediano" },
      { name: "Pierna española o lomo de cerdo", quantity: 500, unit: "g" },
      { name: "Sal o Knorsuiza", quantity: 1, unit: "al gusto" },
    ],
    instructions: [
      {
        text: "Hervir juntos los chiles, ajo, cebolla y tomates en agua. Una vez hervidos, licuar.",
      },
      {
        text: "Poner la salsa en una sartén honda y llevar a hervor. Sazonar con sal o Knorsuiza.",
      },
      {
        text: "Al soltar el hervor, agregar la crema ácida o media crema. Batir constantemente.",
      },
      {
        text: "Cocinar la pierna o lomo de cerdo en sartén con agua, sal y cebolla.",
      },
      {
        text: "Puede sustituirse la carne por hamburguesa, jamón o solo aguacate.",
      },
    ],
  },
  {
    title: "Pay de queso",
    description: "Pastel de queso cremoso y fácil, listo en 50 minutos.",
    servings: 8,
    prep_time_minutes: 10,
    cook_time_minutes: 50,
    tags: "postre, queso, horno",
    ingredients: [
      { name: "Lechera grande", quantity: 1, unit: "lata" },
      { name: "Huevos", quantity: 2, unit: "" },
      { name: "Queso Philadelphia", quantity: 2, unit: "paquetes" },
      { name: "Vainilla", quantity: 2, unit: "cdas" },
    ],
    instructions: [
      {
        text: "Moler todos los ingredientes en la licuadora hasta obtener mezcla homogénea.",
      },
      {
        text: "Verter en un refractario previamente preparado con base de galleta.",
      },
      { text: "Hornear durante 50 minutos." },
    ],
  },
  {
    title: "Papas al horno con crema",
    description: "Papas en capas con crema, catsup y queso al horno.",
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 40,
    tags: "papas, horno, crema, guarnición",
    ingredients: [
      { name: "Papas", quantity: 4, unit: "" },
      { name: "Crema de leche", quantity: 0.25, unit: "taza" },
      { name: "Catsup", quantity: 0.25, unit: "taza" },
      { name: "Mantequilla", quantity: 1, unit: "cdta" },
      { name: "Queso rayado", quantity: 1, unit: "al gusto" },
      { name: "Sal y pimienta", quantity: 1, unit: "al gusto" },
    ],
    instructions: [
      { text: "Pelar las papas y cortar en láminas finas." },
      { text: "Mezclar la crema con la catsup." },
      {
        text: "Colocar la mitad de las papas en el refractario, salpimentar. Agregar el resto y volver a salpimentar.",
      },
      {
        text: "Verter la crema por encima, cubrir bien y tapar con papel de aluminio.",
      },
      { text: "Hornear a 250° durante 30 minutos." },
      {
        text: "Agregar queso rayado y mantequilla, hornear 10 minutos más sin el aluminio.",
      },
    ],
  },
  {
    title: "Fajitas de pollo en Salsa de Chipotle",
    description:
      "Fajitas de pollo asadas bañadas en cremosa salsa de chipotle con leche Carnation.",
    servings: 4,
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    tags: "pollo, chipotle, salsa, fajitas",
    ingredients: [
      { name: "Leche Carnation", quantity: 0.5, unit: "lata" },
      { name: "Dadito de Sazón sabor cebolla-ajo", quantity: 1, unit: "" },
      { name: "Cubo de caldo de pollo", quantity: 1, unit: "" },
      { name: "Chiles chipotles de lata", quantity: 2, unit: "" },
      { name: "Agua", quantity: 1.5, unit: "tza" },
      { name: "Fajitas de pollo, asadas", quantity: 450, unit: "g" },
    ],
    instructions: [
      {
        text: "Licua todos los ingredientes, excepto el pollo.",
      },
      {
        text: "Cuela y calienta de 10 a 15 min o hasta que espese tomando la consistencia deseada, moviendo constantemente para evitar que se pegue.",
      },
      {
        text: "Retira del fuego, baña las fajitas con la salsa y listo.",
      },
    ],
  },
  {
    title: "Pasta de Chipotle con Tocino Philadelphia",
    description:
      "Tallarines con cremosa salsa de philadelphia chipotle y tocino frito.",
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    tags: "pasta, chipotle, tocino, philadelphia, tallarines",
    ingredients: [
      { name: "Philadelphia sabor chipotle", quantity: 190, unit: "g" },
      { name: "Tocino frito en trozos", quantity: 0.5, unit: "tza" },
      { name: "Leche", quantity: 2, unit: "tzas" },
      { name: "Caldo de pollo", quantity: 1, unit: "tza" },
      { name: "Cebolla", quantity: 0.75, unit: "tza" },
      { name: "Aceite", quantity: 2, unit: "cdas" },
      { name: "Tallarines", quantity: 600, unit: "g" },
    ],
    instructions: [
      {
        text: "Calentar una sartén con aceite y freír la cebolla hasta dorar.",
      },
      {
        text: "Licuar todos los ingredientes de la salsa, calentar en una cacerola hasta que suelte el hervor y servir sobre los tallarines cocidos.",
      },
      {
        text: "Decorar con trocitos de tocino y servir.",
      },
    ],
  },
  {
    title: "Pollo 'Cásate Conmigo'",
    description:
      "Pechugas de pollo selladas en cremosa salsa de tomates deshidratados y parmesano, acompañadas de papas y brócoli asados.",
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    tags: "pollo, cremoso, parmesano, tomates deshidratados, horno",
    ingredients: [
      {
        name: "Pechugas de pollo sin hueso, en filetes finos",
        quantity: 600,
        unit: "g",
      },
      { name: "Aceite de oliva (para sellar)", quantity: 15, unit: "ml" },
      { name: "Harina de trigo (para enharinar)", quantity: 15, unit: "g" },
      { name: "Sal y pimienta negra al gusto", quantity: 3, unit: "g" },
      { name: "Sazonador italiano seco", quantity: 2, unit: "g" },
      { name: "Mantequilla sin sal", quantity: 30, unit: "g" },
      { name: "Ajo fresco picado", quantity: 10, unit: "g" },
      { name: "Caldo de pollo", quantity: 120, unit: "ml" },
      { name: "Crema para batir", quantity: 120, unit: "ml" },
      {
        name: "Tomates deshidratados en aceite, escurridos y en tiras",
        quantity: 30,
        unit: "g",
      },
      { name: "Queso parmesano rallado", quantity: 30, unit: "g" },
      { name: "Papas cambray en mitades", quantity: 300, unit: "g" },
      { name: "Floretes de brócoli o broccolini", quantity: 150, unit: "g" },
      { name: "Aceite de oliva (para asar)", quantity: 15, unit: "ml" },
      { name: "Perejil fresco picado (para decorar)", quantity: 5, unit: "g" },
    ],
    instructions: [
      {
        text: "Asar verduras: Precalentar el horno a 200°C. Mezclar las papas y el brócoli con aceite, sal y pimienta. Hornear 20-25 minutos hasta que estén tiernos y ligeramente dorados.",
      },
      {
        text: "Preparar y sellar el pollo: Sazonar con sal, pimienta y sazonador italiano. Enharinar ligeramente. Calentar aceite en un sartén y sellar el pollo 4-5 minutos por lado hasta dorar. Retirar y reservar.",
      },
      {
        text: "Saltear aromáticos: Bajar el fuego a medio, agregar mantequilla y ajo al sartén. Saltear 1 minuto hasta que esté fragante.",
      },
      {
        text: "Hacer la salsa: Verter el caldo de pollo, raspando los trocitos del fondo. Agregar la crema y los tomates deshidratados. Llevar a hervor suave.",
      },
      {
        text: "Terminar la salsa: Incorporar el queso parmesano y revolver hasta obtener una salsa suave y ligeramente espesa.",
      },
      {
        text: "Combinar: Regresar el pollo a la salsa y dejar a fuego lento 1-2 minutos para calentar y bañar bien el pollo.",
      },
      {
        text: "Servir: Servir el pollo con la salsa junto con las papas y el brócoli asados. Decorar con perejil fresco picado.",
      },
    ],
  },
  {
    title: "Espagueti a la Carbonara",
    description:
      "Pasta italiana clásica con yemas de huevo, guanciale crujiente y queso Pecorino Romano.",
    servings: 2,
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    tags: "pasta, italiana, carbonara, huevo, tocino",
    ingredients: [
      { name: "Espagueti", quantity: 200, unit: "g" },
      { name: "Sal (para el agua de cocción)", quantity: 15, unit: "g" },
      { name: "Agua de cocción de pasta reservada", quantity: 60, unit: "ml" },
      { name: "Guanciale o panceta en cubos", quantity: 100, unit: "g" },
      { name: "Yemas de huevo grandes", quantity: 3, unit: "piezas" },
      { name: "Huevo entero grande", quantity: 1, unit: "pieza" },
      { name: "Queso Pecorino Romano rallado", quantity: 50, unit: "g" },
      {
        name: "Pimienta negra recién molida (cantidad generosa)",
        quantity: 4,
        unit: "g",
      },
      {
        name: "Guanciale/panceta extra crujiente (para decorar)",
        quantity: 10,
        unit: "g",
      },
    ],
    instructions: [
      {
        text: "Cocer la pasta: Hervir agua con sal y cocer el espagueti al dente. Reservar aprox. 120 ml del agua de cocción antes de escurrir.",
      },
      {
        text: "Dorar la carne: Cocinar el guanciale o panceta en un sartén a fuego medio hasta que esté crujiente. Retirar los trozos, dejando la grasa en el sartén. Apagar el fuego.",
      },
      {
        text: "Preparar la mezcla de huevo: En un tazón, batir vigorosamente las yemas y el huevo entero con el queso Pecorino Romano y mucha pimienta negra hasta obtener una mezcla cremosa.",
      },
      {
        text: "Combinar pasta y grasa: Agregar el espagueti escurrido y caliente al sartén con la grasa. Mezclar rápidamente para cubrir.",
      },
      {
        text: "Emulsionar: Verter poco a poco la mezcla de huevo sobre la pasta, revolviendo continua y rápidamente (sin calor) para evitar que los huevos se cocinen de más.",
      },
      {
        text: "Ajustar consistencia: Agregar una cucharada del agua de cocción caliente a la vez, revolviendo hasta obtener una salsa cremosa que cubra la pasta.",
      },
      {
        text: "Servir: Transferir de inmediato a tazones. Cubrir con la carne crujiente, queso Pecorino Romano extra y pimienta al gusto.",
      },
    ],
  },
  {
    title: "Camarones al Mojo de Ajo con Espárragos",
    description:
      "Camarones jugosos en mantequilla de ajo y limón, servidos con espárragos salteados.",
    servings: 4,
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    tags: "camarones, ajo, limón, mantequilla, espárragos",
    ingredients: [
      {
        name: "Camarones grandes pelados y desvenados",
        quantity: 400,
        unit: "g",
      },
      { name: "Mantequilla sin sal", quantity: 60, unit: "g" },
      { name: "Ajo fresco picado (aprox. 4 dientes)", quantity: 15, unit: "g" },
      { name: "Aceite de oliva", quantity: 15, unit: "ml" },
      {
        name: "Jugo de limón recién exprimido (aprox. 1 limón)",
        quantity: 30,
        unit: "ml",
      },
      { name: "Orégano seco", quantity: 1, unit: "g" },
      { name: "Sal y pimienta negra al gusto", quantity: 3, unit: "g" },
      { name: "Espárragos en trozos de 2-3 cm", quantity: 200, unit: "g" },
      { name: "Perejil fresco picado (para decorar)", quantity: 5, unit: "g" },
      { name: "Hojuelas de chile rojo (opcional)", quantity: 1, unit: "g" },
    ],
    instructions: [
      {
        text: "Saltear espárragos: Calentar aceite en un sartén grande a fuego medio-alto. Agregar los espárragos con una pizca de sal y saltear 3-5 minutos hasta que estén tiernos pero crujientes. Retirar y reservar.",
      },
      {
        text: "Mantequilla con ajo: Bajar el fuego a medio. Agregar la mantequilla al sartén. Al derretirse, incorporar el ajo y el orégano, cocinar 1 minuto hasta que esté fragante.",
      },
      {
        text: "Sazonar los camarones: Salpimentar los camarones.",
      },
      {
        text: "Cocinar los camarones: Subir el fuego a medio-alto. Agregar los camarones en una sola capa. Cocinar 1-2 minutos por lado hasta que estén rosados y opacos.",
      },
      {
        text: "Agregar limón y verduras: Retirar del fuego. Incorporar el jugo de limón y regresar los espárragos al sartén.",
      },
      {
        text: "Mezclar: Revolver suavemente para bañar todo con la salsa de mantequilla de ajo y limón.",
      },
      {
        text: "Servir: Transferir a tazones de inmediato. Decorar con perejil picado, hojuelas de chile (si se desea) y rodajas de limón.",
      },
    ],
  },
  {
    title: "Pollo con Brócoli al Wok",
    description:
      "Tiras de pollo y brócoli salteados en salsa agridulce de soya, ajo y jengibre.",
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 20,
    tags: "pollo, brócoli, wok, soya, asiático, jengibre",
    ingredients: [
      {
        name: "Pechuga de pollo en tiras de 2-3 cm",
        quantity: 450,
        unit: "g",
      },
      { name: "Maizena", quantity: 15, unit: "g" },
      { name: "Aceite de oliva o aceite de sésamo", quantity: 15, unit: "ml" },
      { name: "Floretes pequeños de brócoli", quantity: 300, unit: "g" },
      { name: "Salsa de soya baja en sodio", quantity: 60, unit: "ml" },
      { name: "Agua o caldo de pollo", quantity: 30, unit: "ml" },
      { name: "Azúcar morena o miel", quantity: 30, unit: "g" },
      { name: "Jengibre fresco picado", quantity: 5, unit: "g" },
      { name: "Ajo fresco picado", quantity: 10, unit: "g" },
      { name: "Vinagre de arroz", quantity: 15, unit: "ml" },
      { name: "Aceite de sésamo tostado", quantity: 5, unit: "ml" },
      {
        name: "Semillas de sésamo tostadas (para decorar)",
        quantity: 3,
        unit: "g",
      },
      { name: "Cebollín en rodajas (para decorar)", quantity: 10, unit: "g" },
    ],
    instructions: [
      {
        text: "Preparar el pollo: Mezclar las tiras de pollo con la maizena hasta cubrir ligeramente. Reservar.",
      },
      {
        text: "Preparar la salsa: En un tazón, mezclar la soya, el agua/caldo, el azúcar/miel, el jengibre, el ajo, el vinagre de arroz y el aceite de sésamo.",
      },
      {
        text: "Cocinar el pollo: Calentar aceite en un wok o sartén grande a fuego medio-alto. Agregar el pollo y cocinar 5-7 minutos hasta que esté dorado y bien cocido. Retirar y reservar.",
      },
      {
        text: "Cocinar el brócoli: En el mismo sartén, agregar los floretes de brócoli. Cocinar 3-5 minutos, agregando un chorrito de agua si es necesario, hasta que estén tiernos pero crujientes.",
      },
      {
        text: "Combinar y espesar: Regresar el pollo al sartén con el brócoli. Verter la salsa preparada sobre todo.",
      },
      {
        text: "Hervir: Llevar a hervor moviendo constantemente hasta que la salsa espese y quede pegajosa y brillante (1-2 minutos).",
      },
      {
        text: "Servir: Servir de inmediato sobre arroz. Decorar con semillas de sésamo tostadas y cebollín en rodajas.",
      },
    ],
  },
  {
    title: "Carbonara Cremosa con Tocino",
    description:
      "Tocino crujiente, champiñones y cebolla salteados y bañados en una rica salsa cremosa de huevo y parmesano. ¡Lista en 30 minutos!",
    servings: 6,
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    tags: "pasta, tocino, carbonara, cremoso, champiñones",
    ingredients: [
      { name: "Huevos", quantity: 2, unit: "piezas" },
      { name: "Crema para batir", quantity: 60, unit: "ml" },
      { name: "Queso parmesano rallado", quantity: 80, unit: "ml" },
      { name: "Perejil fresco picado", quantity: 1, unit: "cdta" },
      { name: "Sal", quantity: 0.25, unit: "cdta" },
      { name: "Hojuelas de chile rojo", quantity: 0.5, unit: "cdta" },
      { name: "Tocino", quantity: 225, unit: "g" },
      { name: "Champiñones picados (opcional)", quantity: 3, unit: "piezas" },
      { name: "Cebolla pequeña picada (opcional)", quantity: 1, unit: "pieza" },
      { name: "Pasta", quantity: 225, unit: "g" },
    ],
    instructions: [
      {
        text: "Mezclar en un tazón los huevos, la crema, el parmesano, el perejil, la sal y las hojuelas de chile. Reservar.",
      },
      {
        text: "Freír el tocino hasta que esté crujiente. Desmenuzar y reservar.",
      },
      {
        text: "Usando 1-2 cdas de la grasa del tocino, saltear la cebolla y los champiñones hasta que la cebolla esté traslúcida y dorada.",
      },
      {
        text: "Escurrir la pasta cocida y, mientras aún esté caliente, agregar la cebolla y los champiñones salteados.",
      },
      {
        text: "Verter la mezcla de crema sobre la pasta y revolver a fuego bajo 1-2 minutos. Importante: usar fuego bajo para evitar que los huevos se cuezan de más.",
      },
      {
        text: "Incorporar el tocino desmenuzado y servir con parmesano adicional.",
      },
    ],
  },
  {
    title: "Pasta de Pastel de Pollo",
    description:
      "Una variante rápida y reconfortante del pastel de pollo clásico: todo el sabor cremoso y sustancioso pero con fideos en lugar de corteza. Lista en 30 minutos.",
    servings: 6,
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    tags: "pasta, pollo, cremoso, verduras, reconfortante, fideos",
    ingredients: [
      { name: "Pechuga de pollo en cubos", quantity: 450, unit: "g" },
      { name: "Mantequilla sin sal", quantity: 2, unit: "cdas" },
      {
        name: "Cebolla picada (aprox. 1/2 cebolla mediana)",
        quantity: 1,
        unit: "taza",
      },
      { name: "Caldo de pollo en polvo", quantity: 2, unit: "cdtas" },
      { name: "Ajo en polvo", quantity: 1, unit: "cdta" },
      { name: "Pimentón (paprika)", quantity: 0.5, unit: "cdta" },
      { name: "Verduras mixtas congeladas", quantity: 340, unit: "g" },
      {
        name: "Crema de pollo en lata",
        quantity: 2,
        unit: "latas (298 g c/u)",
      },
      { name: "Leche entera", quantity: 1, unit: "taza" },
      { name: "Sal y pimienta al gusto", quantity: 1, unit: "al gusto" },
      {
        name: "Fideos anchos de huevo (egg noodles)",
        quantity: 225,
        unit: "g",
      },
    ],
    instructions: [
      {
        text: "Derretir la mantequilla en un sartén grande a fuego medio-alto. Agregar la cebolla y cocinar hasta que esté tierna, aprox. 3-4 minutos.",
      },
      {
        text: "Agregar el pollo en cubos con el caldo en polvo, el ajo en polvo y el pimentón. Cocinar moviendo frecuentemente hasta que esté dorado y casi cocido, aprox. 8-10 minutos.",
      },
      {
        text: "Agregar las verduras mixtas congeladas y cocinar hasta descongelar. Verter la crema de pollo y la leche; sazonar con sal y pimienta. Cocinar a fuego bajo 8-10 minutos hasta que el pollo esté completamente cocido.",
      },
      {
        text: "Mientras tanto, cocer los fideos según las instrucciones del paquete. Agregar los fideos cocidos al sartén y mezclar bien para cubrir.",
      },
      {
        text: "Servir de inmediato con sazonadores adicionales al gusto.",
      },
    ],
  },
];

export function useRecipeSync() {
  const user = useAuthStore((state) => state.user);
  const {
    recipes,
    setRecipes,
    createRecipe,
    updateRecipe,
    removeRecipe,
    restoreRecipe,
    toggleFavorite,
  } = useRecipeStore();

  useEffect(() => {
    if (isDemo || !user) return;

    const userId = user.id;

    const buildLocalRecipes = (): Recipe[] => {
      const now = new Date().toISOString();
      return SEED_RECIPES.map((r) => ({
        id: crypto.randomUUID(),
        user_id: userId,
        title: r.title,
        description: r.description || null,
        image_url: null,
        servings: r.servings || null,
        prep_time_minutes: r.prep_time_minutes || null,
        cook_time_minutes: r.cook_time_minutes || null,
        tags: r.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        ingredients: r.ingredients
          .filter((i) => i.name.trim())
          .map((i) => ({
            id: crypto.randomUUID(),
            name: i.name.trim(),
            quantity: Number(i.quantity) || 1,
            unit: i.unit.trim() || null,
          })),
        instructions: r.instructions.map((s) => s.text.trim()).filter(Boolean),
        is_favorite: false,
        created_at: now,
        updated_at: now,
      }));
    };

    recipeService
      .fetchRecipes(userId)
      .then(async (fetched) => {
        if (fetched.length > 0) {
          setRecipes(fetched);
          return;
        }
        // Show locally first so UI is responsive immediately
        const localRecipes = buildLocalRecipes();
        setRecipes(localRecipes);
        // Then persist to Supabase in background
        const saved: Recipe[] = [];
        for (const recipe of localRecipes) {
          try {
            const s = await recipeService.addRecipe(recipe);
            saved.push(s);
          } catch (e) {
            console.error("[recipe seed] failed to save", recipe.title, e);
            saved.push(recipe);
          }
        }
        setRecipes(saved);
      })
      .catch((e) => {
        console.error("[recipe fetch] failed", e);
        // Fetch failed — still show seed recipes locally
        setRecipes(buildLocalRecipes());
      });

    const onFocus = () => {
      recipeService
        .fetchRecipes(userId)
        .then((fetched) => {
          // Only overwrite if Supabase returned data; keep local recipes otherwise
          if (fetched.length > 0) setRecipes(fetched);
        })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [user, setRecipes]);

  const handleCreate = async (values: RecipeFormValues) => {
    if (isDemo) {
      createRecipe(values);
      return;
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const recipe: Recipe = {
      id,
      user_id: user!.id,
      title: values.title.trim(),
      description: values.description.trim() || null,
      image_url: null,
      servings: values.servings || null,
      prep_time_minutes: values.prep_time_minutes || null,
      cook_time_minutes: values.cook_time_minutes || null,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ingredients: values.ingredients
        .filter((i) => i.name.trim())
        .map((i) => ({
          id: crypto.randomUUID(),
          name: i.name.trim(),
          quantity: Number(i.quantity) || 1,
          unit: i.unit.trim() || null,
        })),
      instructions: values.instructions
        .map((s) => s.text.trim())
        .filter(Boolean),
      is_favorite: false,
      created_at: now,
      updated_at: now,
    };
    const saved = await recipeService.addRecipe(recipe);
    setRecipes([saved, ...recipes]);
  };

  const handleUpdate = async (id: string, values: RecipeFormValues) => {
    if (isDemo) {
      updateRecipe(id, values);
      return;
    }
    const existing = recipes.find((r) => r.id === id);
    const changes: Partial<Recipe> = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      servings: values.servings || null,
      prep_time_minutes: values.prep_time_minutes || null,
      cook_time_minutes: values.cook_time_minutes || null,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ingredients: values.ingredients
        .filter((i) => i.name.trim())
        .map((i, idx) => ({
          id: existing?.ingredients[idx]?.id ?? crypto.randomUUID(),
          name: i.name.trim(),
          quantity: Number(i.quantity) || 1,
          unit: i.unit.trim() || null,
        })),
      instructions: values.instructions
        .map((s) => s.text.trim())
        .filter(Boolean),
    };
    const saved = await recipeService.updateRecipe(id, changes);
    setRecipes(recipes.map((r) => (r.id === id ? saved : r)));
  };

  const handleRemove = async (id: string) => {
    if (isDemo) {
      removeRecipe(id);
      return;
    }
    await recipeService.deleteRecipe(id);
    setRecipes(recipes.filter((r) => r.id !== id));
  };

  const handleRestore = async (recipe: Recipe) => {
    if (isDemo) {
      restoreRecipe(recipe);
      return;
    }
    if (recipes.some((r) => r.id === recipe.id)) return;
    const saved = await recipeService.addRecipe(recipe);
    setRecipes([saved, ...recipes]);
  };

  const handleToggleFavorite = async (id: string) => {
    if (isDemo) {
      toggleFavorite(id);
      return;
    }
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return;
    const saved = await recipeService.toggleFavorite(id, !recipe.is_favorite);
    setRecipes(recipes.map((r) => (r.id === id ? saved : r)));
  };

  return {
    recipes,
    createRecipe: handleCreate,
    updateRecipe: handleUpdate,
    removeRecipe: handleRemove,
    restoreRecipe: handleRestore,
    toggleFavorite: handleToggleFavorite,
  };
}
