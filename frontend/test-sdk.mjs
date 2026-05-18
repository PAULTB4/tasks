import { createClient } from '@insforge/sdk'

const insforge = createClient({
  baseUrl: 'https://rv6f6n5q.us-east.insforge.app',
  anonKey: 'ik_f15e5178f3f1b5d07c9e0904a2998ec1',
})

try {
  const { data, error } = await insforge.from('categories').select('*').limit(1)
  if (error) {
    console.log('ERROR:', JSON.stringify(error, null, 2))
  } else {
    console.log('SUCCESS:', JSON.stringify(data, null, 2))
    console.log('API key works as anonKey!')
  }
} catch (e) {
  console.log('Exception:', e.message)
}
