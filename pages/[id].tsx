import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useQuery, withWunderGraph, useMutation } from '../components/generated/nextjs'

const DetailsPage: NextPage = () => {
  const router = useRouter()
  const recipe = useQuery({
    operationName: 'Recipe',
    input: {
      id: String(router.query.id),
    },
  })
  const { trigger } = useMutation({
    operationName: 'SaveRecipe',
  })
  const onSaveClick = () => {
    const { food_getRecipe } = recipe.data
    if (food_getRecipe) {
      const { id, title, instructions } = food_getRecipe
      trigger({
        recipe: {
          recipeId: String(id),
          title,
          instructions,
        },
      })
    }
  }
  
  return (
    <div>
      <div className="relative max-w-5xl mx-auto pt-20 sm:pt-24 lg:pt-32">
        <h1 className="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
          {recipe.data?.food_getRecipe?.title}
        </h1>
      </div>
      <div className="relative flex flex-col items-center overflow-hidden p-8 sm:p-12">
        <div className="w-full max-w-2xl min-w-64 rounded-2xl bg-blue-50 p-8">
          <div className="mx-auto flex max-w-sm flex-col items-center">{recipe.data?.food_getRecipe?.instructions}</div>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-8"
          onClick={onSaveClick}
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default withWunderGraph(DetailsPage)
