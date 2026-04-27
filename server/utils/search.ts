import { MeiliSearch } from 'meilisearch'

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_KEY || '',
})

export const useSearch = () => {
  const index = client.index('products')
  
  // 1. Sync Product to Search Engine
  const syncProduct = async (product: any) => {
    try {
      await index.addDocuments([{
         id: product.id,
         name: product.name,
         slug: product.slug,
         description: product.description,
         price: Number(product.price),
         category: product.categoryId,
         brand: product.brandId,
         tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags
      }])
    } catch (e) {
      console.error('Search Sync Error:', e)
    }
  }

  // 2. Remove from Search Engine
  const deleteProduct = async (id: number) => {
    try {
      await index.deleteDocument(id)
    } catch (e) {
      console.error('Search Delete Error:', e)
    }
  }

  // 3. Search logic with ranking and filters
  const search = async (query: string, filters: any = {}) => {
     try {
       return await index.search(query, {
         limit: 20,
         attributesToHighlight: ['name', 'description'],
         filter: filters.category ? `category = ${filters.category}` : undefined
       })
     } catch (e) {
        console.error('Search Query Error:', e)
        return null
     }
  }

  return { syncProduct, deleteProduct, search }
}
