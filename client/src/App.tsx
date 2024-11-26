import Chat from './Chat'

function App() {

  return (
    <main className="app">
			<div className='pt-6'>
				<h3 className='text-2xl font-bold px-4'>Home</h3>
				<hr />

				<div className='app-container'>
					<Chat />
				</div>

			</div>
    </main>
  )
}

export default App
