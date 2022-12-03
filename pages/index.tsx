import { useState } from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import { useQuery, withWunderGraph } from '../components/generated/nextjs'

const Home: NextPage = () => {
  const [query, setQuery] = useState('')
  const recipes = useQuery({
    operationName: 'Recipes',
    input: {
      query,
    },
  })
  return (
    <div>
      <div className="relative max-w-5xl mx-auto pt-20 sm:pt-24 lg:pt-32">
        <h1 className="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
          Diet Planner
        </h1>
        <p className="mt-6 text-lg text-slate-600 text-center max-w-3xl mx-auto dark:text-slate-400">
          Start a free text search to find recipes to your diet!
        </p>
        <form className="w-full max-w-sm mx-auto mt-4">
          <div className="flex items-center border-b border-teal-500 py-2">
            <input
              className="appearance-none bg-transparent border-none w-full text-gray-100 mr-3 py-1 px-2 leading-tight focus:outline-none"
              type="text"
              placeholder="gluten free brownies without sugar"
              aria-label="Food query"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>
      </div>
      <div className="relative flex flex-col items-center overflow-hidden p-8 sm:p-12">
        <div className="w-full max-w-2xl min-w-64 rounded-2xl bg-blue-50 p-8">
          <ul className="rounded-2xl border border-gray-700 w-full text-gray-900 shadow-xl">
            {recipes.data?.food_searchRecipes?.results.map((recipe, index, arr) => (
              <Link href={`/${recipe.id}`} key={recipe.id}>
                <li
                  className={`px-6 py-2 cursor-pointer ${index !== arr.length - 1 ? 'border-b' : 'rounded-b-2xl'} ${
                    index === 0 ? 'rounded-t-2xl' : ''
                  } border-gray-700 w-full overflow-hidden hover:bg-white`}
                >
                  {recipe.title}
                </li>
              </Link>
            ))}
          </ul>
          <div className="mx-auto flex max-w-sm flex-col items-center"></div>
        </div>
        <footer className="flex justify-between text-gray-400">
          <p className="pt-3">
            Visit{' '}
            <a className="text-cyan-400 hover:text-cyan-600" target="_blank" href="https://apexlab.io/">
              Apex Lab
            </a>{' '}
            for more content.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default withWunderGraph(Home)
