import { CircularProgress, Grid, Sheet } from '@mui/joy';
import Typography from '@mui/joy/Typography';
import { useAPI } from 'renderer/lib/transformerlab-api-sdk';
import RecipeCard from './RecipeCard';
import { isRecipeCompatibleWithDevice } from './SelectedRecipe';

export default function ListRecipes({ setSelectedRecipe }) {
  const { data, isLoading } = useAPI('recipes', ['getAll']);

  const { data: serverInfo } = useAPI('server', ['info']);
  const device = serverInfo?.device;

  // Sort data by an extra field called zOrder if it exists, put all
  // recipes without zOrder at the end
  const sortedData = data?.sort((a, b) => {
    if (a.zOrder !== undefined && b.zOrder !== undefined) {
      return a.zOrder - b.zOrder;
    } else if (a.zOrder !== undefined) {
      return -1; // a comes first
    } else if (b.zOrder !== undefined) {
      return 1; // b comes first
    } else {
      return 0; // keep original order
    }
  });

  return (
    <>
      <Typography level="h2">👋 Welcome to Transformer Lab!</Typography>
      <Typography level="h3" mb={1}>
        What do you want to do?
      </Typography>
      <Typography level="body-sm" mb={2}>
        Your machine&apos;s architecture is {device}. To see more recipes, try
        this app on a computer with a different GPU.
      </Typography>
      <Sheet
        variant="soft"
        color="neutral"
        sx={{
          width: '100%',
          height: '100%',
          p: 2,
          overflowY: 'auto',
          borderRadius: 'md',
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            flexGrow: 1,
            justifyContent: 'flext-start',
            alignContent: 'flex-start',
            overflow: 'auto',
            maxWidth: '1000px' /* Adjust this to your desired max width */,
            margin: '0 auto',
          }}
        >
          <RecipeCard
            recipeDetails={{
              id: -1,
              title: 'Create an Empty Experiment',
              description: 'Start from scratch',
              cardImage: 'https://recipes.transformerlab.net/cleanlab.jpg',
            }}
            setSelectedRecipe={setSelectedRecipe}
          />
          {isLoading && <CircularProgress />}
          {Array.isArray(sortedData) &&
            sortedData.map((recipe) => (
              <RecipeCard
                recipeDetails={recipe}
                setSelectedRecipe={setSelectedRecipe}
              />
            ))}
        </Grid>
      </Sheet>
    </>
  );
}
